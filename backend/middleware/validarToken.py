from functools import wraps
from flask import request, jsonify,g
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

def token_requerido(f):
    @wraps(f)
    def wrapper_token(*args, **kwargs):
        token = request.cookies.get("access_token")
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]

        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401

        try:
            datos = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.usuario = datos 
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401

        return f(*args, **kwargs)
    return wrapper_token


