from flask import Blueprint, jsonify
from .authentication import authentication_bp
from .users import users_bp
from flask_jwt_extended import jwt_required, get_jwt_identity

# main blueprint
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
   return 'Application is running!'

def register_routes(app):
   app.register_blueprint(main_bp)
   app.register_blueprint(authentication_bp, url_prefix='/api/auth')
   app.register_blueprint(users_bp, url_prefix='/api/users')