# SalonPro — Documentation Générale

> **SaaS de réservation et gestion pour salons de coiffure, barbiers et instituts de beauté en Afrique francophone**

---

## Vue d'ensemble

SalonPro est une application SaaS B2B conçue pour les propriétaires de salons de coiffure, barbiers, spas et instituts de beauté en Afrique francophone (Cameroun, Côte d'Ivoire, Sénégal).

Elle résout 3 problèmes critiques :
1. **Réservations** — les clientes réservent en ligne 24h/24 sans appeler
2. **No-shows** — des rappels WhatsApp automatiques réduisent les absences de 35%
3. **Paiements** — encaissement via MTN MoMo, Orange Money et Wave directement depuis l'app

### Modèle économique
- Abonnement mensuel SaaS en FCFA (5 900 / 11 900 / 22 900 FCFA/mois)
- Frais d'installation unique : 15 000 FCFA
- Commission optionnelle sur paiements traités via la plateforme : 1-2%

### Marchés cibles
- Primaire : Cameroun (Douala, Yaoundé)
- Secondaire : Côte d'Ivoire (Abidjan), Sénégal (Dakar)
- Expansion : ensemble de l'Afrique francophone

---

## Structure de la documentation

```
salonpro/
├── README.md                  ← Ce fichier — vue d'ensemble
└── docs/
    ├── ARCHITECTURE.md        ← Architecture technique complète
    ├── DATABASE.md            ← Schéma base de données (Supabase/PostgreSQL)
    ├── API.md                 ← Documentation de toutes les routes API
    ├── BACKEND.md             ← Guide du développeur backend
    ├── PAYMENTS.md            ← Systèmes de paiement (MoMo, Orange, Wave)
    ├── WHATSAPP.md            ← Intégration WhatsApp Business API
    ├── AUTH.md                ← Authentification et sécurité
    └── ENVIRONMENT.md         ← Variables d'environnement complètes
```

---

## Stack technique

### Frontend (développé séparément)
| Technologie | Usage |
|---|---|
| Next.js 14 (App Router) | Framework React |
| TypeScript | Typage statique |
| TailwindCSS | Styles |
| Vercel | Hébergement |

### Backend (ton périmètre)
| Technologie | Usage |
|---|---|
| Supabase | Base de données PostgreSQL + Auth + Storage + Realtime |
| Supabase Edge Functions | Logique serveur (Deno/TypeScript) |
| CinetPay | Agrégateur paiements Mobile Money (Cameroun, CI, SN) |
| Twilio | WhatsApp Business API + SMS OTP |
| Resend | Emails transactionnels |

---

## Contacts projet

| Rôle | Responsabilité |
|---|---|
| Product Owner | Vision produit, design, frontend |
| **Backend Developer (toi)** | **Supabase, API, paiements, WhatsApp, sécurité** |

---

## Démarrage rapide

Voir [`docs/BACKEND.md`](docs/BACKEND.md) pour le guide complet de mise en place.

```bash
# Cloner le repo
git clone https://github.com/hepixbusiness-ops/salonpro

# Copier les variables d'environnement
cp .env.local.example .env.local

# Remplir les variables (voir docs/ENVIRONMENT.md)
# Puis démarrer le projet
npm install && npm run dev
```
