from flask import jsonify, g, request
from models.userModels import userModel
from schemas.estudianteParcial import validarUsuarioParcial 
import bcrypt 

class userProfileController:
    @staticmethod
    def obtenerUsuarioActual():
        if 'usuario' not in g:
            return jsonify({"error": "Usuario no autenticado o token inválido"}), 401

        usuario = {
            "id": g.usuario['id'],
            "email": g.usuario['email'],
            "rol": g.usuario['rol'],
            "name": g.usuario.get('name'),
            "lastname": g.usuario.get('lastname') 
        }
        return jsonify(usuario), 200

    @staticmethod
    def editarMiPerfil():
        if 'usuario' not in g:
            return jsonify({"error": "Usuario no autenticado"}), 401
        
        user_id = g.usuario['id']
        data = request.get_json()

        esValido, errores, data_limpia = validarUsuarioParcial(data)
        if not esValido:
            return jsonify({
                "message": "Datos no válidos para actualizar su perfil",
                "error": errores
            }), 400

        if not data_limpia:
            return jsonify({"message": "No se proporcionaron campos válidos para actualizar."}), 200

        if "password" in data_limpia:
            password_bytes = data_limpia["password"].encode('utf-8')
            hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
            data_limpia["password"] = hashed.decode('utf-8')

        # El editarUsuario en userModel debe ser capaz de manejar un ID específico
        # Y la validación de permiso ya la hace validarPermisoUsuario en la ruta
        resultadoEdicion = userModel.editarUsuario(user_id, data_limpia)
        
        if "error" in resultadoEdicion:
            return jsonify(resultadoEdicion), 500

        return jsonify({
            "message": "Su perfil ha sido actualizado correctamente",
            "usuario": resultadoEdicion
        }), 200

    @staticmethod
    def eliminarMiCuenta():
        if 'usuario' not in g:
            return jsonify({"error": "Usuario no autenticado"}), 401
        
        user_id = g.usuario['id']
        resultado = userModel.eliminarUsuario(user_id)
        
        if "error" in resultado:
            return jsonify(resultado), 500
            
        return jsonify({"message": "Su cuenta ha sido eliminada correctamente"}), 200
