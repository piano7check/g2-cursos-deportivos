from data.conexion import obtenerConexion
import pymysql.cursors
from decimal import Decimal
from datetime import datetime

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
    def obtener_reserva_por_id(reserva_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        r.id AS reserva_id,
                        r.estudiante_id,
                        r.fecha_reserva,
                        r.estado AS estado_reserva,
                        r.oculto_para_estudiante,
                        c.id AS curso_id,
                        c.nombre AS curso_nombre,
                        c.coste AS curso_coste,
                        u.name AS profesor_nombre,
                        u.lastname AS profesor_apellido,
                        vp.estado AS estado_pago,
                        vp.archivo_url AS comprobante_url
                    FROM reservas r
                    JOIN cursos c ON r.curso_id = c.id
                    JOIN users u ON c.profesor_id = u.id
                    LEFT JOIN validaciones_pago vp ON r.id = vp.reserva_id
                    WHERE r.id = %s
                """
                cursor.execute(sql, (reserva_id,))
                reserva = cursor.fetchone()
                if reserva and isinstance(reserva.get('curso_coste'), Decimal):
                    reserva['curso_coste'] = str(reserva['curso_coste'])
                return {"reserva": reserva}

        except pymysql.Error as e:
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtener_reservas_por_estudiante(estudiante_id):
        conexion = obtenerConexion()

        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        r.id AS reserva_id,
                        r.fecha_reserva,
                        r.estado AS estado_reserva,
                        r.oculto_para_estudiante,
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
    def obtener_todas_las_reservas(limit=None, offset=0, estudiante_id=None, curso_id=None, estado=None, oculto_para_estudiante=None):
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
                        r.oculto_para_estudiante,
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
                if oculto_para_estudiante is not None:
                    conditions.append("r.oculto_para_estudiante = %s")
                    values.append(1 if oculto_para_estudiante else 0)

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
                count_conditions = conditions[:]
                count_values = values[:]
                if limit is not None:
                    count_values = count_values[:-2]

                if count_conditions:
                    sql_count += " WHERE " + " AND ".join(count_conditions)
                
                cursor.execute(sql_count, tuple(count_values))
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

                if estado_actual in ['pendiente', 'validado'] and (nuevo_estado == 'expirado' or nuevo_estado == 'cancelado'):
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
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def actualizar_estado_pago_reserva(reserva_id, archivo_url=None):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                sql_check_validation = "SELECT id, estado FROM validaciones_pago WHERE reserva_id = %s FOR UPDATE"
                cursor.execute(sql_check_validation, (reserva_id,))
                existing_validation = cursor.fetchone()

                if existing_validation:
                    validation_id = existing_validation[0]
                    current_validation_estado = existing_validation[1]

                    if current_validation_estado == 'aprobado':
                        conexion.rollback()
                        return {"error": "Esta reserva ya tiene un pago aprobado.", "status_code": 409}
                    
                    sql_update_validation = """
                        UPDATE validaciones_pago SET
                        archivo_url = %s,
                        fecha_envio = NOW(),
                        estado = 'pendiente'
                        WHERE id = %s
                    """
                    cursor.execute(sql_update_validation, (archivo_url, validation_id))
                    
                else:
                    sql_insert_validation = """
                        INSERT INTO validaciones_pago (reserva_id, archivo_url, fecha_envio, estado)
                        VALUES (%s, %s, NOW(), 'pendiente')
                    """
                    cursor.execute(sql_insert_validation, (reserva_id, archivo_url))
                    validation_id = cursor.lastrowid
                    
                conexion.commit()
                return {
                    "mensaje": "Comprobante de pago enviado para validación.",
                    "validation_id": validation_id,
                    "estado_pago": "pendiente"
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
    def obtener_validaciones_pago_admin():
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        vp.id AS validacion_id,
                        vp.reserva_id,
                        vp.archivo_url,
                        vp.fecha_envio,
                        vp.estado AS estado_validacion,
                        r.estado AS estado_reserva_original,
                        r.fecha_reserva,
                        c.nombre AS curso_nombre,
                        c.coste AS curso_coste,
                        e.name AS estudiante_nombre,
                        e.lastname AS estudiante_apellido,
                        e.email AS estudiante_email
                    FROM validaciones_pago vp
                    JOIN reservas r ON vp.reserva_id = r.id
                    JOIN cursos c ON r.curso_id = c.id
                    JOIN users e ON r.estudiante_id = e.id
                    WHERE vp.estado = 'pendiente'
                    ORDER BY vp.fecha_envio ASC
                """
                cursor.execute(sql)
                validaciones = cursor.fetchall()

                for validacion in validaciones:
                    if 'curso_coste' in validacion and isinstance(validacion['curso_coste'], Decimal):
                        validacion['curso_coste'] = str(validacion['curso_coste'])

                return {"validaciones": validaciones}

        except pymysql.Error as e:
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            conexion.rollback()
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def actualizar_estado_validacion_pago(validacion_id, nuevo_estado):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos"}

        if nuevo_estado not in ['aprobado', 'rechazado']:
            return {"error": "Estado de validación inválido.", "status_code": 400}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                sql_get_validation_info = """
                    SELECT vp.estado, vp.reserva_id, r.estado AS estado_reserva
                    FROM validaciones_pago vp
                    JOIN reservas r ON vp.reserva_id = r.id
                    WHERE vp.id = %s FOR UPDATE
                """
                cursor.execute(sql_get_validation_info, (validacion_id,))
                validation_info = cursor.fetchone()

                if not validation_info:
                    conexion.rollback()
                    return {"error": "Validación de pago no encontrada.", "status_code": 404}

                current_validation_estado = validation_info[0]
                reserva_id = validation_info[1]
                current_reserva_estado = validation_info[2]

                if current_validation_estado == nuevo_estado:
                    conexion.rollback()
                    return {"error": f"La validación ya está en estado '{nuevo_estado}'.", "status_code": 409}
                
                sql_update_validation = """
                    UPDATE validaciones_pago SET estado = %s WHERE id = %s
                """
                cursor.execute(sql_update_validation, (nuevo_estado, validacion_id))

                if nuevo_estado == 'aprobado':
                    if current_reserva_estado == 'pendiente':
                        sql_update_reserva = "UPDATE reservas SET estado = 'validado' WHERE id = %s"
                        cursor.execute(sql_update_reserva, (reserva_id,))
                    else:
                        pass 
                elif nuevo_estado == 'rechazado':
                    pass

                conexion.commit()
                return {
                    "mensaje": f"Estado de validación de pago actualizado a '{nuevo_estado}'.",
                    "reserva_id": reserva_id,
                    "estado_validacion": nuevo_estado
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
    def actualizar_oculto_reserva_estudiante(reserva_id, estudiante_id, ocultar_estado):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a la base de datos", "status_code": 500}

        try:
            with conexion.cursor() as cursor:
                conexion.begin()

                sql_check_ownership = "SELECT estudiante_id FROM reservas WHERE id = %s FOR UPDATE"
                cursor.execute(sql_check_ownership, (reserva_id,))
                reserva_owner_id = cursor.fetchone()

                if not reserva_owner_id or reserva_owner_id[0] != estudiante_id:
                    conexion.rollback()
                    return {"error": "Reserva no encontrada o no pertenece al estudiante.", "status_code": 403}

                sql_update = """
                    UPDATE reservas
                    SET oculto_para_estudiante = %s
                    WHERE id = %s
                """
                cursor.execute(sql_update, (ocultar_estado, reserva_id))
                conexion.commit()

            return {"mensaje": f"Reserva { 'ocultada' if ocultar_estado else 'mostrada' } correctamente.", "status_code": 200}

        except pymysql.Error as e:
            conexion.rollback()
            return {"error": "Error en la base de datos", "codigo": e.args[0], "mensaje": e.args[1], "status_code": 500}
        except Exception as e:
            conexion.rollback()
            return {"error": f"Error interno del servidor: {str(e)}", "status_code": 500}
        finally:
            if conexion:
                conexion.close()
