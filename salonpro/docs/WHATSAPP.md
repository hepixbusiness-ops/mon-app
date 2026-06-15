# Intégration WhatsApp — SalonPro

## Pourquoi WhatsApp est critique

WhatsApp est le canal de communication numéro 1 en Afrique subsaharienne. Dans le contexte de SalonPro :
- Les clientes **préfèrent WhatsApp** aux SMS et emails
- Les rappels WhatsApp ont un taux d'ouverture de **98%** vs 20-30% pour les emails
- Les propriétaires de salon **gèrent déjà leur business** sur WhatsApp
- Pas d'app supplémentaire à installer pour les clientes

---

## Fournisseur : Twilio WhatsApp Business API

**Pourquoi Twilio ?**
- API mature, fiable, bien documentée
- Sandbox gratuite pour les tests
- Templates approuvés par Meta (obligatoire pour les messages initiés par l'entreprise)
- Fallback SMS automatique si WhatsApp non disponible

**Docs :** https://www.twilio.com/docs/whatsapp  
**Console :** https://console.twilio.com

---

## Types de messages

### ⚠️ Distinction importante Meta/WhatsApp

| Type | Quand | Approbation Meta requise |
|---|---|---|
| **Template (HSM)** | Message initié par SalonPro (rappels, confirmations) | ✅ OUI — doit être pré-approuvé |
| **Session message** | Réponse à un message reçu d'une cliente (fenêtre 24h) | ❌ NON — message libre |

**Règle :** Si c'est nous qui envoyons le premier message → utiliser un template approuvé.

---

## Templates à créer et faire approuver

### Template 1 : Confirmation de réservation

**Nom :** `booking_confirmation`  
**Langue :** Français  
**Catégorie :** UTILITY

```
Bonjour {{1}} ! ✅

Votre rendez-vous chez *{{2}}* est confirmé.

📅 {{3}} à {{4}}
💆 Service : {{5}}
👩 Avec : {{6}}
💰 Prix : {{7}} FCFA

Pour annuler, répondez ANNULER à ce message.

À bientôt ! 💜
```

**Variables :**
1. Prénom cliente
2. Nom du salon
3. Date (ex: Samedi 14 juin)
4. Heure (ex: 10h30)
5. Service (ex: Coiffure simple)
6. Nom coiffeuse
7. Prix

---

### Template 2 : Rappel J-1

**Nom :** `booking_reminder_24h`  
**Langue :** Français  
**Catégorie :** UTILITY

```
Rappel 🔔

Bonjour {{1}} !

N'oubliez pas votre rendez-vous demain chez *{{2}}*.

📅 {{3}} à {{4}}
💆 {{5}}

En cas d'empêchement, merci de nous prévenir. 
Répondez ANNULER pour annuler.

À demain ! 💜
```

---

### Template 3 : Rappel H-2

**Nom :** `booking_reminder_2h`  
**Langue :** Français  
**Catégorie :** UTILITY

```
⏰ Votre rendez-vous est dans 2 heures !

Bonjour {{1}}, nous vous attendons à *{{2}}* à {{3}}.

À tout à l'heure ! 💜
```

---

### Template 4 : Reçu de paiement

**Nom :** `payment_receipt`  
**Langue :** Français  
**Catégorie :** UTILITY

```
Reçu de paiement ✅

Bonjour {{1}},

Votre paiement de *{{2}} FCFA* a bien été reçu chez {{3}}.

🧾 Service : {{4}}
📅 Date : {{5}}
💳 Moyen : {{6}}
🔖 Ref : {{7}}

Merci pour votre visite ! 💜
```

---

### Template 5 : Annulation par le salon

**Nom :** `booking_cancelled_by_salon`  
**Langue :** Français  
**Catégorie :** UTILITY

```
Annulation de rendez-vous ❌

Bonjour {{1}},

Nous sommes désolés, votre rendez-vous du {{2}} à {{3}} chez *{{4}}* a dû être annulé.

Raison : {{5}}

Pour reprendre rendez-vous : {{6}}

Toutes nos excuses. 💜
```

---

## Implémentation backend

### Service d'envoi WhatsApp

```typescript
// lib/whatsapp.ts

import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM
// Format : 'whatsapp:+14155238886' (sandbox) ou votre numéro approuvé

interface SendWhatsAppParams {
  to: string           // numéro du destinataire (ex: '237690000000')
  templateName: string
  variables: string[]
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  variables
}: SendWhatsAppParams) {
  // Formater le numéro
  const formattedTo = formatPhoneNumber(to)
  
  // Construire le message depuis le template
  const body = buildTemplateMessage(templateName, variables)
  
  try {
    const message = await client.messages.create({
      from: WHATSAPP_FROM,
      to: `whatsapp:${formattedTo}`,
      body,
    })
    
    // Logger dans la table notifications
    await supabase.from('notifications').insert({
      type: templateName,
      channel: 'whatsapp',
      recipient: formattedTo,
      status: 'sent',
      provider_ref: message.sid,
    })
    
    return { success: true, sid: message.sid }
    
  } catch (error) {
    // Fallback SMS si WhatsApp échoue
    await sendSMSFallback({ to: formattedTo, body })
    
    await supabase.from('notifications').insert({
      type: templateName,
      channel: 'whatsapp',
      recipient: formattedTo,
      status: 'failed',
      error_message: error.message,
    })
    
    throw error
  }
}

function formatPhoneNumber(phone: string): string {
  // Retirer les espaces et tirets
  const clean = phone.replace(/[\s\-]/g, '')
  
  // Si commence par 00237, remplacer par +237
  if (clean.startsWith('00237')) return `+${clean.slice(2)}`
  
  // Si commence par 237 sans +, ajouter +
  if (clean.startsWith('237') && !clean.startsWith('+')) return `+${clean}`
  
  // Si commence par 6 (numéro local Cameroun), ajouter +237
  if (clean.startsWith('6') && clean.length === 9) return `+237${clean}`
  
  return clean.startsWith('+') ? clean : `+${clean}`
}
```

---

### Edge Function : send-whatsapp-reminder

```typescript
// supabase/functions/send-whatsapp-reminder/index.ts
// Déclenchée par pg_cron toutes les heures

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const now = new Date()
  
  // ---- RAPPELS J-1 (22h à 26h avant le RDV) ----
  const reminder24hStart = new Date(now.getTime() + 22 * 60 * 60 * 1000)
  const reminder24hEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000)
  
  const { data: bookings24h } = await supabase
    .from('bookings')
    .select(`
      *,
      customers(name, phone),
      staff(name),
      services(name),
      salons(name, phone)
    `)
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gte('starts_at', reminder24hStart.toISOString())
    .lte('starts_at', reminder24hEnd.toISOString())
  
  for (const booking of bookings24h ?? []) {
    await sendWhatsAppTemplate({
      to: booking.customers.phone,
      templateName: 'booking_reminder_24h',
      variables: [
        booking.customers.name,
        booking.salons.name,
        formatDate(booking.starts_at),
        formatTime(booking.starts_at),
        booking.services.name,
      ]
    })
    
    await supabase
      .from('bookings')
      .update({ reminder_sent_at: now.toISOString() })
      .eq('id', booking.id)
  }
  
  // ---- RAPPELS H-2 (1h45 à 2h15 avant le RDV) ----
  const reminder2hStart = new Date(now.getTime() + 105 * 60 * 1000)
  const reminder2hEnd = new Date(now.getTime() + 135 * 60 * 1000)
  
  const { data: bookings2h } = await supabase
    .from('bookings')
    .select(`*, customers(name, phone), salons(name)`)
    .eq('status', 'confirmed')
    .gte('starts_at', reminder2hStart.toISOString())
    .lte('starts_at', reminder2hEnd.toISOString())
  
  for (const booking of bookings2h ?? []) {
    await sendWhatsAppTemplate({
      to: booking.customers.phone,
      templateName: 'booking_reminder_2h',
      variables: [
        booking.customers.name,
        booking.salons.name,
        formatTime(booking.starts_at),
      ]
    })
  }
  
  return new Response(JSON.stringify({ 
    sent_24h: bookings24h?.length ?? 0,
    sent_2h: bookings2h?.length ?? 0
  }))
})
```

---

### Configuration cron dans Supabase

```sql
-- Activer pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Lancer la fonction de rappels toutes les heures
SELECT cron.schedule(
  'send-whatsapp-reminders',
  '0 * * * *',  -- Toutes les heures
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-whatsapp-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )
  $$
);

-- Lancer la facturation des abonnements tous les jours à 9h UTC
SELECT cron.schedule(
  'subscription-billing',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/subscription-billing',
    ...
  )
  $$
);
```

---

## Sandbox pour les tests

Pendant le développement, utiliser le **Sandbox WhatsApp Twilio** :

1. Aller sur console.twilio.com → WhatsApp → Sandbox
2. Envoyer `join [mot-code]` depuis ton propre WhatsApp au +1 415 523 8886
3. Tu peux alors envoyer/recevoir des messages WhatsApp en mode test
4. Le numéro `from` en sandbox : `whatsapp:+14155238886`

**Important :** En sandbox, pas besoin de templates approuvés — tu peux envoyer des messages libres.

---

## Passage en production

1. Soumettre les templates via console.twilio.com → WhatsApp → Templates
2. Délai d'approbation Meta : 24-72h
3. Acheter un numéro WhatsApp Business dédié (optionnel) ou utiliser le numéro Twilio partagé
4. Changer `TWILIO_WHATSAPP_FROM` vers le numéro de production

---

## Variables d'environnement requises

```bash
TWILIO_ACCOUNT_SID=         # ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=          # Depuis console.twilio.com
TWILIO_WHATSAPP_FROM=       # whatsapp:+14155238886 (sandbox) ou numéro prod
TWILIO_SMS_FROM=            # +1XXXXXXXXXX (numéro SMS Twilio pour le fallback)
```
