-- Migration : ajout de agency_id dans les tables principales
-- À exécuter dans l'éditeur SQL de Supabase (https://app.supabase.com → SQL Editor)

-- 1. Colonne agency_id dans vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;

-- 2. Colonne agency_id dans clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;

-- 3. Colonne agency_id dans rentals
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;

-- 4. Colonne agency_id dans payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;

-- 5. Colonne sub_agencies dans profiles (stocke la liste JSON des sous-agences)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_agencies JSONB DEFAULT '[]'::jsonb;

-- Index pour accélérer les filtrages par agency_id
CREATE INDEX IF NOT EXISTS idx_vehicles_agency_id  ON vehicles(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_agency_id   ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_rentals_agency_id   ON rentals(agency_id);
CREATE INDEX IF NOT EXISTS idx_payments_agency_id  ON payments(agency_id);
