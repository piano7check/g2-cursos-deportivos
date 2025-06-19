-- CATEGORÍAS (Deportes)
INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Fútbol'),
(2, 'Natación'),
(3, 'Baloncesto'),
(4, 'Tenis'),
(5, 'Atletismo'),
(6, 'Artes Marciales');

-- CURSOS (Clases deportivas)
INSERT INTO `cursos` (`id`, `nombre`, `descripcion`, `cupos`, `profesor_id`, `categoria_id`, `coste`) VALUES
-- Entrenadores ID 3-7 (5 entrenadores generados)
(1, 'Fútbol Infantil', 'Clases para niños de 6-12 años', 15, 3, 1, 120.00),
(2, 'Natación Competitiva', 'Entrenamiento para competencias', 10, 4, 2, 180.00),
(3, 'Baloncesto Juvenil', 'Para jóvenes de 13-18 años', 12, 5, 3, 150.00),
(4, 'Tenis Avanzado', 'Clases privadas y grupales', 8, 6, 4, 200.00),
(5, 'Preparación Física', 'Entrenamiento funcional', 20, 7, 5, 100.00);

-- HORARIOS DE ENTRENAMIENTOS
INSERT INTO `horarios` (`id`, `curso_id`, `dia`, `hora_inicio`, `hora_fin`) VALUES
-- Fútbol: Lunes y Miércoles
(1, 1, 'Lunes', '16:00:00', '17:30:00'),
(2, 1, 'Miércoles', '16:00:00', '17:30:00'),
-- Natación: Martes y Jueves
(3, 2, 'Martes', '07:00:00', '08:30:00'),
(4, 2, 'Jueves', '07:00:00', '08:30:00'),
-- Baloncesto: Viernes
(5, 3, 'Viernes', '17:00:00', '19:00:00'),
-- Tenis: Sábado
(6, 4, 'Sábado', '09:00:00', '11:00:00'),
-- Preparación Física: Lunes, Miércoles, Viernes
(7, 5, 'Lunes', '18:00:00', '19:00:00'),
(8, 5, 'Miércoles', '18:00:00', '19:00:00'),
(9, 5, 'Viernes', '18:00:00', '19:00:00');

-- RESERVAS DE CLASES (Atletas ID 8-37)
INSERT INTO `reservas` (`id`, `estudiante_id`, `curso_id`, `fecha_reserva`, `estado`) VALUES
-- Fútbol
(1, 8, 1, '2023-11-01 10:00:00', 'validado'),
(2, 9, 1, '2023-11-01 10:05:00', 'validado'),
-- Natación
(3, 10, 2, '2023-11-02 08:00:00', 'pendiente'),
(4, 11, 2, '2023-11-02 08:02:00', 'validado'),
-- Baloncesto
(5, 12, 3, '2023-11-03 15:00:00', 'validado'),
-- Tenis
(6, 13, 4, '2023-11-04 09:00:00', 'cancelado'),
-- Preparación Física
(7, 14, 5, '2023-11-05 17:00:00', 'validado');

-- ASISTENCIAS A ENTRENAMIENTOS
INSERT INTO `asistencias` (`id`, `estudiante_id`, `curso_id`, `fecha`, `estado_asistencia`) VALUES
-- Asistencias a fútbol
(1, 8, 1, '2023-11-06', 'presente'),
(2, 9, 1, '2023-11-06', 'presente'),
-- Asistencias a natación
(3, 11, 2, '2023-11-07', 'tarde'),
-- Asistencias a preparación física
(4, 14, 5, '2023-11-08', 'presente');