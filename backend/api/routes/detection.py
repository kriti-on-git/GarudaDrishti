# backend/api/routes/detection.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import os, cv2, numpy as np
from ultralytics import YOLO
from api.utils.db import get_connection


router = APIRouter(prefix="/detection", tags=["Detection"])

MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n.pt")
)

model = None


def load_model():
    """Lazy load YOLO model"""
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            print("⚠ YOLO Model Missing — using rule-based detection only.")
            return None
        model = YOLO(MODEL_PATH)
    return model



def save_alert_to_db(alert_type, description=""):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO alerts (alert_type, description, timestamp)
        VALUES (?, ?, datetime('now'))
    """, (alert_type, description))

    conn.commit()
    conn.close()


# ------------------------------------------------------
# SIMPLE FIRE / SMOKE PIXEL CHECK (YOUR THRESHOLDS)
# ------------------------------------------------------
def classify_fire_smoke(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # FIRE = orange/yellow
    lower_orange = np.array([5, 80, 80])
    upper_orange = np.array([25, 255, 255])
    fire_mask = cv2.inRange(hsv, lower_orange, upper_orange)
    fire_pixels = int((fire_mask > 0).sum())

    # SMOKE = greyish
    lower_gray = np.array([0, 0, 80])
    upper_gray = np.array([180, 50, 200])
    smoke_mask = cv2.inRange(hsv, lower_gray, upper_gray)
    smoke_pixels = int((smoke_mask > 0).sum())

    fire_flag = fire_pixels > 4000
    smoke_flag = smoke_pixels > 40000

    return fire_flag, smoke_flag


# ------------------------------------------------------
# MAIN PREDICTION LOGIC
# ------------------------------------------------------
@router.post("/predict")
async def predict(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(("jpg", "jpeg", "png")):
        raise HTTPException(400, "Upload image file only")

    data = await file.read()
    np_img = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    yolo = load_model()

    detections = []
    person_count = 0
    person_boxes = []

    # -------------------------------
    # YOLO PERSON COUNT (ONLY)
    # -------------------------------
    if yolo:
        result = yolo(img)[0]
        for box in result.boxes:
            cls = int(box.cls[0])
            label = result.names[cls]

            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]

            detections.append({
                "label": label,
                "confidence": float(box.conf[0]),
                "bbox": [x1, y1, x2, y2]
            })

            if label == "person":
                person_count += 1
                person_boxes.append([x1, y1, x2, y2])

    # -------------------------------------------------
    # RULE BASED FIRE / SMOKE DETECTION
    # -------------------------------------------------
    fire, smoke = classify_fire_smoke(img)

    # 🔥 Fire (orange pixels)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_orange = np.array([5, 50, 50])
    upper_orange = np.array([25, 255, 255])
    orange_mask = cv2.inRange(hsv, lower_orange, upper_orange)
    orange_pixels = int((orange_mask > 0).sum())

    if orange_pixels > 4000:
     detections.append({"label": "fire", "confidence": 0.90, "bbox": None})
     save_alert_to_db("Alert: Fire", "Emergency detected!")


# 🌫️ Smoke (gray pixels)
    lower_gray = np.array([0, 0, 80])
    upper_gray = np.array([180, 50, 180])
    gray_mask = cv2.inRange(hsv, lower_gray, upper_gray)
    gray_pixels = int((gray_mask > 0).sum())

    if gray_pixels > 40000:
     detections.append({"label": "smoke", "confidence": 0.82, "bbox": None})
     save_alert_to_db("Alert: Smoke", "Chances of fire detected!")


# 👊 Fight (persons > 3)  
    if len(person_boxes) > 3:
     detections.append({"label": "fight", "confidence": 0.95, "bbox": None})
     save_alert_to_db("Alert: Fight", "Person overlapping detected!")

    return {
        "success": True,
        "detections": detections
    }
