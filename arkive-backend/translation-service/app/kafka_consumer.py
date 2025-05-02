from kafka import KafkaConsumer
import os
import json
from dotenv import load_dotenv
from app.translator import translate_title

# Load environment variables from .env file
load_dotenv()

consumer = KafkaConsumer(
    "translate-requests",
    bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
    auto_offset_reset='earliest',
    group_id="translation-group",
    enable_auto_commit=True,
    value_deserializer=lambda v: v.decode("utf-8")
)

print("Consumer started...")

for msg in consumer:
    try:
        payload = json.loads(msg.value)
        title = payload["title"]
        target_language = payload["target_language"]
        print(f"Translating '{title}' to {target_language}")
        translated = translate_title(title, target_language)
        print(f"Translated: {translated}")
    except Exception as e:
        print(f"Error processing message: {e}")
