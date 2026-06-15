# Systèmes de paiement — SalonPro

## Vue d'ensemble

SalonPro gère **2 types de paiements distincts** :

| Type | Description | Opérateur |
|---|---|---|
| **Paiements prestations** | Clientes paient les services (coiffure, etc.) | CinetPay (MoMo, Orange, Wave) |
| **Abonnements SaaS** | Salons paient leur abonnement mensuel/annuel | CinetPay (MoMo, Orange, Wave) |

---

## Opérateur principal : CinetPay

**Pourquoi CinetPay ?**
- Agrège MTN MoMo + Orange Money + Wave en **une seule API**
- Couvre Cameroun, Côte d'Ivoire, Sénégal, Burkina Faso, Mali, Togo
- Documentation en français
- Dashboard de réconciliation intégré
- Webhook fiable avec signature HMAC

**Site :** https://cinetpay.com  
**Documentation API :** https://docs.cinetpay.com  
**Dashboard :** https://app.cinetpay.com

### Inscription CinetPay
1. Aller sur cinetpay.com → Créer un compte marchand
2. Remplir les informations de l'entreprise
3. Fournir les documents KYC (CNI, justificatif domicile)
4. Recevoir `APIKEY` et `SITE_ID` après validation (2-5 jours ouvrés)
5. Tester en sandbox avant la mise en production

---

## Flux 1 — Paiement d'une prestation

### Scénario
Le propriétaire du salon encaisse la cliente pour une prestation.

### Étape 1 : Initier le paiement (depuis le dashboard)

**Endpoint :** `POST /api/payments/initiate`

**Body :**
```json
{
  "booking_id": "uuid-du-rdv",
  "amount": 8000,
  "currency": "XAF",
  "method": "mtn_momo",
  "customer_phone": "237690000000",
  "description": "Défrisage - Salon Prestige"
}
```

**Logique backend :**
```typescript
// Edge Function : initiate-payment

import { createClient } from '@supabase/supabase-js'

export async function initiatePayment(req: Request) {
  const { booking_id, amount, method, customer_phone, description } = await req.json()
  
  // 1. Vérifier que le booking appartient bien au salon authentifié
  const booking = await supabase
    .from('bookings')
    .select('*, salons(*)')
    .eq('id', booking_id)
    .single()
  
  // 2. Générer un transaction_id unique
  const transaction_id = `SP_${Date.now()}_${booking_id.slice(0, 8)}`
  
  // 3. Créer l'enregistrement en base (status = pending)
  const payment = await supabase.from('payments').insert({
    booking_id,
    salon_id: booking.salon_id,
    amount,
    method,
    status: 'pending',
    provider_ref: transaction_id
  }).select().single()
  
  // 4. Appeler l'API CinetPay
  const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: Deno.env.get('CINETPAY_API_KEY'),
      site_id: Deno.env.get('CINETPAY_SITE_ID'),
      transaction_id,
      amount,
      currency: 'XAF',
      description,
      customer_phone_number: customer_phone,
      channels: mapMethodToChannel(method), // 'MOBILE_MONEY' ou 'ALL'
      notify_url: `${Deno.env.get('APP_URL')}/api/payments/webhook`,
      return_url: `${Deno.env.get('APP_URL')}/dashboard/paiements`,
      lang: 'FR',
      customer_name: booking.customers?.name ?? '',
      customer_surname: '',
      customer_email: booking.customers?.email ?? '',
    })
  })
  
  const result = await cinetpayResponse.json()
  
  // 5. Retourner le payment_url ou le statut
  return new Response(JSON.stringify({
    payment_id: payment.id,
    payment_url: result.data?.payment_url,
    transaction_id
  }))
}

function mapMethodToChannel(method: string): string {
  const map: Record<string, string> = {
    'mtn_momo': 'MOBILE_MONEY',
    'orange_money': 'MOBILE_MONEY',
    'wave': 'MOBILE_MONEY',
    'card': 'CREDIT_CARD',
  }
  return map[method] ?? 'ALL'
}
```

---

### Étape 2 : Réception du webhook CinetPay

**Endpoint :** `POST /api/payments/webhook`

> ⚠️ **CRITIQUE** : Toujours vérifier la signature du webhook avant tout traitement.

```typescript
// Edge Function : payment-webhook

export async function paymentWebhook(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-cinetpay-signature')
  
  // 1. Vérifier la signature HMAC
  const expectedSignature = await computeHMAC(body, Deno.env.get('CINETPAY_WEBHOOK_SECRET'))
  if (signature !== expectedSignature) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const data = JSON.parse(body)
  
  // 2. Récupérer la transaction en base
  const payment = await supabase
    .from('payments')
    .select('*')
    .eq('provider_ref', data.cpm_trans_id)
    .single()
  
  // 3. Mapper le statut CinetPay vers notre statut
  const statusMap: Record<string, string> = {
    'ACCEPTED': 'completed',
    'REFUSED': 'failed',
    'CANCELLED': 'failed',
    'ERROR': 'failed',
  }
  
  const newStatus = statusMap[data.cpm_result] ?? 'pending'
  
  // 4. Mettre à jour en base
  await supabase.from('payments').update({
    status: newStatus,
    paid_at: newStatus === 'completed' ? new Date().toISOString() : null,
    provider_data: data
  }).eq('id', payment.id)
  
  // 5. Si paiement réussi → envoyer reçu WhatsApp
  if (newStatus === 'completed') {
    await sendWhatsAppReceipt(payment)
    
    // Mettre à jour le statut du booking
    await supabase.from('bookings').update({
      status: 'completed'
    }).eq('id', payment.booking_id)
  }
  
  // CinetPay attend un HTTP 200 pour confirmer réception
  return new Response('OK', { status: 200 })
}
```

---

## Flux 2 — Abonnement SaaS (facturation récurrente)

### Modèle tarifaire

| Plan | Mensuel (XAF) | Annuel (XAF) | Économie |
|---|---|---|---|
| Essentiel | 5 900 | 59 000 | -2 mois |
| Pro | 11 900 | 119 000 | -2 mois |
| Premium | 22 900 | 229 000 | -2 mois |
| Installation (one-time) | 15 000 | — | — |

### Cron de facturation (J-3 avant expiration)

```typescript
// Edge Function : subscription-billing
// Déclenchée par pg_cron tous les jours à 9h UTC

export async function subscriptionBilling() {
  // Trouver les salons qui expirent dans 3 jours
  const { data: expiringSalons } = await supabase
    .from('salons')
    .select('*, subscriptions(*)')
    .eq('is_active', true)
    .neq('subscription_plan', 'trial')
    .lt('subscription_ends_at', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
    .gt('subscription_ends_at', new Date().toISOString())
  
  for (const salon of expiringSalons) {
    const plan = salon.subscription_plan
    const amount = PLAN_PRICES[plan]
    
    // Initier le paiement push MoMo vers le numéro de facturation du salon
    await initiateSubscriptionPayment({
      salon_id: salon.id,
      amount,
      phone: salon.billing_phone,
      method: salon.billing_method,
      description: `Renouvellement SalonPro ${plan} - ${salon.name}`
    })
    
    // Envoyer une notification WhatsApp au propriétaire
    await sendWhatsApp({
      to: salon.phone,
      message: `Bonjour ! Votre abonnement SalonPro ${plan} expire dans 3 jours. Un paiement de ${amount.toLocaleString()} FCFA va être initié sur votre numéro Mobile Money.`
    })
  }
}
```

### Gestion des échecs de paiement

```
Paiement échoué (J-3)
    ↓ Attendre 24h
Nouveau tentative (J-2)
    ↓ Si échec encore
Notification WhatsApp d'avertissement (J-1)
    ↓ Si toujours échec
Expiration abonnement → salon passe en "past_due"
    ↓
Accès limité : dashboard visible mais nouvelles réservations bloquées
    ↓ J+7 sans paiement
Suspension totale + notification finale
```

---

## Modes de paiement supportés

### MTN Mobile Money (Cameroun)
- **Préfixe Cameroun :** 237 + 650/651/652/653/654/670/671/672/673/674/675/676/677/678/679/680/681/682/683/684/685/686/687/688/689
- **Disponible dans :** Cameroun, Côte d'Ivoire (MTN CI), Rwanda, Uganda, etc.
- **Délai settlement :** T+1 jour ouvré

### Orange Money (Cameroun, CI, Sénégal)
- **Préfixe Cameroun :** 237 + 690/691/692/693/694/695/696/697/698/699
- **Disponible dans :** Cameroun, Côte d'Ivoire, Sénégal, Mali, Burkina Faso, etc.
- **Délai settlement :** T+1 jour ouvré

### Wave (Sénégal principalement)
- **Disponible dans :** Sénégal, Côte d'Ivoire, Burkina Faso, Mali
- **Délai settlement :** T+0 (quasi-instantané)

### Carte bancaire (Visa/Mastercard)
- Via CinetPay (pour les clients internationaux ou diaspora)
- Commission plus élevée : ~2.5%

---

## Gestion des remboursements

```typescript
// Remboursement d'une prestation (annulation salon)

export async function refundPayment(payment_id: string, reason: string) {
  const payment = await supabase
    .from('payments')
    .select('*')
    .eq('id', payment_id)
    .single()
  
  if (payment.status !== 'completed') {
    throw new Error('Seuls les paiements complétés peuvent être remboursés')
  }
  
  // Initier le remboursement via CinetPay
  const refundResponse = await fetch('https://api-checkout.cinetpay.com/v2/refund', {
    method: 'POST',
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: payment.provider_ref,
      amount: payment.amount,
    })
  })
  
  // Mettre à jour en base
  await supabase.from('payments').update({
    status: 'refunded'
  }).eq('id', payment_id)
  
  // Notifier la cliente
  await sendWhatsApp({
    to: payment.customers?.phone,
    message: `Votre remboursement de ${payment.amount.toLocaleString()} FCFA a été initié. Vous le recevrez sous 24-48h.`
  })
}
```

---

## Tableau de bord financier (données à exposer)

```sql
-- Recettes par jour (pour le graphique du dashboard)
SELECT
  DATE(created_at AT TIME ZONE 'Africa/Douala') as date,
  SUM(amount) as total,
  COUNT(*) as transactions,
  method
FROM payments
WHERE salon_id = $1
  AND status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at AT TIME ZONE 'Africa/Douala'), method
ORDER BY date DESC;

-- Résumé du mois
SELECT
  SUM(amount) FILTER (WHERE status = 'completed') as revenue,
  COUNT(*) FILTER (WHERE status = 'completed') as paid_count,
  SUM(amount) FILTER (WHERE method IN ('mtn_momo','orange_money','wave')) as mobile_money_revenue,
  SUM(amount) FILTER (WHERE method = 'cash') as cash_revenue
FROM payments
WHERE salon_id = $1
  AND created_at >= DATE_TRUNC('month', NOW());
```

---

## Sécurité des paiements

1. **Jamais de données de carte** stockées sur nos serveurs (PCI DSS délégué à CinetPay)
2. **Vérification de signature** sur tous les webhooks entrants
3. **Idempotence** : vérifier que le `transaction_id` n'est pas déjà traité avant d'agir
4. **Montant minimum** : 100 FCFA (paramètre CinetPay)
5. **Logs** : toutes les transactions loguées dans `notifications` et `payments.provider_data`
6. **Timeout** : si le paiement reste en `pending` plus de 30 minutes → passer à `failed`

---

## Variables d'environnement requises

```bash
CINETPAY_API_KEY=           # Clé API CinetPay (onglet Intégration du dashboard)
CINETPAY_SITE_ID=           # Site ID CinetPay
CINETPAY_WEBHOOK_SECRET=    # Secret pour vérifier les signatures webhook
CINETPAY_BASE_URL=https://api-checkout.cinetpay.com/v2
CINETPAY_MODE=TEST          # TEST en dev, PROD en production
```
