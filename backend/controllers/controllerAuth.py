from flask import request, jsonify
from utils.tokenUsuario import verificarToken  
from utils.buscarUsuario import buscarUsuarioById

def check_auth():
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'error': 'Token no encontrado'}), 401

    usuario_data = verificarToken(token)
    if not usuario_data:
        return jsonify({'error': 'Token inválido o expirado'}), 401

    usuario = buscarUsuarioById(usuario_data['id'])
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    return jsonify({'usuario': usuario}), 200
