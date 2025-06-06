import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../services/userService'; 

const UsuarioContext = createContext();

export const useUsuarioContext = () => {
    return useContext(UsuarioContext);
};

export const UsuarioProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [coursesLastUpdated, setCoursesLastUpdated] = useState(Date.now()); 

    const verificarAutenticacion = useCallback(async () => {
        setCargando(true);
        try {
            const user = await getCurrentUser();
            setUsuario(user);
            setError(null);
        } catch (err) {
            console.error("Error al verificar autenticación:", err);
            setUsuario(null);
            if (err.status !== 401) {
                setError(err.message);
            } else {
                setError(null);
            }
        } finally {
            setCargando(false);
        }
    }, []);

    const triggerCoursesUpdate = useCallback(() => {
        setCoursesLastUpdated(Date.now()); 
    }, []);

    useEffect(() => {
        verificarAutenticacion();
    }, [verificarAutenticacion]);

    const value = {
        usuario,
        cargando,
        error,
        setUsuario, 
        verificarAutenticacion,
        coursesLastUpdated, 
        triggerCoursesUpdate 
    };

    return (
        <UsuarioContext.Provider value={value}>
            {children}
        </UsuarioContext.Provider>
    );
};
