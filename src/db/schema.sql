-- Switchback database schema
-- Safe to run more than once (every statement uses IF NOT EXISTS).

-- ---------------------------------------------------------------
-- Sessions (used by connect-pg-simple)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session (
  sid    VARCHAR      NOT NULL PRIMARY KEY,
  sess   JSON         NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

-- ---------------------------------------------------------------
-- Users and roles
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE CHECK (name IN ('admin', 'director', 'runner'))
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  -- RESTRICT: a role cannot be deleted while users still hold it.
  role_id       INTEGER      NOT NULL REFERENCES roles (id) ON DELETE RESTRICT,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);

-- ---------------------------------------------------------------
-- Shop catalog
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL UNIQUE,
  description TEXT        NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE
);

-- Terrain tags are shared by products AND races. This is what lets a race
-- page recommend gear that fits its terrain.
CREATE TABLE IF NOT EXISTS terrain_tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE,
  slug VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  -- SET NULL: if a brand is removed, keep the product.
  brand_id     INTEGER      REFERENCES brands (id) ON DELETE SET NULL,
  -- RESTRICT: cannot delete a category that still has products.
  category_id  INTEGER      NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  name         VARCHAR(150) NOT NULL,
  description  TEXT         NOT NULL DEFAULT '',
  price_cents  INTEGER      NOT NULL CHECK (price_cents >= 0),
  image_url    VARCHAR(500),
  -- Shoe specs. NULL for accessories.
  drop_mm      SMALLINT,
  lug_depth_mm NUMERIC(3, 1),
  weight_oz    NUMERIC(4, 1),
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- Admins choose which products appear on the homepage.
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products (brand_id);

CREATE TABLE IF NOT EXISTS product_terrain_tags (
  product_id     INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  terrain_tag_id INTEGER NOT NULL REFERENCES terrain_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, terrain_tag_id)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER     NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  size       VARCHAR(20) NOT NULL,
  color      VARCHAR(40) NOT NULL DEFAULT 'Standard',
  sku        VARCHAR(60) UNIQUE,
  stock      INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE (product_id, size, color)
);

-- ---------------------------------------------------------------
-- Orders (workflow: placed -> packed -> shipped -> delivered, or cancelled)
-- The cart itself lives in the session until checkout.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  -- SET NULL: keep order records for the business if an account is deleted.
  user_id          INTEGER      REFERENCES users (id) ON DELETE SET NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'placed'
                   CHECK (status IN ('placed', 'packed', 'shipped', 'delivered', 'cancelled')),
  total_cents      INTEGER      NOT NULL CHECK (total_cents >= 0),
  shipping_name    VARCHAR(100) NOT NULL,
  shipping_address TEXT         NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER      NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  -- SET NULL: the order keeps its own copy of name and price below.
  variant_id       INTEGER      REFERENCES product_variants (id) ON DELETE SET NULL,
  product_name     VARCHAR(150) NOT NULL,
  variant_label    VARCHAR(100) NOT NULL,
  unit_price_cents INTEGER      NOT NULL CHECK (unit_price_cents >= 0),
  quantity         INTEGER      NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

CREATE TABLE IF NOT EXISTS order_status_history (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER     NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  status     VARCHAR(20) NOT NULL,
  changed_by INTEGER     REFERENCES users (id) ON DELETE SET NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_status_history (order_id);

-- ---------------------------------------------------------------
-- Races
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS races (
  id                    SERIAL PRIMARY KEY,
  -- SET NULL: a race survives if its director's account is removed.
  director_id           INTEGER      REFERENCES users (id) ON DELETE SET NULL,
  name                  VARCHAR(150) NOT NULL,
  description           TEXT         NOT NULL DEFAULT '',
  race_date             DATE         NOT NULL,
  start_time            TIME,
  location_name         VARCHAR(150) NOT NULL,
  city                  VARCHAR(80)  NOT NULL,
  state                 CHAR(2)      NOT NULL,
  difficulty            VARCHAR(10)  NOT NULL DEFAULT 'moderate'
                        CHECK (difficulty IN ('easy', 'moderate', 'hard', 'extreme')),
  elevation_gain_ft     INTEGER      CHECK (elevation_gain_ft >= 0),
  registration_deadline DATE,
  status                VARCHAR(12)  NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  image_url             VARCHAR(500),
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_races_director_id ON races (director_id);
CREATE INDEX IF NOT EXISTS idx_races_race_date ON races (race_date);

CREATE TABLE IF NOT EXISTS race_terrain_tags (
  race_id        INTEGER NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  terrain_tag_id INTEGER NOT NULL REFERENCES terrain_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (race_id, terrain_tag_id)
);

CREATE TABLE IF NOT EXISTS race_distances (
  id           SERIAL PRIMARY KEY,
  race_id      INTEGER      NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  label        VARCHAR(40)  NOT NULL,
  distance_km  NUMERIC(5, 1) NOT NULL CHECK (distance_km > 0),
  price_cents  INTEGER      NOT NULL CHECK (price_cents >= 0),
  capacity     INTEGER      NOT NULL CHECK (capacity > 0),
  cutoff_hours NUMERIC(4, 1),
  UNIQUE (race_id, label)
);

-- ---------------------------------------------------------------
-- Race registrations
-- (workflow: pending -> confirmed -> checked_in -> finished,
--  with waitlisted and cancelled branches)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS race_registrations (
  id                      SERIAL PRIMARY KEY,
  -- CASCADE: deleting a runner removes their registrations.
  user_id                 INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  race_distance_id        INTEGER     NOT NULL REFERENCES race_distances (id) ON DELETE CASCADE,
  status                  VARCHAR(12) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'checked_in', 'finished', 'cancelled')),
  bib_number              INTEGER,
  waiver_accepted         BOOLEAN     NOT NULL DEFAULT FALSE,
  emergency_contact_name  VARCHAR(100),
  emergency_contact_phone VARCHAR(30),
  finish_time             INTERVAL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, race_distance_id),
  UNIQUE (race_distance_id, bib_number)
);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON race_registrations (user_id);

CREATE TABLE IF NOT EXISTS registration_status_history (
  id              SERIAL PRIMARY KEY,
  registration_id INTEGER     NOT NULL REFERENCES race_registrations (id) ON DELETE CASCADE,
  status          VARCHAR(12) NOT NULL,
  changed_by      INTEGER     REFERENCES users (id) ON DELETE SET NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reg_history_registration_id ON registration_status_history (registration_id);

-- ---------------------------------------------------------------
-- User-generated content
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_reviews (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER     NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  -- SET NULL: keep the review text if the author's account is removed.
  user_id    INTEGER     REFERENCES users (id) ON DELETE SET NULL,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      VARCHAR(100) NOT NULL,
  body       TEXT        NOT NULL,
  is_flagged BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS race_reviews (
  id         SERIAL PRIMARY KEY,
  race_id    INTEGER     NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  user_id    INTEGER     REFERENCES users (id) ON DELETE SET NULL,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      VARCHAR(100) NOT NULL,
  body       TEXT        NOT NULL,
  is_flagged BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (race_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_races (
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  race_id    INTEGER     NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, race_id)
);

-- Contact form (workflow: received -> replied -> closed)
CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      REFERENCES users (id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  subject     VARCHAR(150) NOT NULL,
  message     TEXT         NOT NULL,
  status      VARCHAR(10)  NOT NULL DEFAULT 'received'
              CHECK (status IN ('received', 'replied', 'closed')),
  admin_reply TEXT,
  replied_by  INTEGER      REFERENCES users (id) ON DELETE SET NULL,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
