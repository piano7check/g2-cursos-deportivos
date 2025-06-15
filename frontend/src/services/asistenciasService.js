const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error(errorData.message || 'No autorizado. Por favor, inicie sesión.', { cause: 'unauthorized' });
        }
        if (response.status === 403) {
            throw new Error(errorData.error || 'Acceso denegado.', { cause: 'forbidden' });
        }
        throw new Error(errorData.error || errorData.message || 'Algo salió mal en la solicitud.');
    }
    const data = await response.json();
    return data;
};

export const getStudentsByCourse = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/profesor/cursos/${courseId}/estudiantes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const registerAttendance = async (attendanceData) => {
    const response = await fetch(`${API_BASE_URL}/profesor/asistencias`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
        credentials: 'include',
    });
    return handleResponse(response);
};

export const getAttendanceByCourseAndDate = async (courseId, dateString) => {
    const response = await fetch(`${API_BASE_URL}/profesor/asistencias/${courseId}/${dateString}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

export const getAttendanceDatesByCourse = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/profesor/asistencias/fechas/${courseId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};
