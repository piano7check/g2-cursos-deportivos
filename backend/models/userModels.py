from data.conexion import obtenerConexion 

class userModel:
    @staticmethod
    def crearUsuario(data):
        try:
            conexion = obtenerConexion()

            with conexion.cursor() as cursor:
                sql = """
                    INSERT INTO usuarios (name, lastname, birthdate, email, password )
                    VALUES (%s, %s, %s, %s, %s)
                """
                valores = (
                    data['name'],
                    data['lastname'],
                    data['birthdate'], 
                    data['email'],
                    data['password']
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
