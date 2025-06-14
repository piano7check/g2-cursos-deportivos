from data.conexion import obtenerConexion
import pymysql.err
from datetime import datetime, date
from utils.buscarUsuario import buscarUsuarioById

class userModel:
    @staticmethod
    def crearUsuario(data):
        conexion = None
        try:
            conexion = obtenerConexion()
            with conexion.cursor() as cursor:
                if 'birthdate' in data and isinstance(data['birthdate'], str):
                    try:
                        data['birthdate'] = datetime.strptime(data['birthdate'], '%Y-%m-%d').date()
                    except ValueError:
                        return {"error": "Formato de fecha de nacimiento inválido en el modelo. Use %Y-%m-%d"}

                sql = """
                    INSERT INTO users (name, lastname, birthdate, email, password, rol)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                valores = (
                    data['name'],
                    data['lastname'],
                    data['birthdate'],
                    data['email'],
                    data['password'],
                    data['rol']
                )
                cursor.execute(sql, valores)
                conexion.commit()
                return {"mensaje": "Usuario registrado correctamente", "id": cursor.lastrowid}

        except pymysql.err.IntegrityError as e:
            if conexion:
                conexion.rollback()
            if e.args[0] == 1062:
                return {"error": "El email ya está registrado"}
            else:
                return {"error": f"Error de integridad en la BD: {str(e)}"}

        except Exception as e:
            if conexion:
                conexion.rollback()
            return {"error": str(e)}

        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def eliminarUsuario(id):
        conexion = None
        try:
            conexion = obtenerConexion()
            if conexion is None:
                return {"error": "Error en la conexion de la base de datos"}

            with conexion.cursor() as cursor:
                sql = "DELETE FROM users where id = %s"
                cursor.execute(sql,(id,))
                conexion.commit()
                if cursor.rowcount == 0:
                    return {"error": "Usuario no encontrado o ya eliminado"}
                return {"message": "Usuario eliminado"}

        except Exception as e:
            if conexion:
                conexion.rollback()
            return {"error": "Error al eliminar Usuario",
                            "detalles": str(e)}

        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def editarUsuario(id, data):
        conexion = obtenerConexion()

        if conexion is None:
            return {"error": "No se pudo conectar a la base de datos"}

        try:
            with conexion.cursor() as cursor:
                campos = []
                valores = []

                if "birthdate" in data and isinstance(data["birthdate"], str):
                    try:
                        data["birthdate"] = datetime.strptime(data["birthdate"], '%Y-%m-%d').date()
                    except ValueError:
                        return {"error": "Formato de fecha de nacimiento inválido. Use %Y-%m-%d"}, 400


                if "name" in data:
                    campos.append("name = %s")
                    valores.append(data["name"])
                if "lastname" in data:
                    campos.append("lastname = %s")
                    valores.append(data["lastname"])
                if "email" in data:
                    campos.append("email = %s")
                    valores.append(data["email"])
                if "birthdate" in data:
                    campos.append("birthdate = %s")
                    valores.append(data["birthdate"])
                if "password" in data:
                    campos.append("password = %s")
                    valores.append(data["password"])
                if "rol" in data:
                    campos.append("rol = %s")
                    valores.append(data["rol"])

                if not campos:
                    return buscarUsuarioById(id)

                valores.append(id)

                sql = f"UPDATE users SET {', '.join(campos)} WHERE id = %s"
                cursor.execute(sql, valores)
                conexion.commit()

                if cursor.rowcount == 0:
                    return {"error": "Usuario no encontrado o no se realizaron cambios"}

                updated_user_data = buscarUsuarioById(id)
                if updated_user_data is None:
                    return {"error": "Usuario actualizado, pero no se pudo recuperar de nuevo."}
                if "error" in updated_user_data:
                    return {"error": "Usuario actualizado, pero hubo un error al recuperar los datos completos.", "detalle": updated_user_data['error']}

                return updated_user_data

        except pymysql.err.IntegrityError as e:
            if conexion:
                conexion.rollback()
            if e.args[0] == 1062:
                return {"error": "El email ya está registrado"}
            return {"error": f"Error de integridad en la BD al actualizar: {str(e)}"}
        except Exception as e:
            if conexion:
                conexion.rollback()
            return {"error": f"No se pudo actualizar el usuario: {str(e)}"}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtenerUsuarios(limit, offset, filtros=None):
        conexion = obtenerConexion()
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                base_sql = "SELECT id, name, lastname, email, birthdate, rol FROM users"
                condiciones = []
                valores = []

                if filtros:
                    if 'name' in filtros:
                        condiciones.append("name LIKE %s")
                        valores.append(f"%{filtros['name']}%")
                    if 'lastname' in filtros:
                        condiciones.append("lastname LIKE %s")
                        valores.append(f"%{filtros['lastname']}%")
                    if 'email' in filtros:
                        condiciones.append("email LIKE %s")
                        valores.append(f"%{filtros['email']}%")
                    if 'rol' in filtros and filtros['rol']: 
                        condiciones.append("rol = %s")
                        valores.append(filtros['rol'])

                if condiciones:
                    base_sql += " WHERE " + " AND ".join(condiciones)

                base_sql += " ORDER BY id LIMIT %s OFFSET %s"
                valores.extend([limit, offset])

                cursor.execute(base_sql, valores)
                usuarios = cursor.fetchall()

                for usuario in usuarios:
                    if 'birthdate' in usuario and isinstance(usuario['birthdate'], date):
                        usuario['birthdate'] = usuario['birthdate'].isoformat()
                return usuarios

        except Exception as e:
            return {"error": str(e)}

        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def getTotalUsersCount(filtros=None):
        conexion = obtenerConexion()
        try:
            with conexion.cursor() as cursor:
                base_sql = "SELECT COUNT(*) FROM users"
                condiciones = []
                valores = []

                if filtros:
                    if 'name' in filtros:
                        condiciones.append("name LIKE %s")
                        valores.append(f"%{filtros['name']}%")
                    if 'lastname' in filtros:
                        condiciones.append("lastname LIKE %s")
                        valores.append(f"%{filtros['lastname']}%")
                    if 'email' in filtros:
                        condiciones.append("email LIKE %s")
                        valores.append(f"%{filtros['email']}%")
                    if 'rol' in filtros and filtros['rol']: 
                        condiciones.append("rol = %s")
                        valores.append(filtros['rol'])

                if condiciones:
                    base_sql += " WHERE " + " AND ".join(condiciones)

                cursor.execute(base_sql, valores)
                count = cursor.fetchone()[0]
                return count
        except Exception as e:
            return {"error": str(e)}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtener_profesores():
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT id, name, lastname, email, rol, birthdate FROM users WHERE rol = 'profesor'"
                cursor.execute(sql)
                profesores = cursor.fetchall()
            return profesores
        except pymysql.MySQLError as e:
            return {"error": "Error en base de datos", "codigo": e.args[0], "mensaje": e.args[1]}
        finally:
            if conexion:
                conexion.close()

    @staticmethod
    def obtenerCursosInscritosEstudiante(estudiante_id):
        conexion = obtenerConexion()
        if conexion is None:
            return {"error": "Error de conexión a BD"}
        try:
            with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = """
                    SELECT
                        c.id AS curso_id,
                        c.nombre AS curso_nombre,
                        c.descripcion AS curso_descripcion,
                        r.fecha_reserva,
                        r.estado AS reserva_estado,
                        u_profesor.name AS profesor_nombre,
                        u_profesor.lastname AS profesor_apellido,
                        cat.nombre AS categoria_nombre
                    FROM reservas r
                    JOIN cursos c ON r.curso_id = c.id
                    JOIN users u_profesor ON c.profesor_id = u_profesor.id
                    LEFT JOIN categorias cat ON c.categoria_id = cat.id
                    WHERE r.estudiante_id = %s AND r.estado = 'validado'
                """
                cursor.execute(sql, (estudiante_id,))
                cursos = cursor.fetchall()

                for curso in cursos:
                    if 'fecha_reserva' in curso and isinstance(curso['fecha_reserva'], datetime):
                        curso['fecha_reserva'] = curso['fecha_reserva'].isoformat()

                return cursos
        except pymysql.Error as e:
            return {"error": "Error en base de datos al obtener cursos inscritos", "codigo": e.args[0], "mensaje": e.args[1]}
        except Exception as e:
            return {"error": str(e)}
        finally:
            if conexion:
                conexion.close()
