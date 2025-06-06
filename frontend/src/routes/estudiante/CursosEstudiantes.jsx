import { useUsuarioContext } from '../../context/UsuarioContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './CursosEstudiantes.module.css';
import UserProfileWidget from '../../components/common/UserProfileWidget';

const FieldWithFallback = ({ value, fallback = "No definido", children }) => {
  return value ? (children || value) : fallback;
};

const CursosEstudiantes = () => {
  const { usuario, cargando, error: authError, coursesLastUpdated } = useUsuarioContext(); 
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!cargando && usuario) {
      setIsFetching(true);
      fetch('/api/estudiante/cursosEstudiantes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store', 
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            if (res.status === 401) {
              navigate('/login');
            }
            throw new Error(errorData.message || 'Error al obtener cursos');
          }
          return res.json();
        })
        .then(data => {
          const cursosValidados = Array.isArray(data?.cursos)
            ? data.cursos.map(curso => ({
                ...curso,
                horarios: Array.isArray(curso.horarios) ? curso.horarios : [],
              }))
            : [];
          
          setCursos(cursosValidados);
          setError(null);
        })
        .catch(err => {
          setError(err.message || 'Error desconocido al cargar cursos');
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [cargando, usuario, navigate, coursesLastUpdated]); 

  const toggleDetails = (courseId) => {
    setExpandedCourseId(prevId => prevId === courseId ? null : courseId);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.split(':').slice(0, 2).join(':');
  };

  if (cargando || isFetching) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  if (!usuario && !cargando) {
      return <div className={styles.error}>No autenticado. Por favor, inicie sesión.</div>;
  }
  
  if (error || authError) return <div className={styles.error}>Error: {error || authError}</div>;
  if (cursos.length === 0) return <div className={styles.emptyState}>No hay cursos disponibles</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cursos disponibles</h1>
        <div className={styles.userInfo}>
            <UserProfileWidget />
        </div>
      </header>
      
      <div className={styles.cursosGrid}>
        {cursos.map(curso => (
          <div 
            key={curso.id} 
            className={`${styles.cursoCard} ${expandedCourseId === curso.id ? styles.expanded : ''}`}
          >
            <div className={styles.cursoHeader}>
              <h3 className={styles.cursoNombre}>
                <FieldWithFallback value={curso.nombre} fallback="Curso sin nombre" />
              </h3>
              
              <div className={styles.cursoResumen}>
                <p>
                  <strong>Cupos:</strong> 
                  <FieldWithFallback value={curso.cupos} fallback="N/A" />
                </p>
                <button 
                  onClick={() => toggleDetails(curso.id)} 
                  className={styles.detailsButton}
                  aria-expanded={expandedCourseId === curso.id}
                >
                  {expandedCourseId === curso.id ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              </div>
            </div>
            
            {expandedCourseId === curso.id && (
              <div className={styles.cursoDetalles}>
                <p className={styles.cursoDescripcion}>
                  <FieldWithFallback value={curso.descripcion} fallback="No hay descripción disponible" />
                </p>
                
                <p className={styles.profesorInfo}>
                  <strong>Profesor:</strong>{' '}
                  <FieldWithFallback value={`${curso.profesor_nombre || ''} ${curso.profesor_apellido || ''}`.trim()} />
                </p>
                
                <div className={styles.horariosContainer}>
                  <p><strong>Horarios:</strong></p>
                  {curso.horarios.length > 0 ? (
                    <ul className={styles.horariosList}>
                      {curso.horarios.map((horario, index) => (
                        <li key={index}>
                          <span className={styles.dia}>
                            <FieldWithFallback value={horario.dia} fallback="Día no especificado" />:
                          </span>
                          <span className={styles.horas}>
                            {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noHorarios}>No hay horarios definidos</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CursosEstudiantes;
