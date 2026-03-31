-- Tabla para configuraciones del sitio
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Tabla para categorías
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  img TEXT,
  color TEXT,
  "order" INTEGER DEFAULT 0
);

-- Tabla para productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  sizes TEXT[] DEFAULT '{}'
);
