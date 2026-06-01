-- =====================================================
-- SISTEMA DE APARTADO - BD LIMPIA
-- MySQL
-- Incluye: admin inicial, facultad base y sala base
-- Admin: admin@institucion.edu.mx
-- Password: 123456
-- =====================================================

DROP DATABASE IF EXISTS sis_computo;

CREATE DATABASE sis_computo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sis_computo;

-- =====================================================
-- TABLA: usuario
-- =====================================================
CREATE TABLE usuario (
  id_usuario      INT           PRIMARY KEY AUTO_INCREMENT,
  nombre          VARCHAR(50)   NOT NULL,
  apellido1       VARCHAR(30)   NOT NULL,
  apellido2       VARCHAR(30)   NULL,
  correo          VARCHAR(100)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  telefono        VARCHAR(20)   NULL,
  facultad        VARCHAR(100)  NULL,
  rol             ENUM('profesor', 'admin') NOT NULL DEFAULT 'profesor',
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: facultad
-- =====================================================
CREATE TABLE facultad (
  id_facultad     INT           PRIMARY KEY AUTO_INCREMENT,
  nombre          VARCHAR(120)  NOT NULL UNIQUE,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: centro_computo
-- =====================================================
CREATE TABLE centro_computo (
  id_centro       INT           PRIMARY KEY AUTO_INCREMENT,
  id_facultad     INT           NULL,
  nombre          VARCHAR(100)  NOT NULL,
  capacidad       SMALLINT      NOT NULL DEFAULT 30,
  descripcion     TEXT          NULL,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE,
  es_general      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_centro_facultad
    FOREIGN KEY (id_facultad)
    REFERENCES facultad(id_facultad)
    ON DELETE SET NULL
);

-- =====================================================
-- TABLA: solicitud
-- =====================================================
CREATE TABLE solicitud (
  id_solicitud       INT           PRIMARY KEY AUTO_INCREMENT,
  id_usuario         INT           NOT NULL,
  id_centro          INT           NOT NULL,
  fecha_uso          DATE          NOT NULL,
  hora_inicio        TIME          NOT NULL,
  hora_fin           TIME          NOT NULL,
  materia            VARCHAR(100)  NOT NULL,
  grupo              VARCHAR(50)   NOT NULL,
  num_alumnos        SMALLINT      NOT NULL,
  proposito          TEXT          NULL,
  software_requerido TEXT          NULL,
  requerimientos     VARCHAR(255)  NULL,
  estado             ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  motivo_rechazo     TEXT          NULL,
  id_admin_revisor   INT           NULL,
  fecha_revision     DATETIME      NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_solicitud_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT,

  CONSTRAINT fk_solicitud_centro
    FOREIGN KEY (id_centro)
    REFERENCES centro_computo(id_centro)
    ON DELETE RESTRICT,

  CONSTRAINT fk_solicitud_revisor
    FOREIGN KEY (id_admin_revisor)
    REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
);

-- =====================================================
-- TABLA: reserva
-- =====================================================
CREATE TABLE reserva (
  id_reserva          INT           PRIMARY KEY AUTO_INCREMENT,
  id_solicitud        INT           NOT NULL UNIQUE,
  id_usuario          INT           NOT NULL,
  id_centro           INT           NOT NULL,
  fecha_uso           DATE          NOT NULL,
  hora_inicio         TIME          NOT NULL,
  hora_fin            TIME          NOT NULL,
  estado              ENUM('activa', 'cancelada', 'reprogramada', 'completada') NOT NULL DEFAULT 'activa',
  asistencia          BOOLEAN       NULL,
  fecha_asistencia    DATETIME      NULL,
  motivo_cancelacion  TEXT          NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_reserva_solicitud
    FOREIGN KEY (id_solicitud)
    REFERENCES solicitud(id_solicitud)
    ON DELETE RESTRICT,

  CONSTRAINT fk_reserva_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT,

  CONSTRAINT fk_reserva_centro
    FOREIGN KEY (id_centro)
    REFERENCES centro_computo(id_centro)
    ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: bloqueo_horario
-- =====================================================
CREATE TABLE bloqueo_horario (
  id_bloqueo      INT           PRIMARY KEY AUTO_INCREMENT,
  id_centro       INT           NOT NULL,
  id_admin        INT           NOT NULL,
  fecha_inicio    DATETIME      NOT NULL,
  fecha_fin       DATETIME      NOT NULL,
  motivo          VARCHAR(255)  NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_bloqueo_centro
    FOREIGN KEY (id_centro)
    REFERENCES centro_computo(id_centro)
    ON DELETE CASCADE,

  CONSTRAINT fk_bloqueo_admin
    FOREIGN KEY (id_admin)
    REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: historial
-- =====================================================
CREATE TABLE historial (
  id_historial    INT           PRIMARY KEY AUTO_INCREMENT,
  id_usuario      INT           NULL,
  accion          VARCHAR(100)  NOT NULL,
  entidad         VARCHAR(50)   NOT NULL,
  id_entidad      INT           NOT NULL,
  detalle         TEXT          NULL,
  ip_address      VARCHAR(45)   NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_historial_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
);

-- =====================================================
-- TABLA: notificacion
-- =====================================================
CREATE TABLE notificacion (
  id_notificacion   INT           PRIMARY KEY AUTO_INCREMENT,
  id_usuario        INT           NOT NULL,
  tipo              ENUM('solicitud_aprobada', 'solicitud_rechazada', 'reserva_cancelada', 'recordatorio', 'general') NOT NULL,
  titulo            VARCHAR(150)  NOT NULL,
  mensaje           TEXT          NOT NULL,
  leida             BOOLEAN       NOT NULL DEFAULT FALSE,
  id_entidad_ref    INT           NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
    ON DELETE CASCADE
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO usuario (nombre, apellido1, correo, password_hash, rol, activo) VALUES
(
  'Admin',
  'Sistema',
  'admin@institucion.edu.mx',
  '$2b$10$c/.qHLlny/yJL5obCsG91.UwGMHArRhq41COSoUBNXYXGzdZutMa6',
  'admin',
  true
);

INSERT INTO facultad (nombre, activo) VALUES
('Facultad de Ingenieria Mochis', true);

INSERT INTO centro_computo (id_facultad, nombre, capacidad, descripcion, activo, es_general) VALUES
(1, 'Sala de computo Torre Academica', 30, 'Sala principal de la Torre Academica', true, false);

-- =====================================================
-- INDICES
-- =====================================================
CREATE INDEX idx_solicitud_usuario ON solicitud(id_usuario);
CREATE INDEX idx_solicitud_fecha ON solicitud(fecha_uso);
CREATE INDEX idx_solicitud_estado ON solicitud(estado);
CREATE INDEX idx_reserva_usuario ON reserva(id_usuario);
CREATE INDEX idx_reserva_fecha ON reserva(fecha_uso);
CREATE INDEX idx_reserva_estado ON reserva(estado);
CREATE INDEX idx_bloqueo_centro ON bloqueo_horario(id_centro);
CREATE INDEX idx_bloqueo_fechas ON bloqueo_horario(fecha_inicio, fecha_fin);
CREATE INDEX idx_notif_usuario ON notificacion(id_usuario, leida);
CREATE INDEX idx_historial_entidad ON historial(entidad, id_entidad);
