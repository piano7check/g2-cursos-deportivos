import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>¡Bienvenido a la Plataforma de Cursos Deportivos!</h1>
      <p style={styles.subtitle}>
        Regístrate o inicia sesión para acceder a tus cursos y gestionar tus inscripciones.
      </p>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate('/login')}>
          Iniciar Sesión
        </button>
        <button style={{ ...styles.button, ...styles.registerButton }} onClick={() => navigate('/register')}>
          Registrarse
        </button>
      </div>
      <div style={styles.infoBox}>
        <h2>¿Qué puedes hacer aquí?</h2>
        <ul>
          <li>Reservar cupos en cursos deportivos.</li>
          <li>Enviar validaciones de pago.</li>
          <li>Gestionar tus inscripciones y asistencia.</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 20,
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    backgroundColor: '#f7f9fc',
    borderRadius: 10,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    marginBottom: 30,
    fontSize: 18,
    color: '#555',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  button: {
    padding: '12px 25px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#3498db',
    color: 'white',
    transition: 'background-color 0.3s ease',
  },
  registerButton: {
    backgroundColor: '#2ecc71',
  },
  infoBox: {
    textAlign: 'left',
    backgroundColor: '#eaf2f8',
    padding: 20,
    borderRadius: 8,
  },
};

export default Home;
