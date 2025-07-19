# 🏴‍☠️ Lootopia - Treasure Hunting Platform

Une plateforme immersive de chasse au trésor moderne, disponible sur **Web**, **iOS** et **Android**.

![Lootopia](https://img.shields.io/badge/Lootopia-Treasure%20Hunting-blue?style=for-the-badge&logo=react)
![Platforms](https://img.shields.io/badge/Platforms-Web%20%7C%20iOS%20%7C%20Android-green?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20TypeScript%20%7C%20Capacitor-orange?style=for-the-badge)

## 🎯 À propos

Lootopia est une plateforme de chasse au trésor qui combine **géolocalisation**, **réalité augmentée** et **gamification** pour créer des expériences d'aventure uniques. Les utilisateurs peuvent créer, participer et gagner des récompenses dans des chasses au trésor interactives.

## ✨ Fonctionnalités

### 🌍 Web App

- Interface moderne et responsive
- Création et gestion de chasses au trésor
- Marketplace d'artefacts
- Système de classement
- Profils utilisateurs détaillés

### 📱 Mobile App (iOS & Android)

- **Géolocalisation native** - GPS précis pour les chasses
- **Caméra intégrée** - Photos et scan QR codes
- **Vibrations haptiques** - Retour tactile immersif
- **Mode hors ligne** - Fonctionne sans connexion
- **Interface tactile optimisée** - Navigation fluide

### 🎮 Gamification

- Système de niveaux et XP
- Badges et récompenses
- Économie de couronnes
- Marketplace d'artefacts
- Classements compétitifs

## 🛠️ Tech Stack

### Frontend

- **React 18** - Interface utilisateur
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderne
- **Vite** - Build tool rapide
- **Leaflet** - Cartes interactives

### Mobile

- **Capacitor** - Framework cross-platform
- **Plugins natifs** - Géolocalisation, caméra, haptics
- **iOS & Android** - Applications natives

### Backend

- **Node.js** - Serveur API
- **Express** - Framework web
- **SQLite** - Base de données
- **JWT** - Authentification

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Xcode (pour iOS) - macOS uniquement
- Android Studio (pour Android)

### 1. Cloner le repository

```bash
git clone <repository-url>
cd lootopia
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Démarrer le serveur backend

```bash
# Dans un terminal séparé
npm run server
```

### 4. Démarrer l'application web

```bash
npm run dev
```

## 📱 Développement Mobile

### Scripts rapides

```bash
# iOS
npm run mobile:ios        # Ouvrir dans Xcode
npm run mobile:run-ios    # Lancer sur simulateur

# Android
npm run mobile:android    # Ouvrir dans Android Studio
npm run mobile:run-android # Lancer sur émulateur

# Live reload
npm run mobile:live       # Développement en temps réel
```

### Script personnalisé

```bash
# Rendre exécutable (une seule fois)
chmod +x mobile-dev.sh

# Utiliser
./mobile-dev.sh ios       # Build + ouvrir iOS
./mobile-dev.sh android   # Build + ouvrir Android
./mobile-dev.sh live      # Mode live reload
```

📖 **Documentation mobile complète** : [docs/MOBILE_README.md](./docs/MOBILE_README.md)

## 🏗️ Structure du Projet

```
lootopia/
├── src/                    # Code source React
│   ├── components/         # Composants réutilisables
│   │   ├── Layout/        # Header, navigation
│   │   ├── Hunt/          # Composants de chasse
│   │   ├── Auth/          # Authentification
│   │   └── ...
│   ├── pages/             # Pages de l'application
│   ├── services/          # Services API et mobile
│   ├── context/           # Context React
│   └── types/             # Types TypeScript
├── ios/                   # Projet iOS natif
├── android/               # Projet Android natif
├── supabase/              # Migrations base de données
├── dist/                  # Build web (généré)
└── docs/                  # Documentation
```

## 🎮 Utilisation

### Créer une chasse au trésor

1. Connectez-vous à votre compte
2. Cliquez sur "Créer une chasse"
3. Définissez les étapes et récompenses
4. Publiez votre chasse

### Participer à une chasse

1. Parcourez les chasses disponibles
2. Rejoignez une chasse
3. Suivez les indices et validez les étapes
4. Gagnez des récompenses !

### Marketplace

- Achetez et vendez des artefacts
- Collectionnez des objets rares
- Montez en niveau pour débloquer plus de contenu

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` :

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Lootopia
```

### Configuration mobile

Le fichier `capacitor.config.ts` contient la configuration mobile :

- Permissions (localisation, caméra)
- Splash screen
- Status bar
- Plugins natifs

## 📦 Déploiement

### Web

```bash
npm run build
# Déployer le dossier dist/
```

### iOS App Store

1. Ouvrir le projet dans Xcode
2. Configurer les certificats
3. Archiver et uploader

### Google Play Store

1. Ouvrir le projet dans Android Studio
2. Générer un APK/AAB signé
3. Uploader sur Google Play Console

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- **Documentation** : [docs/MOBILE_README.md](./docs/MOBILE_README.md)
- **API Documentation** : [docs/API.md](./docs/API.md)
- **Contributing** : [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions** : [GitHub Discussions](https://github.com/your-repo/discussions)

---

**🏴‍☠️ Prêt pour l'aventure ? Rejoignez Lootopia !**
