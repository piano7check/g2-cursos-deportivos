import { useUsuarioContext } from '../context/UsuarioContext';
import { useEffect, useState } from 'react';

const CursosEstudiantes = () => {
  const { usuario, cargando } = useUsuarioContext();
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    if (!cargando && usuario) {
      fetch('/api/estudiante/cursosEstudiantes', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setCursos(data);
        })
        .catch(err => console.error(err));
    }
  }, [cargando, usuario]);

  if (cargando) return <p>Cargando usuario...</p>;

  if (!usuario) return <p>No autenticado</p>;

  return (
    <div>
      <h2>Cursos para {usuario.rol}</h2>
      <ul>
        {cursos.map(curso => (
          <li key={curso.id}>{curso.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

export default CursosEstudiantes;
