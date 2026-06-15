# Guide du Développeur Backend — SalonPro

Bienvenue sur le projet SalonPro. Ce guide est ton point d'entrée.

---

## Ton périmètre

Tu es responsable de tout ce qui tourne côté serveur :

| Domaine | Détail |
|---|---|
| **Base de données** | Supabase PostgreSQL : migrations, schema, RLS, triggers, indexes |
| **Edge Functions** | Logique métier serveur (rappels WhatsApp, paiements, cron) |
| **Paiements** | Intégration CinetPay (MTN MoMo, Orange Money, Wave) |
| **WhatsApp** | Intégration Twilio WhatsApp Business API |
| **Emails** | Intégration Resend (confirmations, factures) |
| **Sécurité** | RLS, vérification webhooks, rate limiting |
| **Performance** | Indexes, requêtes optimisées, pagination |

---

## Comptes à créer

Crée ces comptes avant de commencer. Récupère les clés API et mets-les dans `.env.local`.

### 1. Supabase (base de données + auth)
- Aller sur **supabase.com** → New Project
- Nom du projet : `salonpro`
- Région : Choisir la plus proche (Europe West ou US East pour de meilleures performances vers l'Afrique)
- Récupérer :
  - `SUPABASE_URL` → Settings → API → Project URL
  - `SUPABASE_ANON_KEY` → Settings → API → anon public
  - `SUPABASE_SERVICE_ROLE_KEY` → Settings → API → service_role (🚨 privé)

### 2. CinetPay (paiements Mobile Money)
- Aller sur **cinetpay.com** → S'inscrire comme marchand
- Documents requis : CNI + justificatif entreprise
- Délai validation : 2-5 jours ouvrés
- En attendant, utiliser le mode sandbox (test)
- Récupérer depuis le dashboard : `CINETPAY_API_KEY` + `CINETPAY_SITE_ID`

### 3. Twilio (WhatsApp + SMS)
- Aller sur **twilio.com** → S'inscrire
- Activer le Sandbox WhatsApp : Console → Messaging → Try it out → Send a WhatsApp message
- Récupérer : `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`

### 4. Resend (emails)
- Aller sur **resend.com** → S'inscrire
- Créer une clé API
- Vérifier le domaine `salonpro.africa` (ajouter les enregistrements DNS)

---

## Mise en place de l'environnement

### 1. Variables d'environnement

```bash
# Copier le fichier exemple
cp .env.local.example .env.local

# Remplir toutes les valeurs
nano .env.local
```

Voir [`docs/ENVIRONMENT.md`](ENVIRONMENT.md) pour la liste complète et la description de chaque variable.

### 2. Installer le CLI Supabase

```bash
npm install -g supabase

# Se connecter
supabase login

# Lier au projet
supabase link --project-ref VOTRE_PROJECT_REF
```

### 3. Appliquer les migrations

```bash
# Appliquer toutes les migrations en base
supabase db push

# Ou en développement local
supabase start  # Lance Supabase en local (Docker)
supabase db reset  # Recrée la base avec les migrations + seed
```

### 4. Déployer les Edge Functions

```bash
# Déployer toutes les fonctions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy send-whatsapp-reminder

# Tester une fonction en local
supabase functions serve send-whatsapp-reminder --env-file .env.local
```

---

## Structure des Edge Functions

```
supabase/
├── functions/
│   ├── send-whatsapp-reminder/
│   │   └── index.ts          # Rappels automatiques (cron horaire)
│   ├── payment-webhook/
│   │   └── index.ts          # Réception webhooks CinetPay
│   ├── initiate-payment/
│   │   └── index.ts          # Démarrer un paiement MoMo
│   ├── subscription-billing/
│   │   └── index.ts          # Facturation abonnements (cron quotidien)
│   ├── send-booking-confirmation/
│   │   └── index.ts          # Confirmation réservation cliente
│   └── daily-report/
│       └── index.ts          # Rapport quotidien WhatsApp au salon
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    ├── 003_triggers.sql
    ├── 004_indexes.sql
    ├── 005_cron_jobs.sql
    └── 006_seed_data.sql
```

---

## Ordre d'implémentation recommandé

### Semaine 1 — Base

**Priorité 1 : Schema base de données**
1. Créer toutes les migrations SQL (voir `docs/DATABASE.md`)
2. Appliquer les migrations sur Supabase
3. Configurer les RLS policies
4. Créer les triggers (`update_updated_at`, `update_customer_stats`)
5. Ajouter les indexes critiques

**Priorité 2 : Authentification**
1. Configurer Supabase Auth avec provider téléphone + OTP SMS
2. Activer le provider SMS (via Twilio dans les settings Supabase)
3. Tester le flow OTP complet

### Semaine 2 — API principale

**Priorité 3 : Routes API salons + bookings**
- Implémenter les endpoints de `docs/API.md`
- Focus : GET/POST/PATCH bookings, GET available slots
- Tester la vérification RLS (un salon ne peut pas voir les données d'un autre)

**Priorité 4 : Page réservation publique**
- Routes `GET /api/public/salons/:slug`
- Route `GET /api/public/salons/:slug/availability` avec calcul de disponibilité
- Route `POST /api/public/bookings`

### Semaine 3 — WhatsApp

**Priorité 5 : Intégration WhatsApp Twilio**
1. Créer les templates (voir `docs/WHATSAPP.md`)
2. Soumettre pour approbation Meta
3. En attendant, tester avec le sandbox
4. Edge Function `send-booking-confirmation`
5. Edge Function `send-whatsapp-reminder` + cron pg_cron

### Semaine 4 — Paiements

**Priorité 6 : Intégration CinetPay**
1. Tester en mode sandbox
2. Edge Function `initiate-payment`
3. Edge Function `payment-webhook` avec vérification signature
4. Edge Function `subscription-billing` + cron quotidien
5. Tests de bout en bout : initier un paiement → recevoir le webhook → mise à jour base

### Semaine 5 — Finalisation

**Priorité 7 : Emails (Resend)**
- Confirmation de réservation (email de backup au WhatsApp)
- Facture d'abonnement en PDF

**Priorité 8 : Monitoring et sécurité**
- Rate limiting sur les routes publiques
- Logs des erreurs critiques
- Tests des scénarios d'échec (paiement refusé, WhatsApp non délivré)

---

## Points d'attention critiques

### Gestion des fuseaux horaires
- Toutes les dates en base sont stockées en **UTC**
- L'affichage se fait en heure locale (`Africa/Douala` = UTC+1, `Africa/Abidjan` = UTC+0)
- Les créneaux disponibles doivent être calculés en heure locale du salon

```typescript
// Convertir une date en heure locale du salon
import { formatInTimeZone } from 'date-fns-tz'

const timezone = 'Africa/Douala' // à mettre dans la table salons
const localTime = formatInTimeZone(new Date(booking.starts_at), timezone, 'dd/MM/yyyy HH:mm')
```

### Calcul de disponibilité des créneaux
C'est l'algorithme le plus complexe de l'application.

```sql
-- Récupérer les créneaux occupés pour une journée / un staff
SELECT starts_at, ends_at
FROM bookings
WHERE staff_id = $staff_id
  AND status NOT IN ('cancelled', 'no_show')
  AND starts_at::date = $date
ORDER BY starts_at;
```

Puis côté application, générer les créneaux disponibles toutes les 30 minutes entre `working_hours.start_time` et `working_hours.end_time`, en soustrayant les créneaux déjà pris + la durée du service demandé.

### Idempotence des webhooks
CinetPay peut envoyer le même webhook plusieurs fois (en cas de timeout de notre côté). Toujours vérifier si la transaction est déjà traitée :

```typescript
const existing = await supabase
  .from('payments')
  .select('status')
  .eq('provider_ref', transaction_id)
  .single()

if (existing.status === 'completed') {
  return new Response('OK', { status: 200 }) // déjà traité, ignorer
}
```

### Numéros de téléphone
Les numéros sont stockés sans `+` ni `00` en base (format national simplifié) :
- Cameroun : `237690000000`
- Côte d'Ivoire : `2250700000000`
- Sénégal : `221701234567`

La normalisation se fait à l'entrée (lors de la création du customer).

---

## Tests

### Structure des tests
```
tests/
├── unit/
│   ├── availability.test.ts    # Calcul des créneaux disponibles
│   ├── payments.test.ts        # Logique paiement
│   └── whatsapp.test.ts        # Templates WhatsApp
└── integration/
    ├── bookings.test.ts         # Flow réservation complet
    └── webhooks.test.ts         # Simulation webhooks CinetPay
```

### Tester les webhooks CinetPay en local

```bash
# Installer ngrok pour exposer localhost
npm install -g ngrok
ngrok http 3000

# Configurer l'URL de webhook dans le dashboard CinetPay
# avec l'URL ngrok : https://xxxx.ngrok.io/api/payments/webhook
```

---

## Questions / Support

Pour toute question sur la logique métier ou le produit, contacter le Product Owner.  
Pour les questions techniques backend, documenter dans ce fichier.

**Ressources utiles :**
- [Supabase Docs](https://supabase.com/docs)
- [CinetPay Docs](https://docs.cinetpay.com)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Resend Docs](https://resend.com/docs)
- [Architecture SalonPro](ARCHITECTURE.md)
- [Schéma base de données](DATABASE.md)
- [API complète](API.md)
- [Paiements](PAYMENTS.md)
- [WhatsApp](WHATSAPP.md)
