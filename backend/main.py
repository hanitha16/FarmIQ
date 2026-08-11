import os
import json
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import init_db, get_db_connection
from auth import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    get_current_user_id
)


app = FastAPI(title="FarmIQ API", version="1.0.0")


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# STARTUP
# ---------------------------------------------------------

@app.on_event("startup")
def startup():
    init_db()


# ---------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------

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


# =========================================================
# AUTHENTICATION
# =========================================================

@app.post("/api/auth/signup")
def signup(req: SignUpRequest):

    if not req.full_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Full name is required."
        )

    if req.password != req.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    validate_password_strength(req.password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (req.email.lower(),)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists."
            )

        pw_hash = hash_password(req.password)

        cursor.execute(
            """
            INSERT INTO users
            (
                full_name,
                email,
                mobile,
                password_hash,
                village,
                main_crop
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                req.full_name.strip(),
                req.email.lower(),
                req.mobile,
                pw_hash,
                req.village or "Guntur",
                req.main_crop,
            ),
        )

        user_id = cursor.lastrowid
        conn.commit()

    finally:
        conn.close()

    token = create_access_token(
        {
            "user_id": user_id,
            "email": req.email.lower(),
        }
    )

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
            "main_crop": req.main_crop,
        },
    }


@app.post("/api/auth/login")
def login(req: LoginRequest):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT * FROM users WHERE email = ?",
            (req.email.lower(),)
        )

        user = cursor.fetchone()

    finally:
        conn.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please try again."
        )

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please try again."
        )

    token = create_access_token(
        {
            "user_id": user["id"],
            "email": user["email"],
        }
    )

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
            "main_crop": user["main_crop"],
        },
    }


@app.post("/api/auth/logout")
def logout():
    return {
        "status": "success",
        "message": "Logged out successfully."
    }


@app.get("/api/auth/me")
def get_current_user_profile(
    user_id: int = Depends(get_current_user_id)
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                id,
                full_name,
                email,
                mobile,
                village,
                main_crop
            FROM users
            WHERE id = ?
            """,
            (user_id,),
        )

        user = cursor.fetchone()

    finally:
        conn.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User profile not found."
        )

    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "mobile": user["mobile"],
        "village": user["village"],
        "main_crop": user["main_crop"],
    }


# =========================================================
# WEATHER
# =========================================================

def calculate_act_now_score(
    temp: float,
    humidity: float,
    rain_prob: float,
    wind_speed: float,
    crop_health: float = 85.0,
):

    temp_score = 100 - max(0, abs(temp - 27) * 4)

    rain_score = max(
        0,
        100 - rain_prob * 1.2
    )

    wind_score = max(
        0,
        100 - wind_speed * 3
    )

    health_weight = crop_health * 0.3

    score = int(
        (temp_score * 0.25)
        + (rain_score * 0.35)
        + (wind_score * 0.1)
        + health_weight
    )

    score = max(10, min(98, score))

    if score >= 80:
        status = "GOOD TIME TO ACT"
        color = "GREEN"
        rationale = (
            "Weather conditions are currently favorable "
            "and rain risk is low."
        )
        best_window = "Tomorrow • 7:00 AM – 10:00 AM"

    elif score >= 50:
        status = "CHECK CONDITIONS"
        color = "YELLOW"
        rationale = (
            "Moderate humidity or light rain risk expected. "
            "Monitor weather closely."
        )
        best_window = "Today • 4:00 PM – 6:00 PM"

    else:
        status = "WAIT"
        color = "RED"
        rationale = (
            "High rainfall or wind speed risk detected. "
            "Spraying or heavy field work is not recommended."
        )
        best_window = "In 2 days • Early morning"

    return (
        score,
        status,
        color,
        rationale,
        best_window,
    )


@app.get("/api/weather")
def get_weather(
    location: Optional[str] = "Guntur"
):

    api_key = os.getenv("WEATHER_API_KEY")

    if api_key:

        try:

            response = httpx.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": location,
                    "appid": api_key,
                    "units": "metric",
                },
                timeout=4,
            )

            if response.status_code == 200:

                data = response.json()

                temp = float(data["main"]["temp"])
                humidity = float(data["main"]["humidity"])

                wind = float(
                    data["wind"]["speed"] * 3.6
                )

                condition = (
                    data["weather"][0]["description"]
                    .title()
                )

                rain_prob = (
                    65
                    if "rain" in condition.lower()
                    else 15
                )

                (
                    score,
                    status,
                    color,
                    rationale,
                    window,
                ) = calculate_act_now_score(
                    temp,
                    humidity,
                    rain_prob,
                    wind,
                )

                return {
                    "location": data.get(
                        "name",
                        location
                    ),
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
                    "demo_mode": False,
                }

        except Exception:
            pass

    demo_weather_profiles = {

        "guntur": {
            "temp": 29.5,
            "humidity": 62,
            "rain_prob": 18,
            "wind": 9.4,
            "condition": "Partly Cloudy",
        },

        "hyderabad": {
            "temp": 28.0,
            "humidity": 58,
            "rain_prob": 12,
            "wind": 11.2,
            "condition": "Clear Sky",
        },

        "vijayawada": {
            "temp": 31.0,
            "humidity": 68,
            "rain_prob": 25,
            "wind": 8.0,
            "condition": "Sunny",
        },

        "warangal": {
            "temp": 27.5,
            "humidity": 70,
            "rain_prob": 40,
            "wind": 14.1,
            "condition": "Light Shower Risk",
        },
    }

    loc_key = (
        location or "guntur"
    ).strip().lower()

    weather = demo_weather_profiles.get(
        loc_key,
        demo_weather_profiles["guntur"],
    )

    (
        score,
        status,
        color,
        rationale,
        window,
    ) = calculate_act_now_score(
        weather["temp"],
        weather["humidity"],
        weather["rain_prob"],
        weather["wind"],
    )

    return {
        "location": (
            location.title()
            if location
            else "Guntur Village"
        ),
        "temp": weather["temp"],
        "humidity": weather["humidity"],
        "rain_prob": weather["rain_prob"],
        "wind_speed": weather["wind"],
        "condition": weather["condition"],
        "act_now_score": score,
        "act_now_status": status,
        "act_now_color": color,
        "act_now_rationale": rationale,
        "best_action_window": window,
        "demo_mode": True,
        "demo_label": "Limited Connectivity - Demo Weather Data",
    }


@app.get("/api/weather/forecast")
def get_weather_forecast(
    location: Optional[str] = "Guntur"
):

    days = [
        "Today",
        "Tomorrow",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
    ]

    conditions = [
        {
            "cond": "Sunny",
            "icon": "sun",
            "temp": 30,
            "rain": 10,
        },
        {
            "cond": "Partly Cloudy",
            "icon": "cloud-sun",
            "temp": 29,
            "rain": 20,
        },
        {
            "cond": "Good Work Day",
            "icon": "sun",
            "temp": 28,
            "rain": 15,
        },
        {
            "cond": "Moderate Humidity",
            "icon": "droplet",
            "temp": 31,
            "rain": 35,
        },
        {
            "cond": "Light Rain Risk",
            "icon": "cloud-rain",
            "temp": 27,
            "rain": 55,
        },
        {
            "cond": "Clear & Breezy",
            "icon": "wind",
            "temp": 29,
            "rain": 5,
        },
        {
            "cond": "Optimal Field Day",
            "icon": "sun",
            "temp": 30,
            "rain": 12,
        },
    ]

    forecast = []

    for index, day in enumerate(days):

        item = conditions[index]

        forecast.append(
            {
                "day": day,
                "condition": item["cond"],
                "temp": item["temp"],
                "rain_prob": item["rain"],
                "recommendation": (
                    "Ideal for spraying & fertilizing"
                    if item["rain"] < 25
                    else
                    "Monitor rain before field work"
                ),
            }
        )

    return {
        "location": (
            location.title()
            if location
            else "Guntur"
        ),
        "forecast": forecast,
    }


# =========================================================
# AI CROP KNOWLEDGE
# =========================================================

DEMO_CROP_KNOWLEDGE = {

    "Rice": {
        "disease": "Leaf Blast (Magnaporthe oryzae)",
        "confidence": 91,
        "severity": "Moderate",
        "crop_health": 78,
        "symptoms": (
            "Diamond-shaped spindle lesions with gray centers "
            "and reddish-brown margins on young leaves."
        ),
        "guidance": (
            "1. Maintain 2-3 cm water level in field.\n"
            "2. Apply Tricyclazole 75% WP @ 0.6g/L water "
            "during early morning.\n"
            "3. Avoid excessive nitrogen fertilizer application."
        ),
        "risk": (
            "Moderate spore spreading risk due to high "
            "night humidity."
        ),
    },

    "Tomato": {
        "disease": "Early Blight (Alternaria solani)",
        "confidence": 88,
        "severity": "Mild to Moderate",
        "crop_health": 82,
        "symptoms": (
            "Concentric ring spots on lower older leaves "
            "with yellow halos."
        ),
        "guidance": (
            "1. Prune lower infected leaves.\n"
            "2. Apply Mancozeb 75% WP @ 2g/L water.\n"
            "3. Ensure adequate spacing for canopy airflow."
        ),
        "risk": "Low risk under present clear weather.",
    },

    "Chilli": {
        "disease": "Chilli Leaf Curl Virus / Thrips Damage",
        "confidence": 85,
        "severity": "Moderate",
        "crop_health": 75,
        "symptoms": (
            "Upward curling of leaf margins, leaf puckering, "
            "and stunted terminal shoot growth."
        ),
        "guidance": (
            "1. Install yellow/blue sticky traps.\n"
            "2. Use appropriate pest management.\n"
            "3. Keep field borders clean from weed hosts."
        ),
        "risk": (
            "Vector insect activity increases in warm dry weather."
        ),
    },

    "Maize": {
        "disease": "Fall Armyworm Damage",
        "confidence": 92,
        "severity": "High",
        "crop_health": 69,
        "symptoms": (
            "Pin-hole punctures and ragged defoliation "
            "in whorls with moist frass visible."
        ),
        "guidance": (
            "1. Inspect central whorls.\n"
            "2. Use appropriate pest management.\n"
            "3. Consider biological control options."
        ),
        "risk": (
            "High larval feeding rate; immediate intervention "
            "recommended."
        ),
    },

    "Cotton": {
        "disease": "Bacterial Leaf Blight / Angular Leaf Spot",
        "confidence": 87,
        "severity": "Mild",
        "crop_health": 84,
        "symptoms": (
            "Small angular water-soaked lesions bounded by "
            "leaf veins turning dark brown."
        ),
        "guidance": (
            "1. Ensure good drainage.\n"
            "2. Destroy fallen infected debris.\n"
            "3. Monitor disease spread."
        ),
        "risk": (
            "Spreads rapidly during rain splash and high winds."
        ),
    },

    "Groundnut": {
        "disease": "Tikka Leaf Spot (Cercospora)",
        "confidence": 89,
        "severity": "Moderate",
        "crop_health": 80,
        "symptoms": (
            "Dark brown circular spots surrounded by bright "
            "yellow halos on both leaf surfaces."
        ),
        "guidance": (
            "1. Maintain crop sanitation.\n"
            "2. Keep fields weed-free.\n"
            "3. Provide balanced nutrition."
        ),
        "risk": (
            "Spore germination high with heavy dew or humidity."
        ),
    },
}


# =========================================================
# CROP SCANNER
# =========================================================

@app.post("/api/analyze-crop")
async def analyze_crop(
    crop: str = Form("Rice"),
    image: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    user_id: int = Depends(get_current_user_id),
):

    selected_crop = crop.strip().title()

    if selected_crop not in DEMO_CROP_KNOWLEDGE:
        selected_crop = "Rice"

    info = DEMO_CROP_KNOWLEDGE[selected_crop]

    weather_info = get_weather(
        location="Guntur"
    )

    (
        score,
        status,
        color,
        rationale,
        window,
    ) = calculate_act_now_score(
        weather_info["temp"],
        weather_info["humidity"],
        weather_info["rain_prob"],
        weather_info["wind_speed"],
        crop_health=info["crop_health"],
    )

    img_data = (
        image_base64
        or "data:image/svg+xml;base64,"
        "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmci"
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO crop_history (
                user_id,
                crop,
                possible_disease,
                confidence,
                severity,
                crop_health,
                symptoms,
                guidance,
                risk,
                action_window,
                act_now_score,
                image_data,
                weather_snapshot,
                is_demo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                selected_crop,
                info["disease"],
                info["confidence"],
                info["severity"],
                info["crop_health"],
                info["symptoms"],
                info["guidance"],
                info["risk"],
                window,
                score,
                img_data,
                json.dumps(weather_info),
                1,
            ),
        )

        scan_id = cursor.lastrowid
        conn.commit()

    finally:
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
        "demo_label": "Demo AI Analysis - Realistic Estimation",
    }


# =========================================================
# CROP HISTORY
# =========================================================

@app.get("/api/crop-history")
def get_crop_history(
    user_id: int = Depends(get_current_user_id)
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT
                id,
                crop,
                possible_disease,
                confidence,
                severity,
                crop_health,
                action_window,
                act_now_score,
                image_data,
                created_at,
                is_demo
            FROM crop_history
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,),
        )

        rows = cursor.fetchall()

    finally:
        conn.close()

    return {
        "history": [dict(row) for row in rows]
    }


@app.get("/api/crop-history/{scan_id}")
def get_crop_history_detail(
    scan_id: int,
    user_id: int = Depends(get_current_user_id),
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT *
            FROM crop_history
            WHERE id = ?
            AND user_id = ?
            """,
            (scan_id, user_id),
        )

        row = cursor.fetchone()

    finally:
        conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Crop analysis record not found."
        )

    record = dict(row)

    if record.get("weather_snapshot"):
        record["weather_snapshot"] = json.loads(
            record["weather_snapshot"]
        )

    return record


@app.delete("/api/crop-history/{scan_id}")
def delete_crop_history(
    scan_id: int,
    user_id: int = Depends(get_current_user_id),
):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            DELETE FROM crop_history
            WHERE id = ?
            AND user_id = ?
            """,
            (scan_id, user_id),
        )

        affected = cursor.rowcount
        conn.commit()

    finally:
        conn.close()

    if affected == 0:
        raise HTTPException(
            status_code=404,
            detail="Scan record not found or unauthorized."
        )

    return {
        "status": "success",
        "message": f"Scan #{scan_id} deleted successfully.",
    }


# =========================================================
# AI ADVISOR
# =========================================================

@app.post("/api/advisor")
def ask_advisor(req: AdvisorRequest):

    q = req.question.lower().strip()

    if (
        "spray" in q
        or "pesticide" in q
        or "fungicide" in q
    ):

        answer = (
            "Based on current weather, early morning "
            "(7:00 AM - 10:00 AM) tomorrow is a good window "
            "for spraying. Follow the product label and use "
            "appropriate protective equipment."
        )

    elif (
        "yellow" in q
        or "leaf" in q
        or "color" in q
    ):

        answer = (
            "Yellowing can have several causes, including "
            "nutrient deficiency, water stress, pests, or disease. "
            "Inspect both sides of leaves and check whether "
            "older or younger leaves are affected."
        )

    elif (
        "irrigat" in q
        or "water" in q
    ):

        answer = (
            "Maintain appropriate soil moisture for the crop "
            "and avoid over-irrigation when rainfall is expected."
        )

    elif (
        "rain" in q
        or "wet" in q
    ):

        answer = (
            "After heavy rain, check field drainage and avoid "
            "unnecessary fertilizer application while fields "
            "remain waterlogged."
        )

    elif (
        "protect" in q
        or "rice" in q
    ):

        answer = (
            "To protect your Rice crop, monitor regularly, "
            "maintain balanced nutrition, manage irrigation, "
            "and watch for common pests and diseases."
        )

    elif (
        "curling" in q
        or "tomato" in q
    ):

        answer = (
            "Tomato leaf curling can have multiple causes, "
            "including viral disease, insects, heat stress, "
            "or water stress. Inspect plants carefully."
        )

    elif (
        "insect" in q
        or "bug" in q
        or "pest" in q
    ):

        answer = (
            "Inspect lower leaf surfaces and growing points "
            "for insects. Identify the pest before choosing "
            "a treatment."
        )

    else:

        answer = (
            f"For your {req.crop} crop in {req.location}: "
            "regular field monitoring, balanced irrigation, "
            "and timely field operations can help protect yield."
        )

    if req.language == "Telugu":
        answer = (
            f"[తెలుగు వ్యవసాయ సలహా]:\n{answer}"
        )

    elif req.language == "Hindi":
        answer = (
            f"[हिंदी कृषि सलाह]:\n{answer}"
        )

    return {
        "question": req.question,
        "answer": answer,
        "crop": req.crop,
        "language": req.language,
    }


# =========================================================
# IMAGE ADVISOR
# =========================================================

@app.post("/api/advisor/image")
async def ask_advisor_image(
    image: UploadFile = File(...),
    question: Optional[str] = Form(
        "What is wrong with this crop image?"
    ),
    language: Optional[str] = Form("English"),
    crop: Optional[str] = Form("Rice"),
    location: Optional[str] = Form("Guntur"),
):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    ]

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Please upload a JPG, JPEG, PNG "
                "or WEBP image."
            ),
        )

    contents = await image.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10 MB limit."
        )

    q = (
        question
        or "What is wrong with this crop image?"
    ).lower().strip()

    selected_crop = (
        crop or "Rice"
    ).strip().title()

    if "yellow" in q or "color" in q:

        analysis_body = f"""
🌱 What the image may show:

The uploaded {selected_crop} foliage appears to show
possible yellowing or chlorosis.

🔎 What to check:

1. Check whether older or younger leaves are affected.
2. Inspect both sides of the leaves for insects, spots,
   webbing, or other symptoms.

🌦️ Weather consideration:

Warm and humid conditions can increase disease pressure.

📋 What you can do:

- Check soil moisture and crop nutrition.
- Monitor nearby plants for similar symptoms.
- Avoid applying treatment until the likely cause is identified.

⚠️ Important:

An image alone cannot confirm the exact cause.
Consult a local agricultural expert if symptoms spread rapidly.
"""

    elif (
        "rain" in q
        or "wet" in q
        or "water" in q
    ):

        analysis_body = f"""
🌱 What the image may show:

The uploaded {selected_crop} crop may be experiencing
excess moisture or waterlogging.

🔎 What to check:

Check root-zone moisture, drainage, and leaf/stem
discoloration.

📋 What you can do:

- Improve field drainage.
- Avoid unnecessary irrigation.
- Monitor plants after rainfall.

⚠️ Important:

Persistent waterlogging can increase disease risk.
"""

    else:

        analysis_body = f"""
🌱 What the image may show:

The uploaded {selected_crop} image shows crop features
that require closer monitoring.

🔎 What to check:

1. Inspect upper and lower leaf surfaces.
2. Look for spots, powdery deposits, holes, insects,
   or unusual discoloration.
3. Check nearby plants for similar symptoms.

📋 What you can do:

Monitor the affected area and compare symptoms with
healthy plants.

⚠️ Important:

This is a guidance estimate, not a laboratory diagnosis.
Consult an agricultural expert if symptoms worsen.
"""

    if language == "Telugu":

        analysis_body = (
            "[తెలుగులో AI పంట ఫోటో విశ్లేషణ]:\n\n"
            + analysis_body
        )

    elif language == "Hindi":

        analysis_body = (
            "[हिंदी में AI फसल फोटो विश्लेषण]:\n\n"
            + analysis_body
        )

    return {
        "question": question,
        "answer": analysis_body,
        "crop": selected_crop,
        "language": language,
        "filename": image.filename,
    }


# =========================================================
# FARM PLAN
# =========================================================

@app.get("/api/farm-plan")
def get_farm_plan(
    crop: str = "Rice"
):

    selected = crop.strip().title()

    plan = [

        {
            "day": "Today (Day 1)",
            "task": (
                f"{selected} Field Inspection & Moisture Check"
            ),
            "status": "Recommended",
            "urgency": "High",
            "details": (
                f"Check your {selected} crop for early "
                "disease symptoms and inspect irrigation channels."
            ),
        },

        {
            "day": "Tomorrow (Day 2)",
            "task": (
                f"Optimal {selected} Action Window"
            ),
            "status": "Good Window",
            "urgency": "Optimal",
            "details": (
                f"Monitor weather and perform planned field "
                f"operations for {selected} during suitable conditions."
            ),
        },

        {
            "day": "Day 3",
            "task": (
                f"{selected} Crop Monitoring & Weeding"
            ),
            "status": "Scheduled",
            "urgency": "Medium",
            "details": (
                f"Inspect field borders and remove weeds "
                f"that may harbor pests affecting {selected}."
            ),
        },

        {
            "day": "Day 4",
            "task": (
                f"{selected} Irrigation Management"
            ),
            "status": "Scheduled",
            "urgency": "Medium",
            "details": (
                f"Check soil moisture and irrigation requirements "
                f"for {selected}."
            ),
        },

        {
            "day": "Day 5",
            "task": (
                f"{selected} Mid-Week Disease Check"
            ),
            "status": "Preventive",
            "urgency": "Low",
            "details": (
                f"Re-examine any flagged symptoms on {selected}."
            ),
        },

        {
            "day": "Day 6",
            "task": (
                f"{selected} Soil Health Check"
            ),
            "status": "Optional",
            "urgency": "Low",
            "details": (
                f"Review crop nutrition and soil moisture for {selected}."
            ),
        },

        {
            "day": "Day 7",
            "task": (
                f"Weekly {selected} Yield & Risk Audit"
            ),
            "status": "Planned",
            "urgency": "Low",
            "details": (
                f"Review crop condition and weather trends "
                f"for next-week {selected} planning."
            ),
        },
    ]

    return {
        "crop": selected,
        "plan": plan,
    }


# =========================================================
# ALERTS
# =========================================================

@app.get("/api/alerts")
def get_alerts():

    alerts = [

        {
            "id": 1,
            "type": "Good Action Window",
            "title": "⚡ Good Spraying Window Tomorrow",
            "message": (
                "Weather conditions tomorrow morning "
                "may be suitable for planned crop operations."
            ),
            "severity": "success",
        },

        {
            "id": 2,
            "type": "Disease Risk",
            "title": "🦠 Leaf Blast Risk",
            "message": (
                "High humidity can increase leaf blast risk "
                "in Rice crops. Inspect fields regularly."
            ),
            "severity": "warning",
        },

        {
            "id": 3,
            "type": "Weather Alert",
            "title": "🌦️ Moderate Humidity Expected",
            "message": (
                "Monitor crop moisture when humidity is high."
            ),
            "severity": "info",
        },
    ]

    return {
        "alerts": alerts
    }


# =========================================================
# SEED HUB
# =========================================================

@app.get("/api/seed-shops")
def get_seed_shops(
    location: str = "Guntur"
):

    shops = [

        {
            "id": 1,
            "name": "Sri Lakshmi Agri Inputs & Seeds",
            "distance": "1.8 km",
            "address": "Main Road, Guntur Market",
            "phone": "+91 98480 12345",
            "rating": 4.8,
            "verified": True,
        },

        {
            "id": 2,
            "name": "Kisan Bio Seeds & Fertilizer Center",
            "distance": "3.4 km",
            "address": "Station Road, Near Rythu Bazar",
            "phone": "+91 98480 67890",
            "rating": 4.6,
            "verified": True,
        },

        {
            "id": 3,
            "name": "Green Fields Agro Tech Store",
            "distance": "5.1 km",
            "address": "Bypass Road, Guntur District",
            "phone": "+91 98480 11223",
            "rating": 4.7,
            "verified": True,
        },
    ]

    return {
        "location": location,
        "shops": shops,
        "demo_mode": True,
        "demo_label": "Demo Shop Data",
    }


@app.get("/api/seeds")
def get_seeds():

    seeds = [

        {
            "id": 1,
            "crop": "Rice",
            "name": "Telangana Sona (RNR 15048)",
            "type": "High Yield & Low GI",
            "pack_size": "10 kg",
            "price": 850,
            "rating": 4.9,
            "in_stock": True,
            "desc": (
                "Short duration paddy seed with good grain quality."
            ),
        },

        {
            "id": 2,
            "crop": "Rice",
            "name": "BPT 5204 (Samba Mahsuri)",
            "type": "Premium Quality Paddy",
            "pack_size": "25 kg",
            "price": 1950,
            "rating": 4.8,
            "in_stock": True,
            "desc": (
                "Fine grain rice variety."
            ),
        },

        {
            "id": 3,
            "crop": "Tomato",
            "name": "Arka Rakshak F1 Hybrid",
            "type": "Triple Disease Resistant",
            "pack_size": "10 g",
            "price": 420,
            "rating": 4.9,
            "in_stock": True,
            "desc": (
                "High-yielding tomato hybrid."
            ),
        },

        {
            "id": 4,
            "crop": "Chilli",
            "name": "Guntur Teja (S-17) Hybrid",
            "type": "High Pungency",
            "pack_size": "100 g",
            "price": 680,
            "rating": 4.7,
            "in_stock": True,
            "desc": (
                "Popular chilli variety."
            ),
        },

        {
            "id": 5,
            "crop": "Maize",
            "name": "Pioneer 3355 Hybrid Seed",
            "type": "Drought & Heat Tolerant",
            "pack_size": "4 kg",
            "price": 1450,
            "rating": 4.8,
            "in_stock": True,
            "desc": (
                "Hybrid maize seed."
            ),
        },
    ]

    return {
        "seeds": seeds
    }


# =========================================================
# RUN SERVER LOCALLY
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=False,
    )