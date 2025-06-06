const API_BASE_URL = '/api/admin'; 

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido', error: 'No se pudo parsear la respuesta de error.' }));
        const error = new Error(errorData.message || 'Algo salió mal');
        error.status = response.status;
        error.data = errorData; 
        throw error;
    }
    return response.json();
};

export const getCursos = async () => {
    const response = await fetch(`${API_BASE_URL}/cursos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
    });
    return handleResponse(response);
};

export const createCurso = async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/cursos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
        credentials: 'include', 
    });
    return handleResponse(response);
};

export const updateCurso = async (cursoId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/cursos/${cursoId}`, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const deleteCurso = async (cursoId) => {
    const response = await fetch(`${API_BASE_URL}/cursos/${cursoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
    });
    return handleResponse(response);
};

export const getProfesores = async () => {
    const response = await fetch(`${API_BASE_URL}/profesores`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
    });
    const data = await handleResponse(response);

    if (data && Array.isArray(data.profesores)) {
        return data.profesores;
    } else {
        console.error("Formato de respuesta inesperado para profesores:", data);
        return []; 
    }
};
