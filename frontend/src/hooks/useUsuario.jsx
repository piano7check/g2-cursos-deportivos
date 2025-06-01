// src/hooks/useUsuario.jsx
import { useState, useEffect } from 'react';

const useUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const response = await fetch('http://localhost:5000/autentificacion/usuario', {          credentials: 'include', 
        });

        if (!response.ok) {
          throw new Error('No autenticado');
        }

        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
  }, []);

  return { usuario, loading };
};

export default useUsuario;
