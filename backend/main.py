# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# IMPORTANT: fix import paths if needed
from api.utils.db import init_db
from api.routes import detection, alerts, announcements, faq, lost_found


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database Initialized")
    yield
    print("Shutting down")


app = FastAPI(
    title="GarudaDrishti",
    version="1.0.0",
    lifespan=lifespan
)

# -------------------------
# ENABLE CORS (Frontend must access API)
# -------------------------
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# -------------------------
# ROUTERS
# These already have their prefixes inside the router files.
# Example: router = APIRouter(prefix="/alerts")
# -------------------------
app.include_router(detection.router)
app.include_router(alerts.router)
app.include_router(announcements.router)
app.include_router(faq.router)
app.include_router(lost_found.router)


@app.get("/")
def home():
    return {"status": "Campus Safety AI API running"}
