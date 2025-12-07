import torch
from PIL import Image
import io

# Load models globally once
fire_model = torch.load("models/fire_model.pt", map_location="cpu")
smoke_model = torch.load("models/smoke_model.pt", map_location="cpu")
fight_model = torch.load("models/fight_model.pt", map_location="cpu")

fire_model.eval()
smoke_model.eval()
fight_model.eval()

# -----------------------------
# Helper Functions
# -----------------------------
async def predict_fire(file):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    # Transform + model prediction placeholder
    # Replace this with actual preprocessing
    tensor = torch.tensor([0.0])  # dummy
    # prediction = fire_model(tensor)
    prediction = False             # dummy output
    return prediction


async def predict_smoke(file):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    tensor = torch.tensor([0.0])  # dummy
    prediction = False
    return prediction


async def predict_fight(file):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    tensor = torch.tensor([0.0])  # dummy
    prediction = False
    return prediction
