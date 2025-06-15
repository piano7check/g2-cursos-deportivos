const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error(errorData.message || 'No autorizado. Por favor, inicie sesión.', { cause: 'unauthorized' });
        }
        throw new Error(errorData.error || errorData.message || 'Algo salió mal en la solicitud.');
    }
    return response.json();
};

export const getCursos = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const createCurso = async (cursoData) => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursoData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const updateCurso = async (id, cursoData) => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursoData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const deleteCurso = async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cursos/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const getProfesores = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profesores`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const buscarCursos = async (searchTermNombre, searchTermCategoria, searchTermProfesor) => {
    const params = new URLSearchParams();
    if (searchTermNombre) {
        params.append('nombre', searchTermNombre);
    }
    if (searchTermCategoria) {
        params.append('categoria', searchTermCategoria);
    }
    if (searchTermProfesor) {
        params.append('profesor', searchTermProfesor);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/admin/cursos/buscar${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const getCursosEstudiantes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiante/cursosEstudiantes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store',
        });
        return handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const getCursosByProfessor = async () => {
    const response = await fetch(`${API_BASE_URL}/profesor/cursos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};
