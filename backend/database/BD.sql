-- =====================================================
-- SISTEMA DE APARTADO - SALA DE CÓMPUTO
-- Base de Datos: MySQL / PostgreSQL compatible
-- Versión: 2.0 (diseñada para NestJS + TypeORM)
-- =====================================================

CREATE DATABASE IF NOT EXISTS sis_computo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sis_computo;

-- =====================================================
-- TABLA: usuario
-- Almacena tanto profesores como administradores
-- =====================================================
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario      INT           PRIMARY KEY AUTO_INCREMENT,
  nombre          VARCHAR(50)   NOT NULL,
  apellido1       VARCHAR(30)   NOT NULL,
  apellido2       VARCHAR(30)   NULL,
  correo          VARCHAR(100)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  rol             ENUM('profesor', 'admin') NOT NULL DEFAULT 'profesor',
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: centro_computo
-- Sala de cómputo disponible para reservar
-- =====================================================
CREATE TABLE IF NOT EXISTS centro_computo (
  id_centro       INT           PRIMARY KEY AUTO_INCREMENT,
  nombre          VARCHAR(100)  NOT NULL,
  capacidad       SMALLINT      NOT NULL DEFAULT 30,
  descripcion     TEXT          NULL,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: solicitud
-- El profesor genera una solicitud antes de tener reserva
-- Estados: pendiente → aprobada | rechazada
-- =====================================================
CREATE TABLE IF NOT EXISTS solicitud (
  id_solicitud      INT           PRIMARY KEY AUTO_INCREMENT,
  id_usuario        INT           NOT NULL,
  id_centro         INT           NOT NULL,
  fecha_uso         DATE          NOT NULL,
  hora_inicio       TIME          NOT NULL,
  hora_fin          TIME          NOT NULL,
  materia           VARCHAR(100)  NOT NULL,
  grupo             VARCHAR(50)   NOT NULL,
  num_alumnos       SMALLINT      NOT NULL,
  proposito         TEXT          NULL,
  software_requerido TEXT         NULL,
  estado            ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  motivo_rechazo    TEXT          NULL,
  id_admin_revisor  INT           NULL,
  fecha_revision    DATETIME      NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_solicitud_usuario  FOREIGN KEY (id_usuario)       REFERENCES usuario(id_usuario)      ON DELETE RESTRICT,
  CONSTRAINT fk_solicitud_centro   FOREIGN KEY (id_centro)        REFERENCES centro_computo(id_centro) ON DELETE RESTRICT,
  CONSTRAINT fk_solicitud_revisor  FOREIGN KEY (id_admin_revisor) REFERENCES usuario(id_usuario)      ON DELETE SET NULL
);

-- =====================================================
-- TABLA: reserva
-- Creada automáticamente cuando una solicitud es aprobada
-- =====================================================
CREATE TABLE IF NOT EXISTS reserva (
  id_reserva        INT           PRIMARY KEY AUTO_INCREMENT,
  id_solicitud      INT           NOT NULL UNIQUE,
  id_usuario        INT           NOT NULL,
  id_centro         INT           NOT NULL,
  fecha_uso         DATE          NOT NULL,
  hora_inicio       TIME          NOT NULL,
  hora_fin          TIME          NOT NULL,
  estado            ENUM('activa', 'cancelada', 'reprogramada', 'completada') NOT NULL DEFAULT 'activa',
  asistencia        BOOLEAN       NULL,                        -- NULL = no confirmada, TRUE = asistió, FALSE = no asistió
  fecha_asistencia  DATETIME      NULL,
  motivo_cancelacion TEXT         NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_reserva_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud) ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_usuario   FOREIGN KEY (id_usuario)   REFERENCES usuario(id_usuario)     ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_centro    FOREIGN KEY (id_centro)    REFERENCES centro_computo(id_centro) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: bloqueo_horario
-- El admin puede bloquear franjas horarias
-- (mantenimiento, eventos, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS bloqueo_horario (
  id_bloqueo      INT           PRIMARY KEY AUTO_INCREMENT,
  id_centro       INT           NOT NULL,
  id_admin        INT           NOT NULL,
  fecha_inicio    DATETIME      NOT NULL,
  fecha_fin       DATETIME      NOT NULL,
  motivo          VARCHAR(255)  NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_bloqueo_centro FOREIGN KEY (id_centro) REFERENCES centro_computo(id_centro) ON DELETE CASCADE,
  CONSTRAINT fk_bloqueo_admin  FOREIGN KEY (id_admin)  REFERENCES usuario(id_usuario)       ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: historial
-- Registro de todas las acciones importantes del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS historial (
  id_historial    INT           PRIMARY KEY AUTO_INCREMENT,
  id_usuario      INT           NULL,
  accion          VARCHAR(100)  NOT NULL,
  entidad         VARCHAR(50)   NOT NULL,   -- 'solicitud', 'reserva', 'bloqueo', 'usuario'
  id_entidad      INT           NOT NULL,
  detalle         TEXT          NULL,
  ip_address      VARCHAR(45)   NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: notificacion
-- Notificaciones para los usuarios del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS notificacion (
  id_notificacion   INT           PRIMARY KEY AUTO_INCREMENT,
  id_usuario        INT           NOT NULL,
  tipo              ENUM('solicitud_aprobada', 'solicitud_rechazada', 'reserva_cancelada', 'recordatorio', 'general') NOT NULL,
  titulo            VARCHAR(150)  NOT NULL,
  mensaje           TEXT          NOT NULL,
  leida             BOOLEAN       NOT NULL DEFAULT FALSE,
  id_entidad_ref    INT           NULL,    -- ID de solicitud o reserva relacionada
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- =====================================================
-- DATOS INICIALES (seed)
-- =====================================================

-- Admin por defecto
INSERT INTO usuario (nombre, apellido1, correo, password_hash, rol) VALUES
('Admin', 'Sistema', 'admin@institucion.edu.mx',
 '$2b$10$c/.qHLlny/yJL5obCsG91.UwGMHArRhq41COSoUBNXYXGzdZutMa6', -- Hash de la contraseña '123456'
 'admin');

-- Sala de cómputo por defecto
INSERT INTO centro_computo (nombre, capacidad, descripcion) VALUES
('Sala de Cómputo A', 30, 'Sala principal con 30 equipos'),
('Sala de Cómputo B', 25, 'Sala secundaria con 25 equipos');

-- =====================================================
-- ÍNDICES para mejorar rendimiento en consultas
-- =====================================================
CREATE INDEX idx_solicitud_usuario  ON solicitud(id_usuario);
CREATE INDEX idx_solicitud_fecha    ON solicitud(fecha_uso);
CREATE INDEX idx_solicitud_estado   ON solicitud(estado);
CREATE INDEX idx_reserva_usuario    ON reserva(id_usuario);
CREATE INDEX idx_reserva_fecha      ON reserva(fecha_uso);
CREATE INDEX idx_reserva_estado     ON reserva(estado);
CREATE INDEX idx_bloqueo_centro     ON bloqueo_horario(id_centro);
CREATE INDEX idx_bloqueo_fechas     ON bloqueo_horario(fecha_inicio, fecha_fin);
CREATE INDEX idx_notif_usuario      ON notificacion(id_usuario, leida);
CREATE INDEX idx_historial_entidad  ON historial(entidad, id_entidad);
