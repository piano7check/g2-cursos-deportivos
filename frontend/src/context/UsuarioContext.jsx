import { createContext, useContext, useEffect, useState } from 'react';

const UsuarioContext = createContext();

export const UsuarioProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const verificarAutenticacion = async () => {
    try {
      const response = await fetch('/api/autentificacion/usuario', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
        return true;
      } else {
        setUsuario(null);
        return false;
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUsuario(null);
      return false;
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
      verificarAutenticacion 
    }}>
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuarioContext = () => useContext(UsuarioContext);