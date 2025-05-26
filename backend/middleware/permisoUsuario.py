from functools import wraps
from flask import request, jsonify
from pymysql.cursors import DictCursor
from data.conexion import obtenerConexion

def validarPermisoUsuario(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario_actual = request.usuario
        id_objetivo = kwargs.get('id')

        if not id_objetivo:
            return jsonify({'error': 'ID de usuario no proporcionado'}), 400

        conexion = obtenerConexion()
        try:
            with conexion.cursor(DictCursor) as cursor:
                consulta = "SELECT id, rol FROM users WHERE id = %s"
                cursor.execute(consulta, (id_objetivo,))
                usuario_objetivo = cursor.fetchone()
        finally:
            conexion.close()

        if not usuario_objetivo:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Jerarquía de roles
        jerarquia = {'estudiante': 1, 'profesor': 2, 'admin': 3}

        rol_actual = usuario_actual['rol']
        rol_objetivo = usuario_objetivo['rol']

        if (
            usuario_actual['id'] != id_objetivo and
            jerarquia[rol_actual] <= jerarquia[rol_objetivo]
        ):
            return jsonify({'error': 'No autorizado'}), 403

        return f(*args, **kwargs)
    return wrapper
