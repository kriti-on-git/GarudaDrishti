# backend/api/utils/db.py
import sqlite3
import os

# BASE_DIR -> backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.join(DB_DIR, "database.db")
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")

def get_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    if not os.path.exists(SCHEMA_PATH):
        raise Exception(f"Schema file not found at: {SCHEMA_PATH}")

    with get_connection() as conn, open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    print(f"Initialized DB at: {DB_PATH}")
