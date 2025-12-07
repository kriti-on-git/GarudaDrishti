from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from api.utils.db import get_connection

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class Alert(BaseModel):
    alert_type: str
    description: str = ""
    timestamp: str | None = None


@router.post("/add")
def add_alert(alert: Alert):
    try:
        if not alert.timestamp:
            alert.timestamp = datetime.now().isoformat()

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO alerts (alert_type, description, timestamp)
            VALUES (?, ?, ?)
        """, (alert.alert_type, alert.description, alert.timestamp))
        conn.commit()

        return {"message": "Alert saved"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")

    finally:
        conn.close()


@router.get("/all")
def get_all_alerts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, alert_type, description, timestamp FROM alerts ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    return [
        {"id": r[0], "alert_type": r[1], "description": r[2], "timestamp": r[3]}
        for r in rows
    ]


@router.delete("/clear")
def clear_alerts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM alerts")
    conn.commit()
    conn.close()
    return {"message": "All alerts cleared"}
