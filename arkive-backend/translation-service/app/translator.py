import os
import requests
from langdetect import detect
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {'Yes' if GEMINI_API_KEY else 'No'}")
print(f"API Key first 5 chars: {GEMINI_API_KEY[:5] + '...' if GEMINI_API_KEY else 'None'}")

# Synchronous version for FastAPI direct endpoints
def translate_title(title: str, target_language: str) -> tuple[str, str]:
    detected_language = detect(title)
    
    prompt = (
        f"You are an expert translator. Your task is to accurately translate the following document title into {target_language}.\n\n"
        f"Please ensure the translation preserves the meaning, context, and tone of the original title.\n\n"
        f"Title: \"{title}\"\n\n"
        f"Respond with only the translated title."
    )

    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    print(f"Making API request with key: {GEMINI_API_KEY[:5]}... for translation")
    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        headers=headers,
        params={"key": GEMINI_API_KEY},
        json=data
    )

    if response.ok:
        translated_title = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        return translated_title, detected_language
    else:
        print(f"Translation failed with status code {response.status_code}: {response.text}")
        return "[Translation Failed]" + response.text, detected_language

# Async version for Kafka processing
async def translate_title_async(title: str, target_language: str) -> tuple[str, str]:
    detected_language = detect(title)
    
    prompt = (
        f"You are an expert translator. Your task is to accurately translate the following document title into {target_language}.\n\n"
        f"Please ensure the translation preserves the meaning, context, and tone of the original title.\n\n"
        f"Title: \"{title}\"\n\n"
        f"Respond with only the translated title."
    )

    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    print(f"Making async API request with key: {GEMINI_API_KEY[:5]}... for translation")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            headers=headers,
            params={"key": GEMINI_API_KEY},
            json=data
        )

        if response.status_code == 200:
            translated_title = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            return translated_title, detected_language
        else:
            print(f"Translation failed with status code {response.status_code}: {response.text}")
            return "[Translation Failed]" + response.text, detected_language
