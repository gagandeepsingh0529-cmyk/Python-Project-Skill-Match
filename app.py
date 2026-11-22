import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, flash, redirect, render_template, request, session, url_for

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-secret-key-before-production")

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = os.environ.get("DATABASE_PATH", str(BASE_DIR / "skillmatch.db"))

# These are illustrative skill requirements for the project demo.
CAREERS = {
    "Python Developer": ["Python", "SQL", "Flask", "Git", "REST APIs", "Debugging"],
    "Web Developer": ["HTML", "CSS", "JavaScript", "Responsive Design", "Git", "REST APIs"],
    "Data Analyst": ["Python", "SQL", "Excel", "Statistics", "Data Visualization", "Pandas"],
    "Machine Learning Engineer": ["Python", "Statistics", "Pandas", "NumPy", "Scikit-learn", "SQL"],
    "Full Stack Developer": ["HTML", "CSS", "JavaScript", "Python", "Flask", "SQL", "Git"],
    "UI/UX Designer": ["Figma", "Wireframing", "Prototyping", "Typography", "User Research", "Visual Design"],
}

ALL_SKILLS = sorted({skill for skills in CAREERS.values() for skill in skills})
LEVELS = ["Beginner", "Intermediate", "Advanced"]


def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                education TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                career TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                matched_json TEXT NOT NULL,
                missing_json TEXT NOT NULL,
                score INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(student_id) REFERENCES students(id)
            )
        """)


def current_student():
    student_id = session.get("student_id")
    if not student_id:
        return None
    with get_db() as db:
        return db.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()


def analyze_skills(career, selected_skills):
    required = CAREERS[career]
    selected = set(selected_skills)
    matched = [skill for skill in required if skill in selected]
    missing = [skill for skill in required if skill not in selected]
    score = round((len(matched) / len(required)) * 100) if required else 0
    return score, matched, missing, required


@app.route("/")
def index():
    student = current_student()
    return render_template("index.html", student=student, careers=CAREERS)


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        education = request.form.get("education", "").strip()

        if not name or not email or not education:
            flash("Please complete all fields.", "error")
            return render_template("register.html")

        try:
            with get_db() as db:
                cursor = db.execute(
                    "INSERT INTO students (name, email, education, created_at) VALUES (?, ?, ?, ?)",
                    (name, email, education, datetime.now().strftime("%d %b %Y, %I:%M %p"))
                )
                session["student_id"] = cursor.lastrowid
            flash("Your profile is ready. Let's find your career match!", "success")
            return redirect(url_for("dashboard"))
        except sqlite3.IntegrityError:
            with get_db() as db:
                student = db.execute("SELECT * FROM students WHERE email = ?", (email,)).fetchone()
            session["student_id"] = student["id"]
            flash("Welcome back! Your existing profile has been opened.", "success")
            return redirect(url_for("dashboard"))

    return render_template("register.html")


@app.route("/dashboard")
def dashboard():
    student = current_student()
    if not student:
        flash("Create your student profile to access the dashboard.", "info")
        return redirect(url_for("register"))

    with get_db() as db:
        history = db.execute(
            "SELECT * FROM assessments WHERE student_id = ? ORDER BY id DESC LIMIT 8",
            (student["id"],)
        ).fetchall()

    latest = history[0] if history else None
    latest_data = None
    if latest:
        latest_data = {
            "career": latest["career"],
            "score": latest["score"],
            "matched": json.loads(latest["matched_json"]),
            "missing": json.loads(latest["missing_json"]),
            "required": CAREERS.get(latest["career"], []),
        }

    return render_template(
        "dashboard.html",
        student=student,
        history=history,
        latest=latest_data,
        careers=CAREERS
    )


@app.route("/analyze", methods=["GET", "POST"])
def analyze():
    student = current_student()
    if not student:
        flash("Please create your profile first.", "info")
        return redirect(url_for("register"))

    if request.method == "POST":
        career = request.form.get("career", "")
        selected = request.form.getlist("skills")

        if career not in CAREERS:
            flash("Please choose a valid career path.", "error")
            return redirect(url_for("analyze"))

        score, matched, missing, required = analyze_skills(career, selected)
        with get_db() as db:
            db.execute("""
                INSERT INTO assessments
                (student_id, career, skills_json, matched_json, missing_json, score, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                student["id"], career, json.dumps(selected), json.dumps(matched),
                json.dumps(missing), score, datetime.now().strftime("%d %b %Y, %I:%M %p")
            ))
        flash("Your skill analysis has been saved.", "success")
        return redirect(url_for("dashboard"))

    return render_template("analyze.html", student=student, careers=CAREERS, all_skills=ALL_SKILLS)


@app.route("/history")
def history():
    student = current_student()
    if not student:
        return redirect(url_for("register"))
    with get_db() as db:
        assessments = db.execute(
            "SELECT * FROM assessments WHERE student_id = ? ORDER BY id DESC",
            (student["id"],)
        ).fetchall()
    return render_template("history.html", student=student, assessments=assessments)


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("index"))


@app.errorhandler(404)
def not_found(_error):
    return render_template("404.html"), 404


init_db()

if __name__ == "__main__":
    app.run(debug=True)
