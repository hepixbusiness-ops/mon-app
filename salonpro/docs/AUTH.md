# Authentification & Sécurité — SalonPro

## Système d'authentification

SalonPro utilise **Supabase Auth** avec authentification par **numéro de téléphone + OTP SMS**.

### Pourquoi téléphone + OTP (pas email + mot de passe) ?
- Les propriétaires de salon ont tous un téléphone, pas forcément un email
- Pas de mot de passe à oublier → moins de friction
- OTP via SMS = familier pour le marché africain (Mobile Money utilise le même principe)
- Sécurité équivalente à un mot de passe fort

---

## Flow d'authentification

```
1. Utilisateur entre son numéro de téléphone
       ↓
2. Supabase Auth → Twilio → Envoie OTP SMS (6 chiffres)
       ↓
3. Utilisateur entre le code reçu
       ↓
4. Supabase Auth valide → Génère JWT (access_token + refresh_token)
       ↓
5. JWT stocké en cookie httpOnly (Next.js)
       ↓
6. Chaque requête API inclut le JWT en Bearer token
       ↓
7. Supabase RLS vérifie auth.uid() sur chaque requête base de données
```

---

## Configuration Supabase Auth

### Activer le provider téléphone

Dans **Supabase Dashboard → Authentication → Providers → Phone** :
1. Activer le provider
2. Choisir SMS provider : **Twilio**
3. Renseigner : Account SID, Auth Token, From number
4. Message template OTP : `Votre code SalonPro : {{.Token}}. Valide 10 minutes.`
5. Durée de validité : 10 minutes
6. Nombre max d'essais : 3

### Paramètres de session

```
Session expiry : 7 jours (renouvelé automatiquement)
Refresh token rotation : activée
Refresh token reuse interval : 10 secondes
```

---

## Utilisation dans le code

### Côté client (Next.js)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Envoi de l'OTP
const supabase = createClient()
const { error } = await supabase.auth.signInWithOtp({
  phone: '+237690000000',
})

// Vérification du code
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+237690000000',
  token: '123456',
  type: 'sms',
})
```

### Côté serveur (Route API / Edge Functions)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Récupérer l'utilisateur connecté dans une route API
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Non authentifié')
  return user
}

// Récupérer le salon de l'utilisateur connecté
export async function getCurrentSalon() {
  const supabase = createClient()
  const user = await getCurrentUser()
  
  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!salon) throw new Error('Salon introuvable')
  return salon
}
```

---

## Row Level Security (RLS)

Le RLS est la première ligne de défense. **Toutes les tables ont RLS activé.**

### Principe
```sql
-- Chaque propriétaire de salon ne voit que ses données
-- auth.uid() = l'ID de l'utilisateur connecté (extrait du JWT)

-- Exemple sur la table bookings
CREATE POLICY "salon_access_only" ON bookings
  FOR ALL                              -- SELECT, INSERT, UPDATE, DELETE
  USING (                              -- condition pour lire
    salon_id IN (
      SELECT id FROM salons WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (                         -- condition pour écrire
    salon_id IN (
      SELECT id FROM salons WHERE user_id = auth.uid()
    )
  );
```

### Exception : données publiques

La page de réservation publique (`/[slug]`) doit lire les données **sans authentification** :

```sql
-- Services : lecture publique pour les services actifs
CREATE POLICY "services_public_read" ON services
  FOR SELECT
  USING (is_active = true);

-- Salons : lecture publique des infos de base
CREATE POLICY "salons_public_read" ON salons
  FOR SELECT
  USING (is_active = true);

-- Staff : lecture publique (pour choisir la coiffeuse)
CREATE POLICY "staff_public_read" ON staff
  FOR SELECT
  USING (is_active = true);

-- Bookings : insertion publique (nouvelle réservation)
-- Mais PAS de lecture publique des réservations existantes
CREATE POLICY "bookings_public_insert" ON bookings
  FOR INSERT
  WITH CHECK (true);  -- validation faite dans la logique applicative
```

---

## Protection des routes (middleware Next.js)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* ... */ } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Routes du dashboard → doivent être authentifiées
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Routes auth → si déjà connecté, rediriger vers dashboard
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
```

---

## Sécurité des webhooks

Tous les webhooks entrants (CinetPay, Twilio) doivent être vérifiés.

### Vérification signature CinetPay

```typescript
import crypto from 'crypto'

export function verifyCinetPayWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  // Comparaison en temps constant (évite timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSig, 'hex')
  )
}
```

### Vérification signature Twilio (SMS/WhatsApp callbacks)

```typescript
import twilio from 'twilio'

export function verifyTwilioWebhook(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  return twilio.validateRequest(authToken, signature, url, params)
}
```

---

## Rate Limiting

Protéger les routes publiques contre les abus.

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requêtes par minute
})

export async function rateLimitPublicBooking(ip: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    throw new Error(`Trop de demandes. Réessayez dans ${Math.ceil((reset - Date.now()) / 1000)} secondes.`)
  }
}
```

> Note : Upstash Redis est optionnel en début de projet. Peut être remplacé par un simple compteur en mémoire pour les premiers mois.

---

## Checklist sécurité avant mise en production

```
□ SUPABASE_SERVICE_ROLE_KEY jamais exposé côté client
□ RLS activé sur toutes les tables
□ Policies RLS testées (tenter d'accéder aux données d'un autre salon = erreur)
□ Webhooks CinetPay vérifiés par signature HMAC
□ Webhooks Twilio vérifiés par signature
□ Rate limiting sur POST /api/public/bookings
□ Rate limiting sur POST /api/auth/*
□ HTTPS forcé partout (Vercel le fait par défaut)
□ Variables d'environnement dans Vercel, pas dans le code
□ .env.local dans .gitignore
□ Logs ne contenant pas de données sensibles (numéros complets, tokens)
```
