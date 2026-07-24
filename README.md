# UpToDate - Release Poster Generator

**UpToDate** is an AI-powered developer tool that transforms raw GitHub code differences into stunning, human-readable release posters. Designed for developers and open-source maintainers, this tool automates the process of communicating technical updates to end-users and stakeholders.

## Features

- **Automated Code Analysis:** Connects directly to the GitHub REST API to fetch the precise code differences (`diffs`) between two branches (e.g., `main` and `develop`).
- **AI-Powered Synthesis:** Leverages Google's Gemini Flash AI models to intelligently read hundreds of lines of code changes and summarize them into high-level, marketing-friendly bullet points and feature highlights.
- **Dynamic Poster Generation:** Automatically designs a sleek, visually stunning, dark-themed release poster using React and Tailwind CSS.
- **High-Resolution Export:** Download the generated poster instantly as a high-quality PNG, perfectly formatted for sharing on Twitter/X, LinkedIn, Discord, or project documentation.
- **Sleek UI:** Features a modern, premium aesthetic with frosted glass elements (backdrop blurs), depth shadowing, and subtle animated light flares.

## Tech Stack

### Backend
- **Python / FastAPI:** Provides a lightning-fast asynchronous REST API.
- **Google Generative AI SDK:** Integrates with Gemini (3.5, 3.6, and 2.5 Flash models) for robust fallback handling and natural language processing.
- **Uvicorn & Requests:** For server hosting and fetching raw GitHub diffs.

### Frontend
- **React + Vite:** A blazing-fast frontend framework utilizing JSX and modern ES modules.
- **Tailwind CSS (v3):** Highly customizable utility-first CSS framework used for creating the custom frosted-glass dark theme.
- **Lucide React:** Clean, beautiful SVG icons.
- **html-to-image:** Enables high-resolution client-side rendering of DOM nodes directly to downloadable PNGs.

## How It Works

1. Enter a **GitHub Repository URL** (e.g., `https://github.com/facebook/react`).
2. Specify the **Base Branch** (e.g., `main`) and the **Compare Branch** (e.g., `develop` or a feature branch).
3. Click **Analyze Codebase**. The backend securely pulls the diff, the AI structures a concise release summary, and the frontend beautifully visualizes it.
4. Click **Download Poster** to export your announcement!
