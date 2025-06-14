import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUsuarioContext } from '../../context/UsuarioContext';
import { loginUser } from '../../services/authService';
import styles from './Login.module.css';
import UABLogo from '../../assets/images/uab-logo.png';
import MessageModal from '../common/MessageModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { verificarAutenticacion, usuario, cargando } = useUsuarioContext();

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('error');

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setStatusModalMessage('');
        setStatusModalType('error');
    };

    useEffect(() => {
        if (!cargando && usuario) {
            if (usuario.rol === 'admin') {
                navigate('/dashboardAdmin');
            } else if (usuario.rol === 'estudiante' || usuario.rol === 'profesor') {
                navigate('/dashboardStudent'); 
            }
        }
    }, [usuario, cargando, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusModalMessage('');
        setShowStatusModal(false);
        setIsLoading(true);

        try {
            await loginUser({ email, password });
            const updatedUser = await verificarAutenticacion();
            
            if (updatedUser && updatedUser.rol) { 
                const userRole = updatedUser.rol; 

                if (userRole === 'admin') {
                    navigate('/dashboardAdmin'); 
                } else if (userRole === 'estudiante' || userRole === 'profesor') {
                    navigate('/dashboardStudent'); 
                } else {
                    setStatusModalMessage('Rol de usuario no reconocido. Contacte al administrador.');
                    setStatusModalType('error');
                    setShowStatusModal(true);
                }
            } else {
                setStatusModalMessage('Error al verificar la autenticación o rol del usuario. Por favor, intente de nuevo.');
                setStatusModalType('error');
                setShowStatusModal(true);
            }
        } catch (err) {
            setStatusModalMessage(err.data?.error || err.message || 'Error de conexión con el servidor');
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
                <h2 className={styles.title}>Iniciar Sesión</h2>
                {showStatusModal && (
                    <MessageModal
                        message={statusModalMessage}
                        type={statusModalType}
                        onClose={closeStatusModal}
                    />
                )}
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
