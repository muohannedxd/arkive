from flask import Blueprint, jsonify
from .authentication import authentication_bp
from .users import users_bp
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from sqlalchemy import text

# main blueprint
main_bp = Blueprint('main', __name__)
test_bp = Blueprint('test', __name__)

@main_bp.route('/')
def index():
   return 'Application is running!'

@test_bp.route('/health/db')
def db_health_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "success", "db": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "db": "unreachable", "details": str(e)}), 500

def register_routes(app):
   app.register_blueprint(main_bp)
   app.register_blueprint(authentication_bp, url_prefix='/api/auth')
   app.register_blueprint(users_bp, url_prefix='/api/users')
   app.register_blueprint(test_bp)