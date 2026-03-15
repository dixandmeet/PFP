# Profoot Profile

Plateforme SaaS de mise en relation pour transferts de footballeurs professionnels.

Connecte **Joueurs**, **Agents** et **Clubs** avec des fonctionnalités avancées : profils détaillés, annonces mercato, mandats numériques, rapports joueurs, feed social et assistants IA pour chaque rôle.

## 🎯 Fonctionnalités principales

### Pour les Joueurs
- ✅ Profil complet (identité, poste, statistiques, parcours)
- ✅ Candidature aux annonces de clubs
- ✅ Gestion des mandats avec agents
- ✅ Création et partage de rapports
- ✅ Feed social (posts, likes, commentaires)
- ✅ **Assistant IA "Player Agent"** : améliore le profil, génère des posts, postule aux annonces

### Pour les Agents
- ✅ Profil agent (licence, agence, spécialités)
- ✅ Gestion des mandats numériques
- ✅ Soumission de joueurs aux clubs
- ✅ Moteur de recherche avancé (joueurs, clubs, annonces)
- ✅ **Assistant IA "Agent Copilot"** : shortlists automatiques, préparation de soumissions, relances

### Pour les Clubs
- ✅ Profil club avec équipes et staff
- ✅ Création d'annonces mercato
- ✅ Pipeline de candidatures (nouveau → essai → signé)
- ✅ Recherche et comparaison de joueurs
- ✅ **Assistant IA "Club Scout"** : scoring de candidatures, comparaison de profils, génération de rapports

### Sécurité & Conformité
- 🔒 RBAC strict (Role-Based Access Control)
- 🔒 NextAuth avec JWT
- 🔒 Protection des données sensibles (rapports, documents)
- 🔒 Système de mandats avec vérification
- 🔒 Audit logs pour toutes les actions IA
- 🔒 Confirmation obligatoire avant exécution des actions IA (two-step)

## 🛠️ Stack technique

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, Prisma ORM
- **Base de données:** PostgreSQL
- **Authentification:** NextAuth (JWT + sessions)
- **Stockage fichiers:** S3-compatible (MinIO en dev, AWS S3 en prod)
- **IA:** OpenAI GPT-4 avec function calling (tool-calling)
- **Validation:** Zod
- **Rate limiting:** Redis (optionnel)

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+
- MinIO ou accès S3 (optionnel pour upload fichiers)
- Clé API OpenAI (optionnel pour assistants IA)

### 1. Cloner le repo

```bash
git clone https://github.com/votre-repo/profoot-profile.git
cd profoot-profile
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration environnement

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Puis éditer `.env.local` :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/profoot"

# NextAuth
NEXTAUTH_SECRET="votre-secret-aleatoire-tres-long"
NEXTAUTH_URL="http://localhost:3000"

# S3 / MinIO
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="profoot-files"
S3_REGION="us-east-1"

# OpenAI
OPENAI_API_KEY="sk-votre-cle-openai"

# Redis (optionnel)
RATE_LIMIT_REDIS_URL="redis://localhost:6379"
```

**Générer un NEXTAUTH_SECRET :**

```bash
openssl rand -base64 32
```

### 4. Setup base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données et tables
npm run db:push

# OU utiliser les migrations (recommandé en prod)
npm run db:migrate

# Seeder les données de démonstration
npm run db:seed
```

### 5. Lancer en développement

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

## 📝 Comptes de test (après seed)

- **Joueur:** player@profoot.com / password123
- **Agent:** agent@profoot.com / password123
- **Club:** club@profoot.com / password123

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes authentification
│   ├── (player)/          # Routes joueur
│   ├── (agent)/           # Routes agent
│   ├── (club)/            # Routes club
│   └── api/               # API endpoints
│       ├── auth/          # NextAuth + register
│       ├── players/       # CRUD joueurs
│       ├── agents/        # CRUD agents
│       ├── clubs/         # CRUD clubs
│       ├── listings/      # Annonces
│       ├── applications/  # Candidatures
│       ├── submissions/   # Soumissions agent
│       ├── mandates/      # Mandats
│       ├── reports/       # Rapports joueurs
│       ├── posts/         # Feed social
│       ├── files/         # Upload/download S3
│       ├── notifications/ # Notifications
│       └── ai/            # Chat IA + confirmation
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── player/
│   ├── agent/
│   ├── club/
│   └── shared/
├── lib/
│   ├── prisma.ts          # Client Prisma
│   ├── auth.ts            # NextAuth config
│   ├── s3.ts              # S3/MinIO
│   ├── ai/                # Système IA
│   │   ├── assistants.ts  # 3 assistants config
│   │   ├── tools/         # Tools par rôle
│   │   ├── executor.ts    # Two-step confirmation
│   │   └── guardrails.ts  # Permissions + rate limits
│   ├── permissions/       # RBAC
│   ├── validators/        # Zod schemas
│   └── utils/
├── middleware.ts          # Auth + RBAC middleware
└── types/
```

## 🔑 Modèle de données

Entités principales :

- **User** : Compte utilisateur (email, password, role)
- **PlayerProfile** : Profil joueur (identité, physique, poste, stats, parcours)
- **AgentProfile** : Profil agent (licence, agence, spécialités)
- **ClubProfile** : Profil club (équipes, staff)
- **Listing** : Annonce mercato (club recherche joueur)
- **Application** : Candidature joueur → club
- **Submission** : Soumission agent → club (pour un joueur sous mandat)
- **Mandate** : Mandat agent ↔ joueur (statut PENDING/ACTIVE/EXPIRED)
- **PlayerReport** : Rapport joueur (sections, attachments, versioning)
- **Post/Comment/Like** : Feed social
- **Notification** : Notifications temps réel
- **AuditLog** : Traçabilité actions (surtout IA)
- **FileAsset** : Fichiers S3 avec permissions

Voir `prisma/schema.prisma` pour le schéma complet.

## 🤖 Système IA

### Architecture

Chaque rôle a son assistant IA dédié avec des **tools** (actions exécutables) :

1. **Player Agent** (pour joueurs)
   - `improve_profile` : suggère améliorations profil
   - `generate_post` : génère post social
   - `apply_to_listing` : postule à une annonce
   - `search_listings` : cherche annonces pertinentes
   - `draft_message` : prépare message pro

2. **Agent Copilot** (pour agents)
   - `shortlist_players` : génère shortlist selon critères
   - `submit_to_club` : soumet joueur (vérifie mandat actif)
   - `search_opportunities` : trouve annonces + clubs
   - `draft_mandate` : génère brouillon mandat
   - `send_follow_up` : prépare relance

3. **Club Scout** (pour clubs)
   - `score_applications` : score les candidatures
   - `compare_players` : compare 2+ joueurs
   - `search_players` : recherche avancée
   - `generate_shortlist` : shortlist depuis candidatures
   - `draft_offer` : prépare offre contractuelle

### Two-Step Confirmation

**Sécurité :** Toute action modifiant des données nécessite confirmation explicite.

**Flow :**

1. User demande à l'IA : "Postule à l'annonce #123"
2. IA propose l'action avec aperçu → `POST /api/ai/chat`
3. Frontend affiche modal de confirmation
4. User clique "Confirmer" → `POST /api/ai/confirm`
5. Backend exécute l'action + log audit + notification

### Guardrails

- ✅ Vérification permissions avant proposition ET exécution
- ✅ Validation Zod des paramètres
- ✅ Rate limiting (20 actions IA/heure/user)
- ✅ AuditLog obligatoire pour chaque action
- ✅ Expiration des actions pendantes (5 min)
- ✅ Vérification mandats actifs pour soumissions agent

## 🚀 Scripts npm

```bash
npm run dev          # Lancer en mode développement
npm run build        # Build production
npm run start        # Lancer en production
npm run lint         # Linter ESLint

npm run db:generate  # Générer client Prisma
npm run db:push      # Créer/maj tables sans migration
npm run db:migrate   # Créer migration + appliquer
npm run db:seed      # Seeder données de démo
npm run db:studio    # Ouvrir Prisma Studio (GUI)
```

## 🔐 Sécurité

### RBAC

- Middleware Next.js vérifie rôle sur chaque route
- API routes vérifient session + rôle + ownership
- Permissions granulaires via `lib/permissions/rbac.ts`

### Mandats

Un agent ne peut soumettre un joueur que si :
- Mandat existe en DB
- Statut = `ACTIVE`
- Date de fin > aujourd'hui

### Fichiers

- Stockage S3 avec presigned URLs
- Table `FileAsset` avec `accessPolicy` JSON
- Vérification accès sur `/api/files/[key]`

### Audit

- Toutes actions IA loggées dans `AuditLog`
- Inclut : action, user, params, résultat, IP, user-agent

## 🎨 UI/UX

- Design moderne avec **Tailwind CSS**
- Composants réutilisables via **shadcn/ui**
- Responsive mobile-first
- Dark mode (optionnel, à activer)
- Layouts différents par rôle (sidebar navigation)

## 📊 Roadmap / Améliorations futures

- [ ] OAuth (Google, LinkedIn)
- [ ] Notifications temps réel (WebSocket/Pusher)
- [ ] Messagerie interne
- [ ] Calendrier de matchs/essais
- [ ] Statistiques avancées avec graphiques
- [ ] Export PDF des rapports joueurs
- [ ] Multi-langue (i18n)
- [ ] Tests e2e (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement Vercel/Railway

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Ajout de ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

## 💬 Support

Pour toute question : contact@profoot-profile.com

---

**Profoot Profile** - Votre plateforme de transfert de footballeurs. ⚽
# PFP
