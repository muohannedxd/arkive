from kafka import KafkaProducer
from pydantic import BaseModel
import json
import asyncio
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TranslationRequest(BaseModel):
    title: str
    target_language: str
    document_id: Optional[str] = None
    request_id: Optional[str] = None

def send_translation_request(title: str, target_language: str, 
                             document_id: Optional[str] = None, 
                             request_id: Optional[str] = None):
    """Utility function to send a translation request to Kafka"""
    # Use kafka-python instead of FastKafka
    producer = KafkaProducer(
        bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    
    try:
        # Create request data
        request = TranslationRequest(
            title=title,
            target_language=target_language,
            document_id=document_id,
            request_id=request_id
        )
        
        # Publish request to Kafka
        producer.send("translate-requests", request.model_dump())
        producer.flush()
        print(f"Translation request sent for '{title}' to {target_language}")
        
    except Exception as e:
        print(f"Error sending translation request: {str(e)}")
    
    finally:
        # Close the producer
        producer.close()

# Example usage
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m app.client <title> <target_language> [document_id] [request_id]")
        sys.exit(1)
    
    title = sys.argv[1]
    target_language = sys.argv[2]
    document_id = sys.argv[3] if len(sys.argv) > 3 else None
    request_id = sys.argv[4] if len(sys.argv) > 4 else None
    
    send_translation_request(title, target_language, document_id, request_id)