# Variables d'environnement — SalonPro

## Instructions

```bash
# 1. Copier le fichier exemple
cp .env.local.example .env.local

# 2. Remplir TOUTES les variables
# 3. Ne jamais commiter .env.local (il est dans .gitignore)
# 4. Pour la production, les ajouter dans Vercel Dashboard → Settings → Environment Variables
```

---

## Liste complète des variables

### SUPABASE

| Variable | Obligatoire | Description | Où la trouver |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL de l'API Supabase | Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé publique (utilisée côté client) | Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clé privée (Edge Functions uniquement) | Dashboard → Settings → API → service_role |
| `SUPABASE_DB_PASSWORD` | ✅ | Mot de passe PostgreSQL | Défini lors de la création du projet |
| `SUPABASE_PROJECT_REF` | ✅ | Référence du projet (pour le CLI) | Extrait de l'URL : `https://[REF].supabase.co` |

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=motdepasse_fort_ici
SUPABASE_PROJECT_REF=abcdefghij
```

---

### CINETPAY (Paiements Mobile Money)

| Variable | Obligatoire | Description |
|---|---|---|
| `CINETPAY_API_KEY` | ✅ | Clé API CinetPay |
| `CINETPAY_SITE_ID` | ✅ | Identifiant du site marchand |
| `CINETPAY_WEBHOOK_SECRET` | ✅ | Secret pour vérifier les signatures webhook |
| `CINETPAY_MODE` | ✅ | `TEST` en dev, `PROD` en production |
| `CINETPAY_BASE_URL` | ✅ | URL de l'API CinetPay |

```bash
CINETPAY_API_KEY=cl_sandbox_XXXXXXXXXXXXXXXX
CINETPAY_SITE_ID=123456789
CINETPAY_WEBHOOK_SECRET=secret_webhook_fort
CINETPAY_MODE=TEST
CINETPAY_BASE_URL=https://api-checkout.cinetpay.com/v2
```

> **Note :** En mode `TEST`, utiliser les numéros de test CinetPay :
> - MTN MoMo test : `0700000000`
> - Orange Money test : `0600000000`

---

### TWILIO (WhatsApp + SMS)

| Variable | Obligatoire | Description |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | ✅ | SID du compte Twilio |
| `TWILIO_AUTH_TOKEN` | ✅ | Token d'authentification Twilio |
| `TWILIO_WHATSAPP_FROM` | ✅ | Numéro WhatsApp expéditeur |
| `TWILIO_SMS_FROM` | ✅ | Numéro SMS (fallback et OTP) |

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token_twilio
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
# En production, remplacer par votre numéro WhatsApp Business approuvé
TWILIO_SMS_FROM=+12345678901
```

---

### RESEND (Emails)

| Variable | Obligatoire | Description |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Clé API Resend |
| `RESEND_FROM_EMAIL` | ✅ | Email expéditeur (doit être vérifié) |
| `RESEND_FROM_NAME` | ✅ | Nom affiché dans l'email |

```bash
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RESEND_FROM_EMAIL=noreply@salonpro.africa
RESEND_FROM_NAME=SalonPro
```

---

### APPLICATION

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | URL publique de l'application |
| `NEXT_PUBLIC_APP_NAME` | ✅ | Nom de l'application |
| `NEXTAUTH_SECRET` | ✅ | Secret pour chiffrer les sessions |

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
# En production : https://salonpro.africa
NEXT_PUBLIC_APP_NAME=SalonPro
NEXTAUTH_SECRET=une_chaine_aleatoire_tres_longue_minimum_32_caracteres
```

> Générer `NEXTAUTH_SECRET` avec : `openssl rand -base64 32`

---

## Fichier `.env.local.example` complet

```bash
# ============================================================
# SALONPRO — Variables d'environnement
# Copier ce fichier : cp .env.local.example .env.local
# Ne JAMAIS commiter .env.local
# ============================================================

# ---- SUPABASE ----
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=
SUPABASE_PROJECT_REF=

# ---- CINETPAY (MTN MoMo + Orange Money + Wave) ----
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_WEBHOOK_SECRET=
CINETPAY_MODE=TEST
CINETPAY_BASE_URL=https://api-checkout.cinetpay.com/v2

# ---- TWILIO (WhatsApp + SMS) ----
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=

# ---- RESEND (Emails) ----
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@salonpro.africa
RESEND_FROM_NAME=SalonPro

# ---- APPLICATION ----
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SalonPro
NEXTAUTH_SECRET=
```

---

## Variables par environnement

| Variable | Development | Staging | Production |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://staging.salonpro.africa` | `https://salonpro.africa` |
| `CINETPAY_MODE` | `TEST` | `TEST` | `PROD` |
| `TWILIO_WHATSAPP_FROM` | Sandbox | Sandbox | Numéro prod |
| `SUPABASE_URL` | Local ou projet dev | Projet staging | Projet prod |

---

## Sécurité

- `SUPABASE_SERVICE_ROLE_KEY` — **Ne jamais exposer côté client**. Uniquement dans les Edge Functions et les routes API serveur.
- `CINETPAY_WEBHOOK_SECRET` — Utilisé pour vérifier que les webhooks viennent bien de CinetPay
- `NEXTAUTH_SECRET` — Minimum 32 caractères aléatoires
- En production : ajouter les variables dans **Vercel Dashboard** → Settings → Environment Variables (et non dans un fichier)
