# backend/api/routes/lost_found.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from api.utils.db import get_connection

router = APIRouter(prefix="/lost-found", tags=["Lost & Found"])

class LostFoundItem(BaseModel):
    item_name: str
    description: str = ""
    status: str = "lost"   # "lost" or "found"
    timestamp: str | None = None


@router.post("/add")
def add_item(data: LostFoundItem):
    try:
        timestamp = data.timestamp or datetime.now().isoformat()

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO lost_found (item_name, description, status, timestamp)
            VALUES (?, ?, ?, ?)
        """, (data.item_name, data.description, data.status, timestamp))

        conn.commit()
        return {"message": "Item added"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()


@router.get("/all")
def get_items():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, item_name, description, status, timestamp 
            FROM lost_found
            ORDER BY id DESC
        """)
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()


@router.delete("/clear")
def clear_items():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM lost_found")
        conn.commit()
        return {"message": "All lost/found items cleared"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()
