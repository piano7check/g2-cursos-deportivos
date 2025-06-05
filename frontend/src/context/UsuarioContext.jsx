import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/userService';

const UsuarioContext = createContext(null);

export const useUsuarioContext = () => useContext(UsuarioContext);

export const UsuarioProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const verificarAutenticacion = async () => {
        try {
            setCargando(true);
            setError(null); 
            const userResponse = await getCurrentUser();
            setUsuario(userResponse); 
            return userResponse; 
        } catch (err) {
            setError(err.message || 'Error al verificar autenticación.');
            setUsuario(null);
            return null; 
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        verificarAutenticacion();
    }, []); 

    return (
        <UsuarioContext.Provider value={{ 
            usuario, 
            setUsuario, 
            cargando,
            verificarAutenticacion,
            error 
        }}>
            {children}
        </UsuarioContext.Provider>
    );
};
