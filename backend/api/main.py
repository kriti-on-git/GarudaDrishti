from fastapi import FastAPI
from .routes import detection, alerts, lost_found, announcements, faq

app = FastAPI(title="Campus Safety AI")

app.include_router(detection.router)
app.include_router(alerts.router)
app.include_router(lost_found.router)
app.include_router(announcements.router)
app.include_router(faq.router)

@app.get("/")
def home():
    return {"status": "Campus Safety AI API running"}
