import { createContext, useContext, useEffect, useState, useRef } from 'react';

const UsuarioContext = createContext();

export const UsuarioProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorAuth, setErrorAuth] = useState(null);
  const efectoLanzado = useRef(false);

  useEffect(() => {
    if (efectoLanzado.current) return;
    efectoLanzado.current = true;

    const fetchUsuario = async () => {
      try {
        console.log('Verificando autenticación...');
        const response = await fetch('/api/autentificacion/usuario', {
          credentials: 'include',
          cache: 'no-store' // Evitar caché del navegador
        });

        console.log('Respuesta del servidor:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
          setErrorAuth(null);
        } else {
          setUsuario(null);
          setErrorAuth(response.status === 401 ? 'unauthorized' : 'error');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        setUsuario(null);
        setErrorAuth('network-error');
      } finally {
        setCargando(false);
      }
    };

    // Pequeño retraso para asegurar cookies
    const timer = setTimeout(fetchUsuario, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <UsuarioContext.Provider value={{ 
      usuario, 
      setUsuario, 
      cargando, 
      errorAuth,
      clearAuth: () => {
        setUsuario(null);
        setErrorAuth('unauthorized');
      }
    }}>
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuarioContext = () => useContext(UsuarioContext);