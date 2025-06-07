from functools import wraps
from flask import request, jsonify, g
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

def token_requerido(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        token = None
        token = request.cookies.get('access_token')
        
        if not token and 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.usuario = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        except Exception as e:
            return jsonify({'error': f'Error al verificar token: {str(e)}'}), 401

        return f(*args, **kwargs)
    return decorated

