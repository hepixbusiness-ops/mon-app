# Base de données — SalonPro

**Système :** PostgreSQL via Supabase  
**Extension activée :** `uuid-ossp`, `pg_cron`

---

## Schéma complet

### Table `salons`
> Compte principal de chaque salon (lié à l'utilisateur Supabase Auth)

```sql
CREATE TABLE salons (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations du salon
  name                varchar(255) NOT NULL,
  slug                varchar(100) UNIQUE NOT NULL,  -- URL publique : salonpro.africa/[slug]
  phone               varchar(20),
  address             text,
  city                varchar(100),
  country             varchar(10) DEFAULT 'CM',      -- CM=Cameroun, CI=Côte d'Ivoire, SN=Sénégal
  type                varchar(50) NOT NULL,           -- coiffure | barbier | spa | institut | onglerie
  description         text,
  
  -- Médias
  cover_url           text,
  logo_url            text,
  
  -- Statut
  is_active           boolean DEFAULT true,
  is_verified         boolean DEFAULT false,
  
  -- Abonnement SaaS
  subscription_plan   varchar(20) DEFAULT 'trial',   -- trial | essentiel | pro | premium
  subscription_ends_at timestamptz,
  
  -- Paiement abonnement
  billing_phone       varchar(20),                    -- numéro MoMo pour la facturation récurrente
  billing_method      varchar(20),                    -- mtn_momo | orange_money | wave | card
  
  -- Métadonnées
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX idx_salons_user_id ON salons(user_id);
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_subscription ON salons(subscription_plan, subscription_ends_at);

-- RLS
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salon_owner_full_access" ON salons
  FOR ALL USING (user_id = auth.uid());
```

---

### Table `staff`
> Employées / coiffeuses du salon

```sql
CREATE TABLE staff (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id    uuid REFERENCES salons(id) ON DELETE CASCADE,
  
  name        varchar(100) NOT NULL,
  phone       varchar(20),
  role        varchar(50) DEFAULT 'stylist',    -- stylist | manager | assistant
  avatar_url  text,
  bio         text,
  color       varchar(7) DEFAULT '#6B21A8',     -- couleur affichée dans l'agenda
  
  is_active   boolean DEFAULT true,
  
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_staff_salon_id ON staff(salon_id);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_salon_access" ON staff
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `working_hours`
> Horaires de travail par employée et par jour

```sql
CREATE TABLE working_hours (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id      uuid REFERENCES staff(id) ON DELETE CASCADE,
  salon_id      uuid REFERENCES salons(id) ON DELETE CASCADE,
  
  day_of_week   smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0=Lundi, 1=Mardi, 2=Mercredi, 3=Jeudi, 4=Vendredi, 5=Samedi, 6=Dimanche
  
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  is_day_off    boolean DEFAULT false,
  
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_working_hours_staff ON working_hours(staff_id);

ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "working_hours_salon_access" ON working_hours
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `services`
> Services proposés par le salon

```sql
CREATE TABLE services (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id          uuid REFERENCES salons(id) ON DELETE CASCADE,
  
  name              varchar(200) NOT NULL,
  description       text,
  price             integer NOT NULL,          -- en FCFA (entier, pas de décimales)
  duration_minutes  integer NOT NULL,          -- durée en minutes
  category          varchar(100),              -- coiffure | soins | barbe | onglerie | autre
  image_url         text,
  
  is_active         boolean DEFAULT true,
  display_order     integer DEFAULT 0,         -- ordre d'affichage sur la page publique
  
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_services_salon_id ON services(salon_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_salon_access" ON services
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));

-- La page publique doit pouvoir lire les services (pas de RLS bloquante pour SELECT public)
CREATE POLICY "services_public_read" ON services
  FOR SELECT USING (is_active = true);
```

---

### Table `customers`
> Clients du salon (base de données clientes)

```sql
CREATE TABLE customers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id        uuid REFERENCES salons(id) ON DELETE CASCADE,
  
  name            varchar(200) NOT NULL,
  phone           varchar(20),                 -- numéro WhatsApp principal
  email           varchar(200),
  notes           text,                        -- notes privées du salon (allergies, préférences)
  
  -- Statistiques calculées (mis à jour via trigger)
  total_visits    integer DEFAULT 0,
  total_spent     integer DEFAULT 0,           -- en FCFA
  last_visit_at   timestamptz,
  
  -- Fidélité
  is_vip          boolean DEFAULT false,
  loyalty_points  integer DEFAULT 0,
  
  -- Source
  source          varchar(20) DEFAULT 'booking', -- booking | manual | import
  
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_customers_salon_id ON customers(salon_id);
CREATE INDEX idx_customers_phone ON customers(salon_id, phone);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_salon_access" ON customers
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `bookings`
> Réservations (cœur de l'application)

```sql
CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id        uuid REFERENCES salons(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES customers(id) ON DELETE SET NULL,
  staff_id        uuid REFERENCES staff(id) ON DELETE SET NULL,
  service_id      uuid REFERENCES services(id) ON DELETE SET NULL,
  
  -- Horaires
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  
  -- Statut
  status          varchar(20) DEFAULT 'pending',
  -- pending (en attente confirmation) | confirmed | completed | cancelled | no_show
  
  -- Prix (snapshot au moment de la réservation)
  price           integer NOT NULL,            -- en FCFA
  
  -- Source
  source          varchar(20) DEFAULT 'online',
  -- online (page publique) | manual (créé par le salon) | walk_in (sans RDV)
  
  -- Notes
  notes           text,                        -- notes de la cliente
  internal_notes  text,                        -- notes internes du salon
  
  -- Rappels
  reminder_sent_at timestamptz,               -- NULL = rappel pas encore envoyé
  
  -- Annulation
  cancelled_at    timestamptz,
  cancellation_reason text,
  cancelled_by    varchar(20),                 -- salon | customer
  
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Index critiques pour les performances
CREATE INDEX idx_bookings_salon_id ON bookings(salon_id);
CREATE INDEX idx_bookings_starts_at ON bookings(salon_id, starts_at);
CREATE INDEX idx_bookings_status ON bookings(salon_id, status);
CREATE INDEX idx_bookings_staff ON bookings(staff_id, starts_at);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_reminder ON bookings(status, starts_at, reminder_sent_at)
  WHERE status = 'confirmed' AND reminder_sent_at IS NULL;

-- Realtime activé
ALTER publication supabase_realtime ADD TABLE bookings;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_salon_access" ON bookings
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `time_blocks`
> Blocages d'agenda (congés, pauses, fermetures exceptionnelles)

```sql
CREATE TABLE time_blocks (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id    uuid REFERENCES salons(id) ON DELETE CASCADE,
  staff_id    uuid REFERENCES staff(id) ON DELETE CASCADE,  -- NULL = tout le salon
  
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  reason      varchar(200),                    -- "Congé", "Formation", "Fermeture"
  
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_time_blocks_staff ON time_blocks(staff_id, starts_at, ends_at);

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "time_blocks_salon_access" ON time_blocks
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `payments`
> Paiements pour les prestations

```sql
CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      uuid REFERENCES bookings(id) ON DELETE SET NULL,
  salon_id        uuid REFERENCES salons(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES customers(id) ON DELETE SET NULL,
  
  amount          integer NOT NULL,            -- en FCFA
  
  -- Mode de paiement
  method          varchar(30) NOT NULL,
  -- cash | mtn_momo | orange_money | wave | card | other
  
  -- Statut
  status          varchar(20) DEFAULT 'pending',
  -- pending | processing | completed | failed | refunded
  
  -- Référence opérateur (pour MoMo, Orange, Wave)
  provider_ref    varchar(200),                -- référence CinetPay
  provider_data   jsonb,                       -- données brutes du webhook
  
  -- Timestamps
  paid_at         timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_payments_salon_id ON payments(salon_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(salon_id, status);
CREATE INDEX idx_payments_created_at ON payments(salon_id, created_at);

-- Realtime activé
ALTER publication supabase_realtime ADD TABLE payments;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_salon_access" ON payments
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `subscriptions`
> Abonnements SaaS des salons

```sql
CREATE TABLE subscriptions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id        uuid REFERENCES salons(id) ON DELETE CASCADE,
  
  plan            varchar(20) NOT NULL,
  -- trial | essentiel | pro | premium
  
  billing_cycle   varchar(10) NOT NULL,
  -- monthly | annual
  
  amount          integer NOT NULL,            -- en FCFA
  
  -- Dates
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  
  -- Paiement
  payment_method  varchar(30),
  -- mtn_momo | orange_money | wave | card
  
  -- Statut
  status          varchar(20) DEFAULT 'active',
  -- trial | active | past_due | cancelled | expired
  
  -- Références
  provider_ref    varchar(200),
  provider_data   jsonb,
  
  cancelled_at    timestamptz,
  cancellation_reason text,
  
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_salon_id ON subscriptions(salon_id);
CREATE INDEX idx_subscriptions_ends_at ON subscriptions(status, ends_at);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_salon_access" ON subscriptions
  FOR ALL USING (salon_id IN (SELECT id FROM salons WHERE user_id = auth.uid()));
```

---

### Table `notifications`
> Log de toutes les notifications envoyées

```sql
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id    uuid REFERENCES salons(id) ON DELETE CASCADE,
  booking_id  uuid REFERENCES bookings(id) ON DELETE SET NULL,
  
  type        varchar(50) NOT NULL,
  -- booking_confirmation | reminder_24h | reminder_2h | payment_receipt
  -- subscription_renewal | subscription_expired | daily_report
  
  channel     varchar(20) NOT NULL,
  -- whatsapp | sms | email
  
  recipient   varchar(200) NOT NULL,           -- numéro ou email
  
  status      varchar(20) DEFAULT 'sent',
  -- sent | delivered | failed
  
  provider_ref varchar(200),                   -- SID Twilio
  error_message text,
  
  sent_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_salon_id ON notifications(salon_id, sent_at);
CREATE INDEX idx_notifications_booking ON notifications(booking_id);
```

---

## Triggers

### Mise à jour automatique `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON salons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Répéter pour : staff, services, customers, bookings, payments, subscriptions
```

### Mise à jour statistiques client après un booking complété

```sql
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE customers
    SET
      total_visits = total_visits + 1,
      total_spent = total_spent + NEW.price,
      last_visit_at = NEW.ends_at
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_completed_update_customer
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();
```

---

## Limites par plan

```sql
-- Vérification des limites (utilisée dans les Edge Functions)

-- Plan Essentiel : max 30 bookings par mois
-- Plan Pro : illimité
-- Plan Premium : illimité

-- Vérification du quota de staff
-- Plan Essentiel : max 1 staff
-- Plan Pro : max 5 staff
-- Plan Premium : illimité
```

---

## Données initiales (seed)

```sql
-- Types d'établissement
-- coiffure, barbier, spa, institut, onglerie

-- Catégories de services
-- coiffure, soins, barbe, onglerie, autre

-- Plans tarifaires
INSERT INTO subscription_plans (plan, monthly_price_xaf, annual_price_xaf, max_staff, max_bookings_month) VALUES
  ('essentiel', 5900, 59000, 1, 30),
  ('pro', 11900, 119000, 5, NULL),
  ('premium', 22900, 229000, NULL, NULL);
```
