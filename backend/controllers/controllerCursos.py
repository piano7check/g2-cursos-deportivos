from flask import jsonify, request, g
from models.cursosModels import CursosModel
from schemas.cursos import validarCurso
from schemas.cursosPartial import validarCursoParcial
from utils.validarCursos import validar_horarios_y_disponibilidad_curso, validar_categoria_existente, parse_time_strings_to_datetime_time
from utils.validarProfesor import validar_profesor
from utils.obtenerCursoId import obtener_curso
from datetime import datetime

class ControllerCursos():
    @staticmethod
    def mostrarCursos():
        resultado = CursosModel.obtener_cursos()
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        return jsonify({"cursos": resultado}), 200

    @staticmethod
    def crearCurso():
        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos JSON requeridos para la creación del curso."}), 400

        esValido, errores = validarCurso(data)
        if not esValido:
            return jsonify({"error": "Datos del curso inválidos", "detalles": errores}), 400

        profesor_id = data.get('profesor_id')
        if not profesor_id or not validar_profesor(profesor_id):
            return jsonify({"error": "Profesor no válido o ID de profesor no proporcionado."}), 400

        categoria_id = data.get('categoria_id')
        valido_categoria, mensaje_categoria = validar_categoria_existente(categoria_id)
        if not valido_categoria:
            return jsonify({"error": "Error de categoría", "detalle": mensaje_categoria}), 400

        horarios_a_validar = data.get('horarios')
        if not isinstance(horarios_a_validar, list) or not horarios_a_validar:
            return jsonify({"error": "Se requiere al menos un horario válido para el curso."}), 400

        horarios_parseados = parse_time_strings_to_datetime_time(horarios_a_validar)
        if "error" in horarios_parseados:
            return jsonify({"error": horarios_parseados['error']}), 400

        valido_horarios, mensaje_horarios = validar_horarios_y_disponibilidad_curso(
            profesor_id,
            horarios_parseados
        )

        if not valido_horarios:
            return jsonify({"error": "Error de horario o disponibilidad", "detalle": mensaje_horarios}), 400

        resultado = CursosModel.crear_curso(data)
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)

        return jsonify(resultado), 201

    @staticmethod
    def editarCurso(id):
        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos JSON para la actualización parcial requeridos"}), 400

        esValido, errores, data_limpia = validarCursoParcial(data)
        if not esValido:
            return jsonify({"error": "Datos no válidos", "detalles": errores}), 400

        if not data_limpia:
            return jsonify({"message": "No se proporcionaron campos válidos para actualizar."}), 200

        curso_existente = obtener_curso(id)
        if not curso_existente or "error" in curso_existente:
            return jsonify({"error": "Curso no encontrado para actualizar"}), 404

        profesor_id_final = data_limpia.get('profesor_id', curso_existente.get('profesor_id'))

        if profesor_id_final is None or not validar_profesor(profesor_id_final):
            return jsonify({"error": "Profesor no válido o ID de profesor no proporcionado para la actualización."}), 400
        
        categoria_id_final = data_limpia.get('categoria_id')
        if 'categoria_id' in data_limpia:
            valido_categoria, mensaje_categoria = validar_categoria_existente(categoria_id_final)
            if not valido_categoria:
                return jsonify({"error": "Error de categoría", "detalle": mensaje_categoria}), 400

        horarios_finales_para_validar = data_limpia.get('horarios', curso_existente.get('horarios'))

        if horarios_finales_para_validar is not None and isinstance(horarios_finales_para_validar, list):
            horarios_parseados = parse_time_strings_to_datetime_time(horarios_finales_para_validar)
            if "error" in horarios_parseados:
                return jsonify({"error": horarios_parseados['error']}), 400

            valido_horarios, mensaje_horarios = validar_horarios_y_disponibilidad_curso(
                profesor_id_final,
                horarios_parseados,
                curso_id_a_ignorar=id
            )
            if not valido_horarios:
                return jsonify({"error": "Conflicto de horario al editar curso", "detalle": mensaje_horarios}), 400

        resultado = CursosModel.actualizar_curso(id, data_limpia)
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)

        return jsonify({"message": "Curso actualizado exitosamente", "curso": resultado}), 200

    @staticmethod
    def eliminarCurso(id):
        busqueda = obtener_curso(id)

        if not isinstance(busqueda, dict) or "error" in busqueda:
            return jsonify({"error": "Curso no encontrado"}), 404

        resultado = CursosModel.eliminar_curso(id)

        if isinstance(resultado, dict) and "error" in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)

        return jsonify(resultado), 200

    @staticmethod
    def buscarCursos():
        nombre_curso = request.args.get('nombre', None)
        nombre_categoria = request.args.get('categoria', None)
        nombre_profesor = request.args.get('profesor', None)
        
        resultado = CursosModel.buscar_cursos(
            nombre_curso=nombre_curso,
            nombre_categoria=nombre_categoria,
            nombre_profesor=nombre_profesor
        )

        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        
        return jsonify({"cursos": resultado}), 200

    @staticmethod
    def obtenerCursosEstudiantes():
        estudiante_id = g.usuario.get('id')

        if not estudiante_id:
            return jsonify({"error": "ID de estudiante no encontrado en el token"}), 400

        cursos_data = CursosModel.obtener_cursos_con_estado_reserva(estudiante_id)

        if 'error' in cursos_data:
            return jsonify(cursos_data), cursos_data.get('status_code', 500)
        
        return jsonify(cursos_data), 200

    @staticmethod
    def obtener_cursos_por_profesor():
        profesor_id = g.usuario.get('id')
        if not profesor_id:
            return jsonify({"error": "ID de profesor no encontrado en el token"}), 400
        
        resultado = CursosModel.obtener_cursos_por_profesor(profesor_id)
        
        if "error" in resultado:
            return jsonify(resultado), resultado.get("status_code", 500)
        
        return jsonify(resultado), 200
