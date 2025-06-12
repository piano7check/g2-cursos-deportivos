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
            method: 'PATCH',
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

export const confirmarPago = async (reservaId, data) => {
    const formData = new FormData();
    
    if (data instanceof File) {
        formData.append('comprobante', data);
    } else if (typeof data === 'string') {
        try {
            const response = await fetch(`${API_URL}/reservas/${reservaId}/confirmar-pago`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ archivo_url: data }),
                credentials: 'include',
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reservas/${reservaId}/confirmar-pago`, {
            method: 'PATCH',
            body: formData,
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Error en confirmarPago:", error);
        throw new Error(error.message || 'Error al confirmar el pago');
    }
};

export const obtenerValidacionesPagoAdmin = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/validaciones-pago`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al obtener las validaciones de pago.');
    }
};

export const aprobarPago = async (validacionId) => {
    try {
        const response = await fetch(`${API_URL}/admin/validaciones-pago/${validacionId}/aprobar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al aprobar el pago.');
    }
};

export const rechazarPago = async (validacionId) => {
    try {
        const response = await fetch(`${API_URL}/admin/validaciones-pago/${validacionId}/rechazar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error desconocido al rechazar el pago.');
    }
};

export const ocultarReservaEstudiante = async (reservaId, ocultar) => {
    try {
        // CAMBIO CRÍTICO AQUÍ: Añadir '/estudiante' al path
        const response = await fetch(`${API_URL}/estudiante/reservas/${reservaId}/ocultar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ocultar: ocultar }),
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || `Error al ${ocultar ? 'ocultar' : 'mostrar'} la reserva.`);
    }
};

const reservasService = {
    reservarCurso,
    obtenerReservasPorEstudiante,
    cancelarReserva,
    confirmarPago,
    obtenerValidacionesPagoAdmin,
    aprobarPago,
    rechazarPago,
    ocultarReservaEstudiante,
};

export default reservasService;
