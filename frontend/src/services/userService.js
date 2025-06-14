const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Error desconocido');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {};
    }
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    localStorage.removeItem('token');
    return handleResponse(response);
};

export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        credentials: 'include',
    });
    return handleResponse(response);
};

export const updateCurrentUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const deleteCurrentUser = async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(response);
};

export const getAllUsers = async (limit = 10, offset = 0, name = '', lastname = '', email = '', rol = '') => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    queryParams.append('offset', offset);
    if (name) queryParams.append('name', name);
    if (lastname) queryParams.append('lastname', lastname);
    if (email) queryParams.append('email', email);
    if (rol) queryParams.append('rol', rol);

    const response = await fetch(`${API_BASE_URL}/admin/usuarios?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
    });
    return handleResponse(response);
};

export const getTotalUsersCount = async (name = '', lastname = '', email = '', rol = '') => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (lastname) queryParams.append('lastname', lastname);
    if (email) queryParams.append('email', email);
    if (rol) queryParams.append('rol', rol);

    const queryString = queryParams.toString();
    const url = queryString ? `${API_BASE_URL}/admin/usuarios/count?${queryString}` : `${API_BASE_URL}/admin/usuarios/count`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
    });
    return handleResponse(response);
};


export const createUserAdmin = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const updateUserAdmin = async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const deleteUserAdmin = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(response);
};
