# AICareer Pro

AI-Powered Career Guidance System

AICareer Pro is an AI-driven platform designed to enhance career planning and job search through Machine Learning, NLP, and real-time analytics. It combines ML-based predictions with LLM-powered content generation to provide personalized, data-driven guidance.


## Overview

AICareer Pro offers tools for:

- Career prediction using ML models
- Resume building with professional templates
- AI-powered cover letter generation
- Mock interview practice with speech recognition
- Job market insights across multiple countries
- LinkedIn profile analysis and optimization
- Portfolio generation
- Stream prediction for students


## Key Features

### Career Prediction
- Skill-based career recommendations
- Random Forest classifier (Scikit-learn)
- Skill gap analysis
- Radar chart visualization
- Personalized learning roadmap

### Resume Builder
- 10 professional templates
- Drag-and-drop section reordering
- Live preview
- PDF export
- Form validation and auto-save

### Cover Letter Generator
- LLM-based content generation
- Job description analysis
- ATS keyword optimization
- DOCX download

### Mock Interview
- Career-specific questions
- Speech recognition
- AI evaluation and scoring
- Feedback with improvement suggestions

### Job Market Insights
- Real-time job listings
- Salary trends
- Multi-country coverage
- Location-based filtering

### LinkedIn Profile Auditor
- SEO and keyword analysis
- Headline and summary optimization
- Profile completeness scoring
- PDF report export

### Portfolio Generator
- Guided 5-step wizard
- Responsive HTML portfolio
- Downloadable standalone file

### Stream Prediction
- Class 11 stream recommendation
- Marks and interest-based analysis


## Tech Stack

### Frontend
- React 18
- React Router
- Three.js
- Chart.js
- Framer Motion
- html2canvas
- jsPDF

### Backend
- Python 3.9+
- Flask
- Flask-JWT-Extended
- Flask-CORS

### Database
- MongoDB

### AI / ML
- Scikit-learn
- Pandas
- NumPy
- NLTK / spaCy
- OpenAI API

### Document Processing
- python-docx
- OpenPyXL
- ReportLab


## Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm
- Git
- Ollama(It is important to generate cover letter, mock interview questions....You can read the OLLAMA_SETUP.md file)

### Clone Repository
    git clone https://github.com/vaibhavagarwal46/AICareer-Pro---Career-Guidance-System

### Frontend Setup
    cd frontend
    npm install
    npm start

### Backend Setup
    cd backend
    python -m venv venv
    venv\Scripts\activate        (Windows)
    source venv/bin/activate     (Mac/Linux)
    pip install -r requirements.txt
    python app.py

### Database Setup 
    Open another terminal and run "mongod"

### Ollama Connection
    Open another terminal and run "ollama serve"      

## Author

- Vaibhav Agarwal  
- GitHub:- https://github.com/vaibahvagarwal46 
- LinkedIn:- https://linkedin.com/in/vaibhavagarwal46     




