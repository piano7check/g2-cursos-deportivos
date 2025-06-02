import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useUsuarioContext } from '../../context/UsuarioContext'; 
import styles from './Login.module.css';
import UABLogo from '../../assets/images/uab-logo.png'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { verificarAutenticacion } = useUsuarioContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/autentificacion/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      const autenticado = await verificarAutenticacion();
      
      if (autenticado) {
        window.location.href = '/cursosEstudiantes';
      } else {
        setError('Error al verificar la autenticación');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}> 
        <img src={UABLogo} alt="Logo UAB" className={styles.logo} /> 
        <h1>Universidad Adventista de Bolivia</h1> 
      </header>

      <div className={styles.formContainer}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña:</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <p className={styles.loginPrompt}> 
          ¿No tienes una cuenta? <Link to="/register" className={styles.loginLink}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;