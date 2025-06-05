from data.conexion import obtenerConexion
import pymysql.cursors

class CursosModel:
    @staticmethod
    def crear_curso(data):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        
        try:
            with conexion.cursor() as cursor:

                sql_curso = """INSERT INTO cursos(nombre, descripcion, cupos, profesor_id)
                               VALUES (%s, %s, %s, %s)"""
                cursor.execute(sql_curso, (
                    data['nombre'],
                    data['descripcion'],
                    data['cupos'],
                    data['profesor_id']
                ))
                curso_id = cursor.lastrowid
                
                for horario in data['horarios']:
                    sql_horario = """INSERT INTO horarios(curso_id, dia, hora_inicio, hora_fin)
                                    VALUES (%s, %s, %s, %s)"""
                    cursor.execute(sql_horario, (
                        curso_id,
                        horario['dia'],
                        horario['hora_inicio'],
                        horario['hora_fin']
                    ))
                
                conexion.commit()
                return {
                    "id": curso_id,
                    "mensaje": "Curso creado exitosamente",
                    "nombre": data['nombre']
                }
                
        except pymysql.Error as e:
            conexion.rollback()
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            conexion.rollback()
            return {"error": str(e)}
        finally:
            conexion.close()

    @staticmethod
    def obtener_cursos():
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
            
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """SELECT c.*, 
                                u.name as profesor_nombre, 
                                u.lastname as profesor_apellido 
                        FROM cursos c
                        JOIN users u ON c.profesor_id = u.id"""
                cursor.execute(sql)
                cursos = cursor.fetchall()
                
                for curso in cursos:
                    cursor.execute(
                        "SELECT dia, hora_inicio, hora_fin FROM horarios WHERE curso_id = %s",
                        (curso['id'],)
                    )
                    horarios = cursor.fetchall()
                    
                    horarios_serializables = []
                    for horario in horarios:
                        horarios_serializables.append({
                            'dia': horario['dia'],
                            'hora_inicio': str(horario['hora_inicio']),  
                            'hora_fin': str(horario['hora_fin'])           
                        })
                    curso['horarios'] = horarios_serializables     
                return cursos          
        except pymysql.Error as e:
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": str(e)}
        finally:
            conexion.close()

    @staticmethod
    def obtener_cursos_por_profesor(profesor_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(
                    "SELECT id, nombre FROM cursos WHERE profesor_id = %s",
                    (profesor_id,)
                )
                cursos = cursor.fetchall()
                
                for curso in cursos:
                    cursor.execute(
                        "SELECT dia, hora_inicio, hora_fin FROM horarios WHERE curso_id = %s",
                        (curso['id'],)
                    )
                    curso['horarios'] = cursor.fetchall()
                
                return cursos
                
        except pymysql.Error as e:
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": str(e)}
        finally:
            conexion.close()
    
    @staticmethod
    def eliminar_curso(id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor() as cursor:
                sql = "DELETE from cursos where id = %s"
                cursor.execute(sql, (id,))
                conexion.commit()
            return {"message": "Curso eliminado exitosamente"}
        except Exception as e:
            return {"error": "Error al eliminar curso",
            "detalles": str(e)}
        finally:
            conexion.close()