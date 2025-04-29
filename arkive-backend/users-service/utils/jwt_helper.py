import datetime
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, decode_token
from flask import current_app

blacklist = set()

def init_jwt(app):
   """
   Initialize the JWT manager and blacklist loader with the Flask app.
   """
   jwt = JWTManager(app)

   @jwt.token_in_blocklist_loader
   def check_if_token_in_blacklist(jwt_header, jwt_payload):
      """
      Check if the given token is in the blacklist.
      """
      jti = jwt_payload['jti']
      return jti in blacklist

   return jwt

def create_tokens(identity):
   """
   Create both access and refresh tokens for a given user.
   :param identity: The user ID or identity to associate the tokens with
   :return: access_token, refresh_token
   """
   identity_string = str(identity)
   access_token = create_access_token(identity=identity_string, fresh=True)
   refresh_token = create_refresh_token(identity=identity_string)

   return access_token, refresh_token
   
def decode_access_token(token):
   """
   Decode the access token to get the payload (e.g., user ID).
   :param token: The access token to decode
   :return: The decoded token payload
   """
   return decode_token(token)

def blacklist_refresh_token(token):
   """
   Blacklist a refresh token to invalidate it.
   :param token: The refresh token to blacklist
   """
   jti = decode_token(token)['jti']
   blacklist.add(jti)
