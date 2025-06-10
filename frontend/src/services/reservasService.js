const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Algo salió mal en la solicitud.');
    }
    return response.json();
};

export const reservarCurso = async (cursoId) => {
    try {
        const response = await fetch(
            `${API_URL}/reservas`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ curso_id: cursoId }),
                credentials: 'include',
            }
        );
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al reservar el curso.');
    }
};

const reservasService = {
    reservarCurso
};

export default reservasService;
