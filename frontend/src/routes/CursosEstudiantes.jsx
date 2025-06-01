import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUsuario from '../hooks/useUsuario';

const CursosEstudiantes = () => {
  const { usuario, loading } = useUsuario();
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !usuario) {
      // Usuario no autenticado, redirigir a login
      navigate('/login');
    }
  }, [loading, usuario, navigate]);

  useEffect(() => {
    if (usuario) {
      // Solo obtener cursos si hay usuario
      const obtenerCursos = async () => {
        try {
          const response = await fetch('http://localhost:5000/cursosEstudiantes', {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              setError('No autorizado. Por favor, inicie sesión.');
              navigate('/login');
            } else {
              setError('Error al cargar los cursos');
            }
            return;
          }
          const data = await response.json();
          setCursos(data);
        } catch (err) {
          setError('Error de conexión con el servidor');
        }
      };

      obtenerCursos();
    }
  }, [usuario, navigate]);

  if (loading) return <p>Cargando usuario...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Cursos disponibles</h1>
      <ul>
        {cursos.map((curso) => (
          <li key={curso.curso_id}>
            <h3>{curso.nombre}</h3>
            <p>{curso.descripcion}</p>
            <p>Cupos: {curso.cupos}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CursosEstudiantes;
