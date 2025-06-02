from flask import jsonify, request
from models.cursosModels import CursosModel
from schemas.cursos import validarCurso
from utils.validarProfesor import validar_profesor, verificar_disponibilidad_profesor

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
            return jsonify({"error": "Datos JSON requeridos"}), 400

        
        if not validar_profesor(data['profesor_id']):
            return jsonify({"error": "Profesor no válido"}), 400
        
        for horario in data['horarios']:
            if horario['hora_inicio'] >= horario['hora_fin']:
                return jsonify({
                    "error": "Horario inválido",
                    "detalle": f"Hora inicio debe ser anterior a hora fin ({horario['dia']})"
                }), 400
        
        disponible, mensaje = verificar_disponibilidad_profesor(
            data['profesor_id'],
            data['horarios']
        )
        if not disponible:
            return jsonify({"error": "Conflicto de horario", "detalle": mensaje}), 400
        
        resultado = CursosModel.crear_curso(data)
        if 'error' in resultado:
            return jsonify(resultado), 500
            
        return jsonify(resultado), 201