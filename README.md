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

## Exporter de données Laravel fourni
Le fichier `migration/ExportMarinaData.php` est une commande Artisan à copier dans le projet Laravel dans `app/Console/Commands/ExportMarinaData.php`. Depuis la racine de l'ancien projet, lancer :

```bash
php artisan marina:export-next
```

La commande crée `storage/app/marina-next-export.zip` (si l'extension PHP ZipArchive est disponible) avec `database.json` et les médias du disque public. Les comptes utilisateurs, mots de passe et abonnements push ne sont pas exportés.

## Import dans la nouvelle base
Après avoir configuré `.env` avec la base PostgreSQL :

```bash
npx prisma db push
node scripts/import-laravel-export.mjs chemin/vers/database.json
```

Le script importe les tables dans l'ordre des dépendances et remet à niveau les séquences PostgreSQL. Il remet à null les références d'audit vers les anciens comptes Filament : le nouvel accès admin est configuré par variables d'environnement.

## Transfert des photos et vidéos
Décompresser l'archive exportée pour obtenir le dossier `storage`, puis configurer `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` localement et lancer :

```bash
node scripts/upload-media.mjs chemin/vers/storage
```

Créer au préalable le bucket public `marina-media`. Les chemins sont conservés afin que les enregistrements `product_media`, `categories.image_path`, `site_settings.logo_path` et `site_settings.hero_images` continuent de pointer vers les mêmes fichiers.

**Attention :** le JSON contient des données personnelles de clients et des informations de commandes. Le ZIP d'export doit rester privé et être supprimé des appareils partagés après migration.
