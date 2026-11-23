-- Skema database GK Yogyakarta (DPW Daerah Istimewa Yogyakarta)

CREATE TABLE IF NOT EXISTS dpd_regions (
  id TEXT PRIMARY KEY, -- kota-yogyakarta, sleman, bantul, kulon-progo, gunungkidul
  name TEXT NOT NULL,
  chairperson TEXT NOT NULL DEFAULT '',
  active_districts INTEGER NOT NULL DEFAULT 0,
  total_districts INTEGER NOT NULL DEFAULT 0,
  secretariat_address TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  instagram_handle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs_agendas (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rutin', 'event')),
  frequency_label TEXT NOT NULL DEFAULT '', -- PEKANAN, BULANAN, PER SEMESTER, atau kosong untuk event
  region_id TEXT REFERENCES dpd_regions(id) ON DELETE SET NULL,
  event_date TIMESTAMPTZ,
  schedule_text TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  status_label TEXT NOT NULL DEFAULT '',
  poster_url TEXT NOT NULL DEFAULT '',
  registration_url TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('kabar', 'opini', 'artikel')),
  region_id TEXT REFERENCES dpd_regions(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('atribut', 'merch-dpw', 'produk-kader')),
  region_id TEXT REFERENCES dpd_regions(id) ON DELETE SET NULL,
  seller_label TEXT NOT NULL DEFAULT '',
  price_idr INTEGER NOT NULL CHECK (price_idr >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS join_submissions (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  region_id TEXT NOT NULL REFERENCES dpd_regions(id),
  district_name TEXT NOT NULL DEFAULT '',
  campus_or_activity TEXT NOT NULL DEFAULT '',
  interests TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  routed_status TEXT NOT NULL DEFAULT 'baru' CHECK (routed_status IN ('baru', 'dihubungi', 'selesai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
