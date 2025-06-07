// frontend/src/services/categoriasService.js

const API_BASE_URL = 'http://localhost:5000/api'; // Ajusta esto si tu backend no corre en 5000

// Función auxiliar para manejar respuestas de la API (errores, etc.)
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || errorData.message || 'Algo salió mal en la API de categorías.');
        error.status = response.status;
        error.data = errorData; // Adjuntar los detalles del error para depuración
        throw error;
    }
    return response.json();
};

/**
 * Obtiene todas las categorías disponibles.
 * Endpoint: /api/categorias (GET)
 */
export const getAllCategorias = async () => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de sesión
    });
    return handleResponse(response);
};

/**
 * Crea una nueva categoría.
 * Endpoint: /api/categorias (POST)
 * @param {object} categoryData - Datos de la categoría a crear (ej: { nombre: "Deportes" })
 */
export const createCategoria = async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Actualiza una categoría existente.
 * Endpoint: /api/categorias/<id> (PATCH)
 * @param {number} categoryId - ID de la categoría a actualizar.
 * @param {object} categoryData - Datos parciales de la categoría a actualizar (ej: { nombre: "Deportes Acuáticos" })
 */
export const updateCategoria = async (categoryId, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${categoryId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Elimina una categoría.
 * Endpoint: /api/categorias/<id> (DELETE)
 * @param {number} categoryId - ID de la categoría a eliminar.
 */
export const deleteCategoria = async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    // Las respuestas de DELETE a menudo no tienen JSON, solo el estado 200/204
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Intentar leer JSON de error si existe
        const error = new Error(errorData.error || errorData.message || 'Error al eliminar categoría.');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    // ParaDELETE, a menudo la API no devuelve contenido. Devolvemos un mensaje simple.
    return { message: 'Categoría eliminada exitosamente' };
};
