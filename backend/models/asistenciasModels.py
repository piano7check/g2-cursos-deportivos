from data.conexion import obtenerConexion
import pymysql.cursors
from datetime import date

class AsistenciasModel:

    @staticmethod
    def registrar_asistencia(curso_id, fecha_str, lista_asistencia):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos", "status_code": 500}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                fecha_asistencia = date.fromisoformat(fecha_str)

                for registro in lista_asistencia:
                    estudiante_id = registro['estudiante_id']
                    estado_asistencia = registro['estado_asistencia']

                    sql_upsert = """
                        INSERT INTO asistencias (estudiante_id, curso_id, fecha, estado_asistencia)
                        VALUES (%s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            estado_asistencia = VALUES(estado_asistencia);
                    """
                    cursor.execute(sql_upsert, (estudiante_id, curso_id, fecha_asistencia, estado_asistencia))
                
                conexion.commit()
                return {"mensaje": "Asistencia(s) registrada(s)/actualizada(s) exitosamente", "status_code": 200}

        except pymysql.Error as e:
            conexion.rollback()
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            conexion.rollback()
            return {"error": str(e), "status_code": 500}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtener_asistencia_por_curso_fecha(curso_id, fecha_str):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos", "status_code": 500}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        a.id AS asistencia_id,
                        a.estudiante_id,
                        u.name AS estudiante_nombre,
                        u.lastname AS estudiante_apellido,
                        a.curso_id,
                        c.nombre AS curso_nombre,
                        a.fecha,
                        a.estado_asistencia
                    FROM asistencias a
                    JOIN users u ON a.estudiante_id = u.id
                    JOIN cursos c ON a.curso_id = c.id
                    WHERE a.curso_id = %s AND a.fecha = %s
                    ORDER BY u.lastname, u.name
                """
                cursor.execute(sql, (curso_id, fecha_str))
                asistencias = cursor.fetchall()

                for asistencia in asistencias:
                    if isinstance(asistencia['fecha'], date):
                        asistencia['fecha'] = asistencia['fecha'].isoformat()

                return {"asistencias": asistencias, "status_code": 200}

        except pymysql.Error as e:
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtener_estudiantes_inscritos_en_curso(curso_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos", "status_code": 500}

        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        u.id AS estudiante_id,
                        u.name AS estudiante_nombre,
                        u.lastname AS estudiante_apellido,
                        u.email AS estudiante_email
                    FROM users u
                    JOIN reservas r ON u.id = r.estudiante_id
                    WHERE r.curso_id = %s AND r.estado = 'validado'
                    ORDER BY u.lastname, u.name
                """
                cursor.execute(sql, (curso_id,))
                estudiantes = cursor.fetchall()
                return {"estudiantes": estudiantes, "status_code": 200}

        except pymysql.Error as e:
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtener_fechas_con_asistencia_por_curso(curso_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos", "status_code": 500}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT DISTINCT fecha
                    FROM asistencias
                    WHERE curso_id = %s
                    ORDER BY fecha DESC
                """
                cursor.execute(sql, (curso_id,))
                fechas = cursor.fetchall() 
                
                fechas_str = [f['fecha'].isoformat() for f in fechas if isinstance(f['fecha'], date)]

                return {"fechas": fechas_str, "status_code": 200}
        except pymysql.Error as e:
            return {"error": "Error en la base de datos al obtener fechas de asistencia", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
        finally:
            if conexion:
                conexion.close()
