from data.conexion import obtenerConexion
from pymysql.cursors import DictCursor

def buscarUsuarioById(id_objetivo):
    try:
        conexion = obtenerConexion()
        
        if conexion is None:
            return {"error": "Error en la conexion a la base de datos"}
        with conexion.cursor(DictCursor) as cursor:
            sql =  "SELECT FROM users where id = %s"   
            cursor.execute(sql,(id_objetivo))
            usuario = cursor.fetchone()
            
        return usuario            
    except Exception as e:
        conexion.rollback()
        return {"error": str(e)}
    finally:
        conexion.close()