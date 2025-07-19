# 🤝 Guide de Contribution - Lootopia

Merci de votre intérêt pour contribuer à Lootopia ! Ce guide vous aidera à comprendre comment participer au développement de notre plateforme de chasse au trésor.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Pull Request Process](#pull-request-process)
- [Rapport de Bugs](#rapport-de-bugs)
- [Suggestions de Fonctionnalités](#suggestions-de-fonctionnalités)

## 📜 Code de Conduite

### Notre Engagement

Nous nous engageons à maintenir un environnement ouvert et accueillant pour tous, peu importe l'âge, la taille, le handicap, l'ethnicité, l'identité et l'expression de genre, le niveau d'expérience, la nationalité, l'apparence personnelle, la race, la religion ou l'identité et l'orientation sexuelles.

### Nos Standards

Exemples de comportements qui contribuent à créer un environnement positif :

- Utiliser un langage accueillant et inclusif
- Respecter les différents points de vue et expériences
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres de la communauté

## 🚀 Comment Contribuer

### Types de Contributions

Nous accueillons différents types de contributions :

- **🐛 Bug Reports** - Signaler des problèmes
- **✨ Feature Requests** - Proposer de nouvelles fonctionnalités
- **📝 Documentation** - Améliorer la documentation
- **🎨 UI/UX** - Améliorer l'interface utilisateur
- **🔧 Code** - Corriger des bugs ou ajouter des fonctionnalités
- **📱 Mobile** - Améliorer l'expérience mobile
- **🧪 Tests** - Ajouter des tests

### Processus de Contribution

1. **Fork** le projet
2. **Clone** votre fork localement
3. **Créez** une branche pour votre fonctionnalité
4. **Développez** votre fonctionnalité
5. **Testez** votre code
6. **Commitez** vos changements
7. **Poussez** vers votre fork
8. **Ouvrez** une Pull Request

## ⚙️ Configuration de l'Environnement

### Prérequis

- Node.js 18+
- npm ou yarn
- Git
- Un éditeur de code (VS Code recommandé)

### Installation

1. **Fork et clone le repository**

   ```bash
   git clone https://github.com/votre-username/lootopia.git
   cd lootopia
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer l'environnement**

   ```bash
   cp env.example .env
   # Éditer .env avec vos configurations
   ```

4. **Lancer le script de setup**

   ```bash
   ./scripts/setup.sh
   ```

5. **Démarrer le développement**

   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run dev
   ```

## 📏 Standards de Code

### JavaScript/TypeScript

- Utiliser **TypeScript** pour tous les nouveaux fichiers
- Suivre les conventions **ESLint** configurées
- Utiliser **Prettier** pour le formatage
- Préférer les **fonctions fléchées** et les **const**
- Utiliser des **noms descriptifs** pour les variables et fonctions

### React

- Utiliser des **composants fonctionnels** avec hooks
- Préférer les **composants purs** quand possible
- Utiliser **TypeScript** pour les props et state
- Suivre les **conventions de nommage** React

### CSS/Styling

- Utiliser **Tailwind CSS** pour le styling
- Préférer les **classes utilitaires** aux styles personnalisés
- Maintenir la **responsivité** mobile-first
- Utiliser des **variables CSS** pour les thèmes

### Structure des Fichiers

```
src/
├── components/          # Composants réutilisables
│   ├── Layout/         # Composants de mise en page
│   ├── Hunt/           # Composants spécifiques aux chasses
│   └── ...
├── pages/              # Pages de l'application
├── services/           # Services API et utilitaires
├── context/            # Context React
├── types/              # Types TypeScript
└── utils/              # Fonctions utilitaires
```

### Conventions de Nommage

- **Fichiers** : `PascalCase` pour les composants, `camelCase` pour les utilitaires
- **Composants** : `PascalCase` (ex: `HuntCard.tsx`)
- **Fonctions** : `camelCase` (ex: `getUserProfile`)
- **Variables** : `camelCase` (ex: `userData`)
- **Constants** : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)

## 🧪 Tests

### Types de Tests

- **Unit Tests** - Tester les fonctions individuelles
- **Integration Tests** - Tester les interactions entre composants
- **E2E Tests** - Tester les flux complets
- **Mobile Tests** - Tester sur simulateurs/appareils

### Exécuter les Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Écrire des Tests

```typescript
// Exemple de test pour un composant
import { render, screen } from "@testing-library/react";
import { HuntCard } from "../HuntCard";

describe("HuntCard", () => {
  it("should display hunt information", () => {
    const hunt = {
      id: "1",
      name: "Test Hunt",
      description: "Test Description",
    };

    render(<HuntCard hunt={hunt} />);

    expect(screen.getByText("Test Hunt")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });
});
```

## 🔄 Pull Request Process

### Avant de Soumettre

1. **Vérifiez** que votre code respecte les standards
2. **Testez** votre code localement
3. **Mettez à jour** la documentation si nécessaire
4. **Ajoutez** des tests pour les nouvelles fonctionnalités

### Template de Pull Request

```markdown
## Description

Brève description des changements apportés.

## Type de Changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Amélioration de la documentation
- [ ] Refactoring
- [ ] Test

## Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués

## Checklist

- [ ] Mon code suit les standards du projet
- [ ] J'ai testé mon code localement
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests pour les nouvelles fonctionnalités

## Screenshots (si applicable)

Ajoutez des captures d'écran pour les changements UI.

## Informations Supplémentaires

Toute information supplémentaire pertinente.
```

## 🐛 Rapport de Bugs

### Avant de Signaler

1. **Vérifiez** les issues existantes
2. **Testez** sur la dernière version
3. **Reproduisez** le bug localement

### Template de Bug Report

```markdown
## Description du Bug

Description claire et concise du bug.

## Étapes pour Reproduire

1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement Attendu

Description de ce qui devrait se passer.

## Comportement Actuel

Description de ce qui se passe actuellement.

## Screenshots

Si applicable, ajoutez des captures d'écran.

## Environnement

- OS: [ex: iOS, Windows, macOS]
- Navigateur: [ex: Chrome, Safari, Firefox]
- Version: [ex: 22]
- Appareil: [ex: iPhone 6, Desktop]

## Informations Supplémentaires

Toute autre information pertinente.
```

## 💡 Suggestions de Fonctionnalités

### Avant de Proposer

1. **Vérifiez** les suggestions existantes
2. **Réfléchissez** à l'impact sur l'expérience utilisateur
3. **Considérez** la complexité d'implémentation

### Template de Feature Request

```markdown
## Problème

Description du problème que cette fonctionnalité résoudrait.

## Solution Proposée

Description de la solution proposée.

## Alternatives Considérées

Description des alternatives considérées.

## Impact Utilisateur

Comment cette fonctionnalité améliorerait l'expérience utilisateur.

## Complexité Technique

Estimation de la complexité d'implémentation.

## Mockups/Screenshots

Si applicable, ajoutez des mockups ou captures d'écran.
```

## 📞 Support

### Questions Générales

- **Discussions GitHub** : [GitHub Discussions](https://github.com/your-repo/discussions)
- **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation** : [README.md](./README.md)

### Communication

- **Respectez** les autres contributeurs
- **Soyez constructif** dans vos commentaires
- **Posez des questions** si vous avez des doutes
- **Partagez** vos connaissances

## 🏆 Reconnaissance

Les contributeurs seront reconnus dans :

- Le fichier [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- Les releases GitHub
- La documentation du projet

---

**Merci de contribuer à Lootopia ! 🏴‍☠️**

Votre contribution aide à créer une plateforme de chasse au trésor meilleure pour tous.
