from data.conexion import obtenerConexion
import pymysql.cursors
from decimal import Decimal

class ReservasModel:
    @staticmethod
    def crear_reserva(estudiante_id, curso_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                sql_check_existing_reserva = """
                    SELECT id FROM reservas
                    WHERE estudiante_id = %s AND curso_id = %s AND estado IN ('pendiente', 'validado')
                """
                cursor.execute(sql_check_existing_reserva, (estudiante_id, curso_id))
                existing_reserva = cursor.fetchone()

                if existing_reserva:
                    conexion.rollback()
                    return {"error": "Ya tienes una reserva activa para este curso.", "status_code": 409}

                sql_check_cupos = "SELECT cupos, nombre FROM cursos WHERE id = %s FOR UPDATE"
                cursor.execute(sql_check_cupos, (curso_id,))
                curso_info = cursor.fetchone()

                if not curso_info:
                    conexion.rollback()
                    return {"error": "Curso no encontrado.", "status_code": 404}

                current_cupos = curso_info[0]
                curso_nombre = curso_info[1]

                if current_cupos <= 0:
                    conexion.rollback()
                    return {"error": "No hay cupos disponibles para este curso.", "status_code": 400}

                sql_update_cupos = "UPDATE cursos SET cupos = cupos - 1 WHERE id = %s"
                cursor.execute(sql_update_cupos, (curso_id,))

                sql_insert_reserva = """
                    INSERT INTO reservas (estudiante_id, curso_id, fecha_reserva, estado)
                    VALUES (%s, %s, NOW(), 'pendiente')
                """
                cursor.execute(sql_insert_reserva, (estudiante_id, curso_id))
                reserva_id = cursor.lastrowid

                conexion.commit()

                return {
                    "id": reserva_id,
                    "mensaje": f"Reserva exitosa para el curso '{curso_nombre}'. Cupo asegurado.",
                    "curso_nombre": curso_nombre,
                    "estado": "pendiente"
                }

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
    def obtener_reservas_por_estudiante(estudiante_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        r.id AS reserva_id,
                        r.fecha_reserva,
                        r.estado AS estado_reserva,
                        c.id AS curso_id,
                        c.nombre AS curso_nombre,
                        c.descripcion AS curso_descripcion,
                        c.cupos AS curso_cupos,
                        c.coste AS curso_coste,
                        u.name AS profesor_nombre,
                        u.lastname AS profesor_apellido,
                        cat.nombre AS categoria_nombre,
                        vp.estado AS estado_pago,
                        vp.fecha_envio AS fecha_envio_pago,
                        vp.archivo_url AS comprobante_url
                    FROM reservas r
                    JOIN cursos c ON r.curso_id = c.id
                    JOIN users u ON c.profesor_id = u.id
                    LEFT JOIN categorias cat ON c.categoria_id = cat.id
                    LEFT JOIN validaciones_pago vp ON r.id = vp.reserva_id
                    WHERE r.estudiante_id = %s
                    ORDER BY r.fecha_reserva DESC
                """
                cursor.execute(sql, (estudiante_id,))
                reservas = cursor.fetchall()

                for reserva in reservas:
                    if 'curso_coste' in reserva and isinstance(reserva['curso_coste'], Decimal):
                        reserva['curso_coste'] = str(reserva['curso_coste'])

                return {"reservas": reservas}

        except pymysql.Error as e:
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtener_todas_las_reservas(limit=None, offset=0, estudiante_id=None, curso_id=None, estado=None):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql_base = """
                    SELECT
                        r.id AS reserva_id,
                        r.fecha_reserva,
                        r.estado AS estado_reserva,
                        c.id AS curso_id,
                        c.nombre AS curso_nombre,
                        c.descripcion AS curso_descripcion,
                        c.cupos AS curso_cupos,
                        c.coste AS curso_coste,
                        e.name AS estudiante_nombre,
                        e.lastname AS estudiante_apellido,
                        e.email AS estudiante_email,
                        p.name AS profesor_nombre,
                        p.lastname AS profesor_apellido,
                        cat.nombre AS categoria_nombre,
                        vp.estado AS estado_pago,
                        vp.fecha_envio AS fecha_envio_pago,
                        vp.archivo_url AS comprobante_url
                    FROM reservas r
                    JOIN users e ON r.estudiante_id = e.id
                    JOIN cursos c ON r.curso_id = c.id
                    JOIN users p ON c.profesor_id = p.id
                    LEFT JOIN categorias cat ON c.categoria_id = cat.id
                    LEFT JOIN validaciones_pago vp ON r.id = vp.reserva_id
                """
                conditions = []
                values = []

                if estudiante_id:
                    conditions.append("r.estudiante_id = %s")
                    values.append(estudiante_id)
                if curso_id:
                    conditions.append("r.curso_id = %s")
                    values.append(curso_id)
                if estado:
                    conditions.append("r.estado = %s")
                    values.append(estado)

                if conditions:
                    sql_base += " WHERE " + " AND ".join(conditions)

                sql_base += " ORDER BY r.fecha_reserva DESC"

                if limit is not None:
                    sql_base += " LIMIT %s OFFSET %s"
                    values.append(limit)
                    values.append(offset)

                cursor.execute(sql_base, tuple(values))
                reservas = cursor.fetchall()

                for reserva in reservas:
                    if 'curso_coste' in reserva and isinstance(reserva['curso_coste'], Decimal):
                        reserva['curso_coste'] = str(reserva['curso_coste'])

                sql_count = """
                    SELECT COUNT(*)
                    FROM reservas r
                    JOIN users e ON r.estudiante_id = e.id
                    JOIN cursos c ON r.curso_id = c.id
                    JOIN users p ON c.profesor_id = p.id
                    LEFT JOIN categorias cat ON c.categoria_id = cat.id
                    LEFT JOIN validaciones_pago vp ON r.id = vp.reserva_id
                """
                if conditions:
                    sql_count += " WHERE " + " AND ".join(conditions)

                cursor.execute(sql_count, tuple(values[:-2] if limit is not None else values))
                total_reservas = cursor.fetchone()[0]


                return {"reservas": reservas, "total_reservas": total_reservas}

        except pymysql.Error as e:
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def actualizar_estado_reserva(reserva_id, nuevo_estado):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        if nuevo_estado not in ['pendiente', 'validado', 'expirado', 'cancelado']:
            return {"error": "Estado de reserva inválido."}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                sql_get_info = "SELECT estado, curso_id FROM reservas WHERE id = %s FOR UPDATE"
                cursor.execute(sql_get_info, (reserva_id,))
                reserva_info = cursor.fetchone()

                if not reserva_info:
                    conexion.rollback()
                    return {"error": "Reserva no encontrada."}

                estado_actual = reserva_info[0]
                curso_id = reserva_info[1]

                sql_update_reserva = "UPDATE reservas SET estado = %s WHERE id = %s"
                cursor.execute(sql_update_reserva, (nuevo_estado, reserva_id))

                if estado_actual == 'pendiente' and (nuevo_estado == 'expirado' or nuevo_estado == 'cancelado'):
                    sql_increment_cupos = "UPDATE cursos SET cupos = cupos + 1 WHERE id = %s"
                    cursor.execute(sql_increment_cupos, (curso_id,))

                conexion.commit()
                return {
                    "id": reserva_id,
                    "mensaje": f"Estado de reserva actualizado a '{nuevo_estado}'."
                }

        except pymysql.Error as e:
            conexion.rollback()
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            conexion.rollback()
            return {"error": f"Error interno del servidor: {str(e)}"}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def eliminar_reserva(reserva_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                sql_get_info = "SELECT estado, curso_id FROM reservas WHERE id = %s FOR UPDATE"
                cursor.execute(sql_get_info, (reserva_id,))
                reserva_info = cursor.fetchone()

                if not reserva_info:
                    conexion.rollback()
                    return {"error": "Reserva no encontrada."}

                estado_reserva = reserva_info[0]
                curso_id = reserva_info[1]

                sql_delete_reserva = "DELETE FROM reservas WHERE id = %s"
                cursor.execute(sql_delete_reserva, (reserva_id,))

                if estado_reserva in ['pendiente', 'validado']:
                    sql_increment_cupos = "UPDATE cursos SET cupos = cupos + 1 WHERE id = %s"
                    cursor.execute(sql_increment_cupos, (curso_id,))

                conexion.commit()
                return {"mensaje": "Reserva eliminada exitosamente."}

        except pymysql.Error as e:
            conexion.rollback()
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            conexion.rollback()
            return {"error": f"Error interno del servidor: {str(e)}"}
        finally:
            if conexion:
                conexion.close()
