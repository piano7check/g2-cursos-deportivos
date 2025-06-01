import { useEffect, useState } from 'react';

const useUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/usuario', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
        } else {
          setUsuario(null);
        }
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
