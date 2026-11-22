# SkillMatch – Smart Student Skill Gap Analyzer

SkillMatch is a Flask web application that compares a student's existing skills with the skills commonly associated with a selected career path. It calculates a transparent match percentage and recommends skills to learn next.

## Features

- Student profile registration
- Six predefined career paths
- Skill selection and rule-based matching
- Career match percentage
- Matched and missing skill lists
- Dashboard with visual charts
- Assessment history
- SQLite database

## Technology stack

- Python 3
- Flask
- SQLite
- HTML, CSS, JavaScript
- Chart.js

## Run locally

1. Install Python 3.10 or newer.
2. Download or clone this repository.
3. Open a terminal in the project folder.
4. Create and activate a virtual environment:

   **Windows**
   ```bash
   py -m venv .venv
   .venv\Scripts\activate
   ```

   **macOS/Linux**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

5. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

6. Start the website:

   ```bash
   python app.py
   ```

7. Open `http://127.0.0.1:5000` in your browser.

The SQLite database (`skillmatch.db`) is created automatically on first run.

## Deploy on Render

1. Push this project to a GitHub repository.
2. Sign in at https://render.com and choose **New → Web Service**.
3. Connect your GitHub repository.
4. Use these settings:
   - Runtime: Python 3
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
   - Instance type: Free
5. Add an environment variable named `SECRET_KEY` with a long random value, or keep the generated value from `render.yaml`.
6. Click **Create Web Service** and wait for the deployment to finish.

Render assigns a public `onrender.com` URL to the deployed website.

## Important hosting note

This starter project uses SQLite so it is easy to run locally and demonstrate. Render's free web services use an ephemeral filesystem, so the local SQLite database can be lost when the service restarts, spins down, or redeploys. This is suitable for a classroom demo, but not for permanent student records. For persistent hosted records, connect a managed PostgreSQL database and update the database layer.

## How the matching score works

`Match Score = (Number of matched required skills / Total required skills) × 100`

The career skill lists are illustrative project data, not official job requirements or a guarantee of employability. The app is an educational self-assessment tool.

## Suggested future improvements

- Student login and password authentication
- Admin panel to edit career skill requirements
- Custom skill levels and weighted scoring
- PostgreSQL for persistent hosted data
- Export assessment report as PDF
