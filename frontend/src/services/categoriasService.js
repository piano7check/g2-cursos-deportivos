const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || errorData.message || 'Algo salió mal en la API de categorías.');
        error.status = response.status;
        error.data = errorData; 
        throw error;
    }
    return response.json();
};


export const getAllCategorias = async () => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * @param {object} categoryData 
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

 * @param {number} categoryId 
 * @param {object} categoryData
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
 * @param {number} categoryId 
 */
export const deleteCategoria = async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        const error = new Error(errorData.error || errorData.message || 'Error al eliminar categoría.');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    return { message: 'Categoría eliminada exitosamente' };
};
