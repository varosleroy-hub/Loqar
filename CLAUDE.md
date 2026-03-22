# Loqar — Contexte projet

Application de gestion de location de voitures (SaaS).

## Stack technique
- **Frontend** : React (JSX), Vite, tout dans `src/App.jsx`
- **Backend** : Supabase (PostgreSQL + Auth + RLS)
- **Déploiement** : Vercel (auto depuis GitHub)
- **Repo** : `varosleroy-hub/Loqar` sur GitHub

## Branche de travail
Toujours développer sur `claude/implement-todo-item-twQZq`, jamais sur `main`.

## Commandes utiles
```bash
npm run dev      # Lancer en local
npm run build    # Build de production
git push -u origin claude/implement-todo-item-twQZq
```

## Base de données (Supabase)
Tables principales :
- `vehicles` — colonnes: `id`, `user_id`, `name`, `plate`, `fuel`, `transmission`, `km`, `price_per_day`, `year`, `category`, `status`, `photo_url`
- `clients` — colonnes: `id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `license_expiry`, `total_spent`
- `rentals` — colonnes: `id`, `user_id`, `client_id`, `vehicle_id`, `client_name`, `vehicle_name`, `start_date`, `end_date`, `prix_per_day`, `deposit`, `total`, `km_start`, `notes`, `status`
- `payments` — colonnes: `id`, `user_id`, `client_id`, `rental_id`, `amount`, `deposit`, `method`, `status`, `paid_at`
- `profiles` — colonnes: `id`, `agency_name`, `logo`, `address`, `phone`, `email`, `siret`, `plan`

## Architecture App.jsx
Un seul fichier. Pages :
- `Dashboard`, `Rentals`, `Vehicles`, `Clients`, `Payments`, `Documents`, `SignaturePage`, `Pricing`, `Settings`

Navigation via `setPage()` dans le composant App principal.
