const API_BASE_URL = '/api/user'; 

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido', error: 'No se pudo parsear la respuesta de error.' }));
        const error = new Error(errorData.message || 'Something went wrong');
        error.status = response.status;
        error.data = errorData; 
        throw error;
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {}; 
    }
    return response.json();
};

export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const userData = await handleResponse(response);
    return userData;
};

export const updateCurrentUser = async (userId, data) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const deleteCurrentUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const logoutUser = async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST', 
        credentials: 'include', 
    });
    return handleResponse(response);
};
