# 📱 Lootopia Mobile App

Votre application de chasse au trésor Lootopia est maintenant disponible sur mobile ! Cette version mobile utilise **Capacitor** pour transformer votre web app en application native iOS et Android.

## 🚀 Fonctionnalités Mobile

### ✨ Fonctionnalités Natives

- **Géolocalisation précise** - Utilise le GPS natif pour la localisation
- **Caméra intégrée** - Capture de photos et scan de QR codes
- **Vibrations haptiques** - Retour tactile pour une meilleure UX
- **Notifications push** - Alertes pour les nouvelles chasses
- **Mode hors ligne** - Fonctionne même sans connexion
- **Interface tactile optimisée** - Navigation fluide sur mobile

### 🗺️ Carte Interactive

- Suivi en temps réel de votre position
- Marqueurs pour les étapes et points d'intérêt
- Contrôles tactiles optimisés
- Mode tracking automatique

### 📸 Validation des Étapes

- **Validation par localisation** - Photo à l'emplacement requis
- **Scan de QR codes** - Utilise la caméra native
- **Validation textuelle** - Saisie de codes de validation
- **Retour haptique** - Vibrations pour confirmer les actions

## 🛠️ Installation et Configuration

### Prérequis

- Node.js 18+
- npm ou yarn
- Xcode (pour iOS) - macOS uniquement
- Android Studio (pour Android)

### 1. Installation des dépendances

```bash
npm install
```

### 2. Build de l'application web

```bash
npm run build
```

### 3. Synchronisation avec les plateformes mobiles

```bash
npx cap sync
```

## 📱 Développement Mobile

### Scripts de développement

Nous avons créé un script pour faciliter le développement :

```bash
# Rendre le script exécutable (une seule fois)
chmod +x mobile-dev.sh

# Utiliser le script
./mobile-dev.sh [commande]
```

### Commandes disponibles

| Commande                      | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `./mobile-dev.sh build`       | Build et sync avec les plateformes           |
| `./mobile-dev.sh ios`         | Ouvrir le projet iOS dans Xcode              |
| `./mobile-dev.sh android`     | Ouvrir le projet Android dans Android Studio |
| `./mobile-dev.sh run-ios`     | Lancer sur le simulateur iOS                 |
| `./mobile-dev.sh run-android` | Lancer sur l'émulateur Android               |
| `./mobile-dev.sh live`        | Mode live reload pour iOS                    |
| `./mobile-dev.sh sync`        | Synchroniser les assets web                  |

### Développement iOS

1. **Ouvrir le projet iOS :**

   ```bash
   ./mobile-dev.sh ios
   ```

2. **Lancer sur simulateur :**

   ```bash
   ./mobile-dev.sh run-ios
   ```

3. **Mode live reload :**
   ```bash
   ./mobile-dev.sh live
   ```

### Développement Android

1. **Ouvrir le projet Android :**

   ```bash
   ./mobile-dev.sh android
   ```

2. **Lancer sur émulateur :**
   ```bash
   ./mobile-dev.sh run-android
   ```

## 🔧 Configuration

### Permissions requises

L'app demande automatiquement les permissions suivantes :

- **Localisation** - Pour la géolocalisation des chasses
- **Caméra** - Pour les photos et QR codes
- **Stockage** - Pour sauvegarder les données hors ligne

### Configuration Capacitor

Le fichier `capacitor.config.ts` contient la configuration :

```typescript
{
  appId: 'com.lootopia.app',
  appName: 'Lootopia',
  webDir: 'dist',
  plugins: {
    SplashScreen: { /* ... */ },
    StatusBar: { /* ... */ },
    Geolocation: { permissions: ["location"] },
    Camera: { permissions: ["camera"] }
  }
}
```

## 📦 Déploiement

### iOS App Store

1. Ouvrir le projet dans Xcode
2. Configurer les certificats de signature
3. Archiver et uploader via Xcode

### Google Play Store

1. Ouvrir le projet dans Android Studio
2. Générer un APK signé ou AAB
3. Uploader sur Google Play Console

## 🎯 Fonctionnalités Spécifiques Mobile

### Service Mobile

Le service `src/services/mobile.ts` gère toutes les fonctionnalités natives :

```typescript
import { mobileService } from "./services/mobile";

// Géolocalisation
const location = await mobileService.getCurrentLocation();

// Caméra
const photo = await mobileService.takePhoto();

// Vibrations
await mobileService.impact();
```

### Composants Mobile

- `MobileHeader.tsx` - Navigation mobile optimisée
- `MobileHuntMap.tsx` - Carte avec contrôles tactiles
- `MobileValidationModal.tsx` - Validation avec caméra

## 🔍 Dépannage

### Problèmes courants

1. **Erreur de build :**

   ```bash
   npm run build
   npx cap sync
   ```

2. **Permissions refusées :**

   - Vérifier les paramètres de l'appareil
   - Redémarrer l'app après accord des permissions

3. **Géolocalisation ne fonctionne pas :**

   - Vérifier que la localisation est activée
   - Tester sur un appareil physique (plus précis)

4. **Caméra ne s'ouvre pas :**
   - Vérifier les permissions caméra
   - Tester sur un appareil physique

### Logs de débogage

```bash
# iOS
npx cap run ios --livereload --external

# Android
npx cap run android --livereload --external
```

## 🎨 Personnalisation

### Thème mobile

Les styles sont optimisés pour mobile avec Tailwind CSS. Les classes responsives s'adaptent automatiquement.

### Icônes et splash screen

Modifiez les assets dans :

- `ios/App/App/Assets.xcassets/` (iOS)
- `android/app/src/main/res/` (Android)

## 📞 Support

Pour toute question sur l'app mobile :

1. Vérifiez ce README
2. Consultez la [documentation Capacitor](https://capacitorjs.com/docs)
3. Ouvrez une issue sur le projet

---

**🎉 Votre app Lootopia est maintenant prête pour mobile !**
