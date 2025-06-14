from flask import request, jsonify, g, make_response
from models.userModels import userModel
from schemas.userSchema import validarUsuarioParcial
import bcrypt
from utils.tokenUsuario import generarToken
from utils.buscarUsuario import buscarUsuarioById

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
    def editarPerfil(): 
        if 'usuario' not in g:
            return jsonify({"error": "Usuario no autenticado"}), 401
            
        target_user_id = g.usuario['id'] 
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

        resultadoEdicion = userModel.editarUsuario(target_user_id, data_limpia)
            
        if "error" in resultadoEdicion:
            return jsonify(resultadoEdicion), 500
        
        updated_user = buscarUsuarioById(target_user_id)
        if not updated_user or "error" in updated_user:
            return jsonify({"error": "Perfil actualizado, pero no se pudo recuperar los datos completos del usuario."}), 500
        
        new_token = generarToken(updated_user)

        response = make_response(jsonify({
            "message": "Perfil de usuario actualizado correctamente",
            "usuario": updated_user 
            }), 200)

        response.set_cookie(
            "access_token",
            new_token,
            httponly=True,
            secure=False, 
            samesite="Lax",
            max_age=3600 * 24,
            path="/"
        )
        return response

    @staticmethod
    def eliminarCuenta(): 
        if 'usuario' not in g:
            return jsonify({"error": "Usuario no autenticado"}), 401
            
        target_user_id = g.usuario['id'] 
        resultado = userModel.eliminarUsuario(target_user_id)
            
        if "error" in resultado:
            return jsonify(resultado), 500
            
        return jsonify({"message": "Cuenta de usuario eliminada correctamente"}), 200

    @staticmethod
    def logoutUsuario():
        response = make_response(jsonify({"message": "Sesión cerrada correctamente"}), 200)
        response.set_cookie(
            "access_token", 
            "", 
            max_age=0, 
            httponly=True, 
            secure=False, 
            samesite="Lax",
            path="/"
        )
        return response

