from data.conexion import obtenerConexion
from pymysql.cursors import DictCursor

def obtener_curso(id):
    conexion = obtenerConexion()
    if conexion is None:
        return {"error": "Error en la conexión a la base de datos"}
    
    try:
        with conexion.cursor(DictCursor) as cursor:
            sql = "SELECT * FROM cursos WHERE id = %s"
            cursor.execute(sql, (id,))
            curso = cursor.fetchone()
            if curso is None:
                return {"error": "Curso no encontrado"}
        return curso
        
    except Exception as e:
        return {"error": "Error al obtener curso", "detalles": str(e)}
    finally:
        conexion.close()
