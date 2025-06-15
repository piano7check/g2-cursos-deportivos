from flask import jsonify, request, g
from models.asistenciasModels import AsistenciasModel
from models.cursosModels import CursosModel
from schemas.asistencias import validarRegistroAsistenciaBatch

class ControllerAsistencias:
    def registrar_o_actualizar_asistencia():
        current_profesor_id = g.usuario.get('id')
        if not current_profesor_id:
            return {"error": "ID de profesor no encontrado en el token."}, 400

        data = request.get_json()
        es_valido, errores = validarRegistroAsistenciaBatch(data)

        if not es_valido:
            return {"error": "Datos de asistencia inválidos", "detalles": errores}, 400

        curso_id = data['curso_id']
        fecha = data['fecha']
        lista_asistencia = data['lista_asistencia']

        curso = CursosModel.obtener_curso_por_id(curso_id)
        if "error" in curso or not curso.get("curso") or curso["curso"].get("profesor_id") != current_profesor_id:
            return {"error": "No autorizado para registrar asistencia en este curso."}, 403

        resultado = AsistenciasModel.registrar_asistencia(curso_id, fecha, lista_asistencia)

        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        return resultado, 200

    def obtener_asistencia_curso_fecha(curso_id, fecha_str):
        current_profesor_id = g.usuario.get('id')
        if not current_profesor_id:
            return {"error": "ID de profesor no encontrado en el token."}, 400

        curso = CursosModel.obtener_curso_por_id(curso_id)
        if "error" in curso or not curso.get("curso") or curso["curso"].get("profesor_id") != current_profesor_id:
            return {"error": "No autorizado para consultar asistencia de este curso."}, 403

        resultado = AsistenciasModel.obtener_asistencia_por_curso_fecha(curso_id, fecha_str)
        
        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        return resultado, 200

    def obtener_estudiantes_por_curso(curso_id):
        current_profesor_id = g.usuario.get('id')
        if not current_profesor_id:
            return {"error": "ID de profesor no encontrado en el token."}, 400

        curso = CursosModel.obtener_curso_por_id(curso_id)
        if "error" in curso or not curso.get("curso") or curso["curso"].get("profesor_id") != current_profesor_id:
            return {"error": "No autorizado para acceder a los estudiantes de este curso."}, 403

        resultado = AsistenciasModel.obtener_estudiantes_inscritos_en_curso(curso_id)
        
        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        return resultado, 200

    def obtener_fechas_con_asistencia_por_curso(curso_id):
        current_profesor_id = g.usuario.get('id')
        if not current_profesor_id:
            return {"error": "ID de profesor no encontrado en el token."}, 400

        curso = CursosModel.obtener_curso_por_id(curso_id)
        if "error" in curso or not curso.get("curso") or curso["curso"].get("profesor_id") != current_profesor_id:
            return {"error": "No autorizado para consultar fechas de asistencia de este curso."}, 403

        resultado = AsistenciasModel.obtener_fechas_con_asistencia_por_curso(curso_id)

        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        return resultado, 200
