# 🔧 Résoudre le Problème de Push vers jobboat-fr/azzco

## ❌ Problème Actuel

Le push échoue avec l'erreur :
```
remote: Permission to jobboat-fr/azzco.git denied
fatal: unable to access 'https://github.com/jobboat-fr/azzco.git/': The requested URL returned error: 403
```

## ✅ Solutions

### Option 1 : Utiliser SSH au lieu de HTTPS (Recommandé)

#### Étape 1 : Changer le remote vers SSH

```bash
cd azzco-website

# Supprimer le remote HTTPS
git remote remove jobboat-fr

# Ajouter le remote SSH
git remote add jobboat-fr git@github.com:jobboat-fr/azzco.git
```

#### Étape 2 : Vérifier votre clé SSH

```bash
# Vérifier si vous avez une clé SSH
ls -al ~/.ssh

# Si pas de clé, en créer une
ssh-keygen -t ed25519 -C "votre_email@example.com"

# Ajouter la clé à ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

#### Étape 3 : Ajouter la clé SSH à GitHub

1. Copier le contenu de votre clé publique :
```bash
cat ~/.ssh/id_ed25519.pub
```

2. Aller sur GitHub → Settings → SSH and GPG keys
3. Cliquer "New SSH key"
4. Coller la clé et sauvegarder

#### Étape 4 : Push avec SSH

```bash
git push jobboat-fr main --force
```

---

### Option 2 : Utiliser un Personal Access Token (HTTPS)

#### Étape 1 : Créer un Personal Access Token

1. Aller sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Cliquer "Generate new token (classic)"
3. Donner un nom (ex: "azzco-push")
4. Sélectionner les permissions : `repo` (toutes les permissions repo)
5. Générer et **COPIER LE TOKEN** (vous ne le verrez qu'une fois !)

#### Étape 2 : Utiliser le token dans l'URL

```bash
cd azzco-website

# Changer le remote pour inclure le token
git remote set-url jobboat-fr https://VOTRE_TOKEN@github.com/jobboat-fr/azzco.git

# OU utiliser votre username
git remote set-url jobboat-fr https://VOTRE_USERNAME:VOTRE_TOKEN@github.com/jobboat-fr/azzco.git
```

#### Étape 3 : Push

```bash
git push jobboat-fr main --force
```

---

### Option 3 : Utiliser GitHub Desktop ou GitHub CLI

#### GitHub Desktop

1. Ouvrir GitHub Desktop
2. File → Clone repository
3. Sélectionner `jobboat-fr/azzco`
4. Copier les fichiers depuis `azzco-website`
5. Commit et Push

#### GitHub CLI

```bash
# Installer GitHub CLI si pas déjà fait
# Windows: winget install GitHub.cli

# Se connecter
gh auth login

# Cloner le repository
gh repo clone jobboat-fr/azzco

# Copier les fichiers
cp -r azzco-website/* azzco/

# Commit et push
cd azzco
git add .
git commit -m "Complete AZZ&CO LABS website update"
git push
```

---

### Option 4 : Push via l'interface GitHub (Web)

Si vous n'avez pas les permissions, demandez à un administrateur du repository `jobboat-fr/azzco` de :

1. Vous ajouter comme collaborateur avec les droits d'écriture
2. OU créer un fichier ZIP de votre code et l'uploader via l'interface web

---

## 🔍 Vérifier les Permissions

### Vérifier si vous êtes collaborateur

1. Aller sur https://github.com/jobboat-fr/azzco
2. Settings → Collaborators
3. Vérifier si votre compte est listé

### Demander l'accès

Si vous n'êtes pas collaborateur, contactez le propriétaire du repository pour :
- Vous ajouter comme collaborateur
- OU vous donner les droits d'écriture

---

## 📋 Checklist Avant Push

- [ ] Vous avez les droits d'écriture sur `jobboat-fr/azzco`
- [ ] Le remote est correctement configuré (SSH ou HTTPS avec token)
- [ ] Votre authentification GitHub fonctionne
- [ ] Tous les fichiers sont commités localement
- [ ] Vous êtes sur la branche `main`

---

## 🚀 Commande Complète (SSH)

```bash
cd azzco-website

# Vérifier le remote actuel
git remote -v

# Changer vers SSH
git remote set-url jobboat-fr git@github.com:jobboat-fr/azzco.git

# Vérifier la connexion SSH
ssh -T git@github.com

# Push
git push jobboat-fr main --force
```

---

## 🚀 Commande Complète (HTTPS avec Token)

```bash
cd azzco-website

# Remplacer VOTRE_TOKEN par votre Personal Access Token
git remote set-url jobboat-fr https://VOTRE_TOKEN@github.com/jobboat-fr/azzco.git

# Push
git push jobboat-fr main --force
```

---

## ⚠️ Important

1. **Ne jamais partager votre token ou clé privée**
2. **Utilisez `--force` seulement si vous êtes sûr** (écrase l'historique distant)
3. **Sauvegardez votre token** dans un gestionnaire de mots de passe
4. **Révocation du token** si compromis : GitHub → Settings → Developer settings → Personal access tokens

---

## 📚 Ressources

- [GitHub SSH Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub CLI](https://cli.github.com/)
