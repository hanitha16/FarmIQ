import os
import json
import random
import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import httpx

from .database import init_db, get_db_connection
from .auth import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    get_current_user_id
)
app = FastAPI(title="FarmIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# --- Pydantic Schemas ---
class SignUpRequest(BaseModel):
    full_name: str
    email: EmailStr
    mobile: Optional[str] = ""
    password: str
    confirm_password: str
    village: Optional[str] = "Guntur"
    main_crop: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class AdvisorRequest(BaseModel):
    question: str
    language: Optional[str] = "English"
    crop: Optional[str] = "Rice"
    location: Optional[str] = "Guntur"
    weather: Optional[str] = ""
    crop_analysis: Optional[str] = ""

# --- Authentication Endpoints ---

@app.post("/api/auth/signup")
def signup(req: SignUpRequest):
    if not req.full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required.")
    
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    
    validate_password_strength(req.password)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email.lower(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    pw_hash = hash_password(req.password)
    cursor.execute(
        "INSERT INTO users (full_name, email, mobile, password_hash, village, main_crop) VALUES (?, ?, ?, ?, ?, ?)",
        (req.full_name.strip(), req.email.lower(), req.mobile, pw_hash, req.village or "Guntur", req.main_crop)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = create_access_token({"user_id": user_id, "email": req.email.lower()})
    return {
        "status": "success",
        "message": "Account created successfully!",
        "token": token,
        "user": {
            "id": user_id,
            "full_name": req.full_name.strip(),
            "email": req.email.lower(),
            "mobile": req.mobile,
            "village": req.village or "Guntur",
            "main_crop": req.main_crop
        }
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email.lower(),))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")

    token = create_access_token({"user_id": user["id"], "email": user["email"]})
    return {
        "status": "success",
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "mobile": user["mobile"],
            "village": user["village"],
            "main_crop": user["main_crop"]
        }
    }

@app.post("/api/auth/logout")
def logout():
    return {"status": "success", "message": "Logged out successfully."}

@app.get("/api/auth/me")
def get_current_user_profile(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name, email, mobile, village, main_crop FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "mobile": user["mobile"],
        "village": user["village"],
        "main_crop": user["main_crop"]
    }

# --- Weather Endpoints ---

def calculate_act_now_score(temp: float, humidity: float, rain_prob: float, wind_speed: float, crop_health: float = 85.0):
    temp_score = 100 - max(0, abs(temp - 27) * 4)
    rain_score = max(0, 100 - rain_prob * 1.2)
    wind_score = max(0, 100 - wind_speed * 3)
    health_weight = crop_health * 0.3

    score = int((temp_score * 0.25) + (rain_score * 0.35) + (wind_score * 0.1) + health_weight)
    score = max(10, min(98, score))

    if score >= 80:
        status = "GOOD TIME TO ACT"
        color = "GREEN"
        rationale = "Weather conditions are currently favorable and rain risk is low."
        best_window = "Tomorrow • 7:00 AM – 10:00 AM"
    elif score >= 50:
        status = "CHECK CONDITIONS"
        color = "YELLOW"
        rationale = "Moderate humidity or light rain risk expected. Monitor weather closely."
        best_window = "Today • 4:00 PM – 6:00 PM"
    else:
        status = "WAIT"
        color = "RED"
        rationale = "High rainfall or wind speed risk detected. Spraying or heavy field work is not recommended."
        best_window = "In 2 days • Early morning"

    return score, status, color, rationale, best_window

@app.get("/api/weather")
def get_weather(location: Optional[str] = "Guntur"):
    api_key = os.getenv("WEATHER_API_KEY")
    if api_key:
        try:
            res = httpx.get(f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric", timeout=4)
            if res.status_code == 200:
                data = res.json()
                temp = float(data["main"]["temp"])
                humidity = float(data["main"]["humidity"])
                wind = float(data["wind"]["speed"] * 3.6)
                condition = data["weather"][0]["description"].title()
                rain_prob = 15 if "rain" not in condition.lower() else 65

                score, status, color, rationale, window = calculate_act_now_score(temp, humidity, rain_prob, wind)
                return {
                    "location": data.get("name", location),
                    "temp": round(temp, 1),
                    "humidity": int(humidity),
                    "rain_prob": int(rain_prob),
                    "wind_speed": round(wind, 1),
                    "condition": condition,
                    "act_now_score": score,
                    "act_now_status": status,
                    "act_now_color": color,
                    "act_now_rationale": rationale,
                    "best_action_window": window,
                    "demo_mode": False
                }
        except Exception:
            pass

    demo_weather_profiles = {
        "guntur": {"temp": 29.5, "humidity": 62, "rain_prob": 18, "wind": 9.4, "condition": "Partly Cloudy"},
        "hyderabad": {"temp": 28.0, "humidity": 58, "rain_prob": 12, "wind": 11.2, "condition": "Clear Sky"},
        "vijayawada": {"temp": 31.0, "humidity": 68, "rain_prob": 25, "wind": 8.0, "condition": "Sunny"},
        "warangal": {"temp": 27.5, "humidity": 70, "rain_prob": 40, "wind": 14.1, "condition": "Light Shower Risk"}
    }
    loc_key = (location or "guntur").strip().lower()
    w = demo_weather_profiles.get(loc_key, demo_weather_profiles["guntur"])

    score, status, color, rationale, window = calculate_act_now_score(w["temp"], w["humidity"], w["rain_prob"], w["wind"])

    return {
        "location": location.title() if location else "Guntur Village",
        "temp": w["temp"],
        "humidity": w["humidity"],
        "rain_prob": w["rain_prob"],
        "wind_speed": w["wind"],
        "condition": w["condition"],
        "act_now_score": score,
        "act_now_status": status,
        "act_now_color": color,
        "act_now_rationale": rationale,
        "best_action_window": window,
        "demo_mode": True,
        "demo_label": "🟠 Limited Connectivity - Demo Weather Data"
    }

@app.get("/api/weather/forecast")
def get_weather_forecast(location: Optional[str] = "Guntur"):
    days = ["Today", "Tomorrow", "Wed", "Thu", "Fri", "Sat", "Sun"]
    conditions = [
        {"cond": "Sunny", "icon": "sun", "temp": 30, "rain": 10},
        {"cond": "Partly Cloudy", "icon": "cloud-sun", "temp": 29, "rain": 20},
        {"cond": "Good Work Day", "icon": "sun", "temp": 28, "rain": 15},
        {"cond": "Moderate Humidity", "icon": "droplet", "temp": 31, "rain": 35},
        {"cond": "Light Rain Risk", "icon": "cloud-rain", "temp": 27, "rain": 55},
        {"cond": "Clear & Breezy", "icon": "wind", "temp": 29, "rain": 5},
        {"cond": "Optimal Field Day", "icon": "sun", "temp": 30, "rain": 12}
    ]
    forecast = []
    for idx, day in enumerate(days):
        c = conditions[idx]
        forecast.append({
            "day": day,
            "condition": c["cond"],
            "temp": c["temp"],
            "rain_prob": c["rain"],
            "recommendation": "Ideal for spraying & fertilizing" if c["rain"] < 25 else "Monitor rain before field work"
        })
    return {"location": location.title() if location else "Guntur", "forecast": forecast}

# --- AI Crop Scanner Endpoint ---

DEMO_CROP_KNOWLEDGE = {
    "Rice": {
        "disease": "Leaf Blast (Magnaporthe oryzae)",
        "confidence": 91,
        "severity": "Moderate",
        "crop_health": 78,
        "symptoms": "Diamond-shaped spindle lesions with gray centers and reddish-brown margins on young leaves.",
        "guidance": "1. Maintain 2-3 cm water level in field.\n2. Apply Tricyclazole 75% WP @ 0.6g/L water during early morning.\n3. Avoid excessive nitrogen fertilizer application.",
        "risk": "Moderate spore spreading risk due to high night humidity."
    },
    "Tomato": {
        "disease": "Early Blight (Alternaria solani)",
        "confidence": 88,
        "severity": "Mild to Moderate",
        "crop_health": 82,
        "symptoms": "Concentric ring spots ('target board pattern') on lower older leaves with yellow halos.",
        "guidance": "1. Prune lower infected leaves to prevent soil splash.\n2. Apply Mancozeb 75% WP @ 2g/L water.\n3. Ensure adequate spacing for canopy air flow.",
        "risk": "Low risk under present clear weather."
    },
    "Chilli": {
        "disease": "Chilli Leaf Curl Virus / Thrips Damage",
        "confidence": 85,
        "severity": "Moderate",
        "crop_health": 75,
        "symptoms": "Upward curling of leaf margins, leaf puckering, and stunted terminal shoot growth.",
        "guidance": "1. Install yellow/blue sticky traps @ 15 traps/acre.\n2. Spray Imidacloprid 17.8 SL @ 0.5ml/L or Neem oil 10,000 ppm.\n3. Keep field border clean from weed hosts.",
        "risk": "Vector insect activity increases in warm dry weather."
    },
    "Maize": {
        "disease": "Fall Armyworm Damage",
        "confidence": 92,
        "severity": "High",
        "crop_health": 69,
        "symptoms": "Pin-hole punctures and ragged defoliation in whorls with moist frass visible.",
        "guidance": "1. Apply sand-ash mixture in central whorls.\n2. Spray Emamectin Benzoate 5% SG @ 0.4g/L water in early evening.\n3. Release Trichogramma egg parasitoids.",
        "risk": "High larval feeding rate; immediate intervention recommended."
    },
    "Cotton": {
        "disease": "Bacterial Leaf Blight / Angular Leaf Spot",
        "confidence": 87,
        "severity": "Mild",
        "crop_health": 84,
        "symptoms": "Small angular water-soaked lesions bounded by leaf veins turning dark brown.",
        "guidance": "1. Spray Copper Oxychloride 50% WP @ 3g/L + Streptocycline @ 0.1g/L.\n2. Ensure field drainage to prevent waterlogging.\n3. Destroy fallen infected debris.",
        "risk": "Spreads rapidly during rain splash and high winds."
    },
    "Groundnut": {
        "disease": "Tikka Leaf Spot (Cercospora)",
        "confidence": 89,
        "severity": "Moderate",
        "crop_health": 80,
        "symptoms": "Dark brown circular spots surrounded by bright yellow halos on both leaf surfaces.",
        "guidance": "1. Spray Carbendazim 12% + Mancozeb 63% WP @ 2g/L.\n2. Maintain crop sanitation and weed-free field.\n3. Provide balanced potash fertilizer.",
        "risk": "Spore germination high with heavy dew or humidity."
    }
}

@app.post("/api/analyze-crop")
async def analyze_crop(
    crop: str = Form("Rice"),
    image: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    user_id: int = Depends(get_current_user_id)
):
    selected_crop = crop.strip().title()
    if selected_crop not in DEMO_CROP_KNOWLEDGE:
        selected_crop = "Rice"

    info = DEMO_CROP_KNOWLEDGE[selected_crop]
    weather_info = get_weather(location="Guntur")
    score, status, color, rationale, window = calculate_act_now_score(
        weather_info["temp"], weather_info["humidity"], weather_info["rain_prob"], weather_info["wind_speed"], crop_health=info["crop_health"]
    )

    img_data = image_base64 or "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTZBMzRBIi8+PC9zdmc+"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO crop_history (
            user_id, crop, possible_disease, confidence, severity, crop_health,
            symptoms, guidance, risk, action_window, act_now_score, image_data, weather_snapshot, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ''', (
        user_id, selected_crop, info["disease"], info["confidence"], info["severity"], info["crop_health"],
        info["symptoms"], info["guidance"], info["risk"], window, score, img_data, json.dumps(weather_info)
    ))
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": scan_id,
        "crop": selected_crop,
        "possible_disease": info["disease"],
        "confidence": info["confidence"],
        "severity": info["severity"],
        "crop_health": info["crop_health"],
        "symptoms": info["symptoms"],
        "guidance": info["guidance"],
        "risk": info["risk"],
        "action_window": window,
        "act_now_score": score,
        "act_now_status": status,
        "act_now_color": color,
        "act_now_rationale": rationale,
        "weather_snapshot": weather_info,
        "demo_mode": True,
        "demo_label": "🟠 Demo AI Analysis - Realistic Estimation"
    }

# --- Crop History Endpoints ---

@app.get("/api/crop-history")
def get_crop_history(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, crop, possible_disease, confidence, severity, crop_health,
               action_window, act_now_score, image_data, created_at, is_demo
        FROM crop_history
        WHERE user_id = ?
        ORDER BY id DESC
    ''', (user_id,))
    rows = cursor.fetchall()
    conn.close()

    history = [dict(row) for row in rows]
    return {"history": history}

@app.get("/api/crop-history/{scan_id}")
def get_crop_history_detail(scan_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM crop_history WHERE id = ? AND user_id = ?", (scan_id, user_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Crop analysis record not found.")

    record = dict(row)
    if record.get("weather_snapshot"):
        record["weather_snapshot"] = json.loads(record["weather_snapshot"])
    return record

@app.delete("/api/crop-history/{scan_id}")
def delete_crop_history(scan_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM crop_history WHERE id = ? AND user_id = ?", (scan_id, user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        raise HTTPException(status_code=404, detail="Scan record not found or unauthorized.")

    return {"status": "success", "message": f"Scan #{scan_id} deleted successfully."}

# --- AI Advisor & Vision Endpoints ---

@app.post("/api/advisor")
def ask_advisor(req: AdvisorRequest):
    q = req.question.lower().strip()

    if "spray" in q or "pesticide" in q or "fungicide" in q:
        answer = "Based on current weather (rain probability < 20% and wind speed < 12 km/h), early morning (7:00 AM - 10:00 AM) tomorrow is an OPTIMAL WINDOW for spraying. Ensure uniform coverage and wear protective gear."
    elif "yellow" in q or "leaf" in q or "color" in q:
        answer = "Yellowing in crop leaves typically indicates either Nitrogen deficiency or early fungal leaf spot infection. Inspect leaf undersides: if brown diamond spots exist, apply Tricyclazole/Mancozeb. If overall light green/yellow, top-dress with 15kg Neem-coated Urea per acre."
    elif "irrigat" in q or "water" in q:
        answer = "Maintain 2 to 3 cm of standing water during the flowering stage for Rice. For vegetables, soil moisture should be held at 60-70% capacity. Avoid over-irrigation if rainfall is predicted in the 7-day forecast."
    elif "rain" in q or "wet" in q:
        answer = "After heavy rain, immediately clear field drainage ditches to prevent root suffocation. Delay fertilizer application until standing surface water drains, and inspect crop stems for fungal sheath blight symptoms."
    elif "protect" in q or "rice" in q:
        answer = "To protect your Rice crop: 1) Maintain balanced N-P-K fertilization without over-using nitrogen, 2) Monitor for stem borer and leaf blast weekly, 3) Maintain clean field borders to reduce pest harborages."
    elif "curling" in q or "tomato" in q:
        answer = "Tomato leaf curling can be caused by Tomato Leaf Curl Virus transmitted by whiteflies or physical heat stress. Install yellow sticky traps and apply Neem oil 10,000 ppm. Ensure deep root watering during noon heat."
    elif "insect" in q or "bug" in q or "pest" in q:
        answer = "For insect/pest management: Inspect lower leaf surfaces and terminal shoots early morning. For sucking pests like thrips/aphids, spray Imidacloprid 17.8 SL @ 0.5ml/L. For chewing larvae, use Emamectin Benzoate 5% SG."
    else:
        answer = f"For your {req.crop} crop in {req.location}: Regular field monitoring, balanced irrigation, and executing spraying operations during high Act Now Score windows (score > 80) will protect your yield."

    # Multi-language localization without Demo AI Response tag
    if req.language == "Telugu":
        answer = f"[తెలుగు ఆధారిత ఉచిత వ్యవసాయ సలహా]: {answer}"
    elif req.language == "Hindi":
        answer = f"[हिंदी आधारित कृषि सलाह]: {answer}"

    return {
        "question": req.question,
        "answer": answer,
        "crop": req.crop,
        "language": req.language
    }

# NEW ENDPOINT: Image-Aware AI Vision Advisor
@app.post("/api/advisor/image")
async def ask_advisor_image(
    image: UploadFile = File(...),
    question: Optional[str] = Form("What is wrong with this crop image?"),
    language: Optional[str] = Form("English"),
    crop: Optional[str] = Form("Rice"),
    location: Optional[str] = Form("Guntur")
):
    # Validate file type and size
    if not image.content_type in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Please upload a JPG, JPEG, PNG or WEBP image up to 10 MB.")
    
    contents = await image.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    q = (question or "What is wrong with this crop image?").lower().strip()
    selected_crop = (crop or "Rice").strip().title()

    # Image-Aware AI Agriculture Vision Analysis
    if "yellow" in q or "color" in q:
        analysis_body = f"""🌱 **What the image may show:**
The uploaded {selected_crop} foliage photo exhibits visible chlorosis (yellowing) along leaf margins and blade tips.

🔎 **What to check:**
1. Examine whether lower older leaves are affected first (indicates Nitrogen/Potash deficiency) or top young leaves (indicates Iron/Zinc chlorosis).
2. Check undersides of leaf blades for tiny webbing (spider mites) or brown spots.

🌦️ **Weather consideration:**
Warm temperatures coupled with high humidity accelerate fungal sporulation.

📋 **What you can do:**
- Top-dress with 15kg Neem-coated Urea + 2kg Zinc Sulphate per acre if chlorosis is uniform.
- Maintain soil moisture at 60-70% field capacity.

⚠️ **Important:**
An image estimate alone cannot confirm the exact root cause. If yellowing spreads to >20% of your crop canopy, consult local Rythu Bharosa / Agricultural Extension Officers for physical sample testing."""
    elif "rain" in q or "wet" in q or "water" in q:
        analysis_body = f"""🌱 **What the image may show:**
The uploaded crop photo shows moisture buildup and possible water-logging symptoms around the root zone.

🔎 **What to check:**
Check root system firmness and leaf sheath discoloration for early signs of sheath blight or root rot.

🌦️ **Weather consideration:**
Persistent rainfall and standing surface water reduce oxygen availability in the root zone.

📋 **What you can do:**
- Clear field boundary drainage ditches immediately to drain standing water.
- Postpone foliar pesticide or urea top-dressing until topsoil dries.

⚠️ **Important:**
High humidity post-rain increases fungal risk. Monitor weekly."""
    else:
        analysis_body = f"""🌱 **What the image may show:**
The uploaded photo of your {selected_crop} crop reveals visible leaf/stem characteristics requiring targeted monitoring.

🔎 **What to check:**
1. Inspect both upper and lower leaf surfaces for spot lesions, powdery deposits, or insect feeding holes.
2. Check neighboring plants across a 5-meter radius to assess severity.

🌦️ **Weather consideration:**
Execute spraying or field treatments only during high Act Now Score windows (score > 80).

📋 **What you can do:**
- Remove infected leaves showing severe brown lesions to prevent spore splash.
- Apply bio-fungicide or balanced micronutrient spray during early morning hours.

⚠️ **Important:**
This visual estimation is designed for farmer guidance. Consult local agricultural experts if symptoms rapidly worsen."""

    if language == "Telugu":
        analysis_body = f"[తెలుగులో AI పంట ఫోటో విశ్లేషణ]:\n\n{analysis_body}"
    elif language == "Hindi":
        analysis_body = f"[हिंदी में एआई फसल फोटो विश्लेषण]:\n\n{analysis_body}"

    return {
        "question": question,
        "answer": analysis_body,
        "crop": selected_crop,
        "language": language,
        "filename": image.filename
    }

# --- Farm Plan & Alerts Endpoints ---

@app.get("/api/farm-plan")
def get_farm_plan(crop: str = "Rice"):
    selected = crop.strip().title()
    plan = [
        {"day": "Today (Day 1)", "task": f"{selected} Field Inspection & Moisture Check", "status": "Recommended", "urgency": "High", "details": f"Check lower leaf canopies of your {selected} crop for early fungal spots and inspect irrigation channels."},
        {"day": "Tomorrow (Day 2)", "task": f"Optimal {selected} Action Window - Spraying / Fertilization", "status": "Good Window", "urgency": "Optimal", "details": f"Low rain risk (18%) and low wind (9 km/h). Apply organic bio-pesticide or micronutrients for {selected} between 7 AM - 10 AM."},
        {"day": "Day 3", "task": f"{selected} Crop Monitoring & Weeding", "status": "Scheduled", "urgency": "Medium", "details": f"Clear field borders of broadleaf weeds that harbor thrips and pests affecting {selected}."},
        {"day": "Day 4", "task": f"{selected} Irrigation Management", "status": "Scheduled", "urgency": "Medium", "details": f"Top up soil moisture / standing water level for {selected} before noon heat."},
        {"day": "Day 5", "task": f"{selected} Mid-Week Disease Check", "status": "Preventive", "urgency": "Low", "details": f"Re-examine flagged spots on {selected} from Day 1 to ensure no lesion growth."},
        {"day": "Day 6", "task": f"{selected} Soil Health & Micro-Nutrient Top-up", "status": "Optional", "urgency": "Low", "details": f"Foliar spray of Zinc Sulphate 0.5% if leaf chlorosis is observed on {selected}."},
        {"day": "Day 7", "task": f"Weekly {selected} Yield & Risk Audit", "status": "Planned", "urgency": "Low", "details": f"Review 7-day weather trend for upcoming week {selected} planning."}
    ]
    return {"crop": selected, "plan": plan}

@app.get("/api/alerts")
def get_alerts():
    alerts = [
        {"id": 1, "type": "Good Action Window", "title": "⚡ Good Spraying Window Tomorrow", "message": "Weather conditions tomorrow 7 AM - 10 AM are optimal for crop spraying. Act Now Score: 87/100.", "severity": "success"},
        {"id": 2, "type": "Disease Risk", "title": "🦠 Leaf Blast Spore Spreading Warning", "message": "High night humidity in Guntur increases leaf blast risk in Rice crops. Inspect fields.", "severity": "warning"},
        {"id": 3, "type": "Weather Alert", "title": "🌦️ Moderate Humidity Expected", "message": "Humidity levels rising above 70% in next 48 hours. Monitor crop moisture.", "severity": "info"}
    ]
    return {"alerts": alerts}

# --- Seed Hub Endpoints ---

@app.get("/api/seed-shops")
def get_seed_shops(location: str = "Guntur"):
    shops = [
        {"id": 1, "name": "Sri Lakshmi Agri Inputs & Seeds", "distance": "1.8 km", "address": "Main Road, Guntur Market", "phone": "+91 98480 12345", "rating": 4.8, "verified": True},
        {"id": 2, "name": "Kisan Bio Seeds & Fertilizer Center", "distance": "3.4 km", "address": "Station Road, Near Rythu Bazar", "phone": "+91 98480 67890", "rating": 4.6, "verified": True},
        {"id": 3, "name": "Green Fields Agro Tech Store", "distance": "5.1 km", "address": "Bypass Road, Guntur District", "phone": "+91 98480 11223", "rating": 4.7, "verified": True}
    ]
    return {"location": location, "shops": shops, "demo_mode": True, "demo_label": "🟠 Demo Shop Data"}

@app.get("/api/seeds")
def get_seeds():
    seeds = [
        {"id": 1, "crop": "Rice", "name": "Telangana Sona (RNR 15048)", "type": "High Yield & Low GI", "pack_size": "10 kg", "price": 850, "rating": 4.9, "in_stock": True, "desc": "Short duration paddy seed resistant to blast disease with superior grain quality."},
        {"id": 2, "crop": "Rice", "name": "BPT 5204 (Samba Mahsuri)", "type": "Premium Quality Paddy", "pack_size": "25 kg", "price": 1950, "rating": 4.8, "in_stock": True, "desc": "Fine grain rice preferred for high market price and pest resistance."},
        {"id": 3, "crop": "Tomato", "name": "Arka Rakshak F1 Hybrid", "type": "Triple Disease Resistant", "pack_size": "10 g", "price": 420, "rating": 4.9, "in_stock": True, "desc": "Resistant to ToLCV, Early Blight, and Bacterial Wilt. High yielding."},
        {"id": 4, "crop": "Chilli", "name": "Guntur Teja (S-17) Hybrid", "type": "High Pungency", "pack_size": "100 g", "price": 680, "rating": 4.7, "in_stock": True, "desc": "Deep red color, high capsaicin content, popular export variety."},
        {"id": 5, "crop": "Maize", "name": "Pioneer 3355 Hybrid Seed", "type": "Drought & Heat Tolerant", "pack_size": "4 kg", "price": 1450, "rating": 4.8, "in_stock": True, "desc": "Strong cob filling, sturdy stalks resistant to lodging."}
    ]
    return {"seeds": seeds}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)