import os
import secrets
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables
load_dotenv()

class Config:
   """Base configuration."""
   SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
   SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))
   SQLALCHEMY_TRACK_MODIFICATIONS = False
   JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
   JWT_BLACKLIST_ENABLED = True
   JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
   JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=90)
   JWT_VERIFY_SUB = False