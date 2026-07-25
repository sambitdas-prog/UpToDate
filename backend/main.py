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
from typing import Optional
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

class GitHubRequest(BaseModel):
    repo_url: Optional[str] = None
    url: Optional[str] = None
    base_branch: Optional[str] = None
    head_branch: Optional[str] = None
    compare_branch: Optional[str] = None

# Alias for backwards compatibility
AnalyzeRequest = GitHubRequest

def parse_github_url(url: str):
    """Extracts owner and repo from a GitHub URL."""
    if not url or not url.strip():
        raise ValueError("The URL of the Repository is not valid. Please enter a valid Repository URL.")
    cleaned_url = url.strip()
    match = re.search(r"github\.com[:/]([^/]+)/([^/\s?#]+)", cleaned_url)
    if not match:
        raise ValueError("Invalid GitHub URL format.")
    
    owner = match.group(1)
    repo = match.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo

extract_owner_repo = parse_github_url

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

@app.post("/api/analyze")
@app.post("/api/v1/analyze-github")
async def analyze_github(request: GitHubRequest):
    raw_url = request.repo_url or request.url
    if not raw_url:
        raise HTTPException(status_code=400, detail="The URL of the Repository is not valid. Please enter a valid Repository URL.")
        
    try:
        owner, repo = parse_github_url(raw_url)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    
    base_b = request.base_branch.strip() if request.base_branch and request.base_branch.strip() else None
    head_b = request.head_branch or request.compare_branch
    head_b = head_b.strip() if head_b and head_b.strip() else None

    # Base headers for GitHub API calls
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "UpToDate-App"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # MODE 1: AUTO-DETECT COMMITS
        if not base_b and not head_b:
            commits_url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=10"
            commits_resp = await client.get(commits_url, headers=headers)
            
            if commits_resp.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub returned 404 Not Found. Please verify repository '{owner}/{repo}' exists and is accessible.")
            elif commits_resp.status_code != 200:
                raise HTTPException(status_code=commits_resp.status_code, detail="Failed to fetch commits. Check repo URL.")
            
            commits = commits_resp.json()
            if not isinstance(commits, list) or len(commits) < 2:
                raise HTTPException(status_code=400, detail="Not enough commits to generate a diff.")
            
            head_ref = commits[0]['sha']
            base_ref = commits[-1]['sha']
            ref_for_logo = head_ref

        # MODE 2: MANUAL BRANCH COMPARISON
        else:
            if not base_b or not head_b:
                raise HTTPException(status_code=400, detail="Both base and head branches are required for manual mode.")
                
            if base_b.lower() == head_b.lower():
                raise HTTPException(status_code=400, detail="Compare branch and base branch must be different.")

            base_ref = base_b
            head_ref = head_b
            ref_for_logo = head_ref

        # Format comparison endpoint
        compare_url = f"https://api.github.com/repos/{owner}/{repo}/compare/{base_ref}...{head_ref}"
        diff_headers = headers.copy()
        diff_headers["Accept"] = "application/vnd.github.v3.diff" # Crucial for raw diff
        
        app_logo_b64 = await fetch_app_logo_base64(client, owner, repo, ref_for_logo)
        response = await client.get(compare_url, headers=diff_headers)
        
        if response.status_code == 404:
            raise HTTPException(
                status_code=404, 
                detail=f"GitHub returned 404 Not Found. Please verify repository '{owner}/{repo}' and branches '{base_ref}' and '{head_ref}' exist and are accessible."
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
                    "message": f"No release poster needed as the contents of both references ('{base_ref}' and '{head_ref}') are identical."
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
2. Infer the official or clean Application Name (e.g., 'Kiro' or 'FaceBook' or 'Instagram' etc).
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
                
                if not data.get("title"):
                    data["title"] = "Release Update"
                    
                if not data.get("summary"):
                    data["summary"] = "Various improvements and bug fixes have been made in this release."
                    
                if not data.get("features") or not isinstance(data["features"], list):
                    data["features"] = ["Codebase optimizations", "Refactoring and cleanup"]

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

