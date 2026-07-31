# UpToDate - AI-Powered Release Poster Generator 🚀

**UpToDate** is a modern developer tool that automatically converts raw GitHub code diffs into visually stunning, human-readable **Release Announcement Posters**. Designed for developers, product managers, and open-source maintainers, UpToDate bridges the gap between raw git commits and engaging public release notes.

---

## 🌟 Key Features

- **Automated GitHub Diff Analysis**: Connects directly to the GitHub REST API to fetch and analyze precise code differences between any two branches, tags, or commits.
- **AI-Powered Release Summaries**: Uses **Google Gemini 2.5 / 3.5 / 3.6 Flash** models to parse code changes and extract:
  - 🚀 **Major Feature Highlights**: High-level value propositions.
  - 🛠️ **Bug Fixes & Enhancements**: Categorized technical improvements.
  - ⚠️ **Breaking Changes & Warnings**: Crucial alerts for users.
  - 🗺️ **Step-by-step Navigation Path**: User guidance on how to navigate new updates.
- **Dynamic Poster Theme & Styling**: 
  - Sleek dark-mode aesthetic with frosted glass elements (`backdrop-blur`).
  - Automatic dynamic palette extraction via `ColorThief` to adapt poster theme colors.
- **High-Resolution PNG Export**: Uses `html-to-image` for client-side, loss-less export ready for Twitter/X, LinkedIn, Discord, or product changelogs.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.9+ / FastAPI | High-performance asynchronous REST API |
| **AI Integration** | Google Generative AI SDK | Gemini Flash models with robust fallback handling |
| **Frontend** | React 19 + Vite | Blazing fast client-side app with ES module imports |
| **Styling** | Tailwind CSS v3 | Utility-first styling with custom glassmorphism design |
| **Icons & Media** | Lucide React / ColorThief | Clean SVG icons & dynamic color palette extraction |
| **Poster Export** | html-to-image | Client-side DOM rendering to 4K PNG format |

---

## 📂 Repository Structure

```
Comparison/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # REST API endpoints & Gemini prompt engineering
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Template for backend environment variables
│   └── .env                  # Private backend config (API keys - Git ignored)
│
├── frontend/                 # React + Vite Frontend
│   ├── src/                  # Application source code
│   │   ├── components/       # Poster & UI rendering components
│   │   ├── App.jsx           # Main UI logic & API fetch layer
│   │   └── main.jsx          # React entrypoint
│   ├── index.html            # HTML shell
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite build configuration
│
├── vercel.json               # Deployment routing configuration (Frontend + Backend)
├── .gitignore                # Global git ignore configuration
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** installed
- **Node.js 18+** & `npm` installed
- A **Google Gemini API Key** (obtainable from [Google AI Studio](https://aistudio.google.com/))

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

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file inside `backend/`:
   ```bash
   cp .env.example .env
   ```

5. Open `backend/.env` and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

6. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web UI will be available at `http://localhost:5173`.

---

## 💡 How to Use

1. Launch both the **Backend** (`http://localhost:8000`) and **Frontend** (`http://localhost:5173`).
2. Open the web UI in your browser.
3. Input a **GitHub Repository URL** (e.g. `https://github.com/facebook/react`).
4. Select or enter:
   - **Base Branch** (e.g. `main` or `v1.0.0`)
   - **Compare Branch** (e.g. `develop` or `v1.1.0`)
5. Click **Analyze Codebase**.
6. Review the generated poster preview and click **Download Poster** to save the PNG image.

---

## 🔌 API Reference

### `POST /api/analyze`

Analyzes repository diffs and generates structured poster data.

#### Request Body
```json
{
  "repo_url": "https://github.com/owner/repo",
  "base_branch": "main",
  "compare_branch": "feature-branch"
}
```

#### Response Body
Returns structured JSON containing:
- `version`: Release tag or version name.
- `tagline`: Snappy catchphrase summarizing the update.
- `highlights`: Key feature bullet points.
- `improvements`: Secondary bug fixes/optimizations.
- `breaking_changes`: Any critical deprecations or alerts.
- `nav_steps`: Step-by-step navigation path.
- `tech_specs`: Frameworks, diff line counts, and technical metadata.

---

## 🛡️ Environment & Security

- All API keys (`AI_API_KEY`) are kept exclusively on the server side in `backend/.env`.
- The frontend makes HTTP calls to the backend (`/api/analyze`) and never exposes private secret keys to client browsers.
- Environment files (`*.env`) are strictly excluded from version control via `.gitignore`.
