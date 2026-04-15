from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = ["http://localhost:4200"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Description(BaseModel):
    text: str

@app.post("/analyze")
def analyze(desc: Description):

    text = desc.text.lower().strip()

    # 🔹 1. Vérification longueur minimale
    if not text or len(text) < 20:
        return {
            "category": "Unknown"
        }

    # 🔹 2. Détection simple par mots-clés
    if "mobile" in text or "android" in text or "ios" in text:
        return {"category": "Mobile Application"}

    if "ecommerce" in text or "shop" in text or "store" in text:
        return {"category": "E-commerce"}

    if "ai" in text or "machine learning" in text:
        return {"category": "AI / Machine Learning"}

    if "game" in text:
        return {"category": "Game Development"}

    if "blockchain" in text or "crypto" in text:
        return {"category": "Blockchain"}

    if "web" in text or "website" in text or "platform" in text:
        return {"category": "Web Application"}

    # 🔹 Si rien détecté
    return {
        "category": "Unknown"
    }