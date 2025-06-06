from functools import wraps
from flask import request, jsonify, g
from utils.buscarUsuario import buscarUsuarioById

def validarPermisoUsuario(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario_actual = g.usuario 
        id_objetivo = kwargs.get('id')

        if not id_objetivo:
            return jsonify({'error': 'ID de usuario no proporcionado'}), 400

        usuario_objetivo = buscarUsuarioById(id_objetivo)

        if not usuario_objetivo or 'error' in usuario_objetivo:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        jerarquia = {'estudiante': 1, 'profesor': 2, 'admin': 3}

        rol_actual = usuario_actual['rol']
        rol_objetivo = usuario_objetivo['rol']

        if (
            usuario_actual['id'] != id_objetivo and 
            jerarquia[rol_actual] <= jerarquia[rol_objetivo] 
        ):
            return jsonify({'error': 'No autorizado para realizar esta acción sobre este usuario'}), 403

        return f(*args, **kwargs)
    return wrapper
