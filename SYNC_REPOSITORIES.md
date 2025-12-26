# 🔄 Synchronisation des Repositories

## 📍 Repositories GitHub

### Repository Principal (Développement)
- **URL** : `https://github.com/azerrached3-a11y/AZZ-CO-LABS-.git`
- **Remote** : `origin`
- **Usage** : Développement et versioning principal

### Repository de Production (Déploiement)
- **URL** : `https://github.com/jobboat-fr/azzco.git`
- **Remote** : `jobboat-fr`
- **Usage** : Déploiement sur Vercel (azzco.vercel.app)
- **Status** : ✅ Déjà déployé sur Vercel

---

## 🔄 Synchroniser vers le Repository de Production

### Option 1 : Push direct vers jobboat-fr

```bash
cd azzco-website

# Vérifier que vous êtes sur la branche main
git checkout main

# Ajouter le remote si pas déjà fait
git remote add jobboat-fr https://github.com/jobboat-fr/azzco.git

# Pousser vers jobboat-fr
git push jobboat-fr main
```

### Option 2 : Push avec force (si nécessaire)

⚠️ **Attention** : Utilisez seulement si vous êtes sûr de vouloir écraser l'historique

```bash
git push jobboat-fr main --force
```

### Option 3 : Synchronisation bidirectionnelle

Si vous voulez aussi récupérer les changements du repository de production :

```bash
# Récupérer les changements
git fetch jobboat-fr

# Voir les différences
git diff main jobboat-fr/main

# Fusionner si nécessaire
git merge jobboat-fr/main
```

---

## 🚀 Déploiement Automatique sur Vercel

Le repository `jobboat-fr/azzco` est connecté à Vercel. Chaque push vers `main` déclenche automatiquement un redéploiement.

### Workflow Recommandé

1. **Développement local** → Push vers `origin` (azerrached3-a11y/AZZ-CO-LABS-)
2. **Test et validation** → Vérifier que tout fonctionne
3. **Production** → Push vers `jobboat-fr` (jobboat-fr/azzco)
4. **Vercel** → Déploiement automatique sur azzco.vercel.app

---

## 📋 Checklist avant Push vers Production

Avant de pousser vers `jobboat-fr`, vérifiez :

- [ ] Tous les tests passent localement
- [ ] Les variables d'environnement sont configurées sur Vercel
- [ ] La base de données PostgreSQL est configurée (pas SQLite)
- [ ] Les clés API sont valides (Ollama, ipapi.com)
- [ ] Le fichier `vercel.json` est correct
- [ ] Aucune information sensible dans le code
- [ ] Le `.gitignore` exclut bien les fichiers sensibles

---

## 🔐 Variables d'Environnement Vercel

Assurez-vous que toutes les variables sont configurées dans le dashboard Vercel :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet `azzco`
3. Settings → Environment Variables
4. Ajoutez toutes les variables nécessaires (voir `DEPLOYMENT_DATA_ENV.md`)

---

## 🛠️ Commandes Utiles

```bash
# Voir tous les remotes
git remote -v

# Changer le remote principal
git remote set-url origin https://github.com/jobboat-fr/azzco.git

# Voir les différences entre les repositories
git diff origin/main jobboat-fr/main

# Synchroniser les deux repositories
git push origin main
git push jobboat-fr main
```

---

## ⚠️ Notes Importantes

1. **Ne jamais commiter** :
   - Fichiers `.env`
   - Clés API
   - Fichiers de base de données (`.db`)

2. **Vercel déploie automatiquement** :
   - Chaque push vers `main` sur `jobboat-fr/azzco` déclenche un déploiement
   - Vérifiez les logs Vercel après chaque déploiement

3. **Base de données** :
   - SQLite ne fonctionne PAS sur Vercel
   - Utilisez PostgreSQL (Vercel Postgres recommandé)
   - Voir `DEPLOYMENT_DATA_ENV.md` pour plus de détails

---

## 📚 Ressources

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Git Remote Documentation](https://git-scm.com/docs/git-remote)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)
