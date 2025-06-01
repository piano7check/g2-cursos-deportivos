import React, { useEffect, useState } from 'react';

const CursosEstudiantes = () => {
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerCursos = async () => {
      try {
        const response = await fetch('http://localhost:5000/cursosEstudiantes', {
          method: 'GET',
          credentials: 'include', // importante para enviar la cookie
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('No autorizado. Por favor, inicie sesión.');
            // Aquí podrías redirigir al login con navigate()
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
  }, []);

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
    