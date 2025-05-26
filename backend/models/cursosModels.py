from data.conexion import obtenerConexion
import pymysql.cursors

class cursosModels():
    @staticmethod
    def mostrarCursos():
        conexion = obtenerConexion()
        
        if conexion is None:
            return {"error": "No se pudo hacer la conexion a la base de datos"}
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
    def crearCursos(data):
        conexion = obtenerConexion()
        
        if conexion is None:
            return {"error": "No se pudo hacer la conexion a la base de datos"}
        
        try:
            with conexion.cursor() as cursor:
                sql = """INSERT INTO cursos(nombre,descripcion, cupos, profesor_id)
                        values (%s, %s, %s, %s)"""
                valores=(
                    data['nombre'],
                    data['descripcion'],
                    data['cupos'],
                    data['profesor_id']
                )
                cursor.execute(sql,valores)
                conexion.commit()
            
            nuevo_id = cursor.lastrowid
            return {"curso_id": nuevo_id }
        
        except Exception as e:
            conexion.rollback()
            return {"error": str(e)}
        finally:
            conexion.close()
            
     