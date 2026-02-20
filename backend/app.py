from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import pickle
import numpy as np
import os
import sys
from datetime import datetime, timezone
import json
import ollama
import joblib
import requests
from dotenv import load_dotenv
import random
import pandas as pd
import time
from werkzeug.utils import secure_filename
import warnings
from sklearn.exceptions import InconsistentVersionWarning

app = Flask(__name__)
CORS(app) 
bcrypt = Bcrypt(app)

warnings.filterwarnings("ignore", category=InconsistentVersionWarning) 

# Loading environment variables from .env file
load_dotenv()
ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY')
ADZUNA_LOCATION = os.getenv('ADZUNA_LOCATION', 'us')

# CONNECTING MONGODB ->
client = MongoClient("mongodb://localhost:27017/")
db = client['career_guide_db']
users_collection = db['users']
try:
    client.admin.command('ping')
    print("MongoDB connection successful!")
except Exception as e:
    print(f"ERROR: Failed to connect to MongoDB! Is the server running? Details: {e}", file=sys.stderr)


# OLLAMA INTEGRATION ->
MODEL_NAME = 'llama3.2:1b'
print(f"Using Ollama with model: {MODEL_NAME} for Cover Letter & Mock Interview generation")

# LOADING STREAM PREDICTION MODEL
try:
    stream_model = joblib.load('10_stream_predictor_model.pkl')
    print("Pipeline model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# LOADING PROFESSION PREDICTION MODEL
try:
    with open('career_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    print("Career Prediction model loaded successfully.")
except FileNotFoundError:
    print("WARNING: Career model files not found. Prediction route disabled.")
    model = None
except ModuleNotFoundError as e:
    print(f"FATAL ERROR: Failed to load ML model due to missing module: {e}")
    model = None
 

rating_map = {
    'Not Interested': 0, 'Poor': 1, 'Beginner': 2, 'Average': 3, 
    'Intermediate': 4, 'Excellent': 5, 'Professional': 6
}



JOB_DESCRIPTIONS = {
    "Data Scientist": """A Data Scientist explores large datasets to extract insights and develop predictive models. They clean, preprocess, and analyze data using statistical and machine learning techniques. Their work includes feature engineering, algorithm selection, and model validation. Data scientists collaborate with teams to solve business problems using data. They visualize results using dashboards and meaningful reports. They experiment with advanced techniques to improve accuracy and efficiency. Their insights support strategic planning and innovation. Their expertise drives data-driven decision-making.""",
    "Software Developer": """A Software Developer builds, tests, and maintains software applications that solve real-world problems. They analyze user requirements and translate them into technical solutions. Their work involves writing clean, efficient code using programming languages and frameworks. Developers collaborate with designers, testers, and project managers throughout the development cycle. They debug errors, enhance features, and optimize performance. Developers also maintain documentation for future updates. Continuous learning of new tools and technologies helps them stay relevant. Their innovations power digital products and services used daily.""",
    "Cyber Security Specialist": """A Cyber Security Specialist protects an organization’s digital systems from internal and external threats. They conduct vulnerability assessments, penetration testing, and monitor real-time security alerts. Their job includes implementing security measures such as firewalls, encryption, and intrusion detection systems. They respond to cyber incidents and perform forensic analysis to determine root causes. Cyber specialists also create policies, standards, and awareness programs to strengthen security culture. They regularly update systems to patch vulnerabilities. Their continuous monitoring ensures data confidentiality, integrity, and availability. Their vigilance is critical for preventing cyberattacks.""",
    "Database Administrator": """A Database Administrator manages and maintains an organization’s database systems to ensure optimal performance and data accuracy. They oversee installation, configuration, and upgrading of database servers. DBAs regularly perform backups and recovery planning to avoid data loss. They monitor database performance and apply tuning techniques to improve efficiency. Their role includes ensuring compliance with security standards and managing user access. DBAs collaborate with developers to design and implement data models. They troubleshoot database issues and maintain documentation. Their work ensures that business applications run smoothly and reliably.""",
    "Technical Writer": """A Technical Writer creates clear and structured documentation for software, hardware, or technical processes. They translate complex concepts into simple, user-friendly content. Their work includes preparing manuals, user guides, API documentation, and FAQs. They collaborate with developers and engineers to gather accurate information. Technical writers ensure consistency in terminology and formatting. They update documents as new features or systems emerge. Their writing supports training, troubleshooting, and product adoption. Their role enhances customer understanding and product usability.""",
    "Project Manager": """A Project Manager plans, executes, and oversees projects to ensure timely and successful delivery. They define project scope, objectives, timeline, and resource allocation. Their role includes coordinating cross-functional teams and resolving conflicts. They monitor progress through reports, meetings, and project management tools. Project managers manage risks and implement mitigation strategies. They communicate regularly with stakeholders and ensure alignment with business goals. Budget management is also part of their responsibility. Their leadership ensures smooth execution and high-quality outcomes.""",
    "Network Engineer": """A Network Engineer designs, configures, and maintains network infrastructure such as routers, switches, and firewalls. They ensure reliable LAN, WAN, and cloud connectivity across the organization. Their responsibilities include monitoring network performance and troubleshooting connectivity issues. They implement security measures to protect against unauthorized access and cyber threats. Network engineers optimize bandwidth usage and upgrade network hardware when needed. They collaborate with IT teams to support projects and system integrations. Documentation of network architecture and changes is part of their routine work. Their role ensures seamless communication across systems and users.""",
    "AI ML Specialist": """An AI/ML Specialist develops machine learning models and AI solutions that automate tasks and provide insights. They process and analyze large datasets to identify patterns. Their role includes selecting algorithms, training models, and improving accuracy through tuning. They collaborate with data scientists and software teams to integrate models into applications. They evaluate performance using metrics and refine models when necessary. AI/ML specialists stay updated with advancements in deep learning, NLP, and AI frameworks. They help businesses adopt intelligent technologies. Their work drives innovation across industries.""",
    "Business Analyst": """A Business Analyst analyzes business processes and translates requirements into technical specifications. They interact with stakeholders to understand goals and identify gaps. Their work includes creating BRDs, FRDs, flowcharts, and documentation. Analysts collaborate with developers to ensure proper implementation of solutions. They use data-driven insights to recommend process improvements. Business analysts validate outputs through testing and feedback collection. Their communication skills help bridge the gap between business and IT teams. Their work contributes to strategic decision-making.""",
    "Software Engineer": """Applies engineering principles to the design, development, maintenance, testing, and evaluation of software systems. This role typically works on large, complex codebases and focuses on the long-term maintainability and scalability of applications (Software Engineering).""",
    "Hardware Engineer": """A Hardware Engineer designs, develops, and tests physical computer components and related systems. They create circuit designs and analyze system requirements to build efficient hardware structures. Their work includes developing prototypes and performing simulations using engineering software tools. They collaborate with software teams to ensure full compatibility. Hardware engineers also diagnose hardware issues and improve system performance. They work on optimizing power consumption, speed, and durability of devices. Regular research into emerging technologies helps them innovate. Their contributions form the backbone of modern computing systems.""",
    "Application Support Engineer": """An Application Support Engineer provides technical support for business-critical software applications. They monitor application performance, analyze logs, and troubleshoot errors to ensure smooth functioning. Their role includes handling user queries and offering solutions for functional and technical issues. They work closely with development teams to escalate and resolve bugs. Application support engineers also assist in deployments, updates, and configuration management. They create knowledge-base articles and documentation for repeated issues. Strong analytical and communication skills help them quickly resolve problems. Their role ensures uninterrupted operations for users and organizations.""",
    "API Specialist": """An API Specialist designs, develops, and manages APIs that enable applications to communicate seamlessly. They ensure APIs are secure, scalable, and well-structured. Their role involves integrating third-party services and optimizing data flow between systems. They troubleshoot API issues and monitor logs to maintain performance. API specialists work with backend teams to define data models, endpoints, and authentication methods. They maintain version control and ensure backward compatibility. Technical documentation is also a key responsibility. Their work enables efficient interaction between diverse software platforms.""",
    "Information Security Specialist": """An Information Security Specialist safeguards sensitive data by implementing and managing security controls. They conduct risk assessments and identify vulnerabilities in IT systems. Their job includes developing security policies and ensuring compliance with standards. They monitor systems for intrusion attempts and suspicious behavior. In case of incidents, they respond quickly and carry out root-cause analysis. They also educate employees on cybersecurity best practices. Regular audits and updates help maintain strong security posture. Their work ensures that organizational assets remain protected.""",
    "Software tester": """A Software Tester ensures software quality by identifying bugs and validating functionality. They develop test plans, create test cases, and perform manual or automated tests. Their work includes regression testing, load testing, and usability testing. Testers collaborate closely with developers to ensure quick issue resolution. They document test results and track defects until closure. Their attention to detail ensures product stability and user satisfaction. They verify that applications meet functional and non-functional requirements. Their role is essential for delivering reliable software products.""",
    "Customer Service Executive": """A Customer Service Executive assists customers by resolving queries and providing support through calls, emails, or chats. They maintain detailed records of interactions and follow up when necessary. Their role includes troubleshooting basic product or service issues. They ensure customer satisfaction by providing accurate and timely responses. Executives escalate complex problems to higher support levels. Strong communication, patience, and empathy are essential in this role. They also promote products or services when required. Their service helps build trust and customer loyalty.""",
    "Helpdesk Engineer": """A Helpdesk Engineer provides frontline IT support by resolving user issues related to hardware, software, and networking. They handle support tickets, diagnose problems, and offer step-by-step solutions. Their responsibilities include installing and configuring systems. Helpdesk engineers escalate complex issues to higher-level support when needed. They maintain logs and documentation of repeated issues. Strong communication and troubleshooting skills are essential. Their timely support ensures smooth operations in the organization. They play a key role in maintaining IT service quality.""",
    "Graphics Designer": """A Graphics Designer creates visually appealing content for marketing, branding, and communication. They use design tools to produce logos, posters, social media creatives, and UI graphics. Their work includes understanding client or brand requirements and building creative concepts. They collaborate with marketing and content teams to ensure design consistency. Designers revise drafts based on feedback and improve visual aesthetics. They stay updated with design trends to create modern visuals. Attention to detail and creativity are crucial to their role. Their designs enhance brand identity and engagement.""",
    "Default Career": "A general career path focused on utilizing technical and business skills to solve organizational challenges. Specific duties depend on specialization and can involve a mix of development and analysis."
}
  

FEATURE_ORDER = [
    'Database Fundamentals', 'Computer Architecture', 'Distributed Computing Systems',
    'Cyber Security', 'Networking', 'Software Development', 'Programming Skills',
    'Project Management', 'Computer Forensics Fundamentals', 'Technical Communication',
    'AI ML', 'Software Engineering', 'Business Analysis', 'Communication skills',
    'Data Science', 'Troubleshooting skills', 'Graphics Designing'
]


IDEAL_SKILLS_DATA = {
    "Data Scientist": [5, 3, 5, 2, 2, 4, 6, 3, 2, 5, 6, 4, 5, 5, 6, 4, 2],
    "Software Developer": [4, 4, 3, 3, 3, 6, 6, 4, 2, 4, 3, 5, 3, 4, 2, 5, 2],
    "Cyber Security Specialist": [4, 4, 3, 6, 5, 3, 4, 4, 6, 4, 2, 3, 3, 4, 2, 6, 1],
    "Database Administrator": [6, 4, 4, 3, 3, 3, 4, 3, 2, 4, 2, 4, 4, 4, 3, 6, 1],
    "Technical Writer": [2, 2, 2, 2, 2, 4, 4, 4, 1, 6, 2, 4, 4, 6, 2, 3, 4],
    "Project Manager": [3, 2, 2, 3, 3, 3, 3, 6, 1, 6, 2, 4, 6, 6, 3, 4, 2],
    "Network Engineer": [4, 5, 4, 5, 6, 3, 4, 4, 3, 4, 2, 3, 3, 4, 2, 6, 1],
    "AI ML Specialist": [4, 4, 5, 2, 2, 5, 6, 3, 2, 4, 6, 4, 4, 4, 6, 4, 2],
    "Business Analyst": [4, 2, 2, 2, 2, 3, 3, 5, 1, 5, 2, 4, 6, 6, 4, 3, 3],
    "Software Engineer": [4, 5, 4, 3, 3, 6, 6, 4, 2, 4, 4, 6, 3, 4, 3, 5, 3],
    "Hardware Engineer": [3, 6, 4, 3, 4, 2, 4, 3, 3, 4, 2, 3, 3, 3, 2, 6, 1],
    "Application Support Engineer": [5, 4, 3, 3, 4, 4, 4, 3, 2, 4, 2, 4, 3, 6, 2, 6, 2],
    "API Specialist": [4, 3, 5, 3, 4, 6, 6, 4, 1, 5, 3, 5, 4, 4, 3, 5, 1],
    "Information Security Specialist": [4, 4, 3, 6, 5, 2, 4, 4, 5, 4, 2, 3, 4, 4, 2, 5, 1],
    "Software tester": [4, 3, 3, 3, 3, 5, 5, 4, 2, 5, 3, 5, 4, 5, 2, 6, 2],
    "Customer Service Executive": [2, 1, 1, 2, 2, 2, 2, 3, 1, 5, 1, 2, 4, 6, 1, 5, 2],
    "Helpdesk Engineer": [4, 4, 3, 4, 5, 3, 4, 3, 3, 5, 2, 3, 3, 6, 2, 6, 2],
    "Graphics Designer": [2, 2, 1, 1, 1, 2, 3, 3, 1, 5, 2, 2, 3, 5, 2, 4, 6],
    "Default Career": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
}



@app.route('/signup', methods=['POST'])
@cross_origin()
def signup():
    data = request.json
    if users_collection.find_one({'email': data['email']}):
        return jsonify({"message": "User already exists"}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    users_collection.insert_one({
        'name': data['name'], 
        'email': data['email'], 
        'password': hashed_password
    })
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.json
    user = users_collection.find_one({'email': data['email']})
    if user and bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({"message": "Login successful", "name": user['name']}), 200
    return jsonify({"message": "Invalid credentials"}), 401




# ROADMAP GENERATOR FEATURE ->

def generate_roadmap(career, user_scores, ideal_scores):
    """Generate a roadmap based on skill gap analysis."""
    roadmap = []
    skills = FEATURE_ORDER
    for i in range(len(skills)):
        gap = ideal_scores[i] - user_scores[i]
        
        if gap > 2:
            roadmap.append({
                "skill": skills[i],
                "status": "Critical Gap",
                "priority": 1,
                "note": "High priority: Essential for this role."
            })
        elif gap > 0:
            roadmap.append({
                "skill": skills[i],
                "status": "Improvement Needed",
                "priority": 2,
                "note": "Moderate priority: Refine these skills."
            })
    return sorted(roadmap, key=lambda x: x['priority'])
  


# PROFESSION PREDICTION FEATURE ->

@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    if model is None:
        return jsonify({"error": "Prediction model is not available."}), 503
    data = request.json
    user_skills = data.get('skills', {})
    user_email = data.get('user_email', 'anonymous')
    feature_order = FEATURE_ORDER
    input_vector = []
    for feature in feature_order:
        value_text = user_skills.get(feature, 'Not Interested')
        input_vector.append(rating_map.get(value_text, 0))
    
    predicted_role = "Default Career"
    job_description = JOB_DESCRIPTIONS.get(predicted_role)
    
    try:
        prediction_index = model.predict([np.array(input_vector)])[0]
        predicted_role = label_encoder.inverse_transform([prediction_index])[0]
        
        job_description = JOB_DESCRIPTIONS.get(
            predicted_role, 
            f"A detailed description for the role: {predicted_role} is not yet available in our database."
        )
        user_numeric_scores = [rating_map.get(user_skills.get(f, 'Not Interested'), 0) for f in FEATURE_ORDER]
        career_record = {
            'inputs_skills': user_skills,
            'predicted_career': predicted_role,
            'timestamp': datetime.now(timezone.utc),
            'user_email': user_email
        }
        
        try:
            db.career_predictions.insert_one(career_record)
            print(f"Successfully logged career prediction: {predicted_role}")
        except Exception as log_e:
            print(f"ERROR logging career prediction to MongoDB: {log_e}")

        ideal_scores = IDEAL_SKILLS_DATA.get(predicted_role, [3] * len(FEATURE_ORDER))
        roadmap_steps = generate_roadmap(predicted_role, user_numeric_scores, ideal_scores)
        return jsonify({
            "career": predicted_role,
            "description": job_description,
            "user_scores": user_numeric_scores,
            "ideal_scores": ideal_scores,
            "labels": FEATURE_ORDER,
            "roadmap": roadmap_steps
        })
    except Exception as e:
        print(f"Prediction Runtime Error: {e}")
        return jsonify({"error": "Error during model prediction."}), 500



# JOB INSIGHTS FEATURE ->

@app.route('/job-insights', methods=['POST'])
def get_job_insights():
    """
    Fetch live job market data from Adzuna API based on predicted job role.
    This provides real, clickable job listings with salary data.
    """
    try:
        data = request.json
        role = data.get('role')
        location = data.get('location', ADZUNA_LOCATION)
        if not role:
            return jsonify({"error": "Role is required"}), 400
        if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
            return jsonify({
                "error": "Adzuna API credentials not found.... Please set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env file"
            }), 500

        url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
        params = {
            'app_id': ADZUNA_APP_ID,
            'app_key': ADZUNA_APP_KEY,
            'results_per_page': 5,
            'what': role,
            'content-type': 'application/json'
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        job_data = response.json()
        listings = []
        for job in job_data.get('results', []):
            listings.append({
                'title': job.get('title'),
                'company': job.get('company', {}).get('display_name', 'N/A'),
                'location': job.get('location', {}).get('display_name', 'Remote'),
                'salary_min': job.get('salary_min'),
                'salary_max': job.get('salary_max'),
                'url': job.get('redirect_url'),
                'description': job.get('description', '')[:200]
            })

        print(f"Fetched {len(listings)} job listings for role: {role} from Adzuna")
        
        return jsonify({
            "listings": listings,
            "count": job_data.get('count', 0),
            "role": role,
            "location": location
        })
    except requests.exceptions.Timeout:
        print("ERROR: Adzuna API request timed out")
        return jsonify({"error": "API request timed out. Please try again."}), 504
    except requests.exceptions.HTTPError as e:
        print(f"ERROR: Adzuna API HTTP Error: {e}")
        return jsonify({"error": f"API Error: {str(e)}"}), 502
    except Exception as e:
        print(f"ERROR: Job insights fetch failed: {e}")
        return jsonify({"error": str(e)}), 500



# FOR STREAM PREDICTION FEATURE ->

@app.route('/api/predict_stream', methods=['POST'])
@cross_origin()
def predict_stream():
    """Predicts stream using the Pipeline Model and logs to MongoDB."""
    data = request.json
    user_email = data.get('user_email', 'anonymous')
    try:
        input_data = {
            'math_marks': float(data.get('math_marks', 0)),
            'science_marks': float(data.get('science_marks', 0)),
            'social_marks': float(data.get('social_marks', 0)),
            'english_marks': float(data.get('english_marks', 0)),
            'hobby': data.get('hobby', 'Technical'),
            'activity': data.get('activity', 'Robotics'),
            'logic_score': int(data.get('logic_score', 0)),
            'creative_score': int(data.get('creative_score', 0)),
            'leadership_score': int(data.get('leadership_score', 0))
        }
        input_df = pd.DataFrame([input_data])

    except (ValueError, TypeError) as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400

    predicted_stream = "Unsure"
    reason = "Analysis based on provided academic and aptitude profile."

    if stream_model:
        try:
            prediction = stream_model.predict(input_df)[0]
            predicted_stream = str(prediction)
            if predicted_stream == 'Science':
                reason = f"Your strong Logic score ({input_data['logic_score']}/5) and marks in Math/Science suggest a great fit for Science."
            elif predicted_stream == 'Commerce':
                reason = f"High Leadership ({input_data['leadership_score']}/5) and interest in {input_data['hobby']} align well with Commerce."
            elif predicted_stream == 'Humanities':
                reason = f"Your Creativity score ({input_data['creative_score']}/5) and Social Studies marks indicate potential in Humanities."
            
        except Exception as e:
            print(f"Prediction Error: {e}")
            predicted_stream = "Error"
            reason = f"Model prediction failed: {str(e)}"
    else:
        reason = "ML Model not loaded on server."

    log_entry = {
        'user_email': user_email,
        'timestamp': datetime.now(timezone.utc),
        'inputs': input_data,
        'prediction': predicted_stream,
        'reason': reason
    }
    try:
        db.stream_predictions.insert_one(log_entry)
        print("Prediction logged to MongoDB.")
    except Exception as e:
        print(f"MongoDB Error: {e}")
    return jsonify({
        'stream': predicted_stream,
        'reasoning': reason
    })



# COVER LETTER GENERATION ->

@app.route('/api/generate_cover_letter', methods=['POST'])
@cross_origin()
def generate_cover_letter_route():
    data = request.get_json()
    job_description = data.get('jobDescription')
    user_name = data.get('userName')
    
    if not job_description or not user_name:
        return jsonify({"error": "Name and job description are required"}), 400

    prompt = f"""You are an expert career assistant. Write a professional, persuasive cover letter.

Candidate Name: {user_name}
Job Description:
{job_description}

Generate a professional cover letter that:
- Uses a confident, professional tone
- Is 200-300 words
- Highlights relevant skills matching the job
- Includes specific examples where relevant
- Has proper formatting (date, greeting, body, signature)
- Is ready to submit

Cover Letter:"""
    
    try:
        response = ollama.generate(
            model=MODEL_NAME,
            prompt=prompt,
            options={
                'temperature': 0.5,
                'top_p': 0.9,
                'top_k': 40
            }
        )
        cover_letter_text = response['response'].strip()
        
        return jsonify({
            "cover_letter": cover_letter_text
        })
    except Exception as e:
        print(f"Ollama Cover Letter Error: {e}", file=sys.stderr)
        return jsonify({"error": "Failed to generate cover letter. Please ensure Ollama is running."}), 500





@app.route('/api/profile', methods=['POST'])
@cross_origin()
def manage_profile():
    """Creates a new profile or updates an existing one using upsert."""
    data = request.json
    user_email = data.get('email')
    if not user_email:
        return jsonify({"error": "Email is required to manage profile."}), 400
    profile_data = {
        'headline': data.get('headline', ''),
        'summary': data.get('summary', ''),
        'experience': data.get('experience', []), 
        'education': data.get('education', []),
        'skills_list': data.get('skills_list', []),
        'last_updated': datetime.now(timezone.utc)
    }
    try:
        result = db.user_profiles.update_one(
            {'email': user_email},
            {'$set': profile_data},
            upsert=True
        )
        
        if result.upserted_id:
            message = "New profile created successfully."
        else:
            message = "Profile updated successfully."
            
        print(f"Profile managed for {user_email}. Result: {message}")
        
        return jsonify({"message": message}), 200

    except Exception as e:
        print(f"Error managing profile for {user_email}: {e}")
        return jsonify({"error": "Server error while saving profile data."}), 500

@app.route('/api/profile/<email>', methods=['GET'])
@cross_origin()
def get_profile(email):
    """Retrieves an existing profile by email."""
    if not email:
        return jsonify({"error": "Email parameter is required."}), 400
    
    try:
        profile = db.user_profiles.find_one({'email': email}, {'_id': 0, 'email': 0})
        
        if profile:
            if 'last_updated' in profile:
                 profile['last_updated'] = profile['last_updated'].isoformat()
            
            return jsonify(profile), 200
        else:
            return jsonify({"message": "Profile not found."}), 404
            
    except Exception as e:
        print(f"Error fetching profile for {email}: {e}")
        return jsonify({"error": "Server error while fetching profile data."}), 500



# LINKEDIN AUDITOR FEATURE ->        

@app.route('/audit-linkedin', methods=['POST'])
@cross_origin()
def audit_linkedin():
    """Audit LinkedIn profile using Ollama and generate personalized suggestions."""
    data = request.json
    content = data.get('content', '')
    career = data.get('career', 'Professional')
    input_type = data.get('type', 'paste') 
    MODEL_NAME = 'llama3.2:1b'
    prompt = f"""
    Context ID: {int(time.time())}
    You are a world-class LinkedIn Profile Optimizer and Executive Recruiter.
    
    TASK: 
    Analyze the following LinkedIn profile data (Source: {input_type}) and optimize it for a career in "{career}".
    
    PROFILE DATA:
    {content}

    REQUIREMENTS:
    1. Write a punchy, keyword-rich 'headline'.
    2. Write a professional, first-person 'summary' (About section) that highlights achievements.
    3. Provide 5 'suggestions' that are specific to the {career} industry.
    
    Return ONLY valid JSON in this format:
    {{
        "headline": "string",
        "summary": "string",
        "suggestions": ["list", "of", "5", "strings"]
    }}
    """

    try:
        response = ollama.generate(
            model=MODEL_NAME,
            prompt=prompt,
            format='json',
            options={
                'temperature': 0.8,
                'seed': random.randint(1, 1000000)
            }
        )
        result = json.loads(response['response'])
        return jsonify(result)

    except Exception as e:
        print(f"Ollama Audit Error: {e}", file=sys.stderr)
        return jsonify({
            "headline": f"{career} Specialist | Transforming Challenges into Solutions",
            "summary": f"A dedicated professional aiming to excel in {career}. Highly skilled in analyzing complex data and implementing efficient workflows to drive business growth.",
            "suggestions": [
                f"Identify 3 key {career} skills you possess and add them to your top skills.",
                "Quantify your experience (e.g., 'Reduced costs by 15%').",
                "Request recommendations from former colleagues to build social proof.",
                "Ensure your summary mentions specific tools used in the industry.",
                "Update your headline to include your primary value proposition."
            ]
        })



# FOR MOCK INTERVIEW FEATURE ->         

@app.route('/mock-interview', methods=['POST'])
@cross_origin()
def mock_interview():
    """Handle mock interview questions and answer evaluations with Ollama LLM (llama3.2:1b)."""
    data = request.json
    action = data.get('action')
    field = data.get('field', 'General Technology')
    
    MODEL_NAME = 'llama3.2:1b'
    if action == 'get_question':
        prompt = f"""You are a professional technical interviewer for {field}.
        Generate ONE specific, challenging question that tests deep technical knowledge.
        The question should focus on practical experience and architectural reasoning.
        Provide ONLY the question text, nothing else."""
        try:
            response = ollama.generate(
                model=MODEL_NAME,
                prompt=prompt,
                options={
                    'temperature': 0.8,
                    'seed': random.randint(1, 1000000)
                }
            )
            return jsonify({"question": response['response'].strip()})
        except Exception as e:
            print(f"Ollama error (get_question): {e}", file=sys.stderr)
            questions = {
                'Data Science': ['How do you handle imbalanced datasets?', 'Explain the Bias-Variance tradeoff.'],
                'Software Development': ['Explain the difference between REST and GraphQL.', 'How do you ensure code scalability?'],
                'Database Admin': ['How do you optimize a slow SQL query?', 'Explain Database Normalization vs Denormalization.'],
                'Cyber Security': ['What is Zero Trust Architecture?', 'How do you prevent SQL Injection?']
            }
            fallback_list = questions.get(field, ["Tell me about a challenging technical project you worked on."])
            return jsonify({"question": random.choice(fallback_list)})

    elif action == 'evaluate':
        question = data.get('question')
        user_answer = data.get('answer', '')
        eval_prompt = f"""You are a senior {field} interviewer. 
        Evaluate this candidate's answer based on technical accuracy, depth, and clarity.

        INTERVIEW QUESTION: {question}
        CANDIDATE ANSWER: {user_answer}

        Instructions:
        1. Assign a score from 0-10 (0 is gibberish, 10 is perfect).
        2. Provide constructive feedback (mention what was good and what was missing).
        3. Provide an 'ideal_answer' which is a perfect, expert-level response to the question.

        Return ONLY a JSON object in this format:
        {{
            "score": integer,
            "feedback": "string",
            "ideal_answer": "string"
        }}"""
        try:
            response = ollama.generate(
                model=MODEL_NAME,
                prompt=eval_prompt,
                format='json',
                options={'temperature': 0.2} 
            )
            result = json.loads(response['response'])
            if len(user_answer.split()) < 5:
                result['score'] = min(result['score'], 2)
                result['feedback'] = "Your answer is too short. Please provide more technical detail. " + result['feedback']
            return jsonify(result)
        except Exception as e:
            print(f"Evaluation Error: {e}", file=sys.stderr)
            return jsonify({
                "score": 0,
                "feedback": "Error analyzing answer. Please try providing a more detailed response.",
                "ideal_answer": "Check documentation for the best practices regarding this specific topic."
            }), 500

    return jsonify({"error": "Invalid action"}), 400




#  FOR PORTFOLIO GENERATION

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/generate-portfolio', methods=['POST'])
@cross_origin()
def generate_portfolio():
    try:
        hero_image_url = None
        about_image_url = None
        resume_url = "#"
        if 'heroImage' in request.files:
            file = request.files['heroImage']
            if file.filename != '':
                filename = secure_filename(f"hero_{int(time.time())}_{file.filename}")
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                hero_image_url = f"http://localhost:5000/uploads/{filename}"
        if 'aboutImage' in request.files:
            file = request.files['aboutImage']
            if file.filename != '':
                filename = secure_filename(f"about_{int(time.time())}_{file.filename}")
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                about_image_url = f"http://localhost:5000/uploads/{filename}"

        if 'resume' in request.files:
            file = request.files['resume']
            if file.filename != '':
                filename = secure_filename(f"resume_{int(time.time())}_{file.filename}")
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                resume_url = f"http://localhost:5000/uploads/{filename}"

        user_data = json.loads(request.form.get('userData', '{}'))
        name = user_data.get('name', 'User Name')
        role = user_data.get('role', 'Creative Professional')
        bio = user_data.get('bio', 'Passionate about creating digital experiences.')
        exp_years = user_data.get('experienceYears', '1+')
        completed_projects_count = user_data.get('projectsCompleted', '10+')
        companies_count = user_data.get('companiesWorked', '1+')
        skills_list = user_data.get('skills', [])
        projects = user_data.get('projects', [])
        education = user_data.get('education', [])
        contact = user_data.get('contact', {})
        email = contact.get('email', 'contact@example.com')
        phone = contact.get('phone', '+123 456 7890')
        location = contact.get('location', 'Remote')
        has_hero_image = user_data.get('hasHeroImage', True)
        has_about_image = user_data.get('hasAboutImage', True)

        for i, proj in enumerate(projects):
            file_key = f'projectImage_{i}'
            if file_key in request.files:
                p_file = request.files[file_key]
                if p_file.filename != '':
                    p_filename = secure_filename(f"proj_{i}_{int(time.time())}_{p_file.filename}")
                    p_file.save(os.path.join(app.config['UPLOAD_FOLDER'], p_filename))
                    projects[i]['image'] = f"http://localhost:5000/uploads/{p_filename}"

        def render_hero_image():
            img_src = hero_image_url if hero_image_url else "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&auto=format&fit=crop"
            if not has_hero_image: return ""
            return f"""
            <div class="relative w-full max-w-lg mx-auto lg:mr-0">
                <div class="absolute top-0 -left-4 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div class="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div class="relative overflow-hidden" style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.2);">
                    <img src="{img_src}" alt="{name}" class="w-full h-full object-cover transform hover:scale-105 transition duration-500">
                </div>
            </div>
            """
        def render_about_image():
            img_src = about_image_url if about_image_url else "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&h=800&auto=format&fit=crop"
            if not has_about_image: return ""
            return f"""
            <div class="lg:w-1/2 mb-10 lg:mb-0">
                <div class="relative w-full max-w-md mx-auto">
                    <div class="absolute inset-0 bg-violet-200 rounded-3xl transform rotate-3 scale-105"></div>
                    <img src="{img_src}" alt="About {name}" class="relative z-10 rounded-3xl shadow-xl w-full h-auto object-cover">
                </div>
            </div>
            """
        def render_skills_list():
            if not skills_list: return ""
            html = ""
            for skill in skills_list:
                s_name = skill.get('name', '')
                s_level = skill.get('level', 80)
                if s_name:
                    html += f"""
                    <div class="mb-5">
                        <div class="flex justify-between mb-1">
                            <span class="text-base font-medium text-slate-700">{s_name}</span>
                            <span class="text-sm font-medium text-violet-600">{s_level}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2.5">
                            <div class="bg-violet-600 h-2.5 rounded-full" style="width: {s_level}%"></div>
                        </div>
                    </div>
                    """
            return html

        def render_education_section():
            if not education: return ""
            edu_html = ""
            for item in education:
                degree = item.get('degree', 'Degree')
                inst = item.get('institution', 'Institution')
                year = item.get('year', 'Year')
                edu_html += f"""
                <div class="relative pl-8 pb-10 border-l-2 border-violet-200 last:border-0">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 bg-violet-600 rounded-full border-4 border-white"></div>
                    <span class="text-sm font-bold text-violet-600 uppercase tracking-wider">{year}</span>
                    <h4 class="text-xl font-bold text-slate-800 mt-1">{degree}</h4>
                    <p class="text-slate-500 font-medium">{inst}</p>
                </div>
                """
            return f"""
            <section id="education" class="py-20 bg-slate-50">
                <div class="container mx-auto px-6">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-slate-800">My <span class="text-violet-600">Qualification</span></h2>
                        <div class="w-20 h-1.5 bg-violet-600 mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div class="max-w-3xl mx-auto">{edu_html}</div>
                </div>
            </section>
            """
        def render_projects_grid():
            html = ""
            for i, proj in enumerate(projects):
                title = proj.get('title', f'Project {i+1}')
                desc = proj.get('desc', 'No description provided.')
                link = proj.get('githubLink', '#') 
                img_src = proj.get('image', f"https://source.unsplash.com/random/800x600/?tech,website&sig={i}")
                
                html += f"""
                <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 transition-all duration-300 group">
                    <div class="h-56 overflow-hidden relative">
                        <img src="{img_src}" alt="{title}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
                        <div class="absolute inset-0 bg-violet-900 bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <button onclick="openModal('{title}', `{desc}`, '{img_src}', '{link}')" class="bg-white text-violet-600 px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition duration-300">Quick View</button>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                        <p class="text-slate-600 mb-4 line-clamp-2">{desc}</p>
                        <a href="{link}" target="_blank" class="inline-flex items-center text-violet-600 font-semibold hover:text-violet-800 transition">
                            View Project <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 11H3a1 1 0 110-2h13.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        </a>
                    </div>
                </div>
                """
            return html

        html_template = f"""<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Poppins', sans-serif; }}
        .animate-blob {{ animation: blob 7s infinite; }}
        .animation-delay-2000 {{ animation-delay: 2s; }}
        .animation-delay-4000 {{ animation-delay: 4s; }}
        @keyframes blob {{
            0% {{ transform: translate(0px, 0px) scale(1); }}
            33% {{ transform: translate(30px, -50px) scale(1.1); }}
            66% {{ transform: translate(-20px, 20px) scale(0.9); }}
            100% {{ transform: translate(0px, 0px) scale(1); }}
        }}
        .modal-active {{ overflow: hidden; }}
    </style>
</head>
<body class="bg-slate-50 text-slate-800">
    <header class="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" class="text-2xl font-bold text-violet-700">{name.split(' ')[0]}</a>
            <div class="hidden md:flex space-x-8 font-medium text-slate-600">
                <a href="#home" class="hover:text-violet-600 transition">Home</a>
                <a href="#about" class="hover:text-violet-600 transition">About</a>
                <a href="#skills" class="hover:text-violet-600 transition">Skills</a>
                <a href="#education" class="hover:text-violet-600 transition">Education</a>
                <a href="#portfolio" class="hover:text-violet-600 transition">Portfolio</a>
                <a href="#contact" class="hover:text-violet-600 transition">Contact</a>
            </div>
            <a href="#contact" class="px-6 py-2 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition">Hire Me</a>
        </nav>
    </header>
    <section id="home" class="pt-32 pb-20 overflow-hidden">
        <div class="container mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-12">
            <div class="lg:w-1/2 text-center lg:text-left">
                <h2 class="text-violet-600 font-bold text-xl mb-4">{role}</h2>
                <h1 class="text-4xl md:text-6xl font-bold mb-6">Hi, I'm <span class="text-violet-700">{name}</span></h1>
                <p class="text-lg text-slate-600 mb-10 leading-relaxed">{bio}</p>
                <div class="flex justify-center lg:justify-start gap-4">
                    <a href="#contact" class="px-8 py-3 bg-violet-600 text-white font-bold rounded-full shadow-lg hover:-translate-y-1 transition-all">Contact Me</a>
                    <a href="{resume_url}" download class="px-8 py-3 bg-white text-violet-600 font-bold rounded-full border-2 border-violet-100 hover:bg-violet-50 transition-all flex items-center">
                        Download CV <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </a>
                </div>
            </div>
            <div class="lg:w-1/2">{render_hero_image()}</div>
        </div>
    </section>

    <section id="about" class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-slate-800">About <span class="text-violet-600">Me</span></h2>
                <div class="w-20 h-1.5 bg-violet-600 mx-auto mt-4 rounded-full"></div>
            </div>
            <div class="flex flex-col lg:flex-row items-center gap-16">
                {render_about_image()}
                <div class="lg:w-1/2">
                    <h3 class="text-2xl font-bold mb-6 text-slate-800">My Introduction</h3>
                    <p class="text-slate-600 text-lg leading-relaxed mb-10">{bio}</p>
                    
                    <div class="grid grid-cols-3 gap-6 text-center mb-10">
                        <div class="p-4 bg-slate-50 rounded-2xl shadow-sm border border-slate-100">
                            <h4 class="text-3xl font-bold text-violet-600">{exp_years}</h4>
                            <p class="text-sm text-slate-500 font-medium">Years Exp</p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl shadow-sm border border-slate-100">
                            <h4 class="text-3xl font-bold text-violet-600">{completed_projects_count}</h4>
                            <p class="text-sm text-slate-500 font-medium">Projects</p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl shadow-sm border border-slate-100">
                            <h4 class="text-3xl font-bold text-violet-600">{companies_count}</h4>
                            <p class="text-sm text-slate-500 font-medium">Companies</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section id="skills" class="py-20 bg-slate-50">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-slate-800">My <span class="text-violet-600">Skills</span></h2>
                <div class="w-20 h-1.5 bg-violet-600 mx-auto mt-4 rounded-full"></div>
                <p class="text-slate-600 mt-4">Technical Proficiency</p>
            </div>
            <div class="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl">
                {render_skills_list()}
            </div>
        </div>
    </section>
    {render_education_section()}
    <section id="portfolio" class="py-20 bg-white">
        <div class="container mx-auto px-6 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-16 text-slate-800">My <span class="text-violet-600">Portfolio</span></h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {render_projects_grid()}
            </div>
        </div>
    </section>
    <section id="contact" class="py-20 relative overflow-hidden bg-slate-50">
        <div class="container mx-auto px-6 relative z-10">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-slate-800">Contact <span class="text-violet-600">Me</span></h2>
                <div class="w-20 h-1.5 bg-violet-600 mx-auto mt-4 rounded-full"></div>
            </div>
            <div class="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                <div class="lg:w-1/3 space-y-8">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-xl font-bold text-slate-800">Call Me</h4>
                            <p class="text-slate-600">{phone}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-xl font-bold text-slate-800">Email</h4>
                            <p class="text-slate-600">{email}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="flex-shrink-0 w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-xl font-bold text-slate-800">Location</h4>
                            <p class="text-slate-600">{location}</p>
                        </div>
                    </div>
                </div>
                <div class="lg:w-2/3 bg-white p-8 md:p-10 rounded-3xl shadow-xl">
                    <form class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" placeholder="Your Name" class="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-1 focus:ring-violet-500 transition">
                            <input type="email" placeholder="Your Email" class="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-1 focus:ring-violet-500 transition">
                        </div>
                        <textarea rows="5" placeholder="Message" class="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-1 focus:ring-violet-500 transition"></textarea>
                        <button class="w-full md:w-auto px-10 py-3.5 bg-violet-600 text-white font-bold rounded-full shadow-md hover:bg-violet-700 transition">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-slate-900 py-12 text-center text-slate-400">
        <div class="container mx-auto px-6">
            <h2 class="text-3xl font-bold text-white mb-4">{name}</h2>
            <p class="mb-8">{role}</p>
            <p class="text-sm">&#169; {time.strftime('%Y')} {name}. All rights reserved.</p>
        </div>
    </footer>

    <div id="projectModal" class="fixed inset-0 z-[100] hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onclick="closeModal()" class="absolute top-4 right-4 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <img id="modalImg" src="" class="w-full h-64 object-cover">
            <div class="p-8">
                <h3 id="modalTitle" class="text-2xl font-bold mb-4"></h3>
                <p id="modalDesc" class="text-slate-600 leading-relaxed mb-8"></p>
                <a id="modalLink" href="#" target="_blank" class="inline-block bg-violet-600 text-white px-8 py-3 rounded-full font-bold">View Live Project</a>
            </div>
        </div>
    </div>

    <script>
        function openModal(title, desc, img, link) {{
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalDesc').innerText = desc;
            document.getElementById('modalImg').src = img;
            document.getElementById('modalLink').href = link;
            document.getElementById('projectModal').classList.remove('hidden');
            document.body.classList.add('modal-active');
        }}
        function closeModal() {{
            document.getElementById('projectModal').classList.add('hidden');
            document.body.classList.remove('modal-active');
        }}
    </script>
</body>
</html>"""
        return jsonify({"html": html_template})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if model is None:
        print("WARNING: Prediction Model failed to load")
        print("Career prediction features may not work...")
    else:
        print("All systems initialized successfully....")
        print("  1) - Ollama: Ready (llama3.2:1b)")
        print("  2) - MongoDB: Connected")
        print("  3) - Prediction Model: Loaded")
    app.run(debug=True, port=5000, use_reloader=False)
