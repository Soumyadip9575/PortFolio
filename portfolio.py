"""
Soumyadip Karak – AI Engineer Portfolio
Backend: Python / Flask
"""

import sys
try:
    from flask import Flask, render_template, request, jsonify, send_file
except Exception as e:
    print("Error: Flask is not installed or failed to import.")
    print("Install dependencies with:")
    print("    python -m venv .venv")
    print("    .venv\\Scripts\\Activate.ps1   (PowerShell)")
    print("    .venv\\Scripts\\activate.bat    (cmd.exe)")
    print("    python -m pip install --upgrade pip")
    print("    pip install -r requirements.txt")
    print("Then run: python portfolio.py")
    print('\nOriginal import error: ', repr(e))
    sys.exit(1)

import os, json, datetime

app = Flask(__name__)
app.secret_key = "sk_portfolio_2026"

# ── Portfolio data (Python drives the content)
PORTFOLIO_DATA = {
    "name": "Soumyadip Karak",
    "title": "ML Engineer And Data Analyst",
    "roles": ["ML Engineer", "Data Analyst", "AI Engineer", "Data Scientist"],
    "bio": (
        "Passionate AI Engineer crafting intelligent systems that solve real-world challenges. "
        "Specializing in machine learning, deep learning, and generative AI — bridging research "
        "and production at scale from Kolkata, India."
    ),
    "location": "Kolkata, West Bengal, India",
    "email": "karaksoumyadip92@gmail.com",
    "phone": "+91 9339799575",
    "linkedin": "www.linkedin.com/in/soumyadip-karak-2004s",
    "github": "github.com/Soumyadip9575",
    "facebook":"https://www.facebook.com/share/1H8oWQsVaH/",
    "stats": [
        {"number": "5+",  "label": "Certifications\nEarned"},
        {"number": "8+", "label": "Projects\nCompleted"},
        {"number": "10+", "label": "Technologies\nMastered"},
        {"number": "3+", "label": "Internships &\nTrainings"},
    ],
    "skills": [
        {"name": "Machine Learning",      "pct": 92},
        {"name": "Deep Learning / NLP",   "pct": 88},
        {"name": "Generative AI",         "pct": 90},
        {"name": "Python / FastAPI",      "pct": 95},
    ],
    "tech_tags": [
        "Python","PyTorch","TensorFlow",
        "OpenAI","AWS","Scikit-learn","Pandas"
    ],
    "services": [
        {"icon": "🤖", "title": "AI / ML Development",       "desc": "End-to-end model design, training, evaluation, and deployment tailored to your exact business problem."},
        {"icon": "💬", "title": "Generative AI",             "desc": "Custom chatbots, RAG pipelines, fine-tuned LLMs, and intelligent agents powered by the latest frontier models."},
        {"icon": "📊", "title": "Data Science & Analytics",  "desc": "Exploratory analysis, feature engineering, predictive modelling, and actionable insights from raw data."},
        {"icon": "🔗", "title": "API & AI Integration",      "desc": "Seamlessly integrate AI capabilities into existing systems via REST APIs, SDKs, and microservices."},
    ],
    "projects": [
        {"emoji":"📩","logo":"images/gmail-logo.svg","title":"Spam Mail Detection","desc":"Streamlit app that detects spam emails using NLP models and feature-based classifiers, with real-time inference and a simple UI.","tags":["NLP","Spam Detection","Streamlit","Machine Learning"],"grad":"g2","live":"https://spam-mail-detection-soumyadip.streamlit.app/","gh":"https://github.com/Soumyadip9575/Spam-Mail-Detection"},
        {"emoji":"💰","logo":"images/finpay-logo.png","title":"FinPay (VORTEx)","desc":"FinPay — a payments demo (VORTEx) deployed on Render providing secure payment flows and transaction demos.","tags":["FinTech","Payments","Flask","Deploy"],"grad":"g3","live":"https://finpay-28s5.onrender.com/","gh":"https://github.com/Soumyadip9575/VORTEx-"},
        {"emoji":"🚗","logo":"images/car-logo.svg","title":"Parking Identification","desc":"Parking Identification — vehicle detection and parking-slot identification web demo with visual overlays.","tags":["Computer Vision","Object Detection","Web Demo"],"grad":"g4",   "live":"https://soumyadip9575.github.io/Parking-Identification/","gh":"https://github.com/Soumyadip9575/Parking-Identification"},
        {"emoji":"🧑‍💻","title":"PortFolio",       "desc":"A portfolio is a compilation of academic and professional materials that exemplifies your beliefs, skills, qualifications, education, training, and experiences. It provides insight into your personality and work ethic.",             "tags":["BERT","FastAPI","Docker"],    "grad":"g3"},
        {"emoji":"🗣️","title":"AI Voice Assistant",           "desc":"Conversational assistant with Whisper STT, Llama reasoning, and neural TTS for smart home automation.", "tags":["Whisper","Llama","TTS"],      "grad":"g4"},
        {"emoji":"🎨","title":"Image Generation App",         "desc":"Stable Diffusion web app for text-to-image generation with custom LoRA fine-tuning support.",          "tags":["Stable Diffusion","LoRA","Gradio"],"grad":"g6"},
    ],
    "year": datetime.datetime.now().year,
}

# New CV filename requested by user
CV_FILENAME = "CV_SOUMYADIP 09.06.2026 (1).pdf"
STATIC_CV_PATH = os.path.join(app.root_path, 'static', 'cv', CV_FILENAME)
# Absolute fallback path (user desktop) — updated to the new file name provided by the user.
FALLBACK_CV_PATH = r"C:\Users\SOUMYADIP KARAK\OneDrive\Desktop\CV_SOUMYADIP 09.06.2026 (1).pdf"

OLD_CV_FILENAME = "CV_SOUMYADIP 09.02.2026.pdf"
old_static = os.path.join(app.root_path, 'static', 'cv', OLD_CV_FILENAME)
try:
    if os.path.exists(old_static):
        os.remove(old_static)
except Exception:
    # Non-fatal; continue without interrupting the app startup
    pass

@app.route("/")
def home():
    # indicate whether a CV is available (either in static/cv or fallback path)
    cv_exists = os.path.exists(STATIC_CV_PATH) or os.path.exists(FALLBACK_CV_PATH)
    return render_template("index.html", d=PORTFOLIO_DATA, cv_available=cv_exists)

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(force=True) or {}
    name    = data.get("name","").strip()
    email   = data.get("email","").strip()
    subject = data.get("subject","").strip()
    message = data.get("message","").strip()
    if not all([name, email, message]):
        return jsonify({"ok": False, "error": "Please fill in all required fields."}), 400
    # In production: send email / save to DB
    print(f"[Contact] {name} <{email}> — {subject}")
    return jsonify({"ok": True, "message": f"Thanks {name}! I'll get back to you soon."})

@app.route("/api/data")
def api_data():
    """Expose portfolio data as JSON (handy for debugging / future SPA use)."""
    return jsonify(PORTFOLIO_DATA)


@app.route('/download-cv')
def download_cv():
    """Send the user's CV file as a download. Uses the absolute path specified
    in `DOWNLOAD_CV_PATH`. Returns JSON error if file is missing or cannot be
    sent.
    """
    # prefer static copy in repo
    if os.path.exists(STATIC_CV_PATH):
        try:
            return send_file(STATIC_CV_PATH, as_attachment=True)
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500
    # fallback to user-provided desktop path
    if os.path.exists(FALLBACK_CV_PATH):
        try:
            return send_file(FALLBACK_CV_PATH, as_attachment=True)
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500
    return jsonify({"ok": False, "error": "CV file not found on server. Place the file at static/cv/ or update FALLBACK_CV_PATH."}), 404

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)