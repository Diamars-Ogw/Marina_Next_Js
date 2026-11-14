# Déploiement de test Marina Craft sur Vercel + Supabase

Le dépôt contient une branche de travail `rebuild/nextjs`. Lors de l'import dans Vercel, sélectionner explicitement cette branche : la branche `main` n'est pas la version Next.js à tester.

## 1. Importer le dépôt

1. Dans Vercel, choisir **Add New → Project**.
2. Importer `Diamars-Ogw/Marina_Next_Js`.
3. Dans les options de configuration, choisir la branche `rebuild/nextjs`.
4. Garder le preset **Next.js** et le répertoire racine `./`.

## 2. Variables d'environnement

Ajouter les variables listées dans `.env.example` dans **Project → Settings → Environment Variables**.

- `DATABASE_URL` : transaction pooler Supabase, port 6543.
- `DIRECT_URL` : session pooler Supabase, port 5432.
- `ADMIN_EMAIL` : adresse de connexion à l'administration.
- `ADMIN_PASSWORD_HASH` : hash bcrypt, jamais le mot de passe brut.
- `AUTH_SECRET` : chaîne aléatoire longue.
- `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_URL` : URL du projet.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète serveur, à garder privée.
- `NEXT_PUBLIC_SITE_URL` : URL Vercel attribuée au projet.

Ne jamais coller le mot de passe PostgreSQL, le hash admin ou la clé service dans un fichier suivi par Git.

## 3. Initialisation automatique de la base

Pour cette branche de démonstration, la commande de build exécute dans cet ordre :

1. génération du client Prisma ;
2. synchronisation du schéma Prisma vers PostgreSQL ;
3. insertion idempotente des données de démonstration ;
4. compilation Next.js.

Il suffit donc de lancer le déploiement après avoir renseigné les variables. Les redéploiements réutilisent les mêmes catégories, produits, zones, FAQ, pages et sections d'accueil au lieu de les dupliquer.

## 4. Données fictives installées

- 6 catégories ;
- 4 produits ;
- 4 zones de livraison ;
- 3 FAQ ;
- 4 pages ;
- 3 sections d'accueil ;
- paramètres de base de la boutique.

Les prix, stocks et coordonnées sont des valeurs de démonstration. Les images des produits et du carrousel doivent encore être ajoutées dans le bucket Storage `marina-media`.

## 5. Limites actuelles

Cette configuration prépare l'initialisation cloud et le déploiement de test. Elle ne signifie pas que tous les parcours du site ont déjà été validés : panier, commande, devis, suivi, administration et affichage responsive doivent encore être vérifiés sur la version hébergée.

Les builds Vercel auront besoin d'accéder à Supabase pour exécuter `prisma db push` et le seed. Si la compilation échoue, consulter les logs Vercel : ils indiqueront si l'erreur vient des variables, de la connexion PostgreSQL ou du code Next.js.
