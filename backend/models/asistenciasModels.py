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

                    sql_check = """
                        SELECT id FROM asistencias
                        WHERE estudiante_id = %s AND curso_id = %s AND fecha = %s
                    """
                    cursor.execute(sql_check, (estudiante_id, curso_id, fecha_asistencia))
                    existing_id = cursor.fetchone()

                    if existing_id:
                        sql_update = """
                            UPDATE asistencias SET estado_asistencia = %s
                            WHERE id = %s
                        """
                        cursor.execute(sql_update, (estado_asistencia, existing_id[0]))
                    else:
                        sql_insert = """
                            INSERT INTO asistencias (estudiante_id, curso_id, fecha, estado_asistencia)
                            VALUES (%s, %s, %s, %s)
                        """
                        cursor.execute(sql_insert, (estudiante_id, curso_id, fecha_asistencia, estado_asistencia))

                conexion.commit()
                return {"mensaje": "Asistencia registrada/actualizada correctamente.", "status_code": 200}

        except pymysql.Error as e:
            conexion.rollback()
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            conexion.rollback()
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
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
