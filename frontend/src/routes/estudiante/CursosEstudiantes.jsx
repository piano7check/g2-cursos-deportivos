import { useUsuarioContext } from '../../context/UsuarioContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { logoutUser } from '../../services/authService'; // Importar la función de logout
import styles from './CursosEstudiantes.module.css';
import { FaSignOutAlt } from 'react-icons/fa'; // Icono para cerrar sesión

const FieldWithFallback = ({ value, fallback = "No definido", children }) => {
  return value ? (children || value) : fallback;
};

const CursosEstudiantes = () => {
  const { usuario, cargando, error: authError } = useUsuarioContext(); // Obtener también el error de autenticación
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate(); // Hook para la navegación

  useEffect(() => {
    if (!cargando && usuario) {
      setIsFetching(true);
      fetch('/api/estudiante/cursosEstudiantes', {
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            // Si el error es 401, redirigir al login
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
          console.error('Error:', err);
          setError(err.message || 'Error desconocido al cargar cursos');
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [cargando, usuario, navigate]); // Añadir 'navigate' a las dependencias

  const toggleDetails = (courseId) => {
    setExpandedCourseId(prevId => prevId === courseId ? null : courseId);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.split(':').slice(0, 2).join(':');
  };

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logoutUser(); // Llamar a la función de logout del servicio
      navigate('/login'); // Redirigir al login después de un logout exitoso
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aunque haya un error, si la cookie se borró, redirigimos.
      // Podrías mostrar un mensaje de error si el logout falla por otras razones.
      navigate('/login'); 
    }
  };

  if (cargando || isFetching) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  // Si no hay usuario y no estamos cargando, significa que no está autenticado
  if (!usuario && !cargando) {
      // ProtectedRoute debería manejar esto, pero como fallback
      return <div className={styles.error}>No autenticado. Por favor, inicie sesión.</div>;
  }
  
  if (error || authError) return <div className={styles.error}>Error: {error || authError}</div>;
  if (cursos.length === 0) return <div className={styles.emptyState}>No hay cursos disponibles</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cursos disponibles</h1>
        <div className={styles.userInfo}>
            {usuario && (
                <>
                    <p>Bienvenido, <strong>{usuario.email}</strong></p>
                    <p>ID: {usuario.id} | Rol: {usuario.rol}</p>
                </>
            )}
            <button className={styles.logoutButton} onClick={handleLogout}>
                <FaSignOutAlt /> Cerrar Sesión
            </button>
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
