from functools import wraps
from flask import request, jsonify,g

def rol_requerido(roles_permitidos):
    def decorador(f):
        @wraps(f)
        def funcion_decorada(*args, **kwargs):
            if request.method == 'OPTIONS':
                return f(*args, **kwargs)

            usuario = getattr(g, 'usuario', None)
            if not usuario:
                return jsonify({'error': 'Usuario no autenticado (no hay token válido en g.usuario)'}), 401
            if usuario.get('rol') not in roles_permitidos:
                return jsonify({'error': f"Acceso denegado: se requiere uno de los roles: {', '.join(roles_permitidos)}"}), 403
            return f(*args, **kwargs)
        return funcion_decorada
    return decorador
