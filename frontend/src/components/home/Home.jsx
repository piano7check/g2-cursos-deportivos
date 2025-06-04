import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';
import UABLogo from '../../assets/images/uab-logo.png';
import { useUsuarioContext } from '../../context/UsuarioContext';

import atletismo from '../../assets/images/atletismo.webp';
import basketball from '../../assets/images/basketball.webp';
import futbol from '../../assets/images/futbol.webp';
import natacion from '../../assets/images/natacion.webp';
import voleibol from '../../assets/images/voleibol.webp';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, cargando } = useUsuarioContext();

  useEffect(() => {
    if (!cargando && usuario) {
      if (usuario.rol === 'estudiante') {
        navigate('/cursosEstudiantes');
      } else if (usuario.rol === 'profesor') {
        navigate('/profesor');
      } else if (usuario.rol === 'admin') {
        navigate('/dashboardAdmin');
      }
    }
  }, [cargando, usuario, navigate]);

  const deportes = [
    { nombre: 'Atletismo', imagen: atletismo },
    { nombre: 'Básquetbol', imagen: basketball },
    { nombre: 'Fútbol', imagen: futbol },
    { nombre: 'Natación', imagen: natacion },
    { nombre: 'Voleibol', imagen: voleibol }
  ];

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav className={styles.navbar}>
        <img src={UABLogo} alt="Logo UAB" className={styles.logo} />
        <div className={styles.navLinks}>
          <motion.button
            className={styles.navButton}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/login')}
          >
            INICIAR SESIÓN
          </motion.button>
          <motion.button
            className={styles.navButtonHighlight}
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/register')}
          >
            REGISTRARSE
          </motion.button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            FORMACIÓN DEPORTIVA DE ALTO RENDIMIENTO
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Certificaciones avaladas por la Universidad Adventista de Bolivia
          </motion.p>
        </div>
      </section>

      <section className={styles.deportesSection}>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          DISCIPLINAS DEPORTIVAS
        </motion.h2>
        
        <div className={styles.deportesGrid}>
          {deportes.map((deporte, index) => (
            <motion.div
              key={deporte.nombre}
              className={styles.deporteCard}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <img 
                src={deporte.imagen} 
                alt={deporte.nombre} 
                className={styles.deporteImagen}
              />
              <h3>{deporte.nombre}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.institucionalSection}>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          NUESTRA INSTITUCIÓN
        </motion.h2>
        <motion.p
          className={styles.institucionalText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          La Universidad Adventista de Bolivia cuenta con más de 30 años de experiencia en formación profesional, 
          ofreciendo ahora programas deportivos de excelencia con estándares internacionales.
        </motion.p>
      </section>
    </motion.div>
  );
};

export default Home;
