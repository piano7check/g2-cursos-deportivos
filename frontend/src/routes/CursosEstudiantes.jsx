import { useUsuarioContext } from '../context/UsuarioContext';
import { useEffect, useState } from 'react';
import styles from './CursosEstudiantes.module.css';

const CursosEstudiantes = () => {
  const { usuario, cargando } = useUsuarioContext();
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cargando && usuario) {
      fetch('/api/estudiante/cursosEstudiantes', {
        credentials: 'include',
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Error al obtener cursos');
          }
          return res.json();
        })
        .then(data => {
          setCursos(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error:', err);
          setError(err.message);
        });
    }
  }, [cargando, usuario]);

  if (cargando) return <div className={styles.loading}>Cargando cursos...</div>;
  if (!usuario) return <div className={styles.error}>No autenticado</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cursos disponibles para {usuario.rol}</h2>
      
      <div className={styles.cursosGrid}>
        {cursos.map(curso => (
          <div key={curso.id} className={styles.cursoCard}>
            <h3 className={styles.cursoNombre}>{curso.nombre}</h3>
            <p className={styles.cursoDescripcion}>{curso.descripcion}</p>
            <div className={styles.cursoDetalles}>
              <p><strong>Cupos disponibles:</strong> {curso.cupos}</p>
              <p><strong>ID del profesor:</strong> {curso.profesor_id}</p>
              <p><strong>ID del curso:</strong> {curso.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CursosEstudiantes;