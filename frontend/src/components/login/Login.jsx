import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import styles from './Login.module.css';
import UABLogo from '../../assets/images/uab-logo.png'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/autentificacion/login', {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/cursosEstudiantes'); 
      } else {
        setError(data.error || 'Error en el login');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
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
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
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
            />
          </div>

          <button type="submit" className={styles.submitButton}>Iniciar sesión</button>
        </form>
        
        <p className={styles.loginPrompt}> 
          ¿No tienes una cuenta? <Link to="/register" className={styles.loginLink}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;