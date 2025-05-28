from flask import request,jsonify
import bcrypt
from models.userModels import userModel
from schemas.estudianteParcial import validarUsuarioParcial
from schemas.estudiantes import validarUsuario
from utils.validarLogin import validacionLogin
from utils.tokenUsuario import generarToken
from utils.buscarUsuario import buscarUsuarioById

class controllerUsuario():
    @staticmethod
    def registroUsuario():
        
        data = request.get_json()
        esValido, errores = validarUsuario(data)
        if not esValido:
            return jsonify({"error": errores}), 400

        try:
            password = data['password'].encode('utf-8')
            hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
            data['password'] = hashed_password.decode('utf-8')
            data['rol'] = 'estudiante'
            resultado = userModel.crearUsuario(data)

            if 'error' in resultado:
                return jsonify(resultado), 500 

            return jsonify({
                "message": "Usuario registrado correctamente",
                "usuario": {
                    "name": data.get('name'),
                    "lastname": data.get('lastname'),
                    "email": data.get('email'),
                    "rol": data.get('rol')
                }
            }), 201
        
        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500 
     
    @staticmethod
    def loginUsuario():
        data = request.get_json()
        resultado = validacionLogin(data)
        if 'error' in resultado:
            return jsonify(resultado),400
        token = generarToken(resultado)
        return jsonify({"token": token})
    
    @staticmethod
    def eliminarUsuario(id):
        try:
            resultado = userModel.eliminarUsuario(id)
            if "error" in resultado:
                return jsonify(resultado), 500
            
            return jsonify(resultado), 200
            
        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500 
        
    @staticmethod
    def editarUsuario(id):
        try:
            data = request.get_json()

            esValido, errores, data_limpia = validarUsuarioParcial(data)
            if not esValido:
                return jsonify({
                    "message": "Datos no válidos",
                    "error": errores
                }), 400

            if "password" in data_limpia:
                password_bytes = data_limpia["password"].encode('utf-8')
                hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
                data_limpia["password"] = hashed.decode('utf-8') 


            usuarioExistente = buscarUsuarioById(id)

            if not usuarioExistente:
                return jsonify({"error": "Usuario no encontrado"}), 404

            if "error" in usuarioExistente:
                return jsonify(usuarioExistente), 500

            resultadoEdicion = userModel.editarUsuario(id, data_limpia)
            
        
            if "error" in resultadoEdicion:
                return jsonify(resultadoEdicion), 500

            return jsonify({
                "message": "Usuario actualizado correctamente",
                "usuario": resultadoEdicion
            }), 200

        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500
        
    @staticmethod
    def mostrarUsuarios():
        try:
            limit = int(request.args.get('limit', 10))
            offset = int(request.args.get('offset', 0))

            usuarios = userModel.obtenerUsuarios(limit, offset)

            if isinstance(usuarios, dict) and 'error' in usuarios:
                return jsonify(usuarios), 500

            return jsonify({"usuarios": usuarios})

        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

    @staticmethod
    def buscarUsuarioPorCampo():
        try:
            campos_validos = ['name', 'lastname', 'email']
            filtros = {}

            for campo in campos_validos:
                valor = request.args.get(campo)
                if valor:
                    filtros[campo] = valor

            if not filtros:
                return jsonify({"error": "Debe especificar al menos un campo de búsqueda válido"}), 400

            limit = int(request.args.get('limit', 10))
            offset = int(request.args.get('offset', 0))

            usuarios = userModel.obtenerUsuarios(limit, offset, filtros)

            if isinstance(usuarios, dict) and 'error' in usuarios:
                return jsonify(usuarios), 500

            return jsonify({"usuarios": usuarios})

        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500