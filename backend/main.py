import os
import re
import urllib.parse
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
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
    """
    Extracts (owner, repo) from any valid GitHub URL or string.
    Examples:
      - https://github.com/owner/repo
      - https://github.com/owner/repo.git
      - https://github.com/owner/repo/tree/main
      - https://github.com/owner/repo/pull/123
    """
    cleaned_url = github_url.strip()
    match = re.search(r"github\.com[:/]([^/]+)/([^/\s?#]+)", cleaned_url)
    if not match:
        raise ValueError("Invalid GitHub URL format. Expected https://github.com/owner/repo")
    
    owner = match.group(1)
    repo = match.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo

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
        response = await client.get(diff_url, headers=headers)
        
        if response.status_code == 404:
            raise HTTPException(
                status_code=404, 
                detail=f"GitHub returned 404 Not Found. Please verify repository '{owner}/{repo}' and branches '{base}' and '{compare}' exist and are accessible."
            )
        elif response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch diff from GitHub: {response.text}")
            
        diff_text = response.text
        
        # Truncate if too long (25k chars)
        if len(diff_text) > 25000:
            diff_text = diff_text[:25000] + "\n...[TRUNCATED]"
            
        if not diff_text.strip():
            raise HTTPException(status_code=400, detail=f"No differences found between branch '{base}' and branch '{compare}'.")

        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server.")
            
        # Call Gemini
        prompt = f"""
Act as a technical marketer. Review this git diff. Ignore minor refactoring, formatting, and typo fixes.
Extract the top 3-4 major user-facing features, architectural improvements, or significant bug fixes.
Translate them into plain-English, engaging marketing bullet points.

Enforce this strict JSON output schema:
{{
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
                return res.text
            except Exception as e:
                last_error = e
                print(f"Model {model_name} failed: {e}. Trying fallback...")
                
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(last_error)}")

@app.get("/")
def read_root():
    return {"message": "UpToDate API is running."}

