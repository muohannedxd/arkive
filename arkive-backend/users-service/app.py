from flask import Flask
from flask_migrate import Migrate
from dotenv import load_dotenv
from routes import register_routes
from database import db
from config import Config
from utils.jwt_helper import init_jwt
from flask_cors import CORS

# .env file
load_dotenv()

def create_app():
    """Application factory."""
    app = Flask(__name__)

    CORS(app)

    # configuration
    app.config.from_object(Config)

    # extensions
    db.init_app(app)
    Migrate(app, db)
    init_jwt(app)

    # models
    from models import User

    # routes
    register_routes(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
