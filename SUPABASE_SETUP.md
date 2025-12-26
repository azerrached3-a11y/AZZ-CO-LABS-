# 🗄️ Configuration Supabase pour AZZ&CO LABS

## ✅ Credentials Configurés

Vos credentials Supabase ont été configurés dans le fichier `.env` :

- **URL Supabase** : `https://ytwrvzkmerlqfvpxfddc.supabase.co`
- **Database URL** : Configurée avec pooler Supabase
- **Anon Key** : Configurée
- **Service Role Key** : Configurée

## 🚀 Configuration Initiale

### Étape 1 : Installer les dépendances

```bash
cd backend
npm install
```

### Étape 2 : Vérifier les variables d'environnement

Le fichier `.env` devrait contenir :
```env
POSTGRES_URL=postgres://postgres.ytwrvzkmerlqfvpxfddc:kT7us3PxraWdnY3L@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.ytwrvzkmerlqfvpxfddc:kT7us3PxraWdnY3L@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://ytwrvzkmerlqfvpxfddc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 3 : Exécuter le script de setup

```bash
cd backend
node scripts/setup-supabase.js
```

Ce script va :
- ✅ Créer toutes les tables nécessaires
- ✅ Créer les indexes pour les performances
- ✅ Insérer les données d'exemple pour la table `notes`
- ✅ Activer Row Level Security (RLS)
- ✅ Créer les politiques RLS de base

## 📊 Tables Créées

1. **visitors** - Données des visiteurs avec géolocalisation
2. **chat_logs** - Historique des conversations du chatbot
3. **page_views** - Vues de pages et analytics
4. **events** - Événements personnalisés
5. **notes** - Table de notes (avec données d'exemple)

## 🔒 Row Level Security (RLS)

RLS est activé sur toutes les tables pour la sécurité. Les politiques par défaut permettent :
- **Notes** : Lecture publique (vous pouvez personnaliser)

Pour personnaliser les politiques RLS, allez sur le dashboard Supabase :
https://supabase.com/dashboard/project/ytwrvzkmerlqfvpxfddc/auth/policies

## 🧪 Tester la Connexion

### Test rapide

```bash
cd backend
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT NOW()').then(r => { console.log('✅ Connected:', r.rows[0]); pool.end(); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
"
```

### Tester via l'API

```bash
# Démarrer le serveur
npm start

# Dans un autre terminal, tester l'endpoint notes
curl http://localhost:3000/api/notes
```

## 📝 Variables d'Environnement pour Vercel

Pour déployer sur Vercel, ajoutez ces variables dans le dashboard Vercel :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Settings → Environment Variables
4. Ajoutez :

```env
POSTGRES_URL=postgres://postgres.ytwrvzkmerlqfvpxfddc:kT7us3PxraWdnY3L@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.ytwrvzkmerlqfvpxfddc:kT7us3PxraWdnY3L@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://ytwrvzkmerlqfvpxfddc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0d3J2emttZXJscWZ2cHhmZGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODEyMjYsImV4cCI6MjA4MjI1NzIyNn0.B4CoHx2aMPnloxUe7uLABTmUa0CVQiB6VzmIeIOwvdY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0d3J2emttZXJscWZ2cHhmZGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY4MTIyNiwiZXhwIjoyMDgyMjU3MjI2fQ.xLLz8ELf7lWzp7MR5J6U-TjCA4uey04iCNeP18V_jio
```

## 🔍 Vérifier dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/ytwrvzkmerlqfvpxfddc
2. Table Editor → Vérifiez que toutes les tables sont créées
3. SQL Editor → Vous pouvez exécuter des requêtes SQL directement

## 📚 API Endpoints Disponibles

Une fois configuré, vous pouvez utiliser :

- `GET /api/notes` - Récupérer toutes les notes
- `GET /api/notes/:id` - Récupérer une note spécifique
- `POST /api/notes` - Créer une nouvelle note
- `PUT /api/notes/:id` - Mettre à jour une note
- `DELETE /api/notes/:id` - Supprimer une note

## ⚠️ Sécurité

- ✅ Les credentials sont dans `.env` (jamais commité)
- ✅ RLS est activé sur toutes les tables
- ✅ Utilisez `POSTGRES_URL` pour les connexions poolées (recommandé)
- ✅ Utilisez `POSTGRES_URL_NON_POOLING` pour les migrations et scripts

## 🐛 Dépannage

### Erreur de connexion

```bash
# Vérifier que les variables sont bien chargées
node -e "require('dotenv').config(); console.log(process.env.POSTGRES_URL ? '✅ POSTGRES_URL found' : '❌ POSTGRES_URL missing');"
```

### Erreur SSL

Si vous avez des problèmes SSL, utilisez `POSTGRES_URL_NON_POOLING` qui utilise le port 5432.

### Tables non créées

Exécutez à nouveau le script de setup :
```bash
node scripts/setup-supabase.js
```

## 📖 Ressources

- [Supabase Dashboard](https://supabase.com/dashboard/project/ytwrvzkmerlqfvpxfddc)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Pooler](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
