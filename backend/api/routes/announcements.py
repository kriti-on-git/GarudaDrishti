from fastapi import APIRouter

router = APIRouter(prefix="/detect", tags=["Detection"])

@router.get("/")
def test():
    return {"msg": "Announcements route working"}
