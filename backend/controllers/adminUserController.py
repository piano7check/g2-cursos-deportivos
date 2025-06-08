from flask import request, jsonify, make_response, g
import bcrypt
from models.userModels import userModel
from schemas.userSchema import validarUsuarioCompleto, validarUsuarioParcial
from utils.buscarUsuario import buscarUsuarioById
from utils.tokenUsuario import generarToken
from models.cursosModels import CursosModel

class adminUserController:
    @staticmethod
    def crearUsuario():
        try:
            data = request.get_json()

            esValido, errores, data_limpia = validarUsuarioCompleto(data)
            if not esValido:
                return jsonify({
                    "message": "Datos de usuario no válidos",
                    "error": errores
                }), 400

            password_bytes = data_limpia["password"].encode('utf-8')
            hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
            data_limpia["password"] = hashed.decode('utf-8')

            resultado = userModel.crearUsuario(data_limpia)

            if "error" in resultado:
                if "El email ya está registrado" in resultado["error"]:
                    return jsonify({"message": "Error al crear usuario", "error": resultado["error"]}), 409
                return jsonify({"message": "Error al crear usuario", "error": resultado["error"]}), 500

            return jsonify({"message": "Usuario creado correctamente", "usuario_id": resultado.get("id")}), 201

        except Exception as e:
            return jsonify({"error": f"Error inesperado al crear usuario: {str(e)}"}), 500

    @staticmethod
    def eliminarUsuario(id):
        try:
            resultado = userModel.eliminarUsuario(id)
            if "error" in resultado:
                if "no encontrado" in resultado["error"].lower() or "ya eliminado" in resultado["error"].lower():
                    return jsonify({"message": "Usuario no encontrado", "error": resultado["error"]}), 404
                return jsonify({"message": "Error al eliminar usuario", "error": resultado["error"]}), 500

            return jsonify({"message": "Usuario eliminado correctamente"}), 200

        except Exception as e:
            return jsonify({"error": f"Error inesperado al eliminar usuario: {str(e)}"}), 500

    @staticmethod
    def editarUsuario(id):
        try:
            data = request.get_json()

            esValido, errores, data_limpia = validarUsuarioParcial(data)
            if not esValido:
                return jsonify({
                    "message": "Datos no válidos para la edición",
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
                if "El email ya está registrado" in resultadoEdicion["error"]:
                    return jsonify({"message": "Error al editar usuario", "error": resultadoEdicion["error"]}), 409
                if "no encontrado o no se realizaron cambios" in resultadoEdicion["error"].lower():
                    return jsonify({"message": "Usuario no encontrado o sin cambios", "error": resultadoEdicion["error"]}), 404
                return jsonify({"message": "Error al editar usuario", "error": resultadoEdicion["error"]}), 500

            updated_user = buscarUsuarioById(id)
            if not updated_user or "error" in updated_user:
                return jsonify({"message": "Usuario actualizado, pero hubo un error al recuperar los datos completos para el token.", "error": updated_user.get("error", "Error desconocido")}), 500

            response_data = {
                "message": "Usuario actualizado correctamente",
                "usuario": {
                    "id": updated_user.get('id'),
                    "name": updated_user.get('name'),
                    "lastname": updated_user.get('lastname'),
                    "email": updated_user.get('email'),
                    "rol": updated_user.get('rol'),
                    "birthdate": updated_user.get('birthdate'),
                }
            }
            response = make_response(jsonify(response_data), 200)

            if 'usuario' in g and g.usuario.get('id') == id:
                new_token = generarToken(updated_user)
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

        except Exception as e:
            return jsonify({"error": f"Error inesperado al editar usuario: {str(e)}"}), 500

    @staticmethod
    def mostrarUsuarios():
        try:
            limit = int(request.args.get('limit', 10))
            offset = int(request.args.get('offset', 0))
            name = request.args.get('name', '')
            lastname = request.args.get('lastname', '')
            email = request.args.get('email', '')
            rol = request.args.get('rol', '') 

            filtros = {}
            if name: filtros['name'] = name
            if lastname: filtros['lastname'] = lastname
            if email: filtros['email'] = email
            if rol: filtros['rol'] = rol 

            usuarios = userModel.obtenerUsuarios(limit, offset, filtros)

            if isinstance(usuarios, dict) and 'error' in usuarios:
                return jsonify({"message": "Error al obtener usuarios", "error": usuarios["error"]}), 500

            usuarios_con_cursos = []
            for usuario in usuarios:
                usuario_dict = dict(usuario)

                if usuario_dict['rol'] == 'estudiante':
                    cursos_inscritos = userModel.obtenerCursosInscritosEstudiante(usuario_dict['id'])
                    if isinstance(cursos_inscritos, dict) and 'error' in cursos_inscritos:
                        usuario_dict['cursos_inscritos'] = []
                    else:
                        usuario_dict['cursos_inscritos'] = cursos_inscritos
                elif usuario_dict['rol'] == 'profesor':
                    cursos_asignados = CursosModel.obtener_cursos_por_profesor(usuario_dict['id'])
                    if isinstance(cursos_asignados, dict) and 'error' in cursos_asignados:
                        usuario_dict['cursos_asignados'] = []
                    else:
                        usuario_dict['cursos_asignados'] = cursos_asignados
                
                usuarios_con_cursos.append(usuario_dict)

            return jsonify({"usuarios": usuarios_con_cursos}), 200

        except Exception as e:
            return jsonify({"error": f"Error inesperado al mostrar usuarios: {str(e)}"}), 500

    @staticmethod
    def getTotalUsers():
        try:
            name = request.args.get('name', '')
            lastname = request.args.get('lastname', '')
            email = request.args.get('email', '')
            rol = request.args.get('rol', '')

            filtros = {}
            if name: filtros['name'] = name
            if lastname: filtros['lastname'] = lastname
            if email: filtros['email'] = email
            if rol: filtros['rol'] = rol 

            count = userModel.getTotalUsersCount(filtros)
            if isinstance(count, dict) and 'error' in count:
                return jsonify({"message": "Error al obtener el conteo total de usuarios", "error": count["error"]}), 500
            return jsonify({"total_users": count}), 200
        except Exception as e:
            return jsonify({"error": f"Error inesperado al obtener el conteo de usuarios: {str(e)}"}), 500

    @staticmethod
    def buscarUsuarioPorCampo():
        try:
            campos_validos = ['name', 'lastname', 'email', 'rol'] 
            filtros = {}

            for campo in campos_validos:
                valor = request.args.get(campo)
                if valor:
                    filtros[campo] = valor

            if not filtros:
                return jsonify({"error": "Debe especificar al menos un campo de búsqueda válido (name, lastname, email, rol)"}), 400

            limit = int(request.args.get('limit', 10))
            offset = int(request.args.get('offset', 0))

            usuarios = userModel.obtenerUsuarios(limit, offset, filtros)

            if isinstance(usuarios, dict) and 'error' in usuarios:
                return jsonify({"message": "Error al buscar usuarios", "error": usuarios["error"]}), 500

            usuarios_con_cursos = []
            for usuario in usuarios:
                usuario_dict = dict(usuario)

                if usuario_dict['rol'] == 'estudiante':
                    cursos_inscritos = userModel.obtenerCursosInscritosEstudiante(usuario_dict['id'])
                    if isinstance(cursos_inscritos, dict) and 'error' in cursos_inscritos:
                        usuario_dict['cursos_inscritos'] = []
                    else:
                        usuario_dict['cursos_inscritos'] = cursos_inscritos
                elif usuario_dict['rol'] == 'profesor':
                    cursos_asignados = CursosModel.obtener_cursos_por_profesor(usuario_dict['id'])
                    if isinstance(cursos_asignados, dict) and 'error' in cursos_asignados:
                        usuario_dict['cursos_asignados'] = []
                    else:
                        usuario_dict['cursos_asignados'] = cursos_asignados
                
                usuarios_con_cursos.append(usuario_dict)

            return jsonify({"usuarios": usuarios_con_cursos}), 200

        except Exception as e:
            return jsonify({"error": f"Error inesperado al buscar usuarios: {str(e)}"}), 500

    @staticmethod
    def obtenerProfesores():
        result = userModel.obtener_profesores()
        if "error" in result:
            return jsonify({"message": "Error al obtener profesores", "error": result["error"]}), 500
        return jsonify({"profesores": result}), 200
