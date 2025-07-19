# 🔌 API Documentation - Lootopia

Documentation complète de l'API Lootopia pour les développeurs.

## 🌐 Base URL

```
http://localhost:3001
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Headers requis

```
Authorization: Bearer <token>
Content-Type: application/json
```

## 📋 Endpoints

### 🔑 Authentification

#### POST `/api/auth/register`

Créer un nouveau compte utilisateur.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "pseudo": "treasure_hunter",
  "lastName": "Doe",
  "surName": "John"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "treasure_hunter",
    "level": 1,
    "crowns": 100
  }
}
```

#### POST `/api/auth/login`

Se connecter avec un compte existant.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "treasure_hunter",
    "level": 5,
    "crowns": 250
  }
}
```

### 👤 Utilisateurs

#### GET `/api/users/profile`

Récupérer le profil de l'utilisateur connecté.

**Response:**

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "treasure_hunter",
  "level": 5,
  "xp": 1250,
  "crowns": 250,
  "badges": [...],
  "joinDate": "2024-01-15T10:30:00Z"
}
```

#### PUT `/api/users/profile`

Mettre à jour le profil utilisateur.

**Body:**

```json
{
  "lastName": "Doe",
  "surName": "John",
  "pseudo": "new_pseudo"
}
```

#### GET `/api/users/treasure-hunts`

Récupérer les chasses au trésor de l'utilisateur.

#### GET `/api/users/artefacts`

Récupérer les artefacts de l'utilisateur.

#### GET `/api/users/crown-balance`

Récupérer le solde de couronnes.

### 🗺️ Chasses au Trésor

#### GET `/api/treasure-hunts`

Récupérer la liste des chasses au trésor.

**Query Parameters:**

- `page` (number): Numéro de page (défaut: 1)
- `limit` (number): Nombre d'éléments par page (défaut: 10)

**Response:**

```json
{
  "data": [
    {
      "id": "hunt_id",
      "name": "Chasse au Trésor de Paris",
      "description": "Découvrez les secrets de Paris",
      "difficulty": "Medium",
      "duration": "2-3 hours",
      "participants": 15,
      "maxParticipants": 50,
      "entryCost": 10,
      "rating": 4.5,
      "location": "Paris, France"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET `/api/treasure-hunts/:id`

Récupérer les détails d'une chasse au trésor.

**Response:**

```json
{
  "id": "hunt_id",
  "name": "Chasse au Trésor de Paris",
  "description": "Découvrez les secrets de Paris",
  "creator": "creator_id",
  "planner_name": "John Doe",
  "difficulty": "Medium",
  "duration": "2-3 hours",
  "participants": 15,
  "maxParticipants": 50,
  "entryCost": 10,
  "rating": 4.5,
  "location": "Paris, France",
  "steps": [...],
  "landmarks": [...],
  "rewards": [...]
}
```

#### POST `/api/treasure-hunts`

Créer une nouvelle chasse au trésor.

**Body:**

```json
{
  "name": "Ma Chasse au Trésor",
  "description": "Description de la chasse",
  "entry_cost": 5,
  "crown_reward": 50,
  "steps": [
    {
      "title": "Étape 1",
      "description": "Trouvez le premier indice",
      "validation_type": "location",
      "validation_value": "48.8566,2.3522",
      "order": 1
    }
  ]
}
```

#### POST `/api/treasure-hunts/:id/join`

Rejoindre une chasse au trésor.

#### POST `/api/treasure-hunts/:id/complete`

Terminer une chasse au trésor.

#### GET `/api/treasure-hunts/:id/progress`

Récupérer le progrès d'une chasse.

### 📍 Étapes

#### GET `/api/steps/treasure-hunt/:huntId`

Récupérer les étapes d'une chasse.

#### POST `/api/steps/complete`

Valider une étape.

**Body:**

```json
{
  "step_id": "step_id",
  "treasure_hunt_id": "hunt_id",
  "validation_data": {
    "type": "location",
    "value": "48.8566,2.3522"
  }
}
```

#### GET `/api/steps/completed/:huntId`

Récupérer les étapes complétées par l'utilisateur.

### 🏪 Marketplace

#### GET `/api/marketplace`

Récupérer les objets du marketplace.

**Query Parameters:**

- `page` (number): Numéro de page
- `limit` (number): Nombre d'éléments
- `rarity` (string): Filtrer par rareté
- `minPrice` (number): Prix minimum
- `maxPrice` (number): Prix maximum

#### GET `/api/marketplace/my-listings`

Récupérer les objets mis en vente par l'utilisateur.

#### POST `/api/marketplace/list`

Mettre un objet en vente.

**Body:**

```json
{
  "user_artefact_id": "artefact_id",
  "price": 100
}
```

#### POST `/api/marketplace/purchase/:itemId`

Acheter un objet du marketplace.

### 🏆 Classement

#### GET `/api/leaderboard`

Récupérer le classement des joueurs.

**Response:**

```json
{
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "user_id",
        "username": "champion",
        "level": 10,
        "avatar": "avatar_url"
      },
      "score": 1500,
      "huntsCompleted": 25,
      "totalRewards": 500
    }
  ]
}
```

### 📊 Statistiques

#### GET `/api/treasure-hunts/:id/reviews`

Récupérer les avis d'une chasse.

#### POST `/api/reviews`

Créer un avis.

**Body:**

```json
{
  "treasure_hunt_id": "hunt_id",
  "rating": 5,
  "comment": "Excellente chasse au trésor !"
}
```

## 🔧 Codes d'Erreur

| Code | Description                               |
| ---- | ----------------------------------------- |
| 400  | Bad Request - Données invalides           |
| 401  | Unauthorized - Token manquant ou invalide |
| 403  | Forbidden - Permissions insuffisantes     |
| 404  | Not Found - Ressource introuvable         |
| 409  | Conflict - Ressource déjà existante       |
| 500  | Internal Server Error - Erreur serveur    |

## 📝 Exemples d'Utilisation

### JavaScript/TypeScript

```javascript
const API_BASE = "http://localhost:3001";

// Authentification
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Récupérer les chasses
const getHunts = async (token) => {
  const response = await fetch(`${API_BASE}/api/treasure-hunts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

### cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Récupérer les chasses (avec token)
curl -X GET http://localhost:3001/api/treasure-hunts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔄 WebSocket Events

Pour les fonctionnalités en temps réel (à implémenter) :

```javascript
// Connexion WebSocket
const ws = new WebSocket("ws://localhost:3001");

// Événements
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "hunt_update":
      // Mise à jour d'une chasse
      break;
    case "new_participant":
      // Nouveau participant
      break;
    case "step_completed":
      // Étape complétée
      break;
  }
};
```

---

**📚 Pour plus d'informations, consultez le code source ou contactez l'équipe de développement.**
