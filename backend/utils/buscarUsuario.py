from data.conexion import obtenerConexion
from pymysql.cursors import DictCursor

def buscarUsuarioById(id_objetivo):
    conexion = obtenerConexion()

    if conexion is None:
        return {"error": "Error en la conexión a la base de datos"}

    try:
        with conexion.cursor(DictCursor) as cursor:
            sql = "SELECT id, name, lastname, email, birthdate, rol FROM users WHERE id = %s"
            cursor.execute(sql, (id_objetivo,))
            usuario = cursor.fetchone()
        return usuario

    except Exception as e:
        return {"error": "Error al buscar usuario",
                "detalles": str(e)}

    finally:
        conexion.close()
