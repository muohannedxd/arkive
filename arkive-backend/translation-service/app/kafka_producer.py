from kafka import KafkaProducer
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

producer = KafkaProducer(
    bootstrap_servers=os.getenv("KAFKA_BROKER", "kafka:29092"),
    value_serializer=lambda v: v.encode("utf-8")
)

def publish_to_kafka(topic: str, message: str):
    producer.send(topic, message)
