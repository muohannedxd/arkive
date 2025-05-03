from fastapi import FastAPI, Request
from fastkafka import FastKafka
from pydantic import BaseModel
import os
import json
from typing import Optional
from app.translator import translate_title, translate_title_async
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Define data models
class TranslationRequest(BaseModel):
    title: str
    target_language: str
    document_id: Optional[str] = None
    request_id: Optional[str] = None

class TranslationResponse(BaseModel):
    status: str
    original_language: str
    target_language: str
    original_title: str
    translated_title: str
    document_id: Optional[str] = None
    request_id: Optional[str] = None

# Configure FastKafka
kafka_client = FastKafka(
    bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
    group_id="translation-group",
)

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

@kafka_client.subscriber("translate-requests")
async def process_translation_request(msg: TranslationRequest) -> None:
    """Process translation requests from Kafka"""
    try:
        print(f"Processing translation request: {msg.title} to {msg.target_language}")
        translated_title, detected_language = await translate_title_async(msg.title, msg.target_language)
        
        # Create response payload
        response = TranslationResponse(
            status="success",
            original_language=detected_language,
            target_language=msg.target_language,
            original_title=msg.title,
            translated_title=translated_title,
            document_id=msg.document_id,
            request_id=msg.request_id
        )
        
        # Publish response to Kafka
        await kafka_client.publish("translation-results", response.model_dump_json())
        print(f"Published translation result: {response.translated_title}")
    except Exception as e:
        error_msg = f"Error processing translation request: {str(e)}"
        print(error_msg)
        await kafka_client.publish(
            "translation-errors", 
            json.dumps({
                "error": error_msg,
                "request": msg.model_dump() if hasattr(msg, "model_dump") else str(msg)
            })
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    await kafka_client.start()

@app.on_event("shutdown")
async def shutdown_event():
    await kafka_client.stop()
