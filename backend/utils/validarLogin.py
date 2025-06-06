from data.conexion import obtenerConexion
import bcrypt
def validacionLogin(data):
    try:
        conexion = obtenerConexion()
        with conexion.cursor() as cursor:
            
            consulta = "SELECT id, name, lastname, email, password, rol FROM users where email = %s"      
            cursor.execute(consulta,(data['email'],))  
            usuario = cursor.fetchone()
            if 'email' not in data or 'password' not in data:
                return {"error": "Faltan campos obligatorios"}
            if usuario:
                id_usuario,user_name, user_lastname ,user_email, password_user, rol = usuario
                password_input = data['password'].encode('utf-8')
                password_db = password_user.encode('utf-8')
                if bcrypt.checkpw(password_input,password_db):
                    return {"id":id_usuario, "name" : user_name, "lastname": user_lastname,"email": user_email, "rol": rol}
                else:
                    return {"error": "Contraseña incorrecta"}
            else:
                return{"error": "Usuario no encontrado"}
            
    except Exception as e:
        return {"error": "Error interno del servidor"}
    finally:
        if conexion:
            conexion.close()