import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Asegúrate de importar Link
import styles from './Registro.module.css';
import UABLogo from '../../assets/images/uab-logo.png'; // Asegúrate de que esta ruta sea correcta

const Registro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    birthdate: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }

    const requiredFields = ['name', 'lastname', 'birthdate', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Introduce un correo electrónico válido.');
      return;
    }


    setError(''); 

    try {
      const response = await fetch('/autentificacion/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          lastname: formData.lastname,
          birthdate: formData.birthdate,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en el registro. Inténtalo de nuevo.');
      } else {
        alert('¡Usuario registrado correctamente!');
        navigate('/login');
      }
    } catch (err) {
      console.error('Error de conexión:', err); 
      setError('Error de conexión con el servidor. Por favor, inténtalo más tarde.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={UABLogo} alt="Logo UAB" className={styles.logo} />
        <h1>Universidad Adventista de Bolivia</h1>
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.title}>Crea tu cuenta</h2> 
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Nombre:</label> 
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Tu nombre" 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastname" className={styles.label}>Apellido:</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Tu apellido"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="birthdate" className={styles.label}>Fecha de nacimiento:</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="ejemplo@uab.edu.bo"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className={styles.input}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className={styles.input}
              placeholder="Repite tu contraseña"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Registrarse
          </button>
        </form>
        
        {/* Enlace para ir al login */}
        <p className={styles.loginPrompt}>
          ¿Ya tienes una cuenta? <Link to="/login" className={styles.loginLink}>Inicia Sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;