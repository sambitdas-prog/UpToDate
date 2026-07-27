import os
import re
import json
import base64
import asyncio
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
    urls = [
        f"https://github.com/{owner}.png",
        f"https://unavatar.io/github/{owner}"
    ]
    for url in urls:
        try:
            res = await client.get(url, follow_redirects=True, timeout=5.0)
            if res.status_code == 200 and len(res.content) > 100:
                mime_type = res.headers.get("content-type", "image/png").split(";")[0].strip()
                if not mime_type.startswith("image/"):
                    mime_type = "image/png"
                encoded = base64.b64encode(res.content).decode("utf-8")
                return f"data:{mime_type};base64,{encoded}"
        except Exception as e:
            print(f"Failed to fetch avatar from {url}: {e}")
    return f"https://github.com/{owner}.png"

async def fetch_repo_metadata_and_logo(client: httpx.AsyncClient, owner: str, repo: str, branch: str, headers: dict) -> tuple[Optional[str], str]:
    extracted_app_name = None
    logo_base64 = None
    
    default_branch = "main"
    try:
        repo_api_url = f"https://api.github.com/repos/{owner}/{repo}"
        r_repo = await client.get(repo_api_url, headers=headers, timeout=5.0)
        if r_repo.status_code == 200:
            info = r_repo.json()
            default_branch = info.get("default_branch", "main")
    except Exception as e:
        print(f"Repo API check failed: {e}")

    branches_to_check = []
    for b in [branch, default_branch, "main", "master"]:
        if b and b not in branches_to_check:
            branches_to_check.append(b)

    tree_files = []
    for b in branches_to_check:
        try:
            tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{b}?recursive=1"
            r_tree = await client.get(tree_url, headers=headers, timeout=5.0)
            if r_tree.status_code == 200:
                data = r_tree.json()
                tree_files = [item.get("path", "") for item in data.get("tree", []) if "path" in item]
                if tree_files:
                    break
        except Exception:
            pass

    tree_files_lower = {p.lower(): p for p in tree_files}

    async def get_raw_file(path: str) -> bytes:
        for b in branches_to_check:
            url = f"https://raw.githubusercontent.com/{owner}/{repo}/{b}/{path}"
            try:
                r = await client.get(url, follow_redirects=True, timeout=3.0)
                if r.status_code == 200 and len(r.content) > 10:
                    return r.content
            except Exception:
                pass
        return b""

    # 1. EXTRACT APPLICATION NAME (Concurrently fetch index, package.json, readme)
    index_paths = [p for p in tree_files if p.lower().endswith("index.html")] or ["index.html", "public/index.html"]
    pkg_paths = [p for p in tree_files if p.lower().endswith("package.json")] or ["package.json"]
    readme_paths = [p for p in tree_files if p.lower().endswith("readme.md")] or ["README.md"]

    name_candidates = (index_paths[:2] + pkg_paths[:1] + readme_paths[:1])
    name_tasks = [get_raw_file(p) for p in name_candidates]
    name_results = await asyncio.gather(*name_tasks, return_exceptions=True)
    file_cache: dict[str, bytes] = {}
    for p, res in zip(name_candidates, name_results):
        if isinstance(res, bytes) and res:
            file_cache[p] = res

    # Try index.html titles
    for idx_path in index_paths[:2]:
        idx_bytes = file_cache.get(idx_path)
        if idx_bytes:
            try:
                html_text = idx_bytes.decode("utf-8", errors="ignore")
                title_match = re.search(r"<title[^>]*>(.*?)</title>", html_text, re.IGNORECASE | re.DOTALL)
                if title_match:
                    raw_title = title_match.group(1).strip()
                    clean_title = re.split(r"\s*[-–—|:]\s*", raw_title)[0].strip()
                    if clean_title and len(clean_title) < 40 and clean_title.lower() not in ["app", "application", "vite app", "react app", "next app", "home", "index", "unknown"]:
                        extracted_app_name = clean_title
                        break
            except Exception:
                pass

    # Try package.json
    if not extracted_app_name:
        for pkg_path in pkg_paths[:1]:
            pkg_bytes = file_cache.get(pkg_path)
            if pkg_bytes:
                try:
                    pkg_data = json.loads(pkg_bytes.decode("utf-8", errors="ignore"))
                    display_name = pkg_data.get("displayName") or pkg_data.get("name")
                    if display_name and isinstance(display_name, str):
                        clean_pkg = display_name.replace("-", " ").replace("_", " ").strip().title()
                        if clean_pkg.lower() not in ["app", "application", "react", "vite", "next", "unknown"]:
                            extracted_app_name = clean_pkg
                            break
                except Exception:
                    pass

    # Try README.md
    if not extracted_app_name:
        for r_path in readme_paths[:1]:
            readme_bytes = file_cache.get(r_path)
            if readme_bytes:
                try:
                    readme_text = readme_bytes.decode("utf-8", errors="ignore")
                    h_match = re.search(r"^#\s+([^\n\r]+)", readme_text, re.MULTILINE)
                    if h_match:
                        raw_h = h_match.group(1).strip()
                        raw_h = re.sub(r"\[.*?\]\(.*?\)", "", raw_h)
                        raw_h = re.sub(r"[^\w\s\.\'-]", "", raw_h).strip()
                        clean_h = re.split(r"\s*[-–—|:]\s*", raw_h)[0].strip()
                        if clean_h and 2 <= len(clean_h) <= 30 and clean_h.lower() not in ["readme", "project", "app", "application"]:
                            extracted_app_name = clean_h
                            break
                except Exception:
                    pass

    # 2. DISCOVER APPLICATION LOGO / FAVICON
    logo_candidates = []
    
    for idx_path in index_paths[:2]:
        idx_bytes = file_cache.get(idx_path)
        if idx_bytes:
            try:
                html_text = idx_bytes.decode("utf-8", errors="ignore")
                icon_links = re.findall(r'<link[^>]+(?:rel=["\'][^"\']*icon[^"\']*["\'])[^>]+href=["\']([^"\']+)["\']', html_text, re.IGNORECASE)
                icon_links += re.findall(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+(?:rel=["\'][^"\']*icon[^"\']*["\'])', html_text, re.IGNORECASE)
                for href in icon_links:
                    clean_href = href.lstrip("./").lstrip("/")
                    if clean_href and clean_href not in logo_candidates:
                        logo_candidates.append(clean_href)
                        if not clean_href.startswith("public/") and "public/" + clean_href not in logo_candidates:
                            logo_candidates.append("public/" + clean_href)
            except Exception:
                pass

    if tree_files:
        img_exts = (".svg", ".png", ".ico", ".webp", ".jpg", ".jpeg")
        for f in tree_files:
            lower_f = f.lower()
            if lower_f.endswith(img_exts):
                if any(k in lower_f for k in ["logo", "favicon", "icon", "brand", "vite.svg", "react.svg"]):
                    if f not in logo_candidates:
                        logo_candidates.append(f)

    standard_paths = [
        "logo.svg", "logo.png", "favicon.png", "favicon.ico", "icon.png", "apple-touch-icon.png",
        "public/logo.svg", "public/logo.png", "public/favicon.png", "public/favicon.ico", "public/icon.png",
        "public/favicon.svg", "public/logo.ico", "public/images/logo.png", "public/images/logo.svg",
        "public/vite.svg", "vite.svg", "src/assets/logo.svg", "src/assets/logo.png",
        "src/assets/favicon.png", "src/assets/favicon.ico", "assets/logo.svg", "assets/logo.png",
        "src/logo.svg", "src/logo.png", "src/favicon.ico", "src/favicon.png",
        "app/favicon.ico", "app/icon.png", "app/favicon.png",
        "static/logo.png", "static/logo.svg", "static/favicon.ico", "static/favicon.png"
    ]
    for p in standard_paths:
        if tree_files:
            if p.lower() in tree_files_lower and tree_files_lower[p.lower()] not in logo_candidates:
                logo_candidates.append(tree_files_lower[p.lower()])
        else:
            if p not in logo_candidates:
                logo_candidates.append(p)

    for i in range(0, len(logo_candidates), 8):
        batch = logo_candidates[i:i+8]
        tasks = [get_raw_file(path) for path in batch]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for path, content in zip(batch, results):
            if isinstance(content, bytes) and len(content) > 50:
                lower_path = path.lower()
                mime = "image/svg+xml" if lower_path.endswith(".svg") else (
                       "image/x-icon" if lower_path.endswith(".ico") else (
                       "image/webp" if lower_path.endswith(".webp") else (
                       "image/jpeg" if lower_path.endswith((".jpg", ".jpeg")) else "image/png")))
                b64 = base64.b64encode(content).decode("utf-8")
                logo_base64 = f"data:{mime};base64,{b64}"
                break
        if logo_base64:
            break

    if not logo_base64:
        logo_base64 = await fetch_avatar_base64(client, owner)

    return extracted_app_name, logo_base64

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
        
        (extracted_app_name, app_logo_b64), response = await asyncio.gather(
            fetch_repo_metadata_and_logo(client, owner, repo, ref_for_logo, headers),
            client.get(compare_url, headers=diff_headers)
        )
        
        if response.status_code == 404:
            raise HTTPException(
                status_code=404, 
                detail=f"GitHub returned 404 Not Found. Please verify repository '{owner}/{repo}' and branches '{base_ref}' and '{head_ref}' exist and are accessible."
            )
        elif response.status_code in [403, 429] and "rate limit" in response.text.lower():
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN environment variable on your hosting server to get 5,000 requests/hour."
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
                    "app_name": extracted_app_name or repo.replace("-", " ").replace("_", " ").title(),
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
Act as a product marketer and UI designer. Review this git diff for repository '{owner}/{repo}'.
1. Extract the top 3-4 major user-facing features, architectural improvements, or significant bug fixes into engaging marketing feature cards.
2. Determine the official Application Name. The actual application name extracted from the repository is '{extracted_app_name or repo.replace("-", " ").replace("_", " ").title()}'. You MUST output "{extracted_app_name or repo.replace("-", " ").replace("_", " ").title()}" as "app_name". Do NOT invent, guess, or hallucinate any other name (such as 'Aether', 'App', etc.).
3. VERY IMPORTANT: Write all feature titles and descriptions in PLAIN, SIMPLE, CLEAR ENGLISH. Do not use hard English, complex vocabulary, technical jargon, or corporate buzzwords. Explain what changed in simple everyday terms so that anyone can easily understand it at a glance.

Enforce this strict JSON output schema:
{{
  "app_name": "Clean human-readable name of the application (e.g. UpToDate)",
  "headline": "A short, extremely punchy title in simple English (max 5 words).",
  "subheadline": "A slightly longer, clear subtitle in plain English.",
  "summary": "A 2-3 sentence engaging overview of the update written in simple, easy-to-understand plain English.",
  "theme_keyword": "A single simple word (e.g., 'speed', 'ui', 'security').",
  "features": [
    {{
      "category": "Major Feature | Polish | Fix",
      "title": "Clear, simple feature name in plain English",
      "description": "1-2 simple sentences explaining the update in easy-to-understand plain English without hard technical jargon.",
      "icon_hint": "name of a standard icon (e.g., 'zap', 'shield', 'eye', 'tool', 'bug')"
    }}
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

                clean_repo_title = repo.replace("-", " ").replace("_", " ").title()
                if extracted_app_name:
                    data["app_name"] = extracted_app_name
                elif (not data.get("app_name") or 
                    not isinstance(data.get("app_name"), str) or 
                    data["app_name"].strip() == "" or 
                    data["app_name"].strip().lower() in ["app", "application", "unknown", "untitled", "release update", "git diff", "release", "update", "aether"]):
                    data["app_name"] = clean_repo_title
                
                if not data.get("headline"):
                    data["headline"] = "Release Update"
                    
                if not data.get("subheadline"):
                    data["subheadline"] = "New features and improvements"
                    
                if not data.get("summary"):
                    data["summary"] = "Various improvements and bug fixes have been made in this release to enhance stability and performance."
                    
                if not data.get("theme_keyword"):
                    data["theme_keyword"] = "update"
                    
                if not data.get("features") or not isinstance(data["features"], list):
                    data["features"] = [
                        {
                            "category": "Polish",
                            "title": "Codebase optimizations",
                            "description": "General refactoring and performance tuning across the application.",
                            "icon_hint": "zap"
                        },
                        {
                            "category": "Fix",
                            "title": "Bug Fixes",
                            "description": "Resolved various edge cases and UI inconsistencies.",
                            "icon_hint": "bug"
                        }
                    ]

                data["app_owner"] = owner
                data["app_repo"] = repo
                data["app_avatar"] = app_logo_b64 or f"https://github.com/{owner}.png"

                return json.dumps(data)
            except Exception as e:
                last_error = e
                print(f"Model {model_name} failed: {e}. Trying fallback...")
                
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(last_error)}")

@app.get("/")
def read_root():
    return {"message": "UpToDate API is running."}

