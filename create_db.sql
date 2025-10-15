-- =========================
-- Tabla de estados de factura (catálogo)
-- =========================
CREATE TABLE estados_factura (
  id_estado_factura TINYINT UNSIGNED PRIMARY KEY,
  valor              VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Carga de valores base
INSERT INTO estados_factura (id_estado_factura, valor) VALUES
  (1, 'Sin validar'),
  (2, 'Aprobada'),
  (3, 'Rechazada')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- =========================
-- Usuarios administradores
-- =========================
CREATE TABLE users_admin (
  id_user_admin INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  rol           VARCHAR(50)  NOT NULL,              -- p.ej. 'superadmin','validador'
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,              -- hash (bcrypt/argon2)
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- Usuarios del juego
-- =========================
CREATE TABLE users_game (
  id_user_game  INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  nickname      VARCHAR(50)  NOT NULL UNIQUE,
  edad          TINYINT UNSIGNED NULL,
  genero        ENUM('M','F','NB','O') NULL,        -- ajusta las opciones que necesites
  correo        VARCHAR(255) NOT NULL UNIQUE,
  avatar        VARCHAR(500) NULL,                  -- URL o ruta
  last_login    DATETIME NULL,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (edad IS NULL OR (edad BETWEEN 0 AND 120))
) ENGINE=InnoDB;

-- =========================
-- Facturas
-- =========================
CREATE TABLE facturas (
  id_factura       BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  lugar_compra     VARCHAR(255) NOT NULL,
  numero_factura   VARCHAR(100) NOT NULL,
  foto_factura     VARCHAR(500) NULL,               -- URL o ruta
  fecha_registro   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado           TINYINT UNSIGNED NOT NULL DEFAULT 1,
  id_user_game     INT  UNSIGNED NOT NULL,
  id_user_admin    INT  UNSIGNED NULL,              -- quién la gestionó/validó (opcional)

  CONSTRAINT uq_factura_numero UNIQUE (numero_factura),
  CONSTRAINT fk_factura_estado
    FOREIGN KEY (estado) REFERENCES estados_factura(id_estado_factura)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_factura_user_game
    FOREIGN KEY (id_user_game) REFERENCES users_game(id_user_game)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_factura_user_admin
    FOREIGN KEY (id_user_admin) REFERENCES users_admin(id_user_admin)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_facturas_user_game  ON facturas(id_user_game);
CREATE INDEX idx_facturas_user_admin ON facturas(id_user_admin);
CREATE INDEX idx_facturas_estado     ON facturas(estado);

-- =========================
-- Puntajes
-- =========================
CREATE TABLE puntajes (
  id_puntaje       BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_user_game     INT    UNSIGNED NOT NULL,
  id_factura       BIGINT UNSIGNED NULL,            -- si el puntaje proviene de compra
  puntaje          INT    NOT NULL DEFAULT 0,
  tiempo_jugado    INT    NULL,                     -- en segundos
  vidas_restantes  TINYINT UNSIGNED NULL,
  fecha_inicio     DATETIME NULL,
  fecha_fin        DATETIME NULL,
  creado_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_puntaje_user_game
    FOREIGN KEY (id_user_game) REFERENCES users_game(id_user_game)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_puntaje_factura
    FOREIGN KEY (id_factura) REFERENCES facturas(id_factura)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_puntajes_user_game ON puntajes(id_user_game);
CREATE INDEX idx_puntajes_factura   ON puntajes(id_factura);

-- =========================
-- Ranking (tabla solicitada)
-- Nota: este contenido es derivado; podría ser una VISTA.
-- =========================
CREATE TABLE ranking (
  id_user_game       INT UNSIGNED PRIMARY KEY,
  nickname           VARCHAR(50) NOT NULL,
  puntaje_acumulado  BIGINT NOT NULL DEFAULT 0,

  CONSTRAINT fk_ranking_user_game
    FOREIGN KEY (id_user_game) REFERENCES users_game(id_user_game)
    ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT uq_ranking_nickname UNIQUE (nickname)
) ENGINE=InnoDB;

-- =========================
-- Vista recomendada para ranking dinámico
-- (suma de puntajes sólo de facturas aprobadas; si no quieres esa
-- condición, elimina el WHERE f.estado = 2)
-- =========================
CREATE OR REPLACE VIEW v_ranking AS
SELECT
  ug.id_user_game,
  ug.nickname,
  COALESCE(SUM(p.puntaje), 0) AS puntaje_acumulado
FROM users_game ug
LEFT JOIN puntajes p
  ON p.id_user_game = ug.id_user_game
LEFT JOIN facturas f
  ON p.id_factura = f.id_factura
WHERE (f.id_factura IS NULL OR f.estado = 2)
GROUP BY ug.id_user_game, ug.nickname
ORDER BY puntaje_acumulado DESC;

-- Índice útil para la vista (filtra por aprobadas)
CREATE INDEX idx_facturas_estado_fecha ON facturas(estado, fecha_registro);