from data.conexion import obtenerConexion
import pymysql.cursors

class cursosModels():
    @staticmethod
    def mostrarCursos():
        conexion = obtenerConexion()
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT * FROM cursos"
                cursor.execute(sql)
                cursos = cursor.fetchall()
                return cursos
        except Exception as e:
            return {"error": "Error al mostrar los cursos",
                    "detalles" : str(e) }
        finally:
            conexion.close()
        
    @staticmethod
    def crearCursos():
        return 0