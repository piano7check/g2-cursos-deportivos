from data.conexion import obtenerConexion 

class userModel:
    @staticmethod
    def crearUsuario(data):
        try:
            conexion = obtenerConexion()

            with conexion.cursor() as cursor:
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

            return {"mensaje": "Usuario registrado correctamente"}

        except Exception as e:
            conexion.rollback()
            return {"error": str(e)}
        finally:
            conexion.close()
            
    @staticmethod
    def eliminarUsuario(id):
        try:
            conexion = obtenerConexion()
            if conexion is None:
                return {"error": "Error en la conexion de la base de datos"}
            
            with conexion.cursor() as cursor:
                sql = "DELETE FROM users where id = %s"
                cursor.execute(sql,(id,))
                conexion.commit()
            return {"message": "Usuario eliminado"}
        
        except Exception as e:
            conexion.rollback()
            return {"error": "Error al eliminar Usuario",
                    "detalles": str(e)}
        
        finally:
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

                for campo, valor in data.items():
                    campos.append(f"{campo} = %s")
                    valores.append(valor)

                valores.append(id) 

                sql = f"UPDATE users SET {', '.join(campos)} WHERE id = %s"
                cursor.execute(sql, valores)
                conexion.commit()

                return {"id": id, "actualizado": True}

        except Exception as e:
            conexion.rollback()
            return {"error": f"No se pudo actualizar el usuario: {str(e)}"}

    @staticmethod
    def obtenerUsuarios(limit, offset, filtros=None):
        conexion = obtenerConexion()
        try:
            with conexion.cursor() as cursor:
                base_sql = "SELECT id, name, lastname, email, birthdate, rol FROM users"
                condiciones = []
                valores = []

                if filtros:
                    for campo, valor in filtros.items():
                        condiciones.append(f"{campo} LIKE %s")
                        valores.append(f"%{valor}%")

                if condiciones:
                    base_sql += " WHERE " + " AND ".join(condiciones)

                base_sql += " ORDER BY id LIMIT %s OFFSET %s"
                valores.extend([limit, offset])

                cursor.execute(base_sql, valores)
                usuarios = cursor.fetchall()

                return usuarios

        except Exception as e:
            return {"error": str(e)}

        finally:
            conexion.close()
 