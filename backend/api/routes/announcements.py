# backend/api/routes/announcements.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from api.utils.db import get_connection

router = APIRouter(prefix="/announcements", tags=["Announcements"])

class Announcement(BaseModel):
    title: str
    message: str
    timestamp: str | None = None


@router.post("/add")
def add_announcement(data: Announcement):
    try:
        timestamp = data.timestamp or datetime.now().isoformat()

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO announcements (title, message, timestamp)
            VALUES (?, ?, ?)
        """, (data.title, data.message, timestamp))

        conn.commit()
        return {"message": "Announcement added"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()


@router.get("/all")
def get_announcements():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, message, timestamp FROM announcements ORDER BY id DESC")
        rows = cur.fetchall()

        return [dict(r) for r in rows]

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()


@router.delete("/clear")
def clear_announcements():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM announcements")
        conn.commit()
        return {"message": "All announcements cleared"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()
