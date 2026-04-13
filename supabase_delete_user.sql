-- Fonction RPC pour permettre à un utilisateur de supprimer son propre compte
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer le profil (les autres tables seront nettoyées via RLS ou cascade)
  DELETE FROM public.profiles WHERE id = auth.uid();
  -- Supprimer le compte auth
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Autoriser les utilisateurs authentifiés à appeler cette fonction
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
