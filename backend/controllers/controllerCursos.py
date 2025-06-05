from flask import jsonify, request
from models.cursosModels import CursosModel
from schemas.cursos import validarCurso
from schemas.cursosPartial import validarCursoParcial
from utils.validarCursos import validar_horarios_y_disponibilidad_curso
from utils.validarProfesor import validar_profesor, verificar_disponibilidad_profesor
from utils.obtenerCursoId import obtener_curso
from datetime import datetime
class ControllerCursos():  
    @staticmethod
    def obtener_cursos():  
        resultado = CursosModel.obtener_cursos()
        if 'error' in resultado:
            return jsonify(resultado), 500
        return jsonify({"cursos": resultado}), 200
    
    @staticmethod
    def crear_curso():         
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Datos JSON requeridos para la creación del curso."}), 400

        esValido, errores = validarCurso(data) 
        if not esValido:
            return jsonify({"error": "Datos del curso inválidos", "detalles": errores}), 400

        profesor_id = data.get('profesor_id')
        if not profesor_id or not validar_profesor(profesor_id):
            return jsonify({"error": "Profesor no válido o ID de profesor no proporcionado."}), 400
        
        horarios_a_validar = data.get('horarios')
        if not isinstance(horarios_a_validar, list) or not horarios_a_validar:
             return jsonify({"error": "Se requiere al menos un horario válido para el curso."}), 400

        valido_horarios, mensaje_horarios = validar_horarios_y_disponibilidad_curso(
            profesor_id,
            horarios_a_validar 
        )
        
        if not valido_horarios:
            return jsonify({"error": "Error de horario o disponibilidad", "detalle": mensaje_horarios}), 400
        
        resultado = CursosModel.crear_curso(data)
        if 'error' in resultado:
            return jsonify(resultado), 500
            
        return jsonify(resultado), 201
    
    @staticmethod
    def editar_curso(id):
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
        
        horarios_finales_para_validar = data_limpia.get('horarios', curso_existente.get('horarios')) 
        
        if horarios_finales_para_validar is not None and isinstance(horarios_finales_para_validar, list):
            valido_horarios, mensaje_horarios = validar_horarios_y_disponibilidad_curso(
                profesor_id_final,
                horarios_finales_para_validar,
                curso_id_a_ignorar=id 
            )
            if not valido_horarios:
                return jsonify({"error": "Conflicto de horario al editar curso", "detalle": mensaje_horarios}), 400
        
        resultado = CursosModel.actualizar_curso(id, data_limpia) 
        if 'error' in resultado:
            return jsonify(resultado), 500
            
        return jsonify({"message": "Curso actualizado exitosamente", "curso": resultado}), 200

    @staticmethod
    def eliminar_curso(id):
        busqueda = obtener_curso(id)
        
        if not isinstance(busqueda, dict) or "error" in busqueda:
            return jsonify({"error": "Curso no encontrado"}), 404

        resultado = CursosModel.eliminar_curso(id)

        if "error" in resultado:
            return jsonify(resultado), 500

        return jsonify(resultado), 200
