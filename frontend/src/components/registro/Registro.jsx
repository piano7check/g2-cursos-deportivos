import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/authService'; 
import styles from './Registro.module.css';
import UABLogo from '../../assets/images/uab-logo.png';
import MessageModal from '../common/MessageModal'; 

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

  const [isLoading, setIsLoading] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalMessage, setStatusModalMessage] = useState('');
  const [statusModalType, setStatusModalType] = useState('error');

  const closeStatusModal = () => {
      setShowStatusModal(false);
      setStatusModalMessage('');
      setStatusModalType('error');
  };

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatusModalMessage('');
    setShowStatusModal(false);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setStatusModalMessage('Las contraseñas no coinciden. Por favor, verifica.');
      setStatusModalType('error');
      setShowStatusModal(true);
      setIsLoading(false);
      return;
    }

    const requiredFields = ['name', 'lastname', 'birthdate', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setStatusModalMessage('Por favor, completa todos los campos obligatorios.');
      setStatusModalType('error');
      setShowStatusModal(true);
      setIsLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatusModalMessage('Introduce un correo electrónico válido.');
      setStatusModalType('error');
      setShowStatusModal(true);
      setIsLoading(false);
      return;
    }

    try {
      await registerUser({
        name: formData.name,
        lastname: formData.lastname,
        birthdate: formData.birthdate,
        email: formData.email,
        password: formData.password,
      });

      setStatusModalMessage('¡Usuario registrado correctamente!');
      setStatusModalType('success');
      setShowStatusModal(true);
      setTimeout(() => {
        closeStatusModal();
        navigate('/login');
      }, 2000); 

    } catch (err) {
      console.error('Error de conexión:', err); 
      setStatusModalMessage(err.data?.error || err.message || 'Error de conexión con el servidor. Por favor, inténtalo más tarde.');
      setStatusModalType('error');
      setShowStatusModal(true);
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
        <h2 className={styles.title}>Crea tu cuenta</h2> 
        {showStatusModal && (
            <MessageModal
                message={statusModalMessage}
                type={statusModalType}
                onClose={closeStatusModal}
            />
        )}

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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              className={styles.input}
              placeholder="Repite tu contraseña"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          ¿Ya tienes una cuenta? <Link to="/login" className={styles.loginLink}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;