import os
import re
import json
import base64
import urllib.parse
# pyrefly: ignore [missing-import]
import httpx
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
import google.generativeai as genai
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
    os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY / GOOGLE_API_KEY not set")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

class AnalyzeRequest(BaseModel):
    url: str
    base_branch: str
    compare_branch: str

def extract_owner_repo(github_url: str):
    cleaned_url = github_url.strip()
    match = re.search(r"github\.com[:/]([^/]+)/([^/\s?#]+)", cleaned_url)
    if not match:
        raise ValueError("The URL of the Repository is not valid. Please enter a valid Repository URL.")
    
    owner = match.group(1)
    repo = match.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo

async def fetch_avatar_base64(client: httpx.AsyncClient, owner: str) -> str:
    url = f"https://github.com/{owner}.png"
    try:
        res = await client.get(url, follow_redirects=True, timeout=5.0)
        if res.status_code == 200:
            mime_type = res.headers.get("content-type", "image/png")
            encoded = base64.b64encode(res.content).decode("utf-8")
            return f"data:{mime_type};base64,{encoded}"
    except Exception as e:
        print(f"Failed to fetch avatar base64: {e}")
    return ""

async def fetch_app_logo_base64(client: httpx.AsyncClient, owner: str, repo: str, branch: str) -> str:
    paths = [
        "logo.svg", "logo.png", "favicon.png", "favicon.ico", "icon.png", "apple-touch-icon.png",
        "public/logo.svg", "public/logo.png", "public/favicon.png", "public/favicon.ico", "public/icon.png",
        "src/assets/logo.svg", "src/assets/logo.png", "assets/logo.svg", "assets/logo.png",
        "src/logo.svg", "src/logo.png"
    ]
    for p in paths:
        url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{p}"
        try:
            r = await client.get(url, follow_redirects=True, timeout=3.0)
            if r.status_code == 200 and len(r.content) > 50:
                mime = "image/svg+xml" if p.endswith(".svg") else ("image/x-icon" if p.endswith(".ico") else "image/png")
                b64 = base64.b64encode(r.content).decode("utf-8")
                return f"data:{mime};base64,{b64}"
        except Exception:
            pass
            
    # Fallback to owner avatar if no app logo/favicon found in repo
    return await fetch_avatar_base64(client, owner)

@app.post("/api/v1/analyze-github")
async def analyze_github(request: AnalyzeRequest):
    # Extract owner and repo cleanly
    try:
        owner, repo = extract_owner_repo(request.url)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    
    base = request.base_branch.strip()
    compare = request.compare_branch.strip()
    
    if not base or not compare:
        raise HTTPException(status_code=400, detail="Base branch and compare branch must not be empty.")
        
    if base.lower() == compare.lower():
        raise HTTPException(status_code=400, detail="Compare branch and base branch must be different.")
    
    # Format comparison endpoint
    diff_url = f"https://api.github.com/repos/{owner}/{repo}/compare/{base}...{compare}"
    
    headers = {
        "Accept": "application/vnd.github.v3.diff",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "UpToDate-App"
    }
    
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Fetch repository application logo or fallback to owner avatar
        app_logo_b64 = await fetch_app_logo_base64(client, owner, repo, compare)
        response = await client.get(diff_url, headers=headers)
        
        if response.status_code == 404:
            raise HTTPException(
                status_code=404, 
                detail=f"GitHub returned 404 Not Found. Please verify repository '{owner}/{repo}' and branches '{base}' and '{compare}' exist and are accessible."
            )
        elif response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch diff from GitHub: {response.text}")
            
        diff_text = response.text
        
        # Check if diff is empty (identical contents)
        if not diff_text.strip():
            # Return JSONResponse directly without consuming Gemini tokens
            return JSONResponse(
                status_code=200,
                content={
                    "no_diff": True,
                    "app_name": repo.replace("-", " ").replace("_", " ").title(),
                    "app_owner": owner,
                    "app_repo": repo,
                    "app_avatar": app_logo_b64 or f"https://github.com/{owner}.png",
                    "message": f"No release poster needed as the contents of both branches ('{base}' and '{compare}') are identical."
                }
            )
        
        # Truncate if too long (25k chars)
        if len(diff_text) > 25000:
            diff_text = diff_text[:25000] + "\n...[TRUNCATED]"

        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server.")
            
        # Call Gemini
        prompt = f"""
Act as a technical marketer and UI designer. Review this git diff.
1. Extract the top 3-4 major user-facing features, architectural improvements, or significant bug fixes into engaging marketing bullet points.
2. Infer the official or clean Application Name (e.g., 'Semester GPA Calculator' or 'Acme Dashboard').
3. Analyze the diff to infer the visual branding/theme of the project (e.g. color accents, theme vibe like 'Neon Emerald', 'Deep Cobalt Blue', 'Cyber Violet', 'Amber Sunset', 'Rose Quartz', 'Glassmorphism Dark').
   Provide hex colors: `primary_color` (accent hex e.g. #10B981 or #3B82F6), `secondary_color` (complementary gradient hex e.g. #06B6D4 or #8B5CF6).

Enforce this strict JSON output schema:
{{
  "app_name": "Clean formatted name of the application",
  "theme": {{
    "theme_name": "Descriptive theme name",
    "primary_color": "#HEXCOLOR",
    "secondary_color": "#HEXCOLOR"
  }},
  "title": "A short, catchy title for this release (e.g. 'Performance Boost & New UI')",
  "summary": "A 1-2 sentence summary of what this release is about.",
  "features": [
    "feature 1",
    "feature 2",
    "feature 3"
  ]
}}

Here is the diff:
{diff_text}
"""
        candidate_models = [
            "gemini-3.5-flash",
            "gemini-3.6-flash",
            "gemini-flash-latest",
            "gemini-2.5-flash"
        ]
        
        last_error = None
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
                res = model.generate_content(prompt)
                
                # Parse and enrich JSON
                try:
                    data = json.loads(res.text)
                except Exception:
                    data = {}

                if not data.get("app_name"):
                    data["app_name"] = repo.replace("-", " ").replace("_", " ").title()

                data["app_owner"] = owner
                data["app_repo"] = repo
                data["app_avatar"] = app_logo_b64 or f"https://github.com/{owner}.png"

                if "theme" not in data or not isinstance(data["theme"], dict):
                    data["theme"] = {
                        "theme_name": "Modern Neon",
                        "primary_color": "#3B82F6",
                        "secondary_color": "#8B5CF6"
                    }

                return json.dumps(data)
            except Exception as e:
                last_error = e
                print(f"Model {model_name} failed: {e}. Trying fallback...")
                
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(last_error)}")

@app.get("/")
def read_root():
    return {"message": "UpToDate API is running."}

