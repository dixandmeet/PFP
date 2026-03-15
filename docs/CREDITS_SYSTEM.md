# Système de Crédits — Documentation Technique

## Table des matières

1. [Architecture des Wallets](#1-architecture-des-wallets)
2. [Plans d'abonnement](#2-plans-dabonnement)
3. [Comment gagner des crédits](#3-comment-gagner-des-crédits)
4. [Comment dépenser des crédits](#4-comment-dépenser-des-crédits)
5. [Retraits (Withdrawals)](#5-retraits-withdrawals)
6. [Expiration annuelle](#6-expiration-annuelle)
7. [Anti-fraude](#7-anti-fraude)
8. [Permissions par rôle](#8-permissions-par-rôle)
9. [Routes API](#9-routes-api)
10. [Services backend](#10-services-backend)
11. [Modèles Prisma](#11-modèles-prisma)
12. [Jobs CRON et webhooks](#12-jobs-cron-et-webhooks)
13. [Interface utilisateur](#13-interface-utilisateur)

---

## 1. Architecture des Wallets

Chaque utilisateur possède **4 portefeuilles** distincts :

| Wallet | Type Prisma | Usage |
|--------|-------------|-------|
| **SUBSCRIPTION** | `WalletType.SUBSCRIPTION` | Crédits alloués mensuellement par l'abonnement |
| **PURCHASED** | `WalletType.PURCHASED` | Crédits achetés à l'unité (1€ = 1 crédit) via Stripe |
| **EARNED** | `WalletType.EARNED` | Crédits gagnés (follows reçus, consultations, signatures) |
| **BONUS** | `WalletType.BONUS` | Crédits offerts par un administrateur |

### Ordre de débit (priorité haute → basse)

```
BONUS → SUBSCRIPTION → PURCHASED → EARNED
```

Cet ordre préserve les crédits EARNED pour le retrait. La constante `DEBIT_PRIORITY` dans `types.ts` définit cette séquence.

**Variante pour les retraits** : avec l'option `excludeBonus: true`, l'ordre devient `SUBSCRIPTION → PURCHASED → EARNED` (les crédits BONUS ne sont jamais utilisés pour les retraits).

### Optimistic Locking

Chaque wallet possède un champ `version` (entier). Toute opération de débit/crédit incrémente la version. Si deux opérations concurrentes tentent de modifier le même wallet, une `ConcurrentModificationError` est levée.

### Clés d'idempotence

Chaque transaction peut porter un `idempotencyKey` unique. Le service `TransactionService.checkIdempotency()` empêche les doubles débits/crédits.

---

## 2. Plans d'abonnement

| Plan | Enum Prisma | Prix/mois | Crédits/mois | Taux de redistribution |
|------|-------------|-----------|-------------|------------------------|
| FREE | `SubscriptionPlan.FREE` | 0€ | 0 | 0% |
| STARTER | `SubscriptionPlan.STARTER` | 10€ | 10 | 25% |
| GROWTH | `SubscriptionPlan.GROWTH` | 50€ | 50 | 30% |
| PRO | `SubscriptionPlan.PRO` | 200€ | 200 | 40% |
| ELITE | `SubscriptionPlan.ELITE` | 500€ | 500 | 50% |

### Statuts d'abonnement

| Statut | Description |
|--------|-------------|
| `ACTIVE` | Abonnement en cours |
| `CANCELLED` | Annulé (actif jusqu'à la fin de la période) |
| `PAST_DUE` | Paiement échoué |
| `TRIALING` | Période d'essai |

### Comportement

- Chaque nouvel utilisateur reçoit automatiquement un abonnement FREE (`ensureDefaultSubscription`).
- Les crédits mensuels sont alloués dans le wallet SUBSCRIPTION via `allocateMonthlyCredits`.
- Le changement de plan est géré via `changePlan` (upgrade/downgrade immédiat).
- L'annulation prend effet en fin de période courante.
- Les variables d'environnement `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE` stockent les IDs Stripe correspondants.

---

## 3. Comment gagner des crédits

### 3.1 Abonnement (CREDIT_SUBSCRIPTION)

Allocation mensuelle automatique dans le wallet **SUBSCRIPTION** à chaque renouvellement d'abonnement (via webhook Stripe `invoice.paid`).

### 3.2 Achat ponctuel / Top-up (CREDIT_PURCHASE)

- Via Stripe Checkout (`POST /api/credits/topup`)
- Minimum : **1 crédit** — Maximum : **10 000 crédits**
- Tarif : **1 crédit = 1€**
- Crédité dans le wallet **PURCHASED**
- Montants prédéfinis dans l'UI : 10, 25, 50, 100, 200, 500 ou montant libre

### 3.3 Redistribution de follow (CREDIT_EARNED_FOLLOW)

Quand un utilisateur te suit (follow), tu reçois une part de son coût mensuel dans le wallet **EARNED**.

- Le taux de redistribution dépend du plan de l'abonné : 0% (FREE) à 50% (ELITE)
- Calcul : `Math.max(1, Math.round(1 * rate))` — minimum 1 crédit redistribué si le taux > 0
- **Exception** : si le débit est uniquement depuis le wallet BONUS, aucune redistribution n'est effectuée

### 3.4 Consultation de listing (CREDIT_EARNED_LISTING)

Quand un utilisateur consulte une annonce de ton club, tu reçois **25%** du coût de consultation dans le wallet **EARNED**.

- Constante : `LISTING_CONSULT_REDISTRIBUTION_RATE = 0.25`

### 3.5 Validation de signature (CREDIT_EARNED_SIGNATURE)

Quand une preuve de signature est approuvée par un admin **ET** que l'annonce a reçu au minimum **20 candidatures**, le club reçoit un complément.

- Complément : jusqu'à **50%** du coût total (`LISTING_SIGNATURE_MAX_REDISTRIBUTION_RATE = 0.50`)
- Seuil minimum de candidatures : `WITHDRAWAL_MIN_APPLICATIONS_FOR_COMPLEMENT = 20`
- Le complément est la différence entre le taux max (50%) et ce qui a déjà été redistribué (25%)

### 3.6 Bonus admin (CREDIT_BONUS)

Un administrateur peut créditer directement n'importe quel wallet d'un utilisateur via `PATCH /api/admin/users/[id]` avec l'action `creditWallet`.

---

## 4. Comment dépenser des crédits

### 4.1 Follow (DEBIT_FOLLOW) — 1 crédit

**Deux flux distincts :**

| Flux | Route | Comportement |
|------|-------|--------------|
| Follow standard | `POST /api/follow/[id]` | Validation + création du follow. La facturation mensuelle est gérée par le CRON |
| Follow avec débit immédiat | `POST /api/credits/follow-spend` | Débite 1 crédit immédiatement puis enregistre le follow pour la facturation mensuelle |

**Facturation mensuelle :**
- CRON exécuté le **1er de chaque mois à 3h UTC**
- 1 crédit/mois par follow actif
- Si le solde est insuffisant : **auto-unfollow** automatique
- Traitement par batch de 100

### 4.2 Consultation de listing (DEBIT_LISTING_CONSULT) — coût variable

| Division | Coût |
|----------|------|
| D1 (Pro) | 20 crédits |
| D2 (Amateur) | 10 crédits |
| D3 (Académie) | 5 crédits |
| Autre | 2 crédits (défaut) |

- Constantes dans `LISTING_COST_BY_DIVISION` et `LISTING_COST_DEFAULT`
- **Paiement unique** par listing (pas de re-facturation). Vérifiable via `hasConsulted`
- Vérification préalable possible via `GET /api/credits/listings/[id]/check`

### 4.3 Retrait (DEBIT_WITHDRAWAL)

Voir section [Retraits](#5-retraits-withdrawals).

---

## 5. Retraits (Withdrawals)

### Conditions d'éligibilité

| Condition | Détail |
|-----------|--------|
| Plan minimum | **GROWTH** ou supérieur (GROWTH, PRO, ELITE) |
| KYC | Statut `VERIFIED` requis |
| Stripe Connect | `payoutsEnabled` doit être `true` |
| Solde minimum | **100 crédits** dans le wallet EARNED |
| Retraits en cours | Maximum **1 retrait** en statut PENDING_REVIEW, APPROVED ou PROCESSING |

### Paramètres

| Paramètre | Valeur | Constante |
|-----------|--------|-----------|
| Minimum | 100 crédits | `WITHDRAWAL_MIN_CREDITS` |
| Commission | 20% | `WITHDRAWAL_COMMISSION_RATE` |
| Délai de sécurité | 7 jours | `WITHDRAWAL_SECURITY_DELAY_DAYS` |

### Calcul du montant net

```
netAmount = amount * (1 - 0.20) = amount * 0.80
```

Le `netAmount` est stocké en **centimes EUR** dans la base de données.

### Cycle de vie d'un retrait

```
PENDING_REVIEW → APPROVED → PROCESSING → COMPLETED
                → REJECTED
PENDING_REVIEW → CANCELLED (par l'utilisateur)
```

| Statut | Description |
|--------|-------------|
| `PENDING_REVIEW` | En attente de revue admin |
| `APPROVED` | Validé par un admin, en attente du délai de sécurité |
| `PROCESSING` | Transfert Stripe en cours |
| `COMPLETED` | Virement effectué |
| `REJECTED` | Rejeté par un admin (avec note) |
| `CANCELLED` | Annulé par l'utilisateur |

### Traitement automatique

Le CRON `withdrawal-processing` s'exécute **quotidiennement à 4h UTC** et traite les retraits APPROVED dont le `availableAt` est dépassé (7 jours après la demande).

---

## 6. Expiration annuelle

| Paramètre | Détail |
|-----------|--------|
| Date | **1er janvier à 00:00 UTC** |
| Wallets affectés | **SUBSCRIPTION** et **BONUS** remis à zéro |
| Wallets préservés | **PURCHASED** et **EARNED** |
| Traçabilité | Création d'un enregistrement `CreditExpiration` par wallet réinitialisé |

Le traitement s'exécute par batch de 100 utilisateurs via `ExpirationService.runAnnualExpiration`.

Un déclenchement manuel est possible via `POST /api/credits/admin/expirations/trigger` (admin uniquement).

---

## 7. Anti-fraude

### Limites de débit

| Mécanisme | Constante | Limite |
|-----------|-----------|--------|
| Follows par heure | `MAX_FOLLOWS_PER_HOUR` | 50 |
| Opérations crédits par minute | `MAX_CREDIT_OPS_PER_MINUTE` | 10 |
| Utilisateurs par IP (24h) | `SUSPICIOUS_IP_THRESHOLD` | 3 |

### Détection de boucles de follow

- Algorithme : **BFS** (Breadth-First Search) sur le graphe A→B→C→A
- Profondeur maximale : **5** (`MAX_FOLLOW_LOOP_DEPTH`)
- Si une boucle est détectée, un `FraudFlag` est créé

### Multi-comptes

- Détection via `DeviceFingerprint` : fingerprint partagé entre plusieurs comptes
- Détection via IP : plus de 3 utilisateurs sur la même IP en 24h
- Flaggé automatiquement comme `MULTI_ACCOUNT` ou `IP_ANOMALY`

### Types de flags de fraude

| Type | Description |
|------|-------------|
| `MULTI_ACCOUNT` | Plusieurs comptes détectés sur le même device |
| `ARTIFICIAL_LOOP` | Boucle de follow artificielle détectée |
| `RATE_LIMIT_EXCEEDED` | Limite de débit dépassée |
| `SUSPICIOUS_PATTERN` | Pattern suspect détecté |
| `IP_ANOMALY` | Anomalie d'adresse IP |
| `DEVICE_ANOMALY` | Anomalie d'appareil |

### Niveaux de sévérité

| Sévérité | Impact |
|----------|--------|
| `LOW` | Informatif, aucun blocage |
| `MEDIUM` | Informatif, aucun blocage |
| `HIGH` | **Bloque** les retraits et les follows |
| `CRITICAL` | **Bloque** les retraits et les follows |

Les flags HIGH/CRITICAL non résolus bloquent les opérations via `FraudService.isBlocked()`. Un admin peut résoudre un flag via `resolveFlag`.

### Rate limiting

Le rate limiting est implémenté **en mémoire par process** (Map JavaScript). Cela signifie qu'il est réinitialisé au redémarrage du serveur et n'est pas partagé entre les instances en cas de déploiement multi-instance.

---

## 8. Permissions par rôle

| Rôle | Peut acheter | Peut dépenser | Peut gagner | Peut retirer | Accès page crédits |
|------|-------------|---------------|-------------|-------------|---------------------|
| **PLAYER** | Oui | Follows, consultations | Limité (follows reçus) | Non | `/player/credits` |
| **AGENT** | Oui | Follows | Limité (follows reçus) | Non | `/agent/credits` |
| **CLUB** | Oui | — | Consultations, follows, signatures | Oui (GROWTH+) | `/club/credits` |
| **CLUB_STAFF** | Oui | — | Via le club | Via le club | `/club/credits` |
| **ADMIN** | Contrôle total | — | — | — | `/admin/credits` + onglet crédits dans `/admin/users/[id]` |

### Actions admin spécifiques

- Créditer un wallet : `PATCH /api/admin/users/[id]` avec `action: "creditWallet"`
- Débiter un wallet : `PATCH /api/admin/users/[id]` avec `action: "debitWallet"`
- Approuver/rejeter un retrait : `POST /api/credits/withdrawals/[id]/review`
- Approuver/rejeter une signature : `POST /api/credits/signatures/[id]/review`
- Déclencher l'expiration : `POST /api/credits/admin/expirations/trigger`
- Voir les stats globales : `GET /api/credits/admin/stats`
- Voir les flags de fraude : `GET /api/credits/fraud/flags`

---

## 9. Routes API

### Routes principales (`/api/credits/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `wallets` | GET | Soldes des 4 wallets + infos plan |
| `transactions` | GET | Historique filtrable (page, limit, walletType, type, from, to) |
| `topup` | POST | Création session Stripe Checkout pour achat de crédits |
| `follow-spend` | POST | Dépense immédiate de 1 crédit pour un follow |

### Abonnement (`/api/credits/subscription/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `subscription` | GET | Abonnement actuel |
| `subscription` | POST | Création session Checkout pour nouvel abonnement |
| `subscription/change` | POST | Changement de plan |
| `subscription/cancel` | POST | Annulation (fin de période) |
| `subscription/sync-session` | POST | Synchronisation après Checkout (fallback webhook) |

### Listings (`/api/credits/listings/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `listings/[id]/check` | GET | Vérifier si déjà consulté + coût |
| `listings/[id]/consult` | POST | Payer la consultation |

### Retraits (`/api/credits/withdrawals/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `withdrawals` | GET | Liste des retraits de l'utilisateur |
| `withdrawals` | POST | Demander un retrait |
| `withdrawals/[id]` | DELETE | Annuler un retrait |
| `withdrawals/[id]/review` | POST | Revue admin (APPROVE/REJECT) |

### Signatures (`/api/credits/signatures/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `signatures` | POST | Soumettre une preuve de signature |
| `signatures/[id]/review` | POST | Revue admin (APPROVE/REJECT) |

### Stripe Connect (`/api/credits/connect/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `connect/onboarding` | POST | Lancer l'onboarding Stripe Connect |
| `connect/dashboard` | GET | Lien vers le dashboard Express |
| `connect/status` | GET | Statut du compte Connect + éligibilité |

### Anti-fraude (`/api/credits/fraud/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `fraud/fingerprint` | POST | Enregistrer l'empreinte device |
| `fraud/flags` | GET | Liste des flags de fraude (admin) |

### Administration (`/api/credits/admin/`)

| Route | Méthode | Description |
|-------|---------|-------------|
| `admin/stats` | GET | Statistiques globales crédits |
| `admin/expirations/trigger` | POST | Déclencher manuellement l'expiration annuelle |

### Autres routes liées aux crédits

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/follow/[id]` | GET | Vérifier si suivi + nombre de followers |
| `/api/follow/[id]` | POST | Suivre une entité (déclenche la facturation follow) |
| `/api/follow/[id]` | DELETE | Ne plus suivre (arrête la facturation) |
| `/api/admin/credits` | GET | Transactions admin avec filtres + statistiques agrégées |
| `/api/admin/users/[id]` | PATCH | Actions admin dont creditWallet / debitWallet |
| `/api/webhooks/stripe` | POST | Webhook Stripe |
| `/api/webhooks/cron` | POST | Jobs CRON manuels |

**Total : 27+ endpoints** liés au système de crédits.

---

## 10. Services backend

Tous les services sont dans `src/lib/services/credits/` :

| Fichier | Classe/Module | Responsabilité |
|---------|---------------|----------------|
| `wallet.service.ts` | `WalletService` | Initialisation, soldes, crédit, débit avec priorité, reset |
| `subscription.service.ts` | `SubscriptionService` | Activation, allocation mensuelle, changement, annulation, taux de redistribution |
| `follow-billing.service.ts` | `FollowBillingService` | Validation follow, facturation mensuelle, redistribution, auto-unfollow |
| `listing-billing.service.ts` | `ListingBillingService` | Coût par division, consultation, redistribution 25%, complément signature |
| `withdrawal.service.ts` | `WithdrawalService` | Demande, revue, annulation, traitement des retraits approuvés |
| `stripe.service.ts` | `StripeService` | Checkouts, Connect, webhooks, synchronisation |
| `transaction.service.ts` | `TransactionService` | Logging, historique paginé, vérification idempotence |
| `expiration.service.ts` | `ExpirationService` | Expiration annuelle SUBSCRIPTION + BONUS |
| `fraud.service.ts` | `FraudService` | Fingerprinting, détection boucles/multi-comptes, rate limiting, flags |
| `signature.service.ts` | `SignatureService` | Soumission, revue, déclenchement complément |
| `types.ts` | — | Constantes, configuration des plans, types d'erreurs |
| `index.ts` | — | Barrel export |

---

## 11. Modèles Prisma

### Enums

```
SubscriptionPlan    : FREE, STARTER, GROWTH, PRO, ELITE
SubscriptionStatus  : ACTIVE, CANCELLED, PAST_DUE, TRIALING
WalletType          : SUBSCRIPTION, PURCHASED, EARNED, BONUS
TransactionType     : CREDIT_SUBSCRIPTION, CREDIT_PURCHASE, CREDIT_BONUS,
                      CREDIT_EARNED_FOLLOW, CREDIT_EARNED_LISTING, CREDIT_EARNED_SIGNATURE,
                      DEBIT_FOLLOW, DEBIT_LISTING_CONSULT, DEBIT_WITHDRAWAL,
                      EXPIRATION, REFUND
TransactionStatus   : PENDING, COMPLETED, FAILED, REVERSED
WithdrawalStatus    : PENDING_REVIEW, APPROVED, PROCESSING, COMPLETED, REJECTED, CANCELLED
FraudFlagType       : MULTI_ACCOUNT, ARTIFICIAL_LOOP, RATE_LIMIT_EXCEEDED,
                      SUSPICIOUS_PATTERN, IP_ANOMALY, DEVICE_ANOMALY
FraudFlagSeverity   : LOW, MEDIUM, HIGH, CRITICAL
KycStatus           : NOT_STARTED, PENDING, VERIFIED, REJECTED
```

### Modèles

| Modèle | Champs clés |
|--------|-------------|
| **Subscription** | userId, plan, status, stripeCustomerId, stripeSubscriptionId, stripePriceId, currentPeriodStart/End, creditsAllocated |
| **Wallet** | userId, type, balance, version |
| **CreditTransaction** | userId, walletType, type, status, amount, balanceBefore/After, referenceId/Type, counterpartyId, description, metadata, idempotencyKey |
| **CreditFollow** | followerId, followingId, entityFollowId, isActive, lastChargedAt, nextChargeAt |
| **ListingConsultation** | userId, listingId, clubProfileId, creditsCost, creditsToClub, divisionRate |
| **SignatureValidation** | listingId, clubProfileId, playerUserId, proofDocument, proofStatus, totalApplications, complementPaid, complementAmount |
| **Withdrawal** | userId, amount, commission, netAmount, status, stripeConnectAccountId, stripePayoutId, requestedAt, availableAt, processedAt, completedAt, reviewedBy, reviewNote |
| **StripeConnectAccount** | userId, stripeAccountId, kycStatus, chargesEnabled, payoutsEnabled, detailsSubmitted |
| **DeviceFingerprint** | userId, fingerprint, ipAddress, userAgent, metadata |
| **FraudFlag** | userId, type, severity, description, evidence, isResolved, resolvedBy, resolvedAt, resolution |
| **CreditExpiration** | userId, walletType, amount, year |

---

## 12. Jobs CRON et webhooks

### Jobs CRON

Déclenchés via `POST /api/webhooks/cron?job=<nom>` avec header `Authorization: Bearer ${CRON_SECRET}`.

| Job | Cron expression | Horaire | Service |
|-----|----------------|---------|---------|
| `follow-billing` | `0 3 1 * *` | 1er du mois, 03:00 UTC | `FollowBillingService.processMonthlyCharges` |
| `expiration` | `0 0 1 1 *` | 1er janvier, 00:00 UTC | `ExpirationService.runAnnualExpiration` |
| `withdrawal-processing` | `0 4 * * *` | Quotidien, 04:00 UTC | `WithdrawalService.processApprovedWithdrawals` |

Le scheduler est défini dans `src/lib/jobs/scheduler.ts`.

### Webhook Stripe

Route : `POST /api/webhooks/stripe` — Vérification via header `stripe-signature`.

| Événement Stripe | Action |
|------------------|--------|
| `checkout.session.completed` | Synchronisation abonnement ou crédit top-up |
| `invoice.paid` | Allocation des crédits mensuels (CREDIT_SUBSCRIPTION) |
| `invoice.payment_failed` | Passage en statut PAST_DUE |
| `customer.subscription.deleted` | Annulation de l'abonnement |
| `account.updated` | Mise à jour du statut Stripe Connect (KYC, payouts) |

---

## 13. Interface utilisateur

### Pages crédits

| Rôle | URL | Composant |
|------|-----|-----------|
| Club / Club Staff | `/club/credits` | `CreditsPageClient` |
| Player | `/player/credits` | `CreditsPageClient` |
| Agent | `/agent/credits` | `CreditsPageClient` |
| Admin | `/admin/credits` | Page autonome (tableau + stats) |
| Admin (fiche user) | `/admin/users/[id]` onglet Credits | `UserCreditsSection` |

### Onglets (CreditsPageClient)

| Onglet | Composant | Fonction |
|--------|-----------|----------|
| Aperçu | `WalletOverview` | Solde total + 4 wallets + 5 dernières transactions + raccourcis |
| Recharger | `TopUpForm` | Achat de crédits (montants prédéfinis ou libre) |
| Abonnement | `SubscriptionManager` | Choix/changement/annulation de plan |
| Retraits | `WithdrawalPanel` | Demande de retrait + onboarding Stripe Connect |
| Historique | `TransactionList` | Liste paginée et filtrable des transactions |

### Composants

Tous dans `src/components/credits/` :

- **CreditsPageClient.tsx** — Client principal avec gestion du retour Stripe (`?success=true&session_id=`)
- **WalletOverview.tsx** — Carte solde total + grille des 4 wallets
- **TopUpForm.tsx** — Formulaire avec montants 10/25/50/100/200/500 ou libre
- **SubscriptionManager.tsx** — Grille des 5 plans avec actions
- **WithdrawalPanel.tsx** — Panel de retrait avec vérification d'éligibilité
- **TransactionList.tsx** — Tableau avec filtres par type et wallet

### Intégrations dans d'autres pages

- **Consultation d'annonces** : `AgentOpportunityCard`, `AgentOpportunityPreview`, `OpportunityCard`, `OpportunityPreview` affichent le coût en crédits et le message "Solde insuffisant"
- **Profil** : Dialog de suivi avec dépense de crédits
- **Sidebar** : Lien vers la page crédits selon le rôle
- **Admin sidebar** : Lien vers `/admin/credits`

---

## Annexe — Constantes de référence

```typescript
// Plans
PLAN_CONFIG = {
  FREE:    { price: 0,   credits: 0,   redistributionRate: 0    },
  STARTER: { price: 10,  credits: 10,  redistributionRate: 0.25 },
  GROWTH:  { price: 50,  credits: 50,  redistributionRate: 0.30 },
  PRO:     { price: 200, credits: 200, redistributionRate: 0.40 },
  ELITE:   { price: 500, credits: 500, redistributionRate: 0.50 },
}

// Coûts de consultation
LISTING_COST_BY_DIVISION = { D1: 20, D2: 10, D3: 5 }
LISTING_COST_DEFAULT = 2

// Redistribution
LISTING_CONSULT_REDISTRIBUTION_RATE = 0.25
LISTING_SIGNATURE_MAX_REDISTRIBUTION_RATE = 0.50

// Ordre de débit
DEBIT_PRIORITY = [BONUS, SUBSCRIPTION, PURCHASED, EARNED]

// Retraits
WITHDRAWAL_MIN_CREDITS = 100
WITHDRAWAL_COMMISSION_RATE = 0.20
WITHDRAWAL_SECURITY_DELAY_DAYS = 7
WITHDRAWAL_MIN_APPLICATIONS_FOR_COMPLEMENT = 20

// Anti-fraude
MAX_FOLLOWS_PER_HOUR = 50
MAX_CREDIT_OPS_PER_MINUTE = 10
SUSPICIOUS_IP_THRESHOLD = 3
MAX_FOLLOW_LOOP_DEPTH = 5
```
