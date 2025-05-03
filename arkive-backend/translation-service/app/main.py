from fastapi import FastAPI, Request
from kafka import KafkaConsumer, KafkaProducer
from pydantic import BaseModel
import os
import json
from typing import Optional
import threading
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

# Create Kafka producer
producer = KafkaProducer(
    bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Kafka consumer function
def consume_translation_requests():
    consumer = KafkaConsumer(
        "translate-requests",
        bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
        group_id="translation-group",
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        value_deserializer=lambda v: json.loads(v.decode('utf-8'))
    )
    
    print("Kafka consumer started and waiting for messages...")
    
    for message in consumer:
        try:
            data = message.value
            print(f"Received message: {data}")
            
            title = data.get("title")
            target_language = data.get("target_language")
            document_id = data.get("document_id")
            request_id = data.get("request_id")
            
            if not title or not target_language:
                print("Missing title or target_language in message")
                continue
            
            # Process the translation synchronously (async would be more complex with threading)
            translated_title, detected_language = translate_title(title, target_language)
            
            # Create response
            response = {
                "status": "success",
                "original_language": detected_language,
                "target_language": target_language,
                "original_title": title,
                "translated_title": translated_title,
                "document_id": document_id,
                "request_id": request_id
            }
            
            # Send response to Kafka
            producer.send("translation-results", response)
            print(f"Published translation result: {translated_title}")
            
        except Exception as e:
            error_msg = f"Error processing translation request: {str(e)}"
            print(error_msg)
            producer.send(
                "translation-errors", 
                {
                    "error": error_msg,
                    "request": data if 'data' in locals() else "Unknown"
                }
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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Start consumer thread when application starts
@app.on_event("startup")
async def startup_event():
    # Start Kafka consumer in a separate thread
    consumer_thread = threading.Thread(target=consume_translation_requests, daemon=True)
    consumer_thread.start()
    print("Kafka consumer thread started")
