# 📝 Notes API - Documentation

## Vue d'ensemble

L'API Notes permet de créer, lire, mettre à jour et supprimer des notes. Elle est compatible avec Supabase (Row Level Security) et fonctionne avec PostgreSQL (production) et SQLite (local).

---

## 🗄️ Structure de la Table

```sql
CREATE TABLE notes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visitor_id TEXT,
    FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE SET NULL
);
```

### Champs

- `id` : Identifiant unique (auto-généré)
- `title` : Titre de la note (requis)
- `content` : Contenu de la note (optionnel)
- `created_at` : Date de création (auto)
- `updated_at` : Date de mise à jour (auto)
- `visitor_id` : ID du visiteur (optionnel, lien avec table visitors)

---

## 🚀 Migration

### PostgreSQL (Production - Supabase/Vercel Postgres)

```bash
cd backend
node scripts/migrate-notes-table.js
```

**Prérequis** :
- Variable d'environnement `POSTGRES_URL` ou `DATABASE_URL` configurée
- Connexion à la base de données PostgreSQL

**Ce que fait le script** :
1. ✅ Crée la table `notes` si elle n'existe pas
2. ✅ Insère des données d'exemple (seulement si la table est vide)
3. ✅ Active Row Level Security (RLS) pour Supabase
4. ✅ Crée les index pour optimiser les performances

### SQLite (Local)

La table est créée automatiquement au démarrage du serveur si elle n'existe pas.

---

## 📡 Endpoints API

### Base URL
```
/api/notes
```

### 1. GET /api/notes
Récupère toutes les notes

**Query Parameters** :
- `visitorId` (optionnel) : Filtrer par ID visiteur

**Exemple** :
```bash
# Toutes les notes
GET /api/notes

# Notes d'un visiteur spécifique
GET /api/notes?visitorId=abc123
```

**Réponse** :
```json
{
  "success": true,
  "notes": [
    {
      "id": 1,
      "title": "Today I created a Supabase project.",
      "content": "This is a sample note...",
      "created_at": "2025-01-26T10:00:00.000Z",
      "updated_at": "2025-01-26T10:00:00.000Z",
      "visitor_id": null
    }
  ]
}
```

---

### 2. GET /api/notes/:id
Récupère une note spécifique

**Exemple** :
```bash
GET /api/notes/1
```

**Réponse** :
```json
{
  "success": true,
  "note": {
    "id": 1,
    "title": "Today I created a Supabase project.",
    "content": "This is a sample note...",
    "created_at": "2025-01-26T10:00:00.000Z",
    "updated_at": "2025-01-26T10:00:00.000Z",
    "visitor_id": null
  }
}
```

**Erreurs** :
- `404` : Note non trouvée
- `400` : ID invalide

---

### 3. POST /api/notes
Crée une nouvelle note

**Body** :
```json
{
  "title": "Ma nouvelle note",
  "content": "Contenu de la note (optionnel)",
  "visitorId": "abc123" // optionnel
}
```

**Exemple** :
```bash
POST /api/notes
Content-Type: application/json

{
  "title": "Today I created a Supabase project.",
  "content": "This is a sample note about creating a Supabase project."
}
```

**Réponse** :
```json
{
  "success": true,
  "note": {
    "id": 1,
    "title": "Today I created a Supabase project.",
    "content": "This is a sample note...",
    "created_at": "2025-01-26T10:00:00.000Z",
    "updated_at": "2025-01-26T10:00:00.000Z",
    "visitor_id": null
  }
}
```

**Erreurs** :
- `400` : Titre manquant ou vide

---

### 4. PUT /api/notes/:id
Met à jour une note

**Body** :
```json
{
  "title": "Titre mis à jour", // optionnel
  "content": "Contenu mis à jour" // optionnel
}
```

**Exemple** :
```bash
PUT /api/notes/1
Content-Type: application/json

{
  "title": "Titre mis à jour",
  "content": "Nouveau contenu"
}
```

**Réponse** :
```json
{
  "success": true,
  "note": {
    "id": 1,
    "title": "Titre mis à jour",
    "content": "Nouveau contenu",
    "created_at": "2025-01-26T10:00:00.000Z",
    "updated_at": "2025-01-26T10:05:00.000Z",
    "visitor_id": null
  }
}
```

**Erreurs** :
- `404` : Note non trouvée
- `400` : ID invalide ou aucun champ fourni

---

### 5. DELETE /api/notes/:id
Supprime une note

**Exemple** :
```bash
DELETE /api/notes/1
```

**Réponse** :
```json
{
  "success": true,
  "message": "Note supprimée avec succès"
}
```

**Erreurs** :
- `404` : Note non trouvée
- `400` : ID invalide

---

## 🔒 Row Level Security (RLS) - Supabase

Si vous utilisez Supabase, le script de migration active automatiquement RLS sur la table `notes`.

### Créer des politiques RLS dans Supabase

Après avoir exécuté la migration, créez des politiques dans le dashboard Supabase :

1. **Politique de lecture** (SELECT) :
```sql
CREATE POLICY "Allow public read access"
ON notes FOR SELECT
USING (true);
```

2. **Politique d'insertion** (INSERT) :
```sql
CREATE POLICY "Allow public insert"
ON notes FOR INSERT
WITH CHECK (true);
```

3. **Politique de mise à jour** (UPDATE) :
```sql
CREATE POLICY "Allow public update"
ON notes FOR UPDATE
USING (true)
WITH CHECK (true);
```

4. **Politique de suppression** (DELETE) :
```sql
CREATE POLICY "Allow public delete"
ON notes FOR DELETE
USING (true);
```

**Note** : Ces politiques permettent l'accès public. Pour la production, créez des politiques plus restrictives basées sur `visitor_id` ou l'authentification.

---

## 💻 Exemples d'utilisation

### JavaScript (Fetch API)

```javascript
// Créer une note
const createNote = async (title, content) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  return await response.json();
};

// Récupérer toutes les notes
const getNotes = async () => {
  const response = await fetch('/api/notes');
  return await response.json();
};

// Mettre à jour une note
const updateNote = async (id, title, content) => {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  return await response.json();
};

// Supprimer une note
const deleteNote = async (id) => {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};
```

### cURL

```bash
# Créer une note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Ma note","content":"Contenu"}'

# Récupérer toutes les notes
curl http://localhost:3000/api/notes

# Récupérer une note
curl http://localhost:3000/api/notes/1

# Mettre à jour une note
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Titre mis à jour"}'

# Supprimer une note
curl -X DELETE http://localhost:3000/api/notes/1
```

---

## 🛠️ Service NotesService

Le service `notesService.js` gère automatiquement :
- ✅ Compatibilité PostgreSQL (production) et SQLite (local)
- ✅ Gestion des erreurs
- ✅ Index pour optimiser les performances
- ✅ Relations avec la table `visitors`

---

## 📊 Index

Les index suivants sont créés automatiquement :
- `idx_notes_visitor_id` : Pour filtrer par visiteur
- `idx_notes_created_at` : Pour trier par date de création

---

## ⚠️ Notes Importantes

1. **Production** : Utilisez PostgreSQL (Vercel Postgres, Supabase, etc.)
2. **Local** : SQLite fonctionne automatiquement
3. **RLS** : Activez les politiques appropriées dans Supabase
4. **Sécurité** : Ajoutez l'authentification pour la production

---

## 📚 Ressources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
