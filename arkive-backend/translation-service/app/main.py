from fastapi import FastAPI, Request
from app.translator import translate_title
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

@app.post("/translate/")
async def translate(req: Request):
    body = await req.json()
    title = body.get("title")
    target_language = body.get("target_language")
    
    if not title or not target_language:
        return {"error": "Missing title or target_language"}
    
    translated_title, detected_language = translate_title(title, target_language)
    
    return {
        "status": "success",
        "original_language": detected_language,
        "target_language": target_language,
        "original_title": title,
        "translated_title": translated_title 
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
