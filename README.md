# AZZ&CO LABS

**Innovation Technologique & Intelligence Artificielle**

> *Transformer la façon dont les gens travaillent, se connectent et vivent grâce à l'intelligence artificielle éthique et centrée sur l'humain.*

---

## 🏢 À Propos d'AZZ&CO LABS

**AZZ&CO LABS** est une entreprise d'innovation technologique et d'intelligence artificielle basée à **Paris, France**. Fondée avec une vision claire : utiliser l'intelligence artificielle pour **aider les gens à travailler et gagner leur vie**, pas pour les remplacer dans une perspective de gain capitaliste.

### Notre Mission

Notre mission est de créer des solutions technologiques avancées qui **amplifient les capacités humaines** plutôt que de les remplacer. Nous croyons fermement que l'IA doit être un outil d'émancipation qui :

- ✅ Facilite l'apprentissage et le développement de compétences
- ✅ Ouvre de nouvelles voies vers l'emploi et l'entrepreneuriat
- ✅ Crée des opportunités économiques durables
- ✅ Transforme les défis en opportunités de croissance

### Notre Philosophie

**L'humain au centre de l'innovation technologique.**

Nous rejetons l'utilisation de l'IA comme simple moyen de réduire les coûts en remplaçant les travailleurs. Au lieu de cela, nous développons des systèmes qui :

- 🔄 Amplifient les capacités humaines
- 📚 Facilitent l'apprentissage continu
- 🤝 Créent des synergies entre technologie et humain
- 🌱 Favorisent une croissance mutuelle et durable

### Notre Vision

Nous voyons un avenir où **la technologie et l'humain travaillent en synergie** pour créer une valeur durable. Un futur où chaque individu peut accéder à des outils puissants pour améliorer sa situation économique et personnelle, où l'IA est un partenaire dans la croissance professionnelle, pas une menace pour l'emploi.

---

## 🚀 Nos Produits

### JobBoat - Plateforme Révolutionnaire de Recherche d'Emploi

**JobBoat** est notre plateforme principale qui transforme la recherche d'emploi en une expérience engageante et efficace. Nous combinons :

- 🎯 **L'algorithme personnalisé de TikTok** pour un feed addictif
- 💼 **Le réseautage professionnel de LinkedIn** pour construire des connexions
- 👆 **L'interface intuitive de swipe de Tinder** pour découvrir des opportunités
- 🎁 **Le financement de projets de carrière** style Kickstarter
- 🌐 **Un écosystème Web3 complet** avec tokens BOAT

**Fonctionnalités clés :**
- Feed social personnalisé (style TikTok/LinkedIn)
- Shorts vidéo pour le développement de carrière
- Swipe d'emplois intuitif (style Tinder)
- Candidature automatique intelligente
- Jupiter Room : Coaching d'entretien avec 105 personas IA
- 572 modèles comportementaux pour un matching ultra-précis
- Système de vote démocratique IA (7 modèles, 95% de précision)

**Statut :** En phase de préparation légale et administrative

### OutWings - La Prochaine Génération des Sorties de Groupes

**OutWings** est notre projet confidentiel en développement - une application de nouvelle génération conçue pour révolutionner la façon dont les groupes organisent et vivent leurs sorties sociales.

**Statut :** En développement actif (projet confidentiel)

---

## 💻 Site Web Officiel

Ce repository contient le **site web officiel** d'AZZ&CO LABS, une plateforme moderne et interactive qui présente :

- 🎨 **Design moderne et responsive** - S'adapte à tous les écrans
- 🤖 **Chatbot intelligent** - Assistant IA alimenté par Ollama
- 📊 **Système d'analytics** - Suivi des visiteurs et interactions
- 🎭 **Détection de persona** - 8 types de personas pour des réponses adaptées
- 📝 **Système de prompts avancé** - 7 catégories de prompts contextuels

### Caractéristiques Techniques

- **Frontend :** HTML5, CSS3, JavaScript vanilla
- **Backend :** Node.js, Express.js
- **Base de données :** SQLite (visiteurs, analytics, chat logs)
- **IA :** Ollama (intégration locale)
- **Design :** Glassmorphism, gradients modernes, animations fluides

---

## 🛠️ Structure du Projet

```
azzco-website/
├── index.html              # Site web principal
├── styles.css              # Styles avec widget chatbot
├── script.js               # Scripts du site (navigation, animations)
├── chatbot.js              # Widget chatbot interactif
├── backend/
│   ├── server.js           # Serveur Express
│   ├── package.json        # Dépendances Node.js
│   ├── routes/             # Routes API
│   │   ├── chatbot.js      # API chatbot
│   │   └── analytics.js    # API analytics
│   ├── services/           # Services métier
│   │   ├── ollamaService.js      # Intégration Ollama
│   │   ├── personaDetector.js    # Détection de persona
│   │   ├── promptManager.js      # Gestion des prompts
│   │   └── analyticsService.js   # Service analytics
│   ├── models/             # Modèles de données
│   │   └── database.js     # Base de données SQLite
│   └── prompts/            # Fichiers de prompts
│       ├── persona-profiles.json    # 8 personas définies
│       ├── persona-keywords.json    # Mots-clés par persona
│       ├── jobboat.json             # Prompts JobBoat
│       ├── outwings.json            # Prompts OutWings
│       ├── contact.json             # Prompts contact
│       ├── mission.json             # Prompts mission
│       ├── ai.json                  # Prompts IA
│       ├── technology.json          # Prompts technologie
│       └── general.json             # Prompts généraux
└── README.md               # Ce fichier
```

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 16+
- Ollama installé et configuré
- Git

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/azerrached3-a11y/AZZ-CO-LABS-.git
   cd AZZ-CO-LABS-
   ```

2. **Installer les dépendances backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditez .env avec vos configurations
   ```

4. **Installer et configurer Ollama**
   ```bash
   # Téléchargez depuis https://ollama.ai
   ollama pull llama2
   ```

5. **Démarrer le backend**
   ```bash
   npm start
   # Le serveur démarre sur http://localhost:3000
   ```

6. **Ouvrir le site web**
   - Ouvrez `index.html` dans votre navigateur
   - Ou servez avec un serveur local :
     ```bash
     python -m http.server 8000
     # Puis ouvrez http://localhost:8000
     ```

---

## 📊 Fonctionnalités du Site

### Sections Principales

1. **Accueil** - Présentation de l'entreprise avec hero section animée
2. **Mission** - Philosophie, engagement et vision de l'entreprise
3. **JobBoat** - Présentation complète avec démos web et mobile
4. **OutWings** - Page d'entrée confidentielle
5. **Contact** - Formulaire de contact et informations

### Chatbot Intelligent

Le site intègre un **chatbot IA** alimenté par Ollama qui :

- 🎭 Détecte automatiquement la persona de l'utilisateur (8 types)
- 🔍 Extrait les mots-clés contextuels
- 📝 Génère des réponses adaptées selon le contexte
- 💾 Enregistre toutes les interactions pour amélioration continue

**Personas supportées :**
- Professional (par défaut)
- Investor
- Job Seeker
- Tech Enthusiast
- Curious Visitor
- Partner
- Media
- Student

### Système d'Analytics

Le site collecte automatiquement :
- 👥 Visiteurs uniques et sessions
- 📄 Pages vues et temps passé
- 💬 Interactions avec le chatbot
- 📊 Événements personnalisés
- 📈 Statistiques de performance

---

## 🎨 Design

- **Couleurs :** Dégradés violets/bleus modernes
- **Typographie :** Inter (Google Fonts)
- **Style :** Glassmorphism, gradients, ombres douces
- **Animations :** Scroll reveal, parallax, hover effects
- **Responsive :** Desktop, tablette, mobile

---

## 📧 Contact

**AZZ&CO LABS**  
📍 Paris, France  
📧 Email: azerrached3@gmail.com  
📞 Téléphone: +33 6 02 56 02 29  
💼 LinkedIn: [Azer Rached](https://www.linkedin.com/in/azer-rached-239258377/)  
🔗 Liens: [Linktree](https://linktr.ee/AZER_rached)

---

## 📄 Statut Actuel

**Phase :** Préparation légale et administrative

Nous travaillons activement sur les aspects juridiques, réglementaires et de conformité pour garantir que nos produits respectent toutes les normes avant leur lancement. C'est une étape importante qui nous permettra de lancer avec confiance et conformité totale.

---

## 🤝 Contribution

Ce projet est actuellement en développement privé. Pour toute question, suggestion ou demande de partenariat, n'hésitez pas à nous contacter.

---

## 📜 Licence

© 2025 AZZ&CO LABS. Tous droits réservés.

---

**Construit avec ❤️ par AZZ&CO LABS**  
*L'IA au service de l'humain*