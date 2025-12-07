# backend/api/routes/faq.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.utils.db import get_connection

router = APIRouter(prefix="/faq", tags=["FAQ"])

class FAQ(BaseModel):
    question: str
    answer: str


@router.post("/add")
def add_faq(data: FAQ):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO faq (question, answer)
            VALUES (?, ?)
        """, (data.question, data.answer))

        conn.commit()
        return {"message": "FAQ added"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()


@router.get("/all")
def get_faqs():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, question, answer FROM faq ORDER BY id DESC")
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()


@router.delete("/clear")
def clear_faqs():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM faq")
        conn.commit()
        return {"message": "All FAQs cleared"}

    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    finally:
        conn.close()
