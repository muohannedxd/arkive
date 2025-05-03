from fastkafka import FastKafka
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

async def send_translation_request(title: str, target_language: str, 
                                   document_id: Optional[str] = None, 
                                   request_id: Optional[str] = None):
    """Utility function to send a translation request to Kafka"""
    kafka_client = FastKafka(
        bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
    )
    
    try:
        # Start the Kafka client
        await kafka_client.start()
        
        # Create and send request
        request = TranslationRequest(
            title=title,
            target_language=target_language,
            document_id=document_id,
            request_id=request_id
        )
        
        # Publish request to Kafka
        await kafka_client.publish("translate-requests", request.model_dump_json())
        print(f"Translation request sent for '{title}' to {target_language}")
        
    except Exception as e:
        print(f"Error sending translation request: {str(e)}")
    
    finally:
        # Stop the Kafka client
        await kafka_client.stop()

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
    
    asyncio.run(send_translation_request(title, target_language, document_id, request_id))