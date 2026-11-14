# MARINA Craft — Next.js

Migration de référence depuis **Diamars-Ogw/MarinaV2**.

## Fidélité visuelle
La feuille `public/css/marina.css` (20 Ko) et le script `public/js/marina.js` (9 Ko) sont repris depuis la version Laravel originale. Les pages publiques réutilisent les mêmes classes CSS, textes et structures. Les logos restent servis depuis les ressources statiques originales du dépôt source dans cette première étape.

## Stack
- Next.js App Router + React + TypeScript
- PostgreSQL + Prisma 6.19
- Sessions admin signées (JWT HttpOnly) + hash bcrypt
- Hébergement cible : Vercel + PostgreSQL gratuit (Neon/Supabase)
- Stockage des images : Supabase Storage ou équivalent persistant

## Installation
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

## Variables obligatoires
- `DATABASE_URL` : PostgreSQL.
- `ADMIN_EMAIL` : e-mail d'administration.
- `ADMIN_PASSWORD_HASH` : hash bcrypt produit par `node scripts/hash-password.mjs 'mot-de-passe-long'`.
- `AUTH_SECRET` : secret aléatoire d'au moins 32 caractères.

Ne jamais publier `.env`, les mots de passe ou les clés de service.

## Déploiement gratuit
1. Créer une base PostgreSQL gratuite sur Neon ou Supabase.
2. Créer un bucket public pour les images sur Supabase Storage.
3. Importer les données et les médias Laravel avant l'ouverture au public.
4. Connecter ce dépôt à Vercel et choisir Next.js.
5. Ajouter les variables d'environnement dans Vercel.
6. Exécuter `npx prisma db push` depuis un environnement autorisé, puis tester l'application.

Les offres gratuites ont des limites de stockage, de trafic et de mise en veille.

## Données manquantes dans l'archive reçue
Le ZIP `MarinaV2-main.zip` ne contient ni dump SQL de la base active ni fichiers uploadés de `storage/app/public`. Le code et les migrations sont présents, mais les fiches produits, commandes, réglages et photos uploadées ne peuvent pas être reconstitués à partir du code seul. Il faudra exporter ces données depuis l'instance Laravel.

## État réel
Le socle Next.js, le schéma Prisma, les principales pages publiques, la feuille de style et le JavaScript d'origine, une connexion admin et les premières API de gestion des produits sont en place. Les parcours panier/commande/devis/suivi, les modules complets d'administration, l'import des données et les tests visuels comparatifs restent à terminer. Ne pas déployer en production avant ces validations.
