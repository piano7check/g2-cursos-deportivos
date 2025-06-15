from datetime import date

def validarRegistroAsistenciaBatch(data):
    errores = {}

    if not isinstance(data, dict):
        return False, {"error": "El cuerpo de la petición debe ser un objeto JSON."}

    if 'curso_id' not in data or not isinstance(data['curso_id'], int):
        errores['curso_id'] = "ID del curso es requerido y debe ser un entero."
    
    if 'fecha' not in data or not isinstance(data['fecha'], str):
        errores['fecha'] = "Fecha es requerida y debe ser una cadena (YYYY-MM-DD)."
    else:
        try:
            date.fromisoformat(data['fecha'])
        except ValueError:
            errores['fecha'] = "Formato de fecha inválido. Use YYYY-MM-DD."

    if 'lista_asistencia' not in data or not isinstance(data['lista_asistencia'], list):
        errores['lista_asistencia'] = "La lista de asistencia es requerida y debe ser un arreglo."
    elif not data['lista_asistencia']:
        errores['lista_asistencia'] = "La lista de asistencia no puede estar vacía."
    else:
        estados_permitidos = ['presente', 'ausente', 'tarde']
        asistencia_errores_items = []
        for i, item in enumerate(data['lista_asistencia']):
            item_errores = {}
            if not isinstance(item, dict):
                asistencia_errores_items.append(f"El elemento {i} de la lista debe ser un objeto.")
                continue

            if 'estudiante_id' not in item or not isinstance(item['estudiante_id'], int):
                item_errores['estudiante_id'] = "ID del estudiante es requerido y debe ser un entero."
            if 'estado_asistencia' not in item or item['estado_asistencia'] not in estados_permitidos:
                item_errores['estado_asistencia'] = f"El estado de asistencia es requerido y debe ser uno de: {', '.join(estados_permitidos)}."
            
            if item_errores:
                asistencia_errores_items.append({f"item_{i}": item_errores})
        
        if asistencia_errores_items:
            errores['lista_asistencia_items'] = asistencia_errores_items

    return not bool(errores), errores

def validarActualizacionAsistencia(data):
    errores = {}

    if not isinstance(data, dict):
        return False, {"error": "El cuerpo de la petición debe ser un objeto JSON."}

    if 'estudiante_id' not in data or not isinstance(data['estudiante_id'], int):
        errores['estudiante_id'] = "ID del estudiante es requerido y debe ser un entero."
    if 'curso_id' not in data or not isinstance(data['curso_id'], int):
        errores['curso_id'] = "ID del curso es requerido y debe ser un entero."
    if 'fecha' not in data or not isinstance(data['fecha'], str):
        errores['fecha'] = "Fecha es requerida y debe ser una cadena (YYYY-MM-DD)."
    else:
        try:
            date.fromisoformat(data['fecha'])
        except ValueError:
            errores['fecha'] = "Formato de fecha inválido. Use YYYY-MM-DD."
    
    estados_permitidos = ['presente', 'ausente', 'tarde']
    if 'estado_asistencia' not in data or data['estado_asistencia'] not in estados_permitidos:
        errores['estado_asistencia'] = f"El estado de asistencia es requerido y debe ser uno de: {', '.join(estados_permitidos)}."

    return not bool(errores), errores
