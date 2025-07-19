# 📁 Structure du Projet Lootopia

Documentation complète de l'architecture et de l'organisation du projet.

## 🏗️ Vue d'Ensemble

```
lootopia/
├── 📁 src/                    # Code source principal
├── 📁 docs/                   # Documentation
├── 📁 scripts/                # Scripts utilitaires
├── 📁 .vscode/                # Configuration VS Code
├── 📁 ios/                    # Projet iOS natif (généré)
├── 📁 android/                # Projet Android natif (généré)
├── 📁 supabase/               # Migrations base de données
├── 📁 dist/                   # Build web (généré)
└── 📄 Fichiers de configuration
```

## 📁 Détail des Dossiers

### 📁 `src/` - Code Source Principal

```
src/
├── 📁 components/             # Composants React réutilisables
│   ├── 📁 Layout/            # Composants de mise en page
│   │   ├── Header.tsx        # Header web
│   │   └── MobileHeader.tsx  # Header mobile optimisé
│   ├── 📁 Hunt/              # Composants de chasse au trésor
│   │   ├── HuntMap.tsx       # Carte web
│   │   ├── MobileHuntMap.tsx # Carte mobile avec GPS
│   │   ├── StepCard.tsx      # Carte d'étape
│   │   ├── ValidationModal.tsx # Modal de validation web
│   │   └── MobileValidationModal.tsx # Modal mobile avec caméra
│   ├── 📁 Auth/              # Composants d'authentification
│   │   └── AuthModal.tsx     # Modal de connexion/inscription
│   ├── 📁 Home/              # Composants de la page d'accueil
│   │   ├── HeroSection.tsx   # Section héro
│   │   └── FeaturedHunts.tsx # Chasses en vedette
│   ├── 📁 Hunts/             # Composants de liste de chasses
│   │   └── HuntCard.tsx      # Carte de chasse
│   ├── 📁 Marketplace/       # Composants du marketplace
│   │   └── ArtifactCard.tsx  # Carte d'artefact
│   └── 📁 Admin/             # Composants d'administration
│       └── AdminPanel.tsx    # Panel d'administration
├── 📁 pages/                 # Pages de l'application
│   ├── HomePage.tsx          # Page d'accueil
│   ├── HuntsPage.tsx         # Liste des chasses
│   ├── HuntDetailsPage.tsx   # Détails d'une chasse
│   ├── CreateHuntPage.tsx    # Création de chasse
│   ├── MarketplacePage.tsx   # Marketplace
│   ├── LeaderboardPage.tsx   # Classement
│   ├── ProfilePage.tsx       # Profil utilisateur
│   └── MyHuntsPage.tsx       # Mes chasses
├── 📁 services/              # Services et API
│   ├── api.ts                # Client API principal
│   └── mobile.ts             # Service mobile (GPS, caméra, etc.)
├── 📁 context/               # Context React
│   └── AuthContext.tsx       # Context d'authentification
├── 📁 types/                 # Types TypeScript
│   └── index.ts              # Définitions de types
├── 📁 data/                  # Données mockées
│   └── mockData.ts           # Données de test
├── App.tsx                   # Composant racine
├── main.tsx                  # Point d'entrée
├── index.css                 # Styles globaux
└── vite-env.d.ts             # Types Vite
```

### 📁 `docs/` - Documentation

```
docs/
├── 📄 MOBILE_README.md       # Guide complet du développement mobile
└── 📄 API.md                 # Documentation de l'API
```

### 📁 `scripts/` - Scripts Utilitaires

```
scripts/
└── 📄 setup.sh               # Script d'installation automatique
```

### 📁 `.vscode/` - Configuration VS Code

```
.vscode/
├── 📄 settings.json          # Paramètres de l'éditeur
├── 📄 extensions.json        # Extensions recommandées
└── 📄 tasks.json             # Tâches de développement
```

### 📁 `ios/` - Projet iOS (Généré par Capacitor)

```
ios/
├── 📁 App/                   # Projet Xcode
│   ├── 📁 App/              # Code natif iOS
│   │   ├── 📁 public/       # Assets web (copiés depuis dist/)
│   │   ├── AppDelegate.swift # Délégué de l'application
│   │   ├── ViewController.swift # Contrôleur principal
│   │   └── Info.plist       # Configuration iOS
│   └── App.xcworkspace      # Workspace Xcode
└── 📄 capacitor.config.json # Configuration Capacitor
```

### 📁 `android/` - Projet Android (Généré par Capacitor)

```
android/
├── 📁 app/                   # Module principal Android
│   ├── 📁 src/              # Code source Android
│   │   └── 📁 main/         # Code principal
│   │       ├── 📁 assets/   # Assets web (copiés depuis dist/)
│   │       ├── 📁 java/     # Code Java/Kotlin
│   │       └── AndroidManifest.xml # Manifest Android
│   └── build.gradle         # Configuration Gradle
├── 📁 gradle/               # Wrapper Gradle
├── build.gradle             # Configuration projet
└── 📄 capacitor.config.json # Configuration Capacitor
```

## 📄 Fichiers de Configuration

### Configuration Principale

| Fichier               | Description                      |
| --------------------- | -------------------------------- |
| `package.json`        | Dépendances et scripts npm       |
| `capacitor.config.ts` | Configuration Capacitor (mobile) |
| `vite.config.ts`      | Configuration Vite (build tool)  |
| `tsconfig.json`       | Configuration TypeScript         |
| `tailwind.config.js`  | Configuration Tailwind CSS       |
| `eslint.config.js`    | Configuration ESLint             |
| `postcss.config.js`   | Configuration PostCSS            |

### Documentation

| Fichier           | Description                          |
| ----------------- | ------------------------------------ |
| `README.md`       | Documentation principale             |
| `CONTRIBUTING.md` | Guide de contribution                |
| `LICENSE`         | Licence MIT                          |
| `env.example`     | Exemple de variables d'environnement |

### Scripts

| Fichier            | Description                       |
| ------------------ | --------------------------------- |
| `mobile-dev.sh`    | Script de développement mobile    |
| `scripts/setup.sh` | Script d'installation automatique |

## 🔧 Architecture Technique

### Frontend (React + TypeScript)

- **Framework** : React 18 avec hooks
- **Language** : TypeScript pour la type safety
- **Styling** : Tailwind CSS pour le design
- **Build Tool** : Vite pour la rapidité
- **State Management** : Context API React
- **Routing** : Navigation manuelle (SPA)

### Mobile (Capacitor)

- **Framework** : Capacitor pour le cross-platform
- **Plugins Natifs** :
  - Géolocalisation (`@capacitor/geolocation`)
  - Caméra (`@capacitor/camera`)
  - Vibrations (`@capacitor/haptics`)
  - Statut bar (`@capacitor/status-bar`)
  - App info (`@capacitor/app`)
  - Network (`@capacitor/network`)
  - Device info (`@capacitor/device`)

### Backend (Node.js + Express)

- **Runtime** : Node.js
- **Framework** : Express.js
- **Database** : SQLite avec migrations
- **Authentication** : JWT
- **CORS** : Configuration pour cross-origin

## 📱 Fonctionnalités par Plateforme

### 🌍 Web

- Interface responsive
- Navigation clavier/souris
- Optimisé pour desktop/tablette

### 📱 Mobile (iOS/Android)

- Interface tactile optimisée
- Géolocalisation native
- Caméra intégrée
- Vibrations haptiques
- Mode hors ligne
- Navigation gestuelle

## 🔄 Workflow de Développement

### Développement Web

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run lint         # Vérification du code
```

### Développement Mobile

```bash
./mobile-dev.sh build    # Build + sync
./mobile-dev.sh ios      # Ouvrir iOS
./mobile-dev.sh android  # Ouvrir Android
./mobile-dev.sh live     # Live reload
```

### Scripts NPM

```bash
npm run mobile:ios       # Build + ouvrir iOS
npm run mobile:android   # Build + ouvrir Android
npm run mobile:live      # Live reload mobile
```

## 🎯 Points d'Entrée

### Application Web

- **Point d'entrée** : `src/main.tsx`
- **Composant racine** : `src/App.tsx`
- **Build output** : `dist/`

### Application Mobile

- **iOS** : `ios/App/App/ViewController.swift`
- **Android** : `android/app/src/main/java/.../MainActivity.java`
- **Web assets** : Copiés depuis `dist/` vers les projets natifs

## 🔍 Fichiers Clés

### Composants Principaux

- `src/App.tsx` - Logique de navigation et routage
- `src/services/api.ts` - Client API pour le backend
- `src/services/mobile.ts` - Service pour fonctionnalités mobiles
- `src/types/index.ts` - Définitions TypeScript

### Configuration Mobile

- `capacitor.config.ts` - Configuration Capacitor
- `mobile-dev.sh` - Scripts de développement mobile
- `docs/MOBILE_README.md` - Guide mobile complet

### Documentation

- `README.md` - Vue d'ensemble du projet
- `docs/API.md` - Documentation API
- `CONTRIBUTING.md` - Guide de contribution

---

**📚 Cette structure permet un développement organisé et maintenable sur toutes les plateformes !**
