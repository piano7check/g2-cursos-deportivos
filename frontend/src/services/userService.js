const API_BASE_URL = '/api/user'; 

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido', error: 'No se pudo parsear la respuesta de error.' }));
        const error = new Error(errorData.message || 'Algo salió mal');
        error.status = response.status;
        error.data = errorData; 
        throw error;
    }
    const data = await response.json();
    return data; 
};

export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
    });
    return handleResponse(response);
};

export const updateCurrentUser = async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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
