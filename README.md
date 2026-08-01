# UpToDate - AI-Powered Release Poster Generator 🚀

**UpToDate** is a modern developer tool that automatically converts raw GitHub code diffs into visually stunning, human-readable **Release Announcement Posters**. Designed for developers, product managers, and open-source maintainers, UpToDate bridges the gap between raw git commits and engaging public release notes.

---

## 🌟 Key Features

- **Dual-Mode GitHub Diff Analysis**: 
  - **Auto Mode**: Automatically detects recent branch updates and commits for instant analysis.
  - **Manual Mode**: Allows custom comparison between specific base and head branches/tags.
- **Robust GitHub Connection & Rate-Limit Fallbacks**: Connects via GitHub REST API with alternate web diff fallback strategies to support high-traffic repos and repository forks without rate-limit interruptions.
- **AI-Powered Release Intelligence**: Uses **Google Gemini 2.5 / 3.5 / 3.6 Flash** models to parse code diffs into structured, user-friendly copy:
  - 🚀 **Categorized Features**: Badged under `NEW`, `FIX`, `POLISH`, `PERF`, `REFACTOR`, or `SECURITY`.
  - 🗺️ **UI Navigation Paths**: Extracted or inferred step-by-step user journey guides.
  - ⚠️ **Breaking Change Banners**: Contextual warning alerts when breaking updates are detected.
  - 💬 **Plain-English Translations**: Converts raw commit messages into clear product value statements.
- **Interactive Feature Selector Modal**: Pick and choose exactly which extracted features to showcase on your poster before rendering.
- **Custom Screenshot & Media Uploads**: Attach up to 2 product screenshots or mockups directly into the poster layout.
- **Automatic Branding & Logo Extraction**: Intelligent server-side fetcher that extracts app icons, favicons, or repository avatars and embeds them seamlessly as high-quality base64 logos.
- **Dynamic Poster Theme & Glassmorphism UI**: 
  - Sleek dark-mode aesthetic with frosted glass textures (`backdrop-blur`).
  - Interactive Error Boundary to catch and manage poster payload render issues gracefully.
- **High-Resolution PNG Export & Social Sharing**:
  - One-click client-side 4K PNG export using `html-to-image`.
  - Built-in **Social Share Modal** tailored for Twitter/X, LinkedIn, Facebook, and Instagram.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.9+ / FastAPI | Async REST API with parallel logo fetching & diff parsing |
| **AI Engine** | Google Generative AI SDK | Gemini Flash models with strict JSON schema enforcement |
| **Frontend** | React 19 + Vite | High-performance SPA with smooth transition choreography |
| **Styling** | Tailwind CSS v3 | Modern glassmorphism UI design with dynamic dark theme |
| **Icons & UI** | Lucide React | Clean, responsive SVG icon set |
| **Poster Export** | html-to-image | High-DPI DOM canvas rendering to PNG format |

---

## 📂 Repository Structure

```
Comparison/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # REST API endpoints, logo fetcher & Gemini prompt engine
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Template for backend environment variables
│   └── .env                  # Private backend config (API keys - Git ignored)
│
├── frontend/                 # React + Vite Frontend
│   ├── src/                  # Application source code
│   │   ├── components/       # Component architecture
│   │   │   ├── Poster.jsx               # Main poster preview canvas component
│   │   │   ├── LoadingPoster.jsx        # Skeleton loader during diff analysis
│   │   │   ├── FeatureSelectModal.jsx   # Interactive feature filter modal
│   │   │   └── ShareModal.jsx           # Social sharing preview & export modal
│   │   ├── App.jsx           # Main state management, form inputs & API handlers
│   │   └── main.jsx          # React DOM entrypoint
│   ├── index.html            # HTML document shell & app branding
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite dev server & build config
│
├── vercel.json               # Deployment routing configuration (Frontend + Backend)
├── .gitignore                # Global git ignore rules
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** installed
- **Node.js 18+** & `npm` installed
- A **Google Gemini API Key** (get one at [Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables inside `backend/`:
   ```bash
   cp .env.example .env
   ```

5. Open `backend/.env` and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

6. Run the FastAPI backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The API server will listen at `http://localhost:8000`.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node packages:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Access the web app at `http://localhost:5173`.

---

## 💡 How to Use

1. **Enter Repository URL**: Paste any public GitHub repository link (e.g. `https://github.com/facebook/react`).
2. **Choose Mode**:
   - **Auto Mode**: Instant release generation based on default repo comparison.
   - **Manual Mode**: Specify your exact **Base Branch** and **Compare/Head Branch**.
3. **Attach Media (Optional)**: Import up to 2 product screenshots to display alongside release notes.
4. **Analyze & Select Features**: Click **Analyze Codebase**. When analysis completes, use the **Feature Selector Modal** to pick which changes to include.
5. **Preview & Export**: Review the generated poster preview, then click **Download Poster** or **Share** to generate your high-res PNG.

---

## 🔌 API Reference

### `POST /api/analyze`

Analyzes repository diffs, extracts brand metadata/logo, and generates structured release poster data.

#### Request Body
```json
{
  "repo_url": "https://github.com/owner/repo",
  "mode": "manual",
  "base_branch": "main",
  "compare_branch": "feature-branch"
}
```

#### Response Body Schema
```json
{
  "update_type": "single_feature | multi_feature",
  "app_name": "UpToDate",
  "app_repo": "owner/repo",
  "logo_url": "data:image/png;base64,...",
  "headline": "Weekly Update: Performance, Fixes & New Tools",
  "subheadline": "A brief overview of key improvements in this release.",
  "what_is_it": "Concise summary explaining what the update delivers.",
  "navigation_path": [
    "Open side menu",
    "Select Settings",
    "Enable Feature"
  ],
  "warning_note": "Note: Old API endpoint deprecated. (or null)",
  "features": [
    {
      "category": "NEW | FIX | POLISH | PERF | REFACTOR | SECURITY",
      "title": "Clear change title",
      "description": "1-2 sentence user-friendly explanation.",
      "icon_hint": "sparkles"
    }
  ]
}
```

---

## 🛡️ Environment & Security

- Server-side API key protection: Gemini API keys (`GEMINI_API_KEY`) remain strictly on the backend (`backend/.env`).
- Environment configuration files (`*.env`) are strictly excluded from version control via `.gitignore`.

