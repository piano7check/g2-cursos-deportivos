const API_BASE_URL = 'http://localhost:5000/api';

// No necesitamos getAuthHeader ya que el navegador enviará la cookie automáticamente
// const getAuthHeader = () => {
//     const token = localStorage.getItem('token');
//     return token ? { 'Authorization': `Bearer ${token}` } : {};
// };

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Algo salió mal');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    return response.json();
};

export const getCursos = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // No necesitamos Authorization header si el token va en cookie
        },
        credentials: 'include', // Importante para enviar cookies
    });
    return handleResponse(response);
};

export const createCurso = async (cursoData) => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // No necesitamos Authorization header si el token va en cookie
        },
        body: JSON.stringify(cursoData),
        credentials: 'include', // Importante para enviar cookies
    });
    return handleResponse(response);
};

export const updateCurso = async (id, cursoData) => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // No necesitamos Authorization header si el token va en cookie
        },
        body: JSON.stringify(cursoData),
        credentials: 'include', // Importante para enviar cookies
    });
    return handleResponse(response);
};

export const deleteCurso = async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // No necesitamos Authorization header si el token va en cookie
        },
        credentials: 'include', // Importante para enviar cookies
    });
    return handleResponse(response);
};

export const getProfesores = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profesores`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // No necesitamos Authorization header si el token va en cookie
        },
        credentials: 'include', // Importante para enviar cookies
    });
    return handleResponse(response);
};
