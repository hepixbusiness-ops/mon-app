# Documentation API — SalonPro

## Conventions

- **Base URL (prod) :** `https://salonpro.africa/api`
- **Authentification :** Bearer token JWT Supabase (header `Authorization: Bearer <token>`)
- **Format :** JSON uniquement
- **Langue :** Erreurs retournées en français
- **Dates :** ISO 8601 avec timezone (ex: `2026-06-14T10:30:00+01:00`)
- **Montants :** Entiers en FCFA (ex: `8000` = 8 000 FCFA)
- **Pagination :** `?page=1&limit=50` (défaut : limit=50, max=100)

---

## Authentification

### POST `/api/auth/verify-otp`
Vérifier le code OTP reçu par SMS et créer la session.

**Body :**
```json
{
  "phone": "237690000000",
  "token": "123456"
}
```

**Response 200 :**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid",
    "phone": "237690000000"
  }
}
```

---

## Salons

### GET `/api/salons/me`
Récupérer les informations du salon de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Response 200 :**
```json
{
  "id": "uuid",
  "name": "Salon Prestige",
  "slug": "salon-prestige-douala",
  "phone": "237690000000",
  "address": "Akwa, Douala",
  "city": "Douala",
  "country": "CM",
  "type": "coiffure",
  "cover_url": "https://...",
  "logo_url": "https://...",
  "subscription_plan": "pro",
  "subscription_ends_at": "2026-07-14T00:00:00Z",
  "is_active": true
}
```

### PUT `/api/salons/me`
Mettre à jour les informations du salon.

**Body :**
```json
{
  "name": "Salon Prestige",
  "address": "Akwa, Douala",
  "description": "Salon de coiffure haut de gamme...",
  "phone": "237690000000"
}
```

---

## Réservations (Bookings)

### GET `/api/bookings`
Liste des réservations du salon.

**Query params :**
- `date` : `2026-06-14` (filtre par jour)
- `status` : `pending|confirmed|completed|cancelled|no_show`
- `staff_id` : uuid
- `from` : date ISO (début de période)
- `to` : date ISO (fin de période)
- `page` : numéro de page
- `limit` : résultats par page (défaut 50)

**Response 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "starts_at": "2026-06-14T10:30:00Z",
      "ends_at": "2026-06-14T11:30:00Z",
      "status": "confirmed",
      "price": 8000,
      "source": "online",
      "customer": {
        "id": "uuid",
        "name": "Aminata Koné",
        "phone": "237690000000"
      },
      "staff": {
        "id": "uuid",
        "name": "Marie",
        "color": "#6B21A8"
      },
      "service": {
        "id": "uuid",
        "name": "Défrisage",
        "duration_minutes": 60
      },
      "created_at": "2026-06-12T14:00:00Z"
    }
  ],
  "meta": {
    "total": 87,
    "page": 1,
    "limit": 50
  }
}
```

### POST `/api/bookings`
Créer une réservation manuellement (depuis le dashboard).

**Body :**
```json
{
  "customer_id": "uuid",
  "staff_id": "uuid",
  "service_id": "uuid",
  "starts_at": "2026-06-14T10:30:00Z",
  "notes": "Préfère les produits sans ammoniaque"
}
```

**Response 201 :**
```json
{
  "id": "uuid",
  "status": "confirmed",
  ...
}
```

### PATCH `/api/bookings/:id`
Modifier le statut ou les détails d'une réservation.

**Body :**
```json
{
  "status": "confirmed",
  "internal_notes": "Cliente arrivée en avance"
}
```

**Transitions de statut autorisées :**
```
pending → confirmed | cancelled
confirmed → completed | cancelled | no_show
```

### DELETE `/api/bookings/:id`
Annuler une réservation.

**Body :**
```json
{
  "reason": "Salon fermé exceptionnellement",
  "notify_customer": true
}
```

---

## Réservation publique (sans auth)

### GET `/api/public/salons/:slug`
Récupérer les infos publiques d'un salon (pour la page de réservation).

**Response 200 :**
```json
{
  "id": "uuid",
  "name": "Salon Prestige",
  "slug": "salon-prestige-douala",
  "address": "Akwa, Douala",
  "cover_url": "https://...",
  "type": "coiffure",
  "services": [
    {
      "id": "uuid",
      "name": "Coiffure simple",
      "price": 3500,
      "duration_minutes": 60,
      "category": "coiffure"
    }
  ],
  "staff": [
    {
      "id": "uuid",
      "name": "Marie",
      "avatar_url": "https://..."
    }
  ],
  "working_hours": [
    { "day_of_week": 0, "start_time": "08:00", "end_time": "20:00", "is_day_off": false }
  ]
}
```

### GET `/api/public/salons/:slug/availability`
Récupérer les créneaux disponibles.

**Query params :**
- `date` : `2026-06-14` (obligatoire)
- `staff_id` : uuid (optionnel)
- `service_id` : uuid (obligatoire, pour calculer la durée)

**Response 200 :**
```json
{
  "date": "2026-06-14",
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "10:00", "available": false },
    { "time": "11:00", "available": true }
  ]
}
```

### POST `/api/public/bookings`
Créer une réservation depuis la page publique (sans auth).

**Body :**
```json
{
  "salon_id": "uuid",
  "staff_id": "uuid",
  "service_id": "uuid",
  "starts_at": "2026-06-14T10:00:00Z",
  "customer_name": "Aminata",
  "customer_phone": "237690000000",
  "notes": "Première visite"
}
```

**Response 201 :**
```json
{
  "id": "uuid",
  "status": "pending",
  "confirmation_message": "Votre demande a été envoyée ! Vous recevrez une confirmation sur WhatsApp."
}
```

**Logique :**
1. Vérifier que le créneau est disponible (pas de conflit)
2. Créer ou retrouver le customer par numéro de téléphone
3. Créer le booking en `pending`
4. Envoyer WhatsApp de confirmation à la cliente
5. Envoyer notification Realtime au dashboard du salon

---

## Clients

### GET `/api/customers`
Liste des clientes du salon.

**Query params :**
- `search` : recherche par nom ou téléphone
- `is_vip` : `true|false`
- `page`, `limit`

### GET `/api/customers/:id`
Profil complet d'une cliente avec son historique.

**Response 200 :**
```json
{
  "id": "uuid",
  "name": "Aminata Koné",
  "phone": "237690000000",
  "email": null,
  "notes": "Allergique au défrisage Lissage",
  "total_visits": 14,
  "total_spent": 187500,
  "last_visit_at": "2026-06-10T14:00:00Z",
  "is_vip": true,
  "bookings": [
    {
      "id": "uuid",
      "starts_at": "2026-06-10T14:00:00Z",
      "service": { "name": "Tressage" },
      "status": "completed",
      "price": 15000
    }
  ]
}
```

### POST `/api/customers`
Ajouter une cliente manuellement.

### PUT `/api/customers/:id`
Modifier les informations d'une cliente.

---

## Services

### GET `/api/services`
Liste des services du salon.

### POST `/api/services`
Créer un service.

**Body :**
```json
{
  "name": "Coiffure simple",
  "price": 3500,
  "duration_minutes": 60,
  "category": "coiffure",
  "description": "Lavage, coupe et mise en forme"
}
```

### PUT `/api/services/:id`
Modifier un service.

### DELETE `/api/services/:id`
Supprimer (désactiver) un service.

---

## Paiements

### GET `/api/payments`
Liste des paiements du salon.

**Query params :**
- `status` : `pending|completed|failed|refunded`
- `method` : `cash|mtn_momo|orange_money|wave|card`
- `from`, `to` : période
- `page`, `limit`

### POST `/api/payments/initiate`
Initier un paiement Mobile Money.

**Body :**
```json
{
  "booking_id": "uuid",
  "amount": 8000,
  "method": "mtn_momo",
  "customer_phone": "237690000000"
}
```

**Response 200 :**
```json
{
  "payment_id": "uuid",
  "transaction_id": "SP_1718362800_abc12345",
  "status": "pending",
  "message": "Une demande de paiement a été envoyée au +237690000000"
}
```

### POST `/api/payments/webhook`
Webhook CinetPay (usage interne, appelé par CinetPay uniquement).

> Cette route est publique mais protégée par vérification de signature HMAC.

### POST `/api/payments/cash`
Enregistrer un paiement en espèces (pas de webhook, confirmation immédiate).

**Body :**
```json
{
  "booking_id": "uuid",
  "amount": 8000,
  "send_receipt_whatsapp": true
}
```

---

## Rapports

### GET `/api/reports/summary`
Résumé financier du salon.

**Query params :**
- `period` : `today|week|month|year`
- `from`, `to` : période personnalisée

**Response 200 :**
```json
{
  "revenue": {
    "total": 247500,
    "by_method": {
      "mtn_momo": 125000,
      "orange_money": 75000,
      "cash": 47500
    }
  },
  "bookings": {
    "total": 89,
    "completed": 82,
    "cancelled": 4,
    "no_show": 3,
    "completion_rate": 92.1
  },
  "top_services": [
    { "name": "Tressage", "count": 34, "revenue": 102000 }
  ],
  "top_customers": [
    { "name": "Aminata K.", "visits": 6, "spent": 48000 }
  ]
}
```

---

## Abonnements

### GET `/api/subscriptions/current`
Abonnement actuel du salon.

### POST `/api/subscriptions/upgrade`
Changer de plan.

**Body :**
```json
{
  "plan": "premium",
  "billing_cycle": "monthly",
  "payment_method": "mtn_momo",
  "billing_phone": "237690000000"
}
```

### POST `/api/subscriptions/webhook`
Webhook CinetPay pour les renouvellements d'abonnement.

---

## Codes d'erreur

| Code | Description |
|---|---|
| `400` | Données invalides (body mal formé, champs manquants) |
| `401` | Non authentifié (token manquant ou expiré) |
| `403` | Accès refusé (ressource qui n'appartient pas au salon) |
| `404` | Ressource introuvable |
| `409` | Conflit (créneau déjà pris, slug déjà utilisé) |
| `422` | Données valides mais logique métier violée (plan limité dépassé, etc.) |
| `429` | Trop de requêtes (rate limiting) |
| `500` | Erreur serveur interne |

**Format d'erreur :**
```json
{
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.",
    "details": {}
  }
}
```

---

## Rate Limiting

| Route | Limite |
|---|---|
| POST `/api/public/bookings` | 5 req/min par IP |
| POST `/api/auth/*` | 10 req/min par IP |
| GET `/api/public/*` | 100 req/min par IP |
| Routes dashboard (auth) | 200 req/min par salon |
