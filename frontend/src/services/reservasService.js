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

export const obtenerReservasPorEstudiante = async () => {
    try {
        const response = await fetch(`${API_URL}/reservas/estudiante`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al obtener las reservas.');
    }
};

export const cancelarReserva = async (reservaId) => {
    try {
        const response = await fetch(`${API_URL}/reservas/${reservaId}/cancelar`, {
            method: 'PATCH', // Corregido de PUT a PATCH
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al cancelar la reserva.');
    }
};

export const confirmarPago = async (reservaId, archivoUrl) => {
    try {
        const response = await fetch(`${API_URL}/reservas/${reservaId}/confirmar-pago`, { // Corregido a confirmar-pago para coincidir con la ruta del backend
            method: 'PATCH', // Corregido de PUT a PATCH
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ archivo_url: archivoUrl }),
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al confirmar el pago.');
    }
};

const reservasService = {
    reservarCurso,
    obtenerReservasPorEstudiante,
    cancelarReserva,
    confirmarPago,
};

export default reservasService;
