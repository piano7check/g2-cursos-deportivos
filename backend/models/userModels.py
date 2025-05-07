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
            if conexion:
                conexion.rollback()
            return {"error": str(e)}
        finally:
            if conexion:
                conexion.close()
