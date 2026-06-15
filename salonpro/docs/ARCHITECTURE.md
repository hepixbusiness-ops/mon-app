# Architecture Technique — SalonPro

## Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  Propriétaire salon (Dashboard)  │  Cliente finale (Booking)    │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                            │
│              Next.js 14 + TypeScript + TailwindCSS               │
│                                                                  │
│  /app/(dashboard)/*     →  Interface propriétaire salon          │
│  /app/(public)/[slug]   →  Page réservation publique             │
│  /app/(auth)/*          →  Login / Register                      │
│  /app/api/*             →  Route handlers (API interne)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Supabase)                           │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ PostgreSQL  │  │  Auth (JWT)  │  │  Storage (fichiers)    │ │
│  │  Database   │  │  + OTP SMS   │  │  photos salons/avatars │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Edge Functions (Deno/TypeScript)               ││
│  │                                                             ││
│  │  send-whatsapp-reminder   →  Rappels RDV automatiques       ││
│  │  process-payment          →  Initier paiement MoMo          ││
│  │  payment-webhook          →  Confirmer paiements reçus      ││
│  │  subscription-billing     →  Facturer abonnements SaaS      ││
│  │  send-booking-confirm     →  Confirmation réservation       ││
│  │  daily-report             →  Rapport quotidien WhatsApp     ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────┬──────────────────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
┌──────────────────┐ ┌────────────────┐ ┌─────────────┐
│    CinetPay      │ │    Twilio      │ │   Resend    │
│                  │ │                │ │             │
│ MTN MoMo         │ │ WhatsApp API   │ │ Emails      │
│ Orange Money     │ │ SMS OTP        │ │ Factures    │
│ Wave             │ │ Rappels SMS    │ │ Newsletters │
└──────────────────┘ └────────────────┘ └─────────────┘
```

---

## Flux de données principaux

### 1. Réservation en ligne (flux critique)

```
Cliente ouvre lien → Page publique [slug]
        ↓
Sélectionne service + coiffeuse + créneau
        ↓
Soumet formulaire (prénom + numéro WhatsApp)
        ↓
POST /api/bookings
        ↓
Supabase : insert booking (status = 'pending')
        ↓
Edge Function : send-booking-confirm
        ↓
Twilio WhatsApp → Message confirmation à la cliente
        ↓
Supabase Realtime → Notification temps réel au dashboard propriétaire
        ↓
Propriétaire voit la réservation apparaître en live
```

### 2. Rappel automatique (flux cron)

```
Cron Supabase (toutes les heures)
        ↓
Edge Function : send-whatsapp-reminder
        ↓
SELECT bookings WHERE starts_at BETWEEN now()+22h AND now()+26h
   AND status = 'confirmed'
   AND reminder_sent_at IS NULL
        ↓
Pour chaque RDV → Twilio WhatsApp → Message rappel cliente
        ↓
UPDATE booking SET reminder_sent_at = now()
```

### 3. Paiement Mobile Money (flux paiement)

```
Propriétaire clique [Encaisser] → choisit MoMo
        ↓
POST /api/payments/initiate
        ↓
Edge Function → CinetPay API → Demande de paiement push
        ↓
CinetPay envoie notification USSD au téléphone cliente
        ↓
Cliente confirme avec son PIN
        ↓
CinetPay → Webhook POST /api/payments/webhook
        ↓
Supabase : update payment (status = 'completed')
        ↓
Supabase Realtime → Dashboard mis à jour
        ↓
Twilio WhatsApp → Reçu envoyé à la cliente
```

### 4. Abonnement SaaS (facturation récurrente)

```
Cron mensuel (J-3 avant expiration)
        ↓
Edge Function : subscription-billing
        ↓
SELECT salons WHERE subscription_ends_at BETWEEN now() AND now()+3days
        ↓
CinetPay → Demande paiement push vers numéro MoMo du salon
        ↓
Propriétaire paie
        ↓
Webhook → UPDATE subscription (ends_at + 30 jours)
        ↓
Resend → Facture PDF par email
```

---

## Architecture Supabase

### Row Level Security (RLS)

Chaque salon ne peut voir et modifier que ses propres données. Les policies RLS sont appliquées sur toutes les tables.

```sql
-- Exemple policy : un salon ne voit que ses propres bookings
CREATE POLICY "salon_sees_own_bookings" ON bookings
  FOR ALL USING (salon_id = auth.uid());
```

### Realtime

Les tables `bookings` et `payments` ont Realtime activé pour que le dashboard se mette à jour instantanément sans polling.

### Storage

Buckets Supabase Storage :
- `salon-covers` — photos de couverture des salons (public)
- `salon-logos` — logos des salons (public)
- `staff-avatars` — photos des coiffeuses (public)
- `invoices` — factures PDF générées (privé, accès salon uniquement)

---

## Sécurité

| Couche | Mécanisme |
|---|---|
| Authentification | Supabase Auth (JWT) + OTP SMS via Twilio |
| Autorisation | Row Level Security PostgreSQL |
| API | Vérification JWT sur chaque route API |
| Webhooks | Signature HMAC vérifiée (CinetPay + Twilio) |
| Données | Chiffrement au repos (Supabase par défaut) |
| Transport | HTTPS uniquement (TLS 1.3) |
| Secrets | Variables d'environnement (jamais dans le code) |

---

## Performance

- **Indexes** sur `salon_id`, `starts_at`, `status`, `customer_id` dans la table `bookings`
- **Pagination** sur toutes les listes (limit 50 par défaut)
- **Caching** : pages publiques [slug] cachées 60s sur Vercel Edge
- **Realtime** : uniquement sur les tables nécessaires (bookings, payments)
- **Images** : optimisées via Next.js Image + Supabase Storage CDN

---

## Environnements

| Env | URL | Base de données | Usage |
|---|---|---|---|
| Development | localhost:3000 | Supabase local ou projet dev | Développement quotidien |
| Staging | staging.salonpro.africa | Supabase projet staging | Tests avant prod |
| Production | salonpro.africa | Supabase projet prod | Clients réels |
