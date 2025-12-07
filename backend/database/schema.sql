-- ==============================
-- Database Schema for Campus Safety App
-- ==============================

PRAGMA foreign_keys = ON;

-- ------------------------------
-- ALERTS
-- ------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL,
    description TEXT DEFAULT '',
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp
ON alerts (timestamp DESC);


-- ------------------------------
-- ANNOUNCEMENTS
-- ------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_timestamp
ON announcements (timestamp DESC);


-- ------------------------------
-- FAQ
-- ------------------------------
CREATE TABLE IF NOT EXISTS faq (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);


-- ------------------------------
-- LOST & FOUND
-- ------------------------------
CREATE TABLE IF NOT EXISTS lost_found (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('lost', 'found')),
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lost_found_status
ON lost_found (status);

CREATE INDEX IF NOT EXISTS idx_lost_found_timestamp
ON lost_found (timestamp DESC);
