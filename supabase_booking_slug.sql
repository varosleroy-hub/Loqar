-- Ajout de la colonne booking_slug à la table profiles
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_slug TEXT UNIQUE;

-- Index pour les lookups rapides par slug
CREATE INDEX IF NOT EXISTS idx_profiles_booking_slug ON profiles(booking_slug);
