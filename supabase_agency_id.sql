-- Ajout de la colonne agency_id aux tables principales
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run

ALTER TABLE vehicles  ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;
ALTER TABLE clients   ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;
ALTER TABLE rentals   ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;
ALTER TABLE payments  ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT NULL;

-- Index pour les lookups rapides par agence
CREATE INDEX IF NOT EXISTS idx_vehicles_agency_id  ON vehicles(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_agency_id   ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_rentals_agency_id   ON rentals(agency_id);
CREATE INDEX IF NOT EXISTS idx_payments_agency_id  ON payments(agency_id);
