const API_BASE_URL = '/api/auth'; 
const API_BASE_URL_USER = '/api/user'; 

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

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', 
    });
    return handleResponse(response);
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const logoutUser = async () => {
    const response = await fetch(`${API_BASE_URL_USER}/logout`, { 
        method: 'POST', 
        credentials: 'include', 
    });
    
    return handleResponse(response); 
};