from flask import jsonify, request
from models.categoriasModels import CategoriasModel
from schemas.categorias import validarCategoria

class ControllerCategorias:
    @staticmethod
    def mostrarCategorias():
        resultado = CategoriasModel.obtener_todas_categorias()
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        return jsonify({"categorias": resultado}), 200

    @staticmethod
    def crearCategoria():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos JSON requeridos"}), 400

        es_valido, errores = validarCategoria(data)
        if not es_valido:
            return jsonify({"error": "Datos de categoría inválidos", "detalles": errores}), 400

        nombre_categoria = data.get('nombre')
        if not nombre_categoria:
            return jsonify({"error": "El nombre de la categoría es requerido."}), 400

        resultado = CategoriasModel.crear_categoria(nombre_categoria)
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        return jsonify(resultado), 201

    @staticmethod
    def obtenerCategoriaPorId(id_categoria):
        resultado = CategoriasModel.obtener_categoria_por_id(id_categoria)
        if resultado is None:
            return jsonify({"error": "Categoría no encontrada"}), 404
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        return jsonify(resultado), 200

    @staticmethod
    def actualizarCategoria(id_categoria):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos JSON requeridos para la actualización"}), 400

        es_valido, errores = validarCategoria(data)
        if not es_valido:
            return jsonify({"error": "Datos de categoría inválidos", "detalles": errores}), 400

        nombre_categoria = data.get('nombre')
        if not nombre_categoria:
            return jsonify({"error": "El nombre de la categoría es requerido."}), 400

        resultado = CategoriasModel.actualizar_categoria(id_categoria, nombre_categoria)
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        return jsonify(resultado), 200

    @staticmethod
    def eliminarCategoria(id_categoria):
        resultado = CategoriasModel.eliminar_categoria(id_categoria)
        if isinstance(resultado, dict) and 'error' in resultado:
            return jsonify(resultado), resultado.get("codigo", 500)
        return jsonify(resultado), 200

