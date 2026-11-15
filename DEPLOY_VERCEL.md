# Déploiement de test Marina Craft sur Vercel + Supabase

Le dépôt contient la branche de travail `rebuild/nextjs`. Lors de l'import dans Vercel, sélectionner cette branche.

## 1. Importer le dépôt

1. Dans Vercel, choisir **Add New → Project**.
2. Importer `Diamars-Ogw/Marina_Next_Js`.
3. Choisir la branche `rebuild/nextjs`.
4. Garder le preset **Next.js** et le répertoire racine `./`.

## 2. Variables d'environnement

Ajouter les variables de `.env.example` dans **Project → Settings → Environment Variables**.

- `DATABASE_URL` : transaction pooler Supabase, port 6543.
- `DIRECT_URL` : session pooler Supabase, port 5432.
- `ADMIN_EMAIL` : adresse de connexion à l'administration.
- `ADMIN_PASSWORD` : mot de passe administrateur en clair dans les variables Vercel uniquement. Ne jamais le mettre dans Git.
- `AUTH_SECRET` : chaîne aléatoire longue (au moins 32 caractères).
- `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_URL` : URL du projet.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète serveur, à garder privée.
- `NEXT_PUBLIC_SITE_URL` : URL Vercel attribuée au projet.

Ne jamais coller le mot de passe PostgreSQL, le mot de passe admin ou la clé service dans un fichier suivi par Git.

## 3. Initialisation automatique de la base

Pour cette branche de démonstration, la commande de build exécute la génération du client Prisma, la synchronisation du schéma, l'insertion des données de démonstration, puis la compilation Next.js.

## 4. Données fictives installées

- 6 catégories ; 4 produits ; 4 zones de livraison ; 3 FAQ ; 4 pages ; 3 sections d'accueil.
- Les prix, stocks et coordonnées sont des valeurs de démonstration.
- Les images doivent encore être transférées dans le bucket Storage `marina-media`.

## 5. Limites actuelles

Cette configuration prépare un déploiement de test, mais tous les parcours n'ont pas encore été validés. Panier, commande, devis, suivi, administration et affichage responsive restent à vérifier en ligne.
