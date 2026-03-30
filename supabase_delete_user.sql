-- Fonction RPC pour supprimer le compte de l'utilisateur connecté
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run

create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
begin
  -- Supprimer les données métier de l'utilisateur
  delete from payments where user_id = auth.uid();
  delete from rentals  where user_id = auth.uid();
  delete from clients  where user_id = auth.uid();
  delete from vehicles where user_id = auth.uid();
  delete from profiles where id      = auth.uid();
  -- Supprimer le compte auth (doit être en dernier)
  delete from auth.users where id = auth.uid();
end;
$$;

-- Accorder l'exécution aux utilisateurs authentifiés
grant execute on function delete_user() to authenticated;
