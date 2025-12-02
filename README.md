# Campus Safety AI

A full-stack AI system for detecting fire, smoke, and fights on campus, along with
real-time alerts, lost and found management, announcements, and SOS support.

## Modules
- Fire/Smoke/Fight Detection (AI)
- Alerts & Notifications
- Lost and Found Portal
- Announcements Feed
- SOS Trigger
- Analytics Dashboard

## Tech Stack
Backend: FastAPI, Python, PyTorch  
Frontend: React.js  
Database: SQLite  

## Folder Structure
campus-safety-ai/
│
├── backend/
│   ├── api/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── detection.py
│   │   │   ├── alerts.py
│   │   │   ├── lost_found.py
│   │   │   ├── announcements.py
│   │   │   └── faq.py
│   │   ├── models/
│   │   │   ├── fire_model.pt
│   │   │   ├── smoke_model.pt
│   │   │   └── fight_model.pt
│   │   ├── utils/
│   │   │   ├── preprocess.py
│   │   │   ├── detection_utils.py
│   │   │   └── db.py
│   │   └── schemas/
│   │       ├── Alert.py
│   │       └── PostItem.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveFeed.js
│   │   │   ├── AlertsPanel.js
│   │   │   ├── LostFound.js
│   │   │   ├── Announcements.js
│   │   │   ├── Analytics.js
│   │   │   └── SOS.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   └── Home.js
│   │   └── App.js
│   └── package.json
│
├── database/
│   ├── campus.db
│   └── schema.sql
│
├── docs/
│   ├── report.pdf
│   ├── ppt/
│   └── media/
│       ├── demo_video.mp4
│       └── screenshots/
│
└── README.md

