from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, get_jwt
from models import User
from utils.jwt_helper import create_tokens, decode_access_token, blacklist
from datetime import timedelta
from database import db
import random
import math
from faker import Faker
import operator

authentication_bp = Blueprint('authentication', __name__)

@authentication_bp.route('/loggedin', methods=['GET'], endpoint='get_loggedin_id')
@jwt_required() # (refresh=True)
def get_loggedin_id():
   """
   Get the logged-in user's ID
   """
   current_user_id = get_jwt_identity()
   return jsonify(logged_in_as=current_user_id), 200

@authentication_bp.route('/login', methods=['POST'], endpoint='login')
def login():
   """
   desc: user login
   input: email, password
   output: access_token, refresh_token, user, message
   """
   try:
      data = request.get_json()
      email = data.get('email')
      password = data.get('password')

      user = User.get_by_email(email)
      
      if not user:
         return jsonify({'message': 'Email not found'}), 404

      if user and not user.check_password(password):
         return jsonify({'message': 'Incorrect password'}), 401

      access_token, refresh_token = create_tokens(user.id)

      response = jsonify({
         'message': 'Login successful',
         'user': user.to_dict(),
         'access_token': access_token,
         'refresh_token': refresh_token
      })

      set_access_cookies(response, access_token)
      set_refresh_cookies(response, refresh_token)

      return response, 201

   except Exception as e:
      db.session.rollback()
      return jsonify({'message': f'Server error. Try again later!'}), 500



@authentication_bp.route('/logout', methods=['POST'], endpoint='logout')
@jwt_required() # (refresh=True) # only refresh token allowed
def logout():
   """
   desc: log out the user by invalidating their refresh token.
   input: refresh token
   output: message 
   """
   try:
      current_user_id = get_jwt_identity()
      jti = get_jwt()['jti']
      blacklist.add(jti)
      response = jsonify({'message': 'Logout successful'})
      
      response.delete_cookie('access_token')
      response.delete_cookie('refresh_token')

      return response, 201

   except Exception as e:
      return jsonify({'message': f'Server error. Try again later!'}), 500


@authentication_bp.route('/refresh', methods=['POST'], endpoint='refresh')
@jwt_required(refresh=True) # only refresh token allowed
def refresh():
   """
   desc: refreshes the access token by generating a new access token because access tokens are expired after 15 minutes.
   input: refresh token
   output: access_token
   """
   try:
      current_user_id = get_jwt_identity()
      access_token = create_access_token(identity=current_user_id, fresh=False)
      return jsonify(access_token=access_token)

   except Exception as e:
      return jsonify({'message': f'Server error. Try again later!'}), 500