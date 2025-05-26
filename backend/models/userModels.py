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
    def editarUsuario():
        try:
            conexion = obtenerConexion()
            if conexion is None:
                return {"error": "Error en la conexion de la base de datos"}
            
            sql = "UPDATE FROM users"
            
            
        except Exception as e:
            conexion.rollback()
            return {"error" : "Error al editar usuario",
                    "detalles": str(e)}
        finally:
            conexion.close()
