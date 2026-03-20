# Profoot Profile - Landing Page Apple 2026

## Vue d'ensemble

Landing page premium avec design "Apple keynote 2026" : minimalisme, fond clair, grandes respirations, illustrations SVG originales, micro-interactions fluides.

## Architecture

### Structure des fichiers créés

```
src/
├── app/
│   ├── page.tsx                          # Page principale (Server Component)
│   ├── layout.tsx                        # Layout avec typo Inter
│   └── globals.css                       # Design system Apple
├── components/
│   ├── nav/
│   │   └── TopNav.tsx                    # Navigation sticky (Client)
│   ├── sections/
│   │   ├── Hero.tsx                      # Hero section (Server)
│   │   ├── NetworkSection.tsx            # Section réseau LinkedIn (Server)
│   │   ├── ForWho.tsx                    # 3 personas (Server)
│   │   ├── OpportunitiesSection.tsx      # Marketplace mercato (Server)
│   │   ├── HowItWorks.tsx                # 4 étapes (Server)
│   │   ├── AIStudio.tsx                  # IA assistants (Server)
│   │   ├── TrustSecurity.tsx             # Sécurité (Server)
│   │   └── FinalCTA.tsx                  # CTA final (Server)
│   ├── footer/
│   │   └── Footer.tsx                    # Footer minimal (Server)
│   ├── ui/
│   │   ├── Button.tsx                    # Button avec animations (Client)
│   │   └── Card.tsx                      # Card avec hover/tilt (Client)
│   ├── motion/
│   │   ├── MotionProvider.tsx            # Context motion (Client)
│   │   ├── Reveal.tsx                    # Scroll reveals (Client)
│   │   └── AnimatedCard.tsx              # Card animée (Client)
│   └── illustrations/
│       ├── HeroNetwork.tsx               # Illustration réseau (Client)
│       ├── InsightOrbIllustration.tsx    # Illustration réseau / données (Client)
│       └── SecurityVault.tsx             # Illustration sécurité (Client)
└── tailwind.config.ts                    # Config Tailwind Apple
```

## Design System Apple 2026

### Couleurs

- **Background**: `#F7F7F8` (apple-bg)
- **Texte principal**: `#0B0D10` (apple-text)
- **Texte secondaire**: `#5B616B` (apple-text-secondary)
- **Accent primaire**: `#0A84FF` (apple-accent)
- **Accent secondaire**: `#2AC3A2` (apple-accent-secondary)
- **Bordures**: `rgba(10, 10, 10, 0.08)` (apple-border)
- **Glass**: `rgba(255, 255, 255, 0.65)` (apple-glass)

### Radius

- `apple`: 18px
- `apple-lg`: 24px
- `apple-xl`: 32px

### Ombres

- `apple-sm`: Ombre très légère
- `apple`: Ombre standard
- `apple-lg`: Ombre élevée
- `apple-xl`: Ombre maximale

### Typographie

- **Police**: Inter (300, 400, 500, 600, 700)
- **H1**: 5xl-7xl, font-bold, tracking-tight
- **H2**: 4xl-5xl, font-bold, tracking-tight
- **Body**: leading-relaxed

## Animations

### Scroll Reveals

- Opacity: 0 → 1
- TranslateY: 40 → 0
- Filter: blur(8px) → blur(0) (optionnel)
- Stagger delay: 0.1s entre éléments

### Interactions

- **Buttons**: Scale 1.02 on hover, 0.98 on press
- **Cards**: translateY(-4px) on hover + shadow lift
- **Cards (tilt)**: Rotation 3D ultra-légère (2.5deg max)

### Illustrations SVG

- **HeroNetwork**: Float + pulse sur nœuds, lignes animées
- **InsightOrbIllustration**: Rotation lente + pulse central
- **SecurityVault**: Glow subtil + scanning lines

### Accessibilité

- Respect de `prefers-reduced-motion`
- Durées d'animation réduites à 0.01ms si préférence activée
- Focus rings visibles sur tous les éléments interactifs
- Contraste WCAG AA vérifié

## Installation

### Prérequis

Toutes les dépendances nécessaires sont déjà installées :

- Next.js 16.1.5 ✅
- Framer Motion 12.29.2 ✅
- Tailwind CSS 3.4.0 ✅
- TypeScript ✅
- Lucide React (icônes) ✅

**Aucune nouvelle dépendance requise.**

### Lancer en local

```bash
# Installer les dépendances (si ce n'est pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Performance

- **Server Components par défaut**: Toutes les sections sont des Server Components
- **Client Components limités**: Uniquement pour animations et interactions
- **Illustrations SVG**: Pas d'images externes, performance optimale
- **Lazy loading**: Animations chargées uniquement quand visibles
- **Code splitting**: Automatique avec Next.js App Router

## Navigation

La landing page est organisée en sections avec ancres :

- `#reseau` - Section réseau professionnel
- `#opportunites` - Section marketplace
- `#ia` - Section IA assistants
- `#securite` - Section sécurité

## Responsive Design

- **Mobile first**: Design optimisé pour mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid adaptatif**: 1 col mobile, 2-3 cols desktop
- **Navigation**: Menu hamburger sur mobile (à implémenter si besoin)

## Sections

### 1. Hero
- H1: "Le réseau professionnel du football."
- 2 CTAs + micro-proof badges
- Illustration HeroNetwork animée

### 2. NetworkSection
- Explication du concept "LinkedIn du foot"
- 3 features: Profil, Connexions, Feed
- Mock feed avec 3 posts stylés

### 3. ForWho
- 3 personas: Joueurs, Agents, Clubs
- Cards avec hover/tilt effects
- 4 features + CTA par persona

### 4. OpportunitiesSection
- Marketplace mercato
- 4 features en grid

### 5. HowItWorks
- 4 étapes du processus
- Design horizontal (desktop) / vertical (mobile)

### 6. AIStudio
- Illustration InsightOrbIllustration
- 3 assistants IA
- Badge validation humaine

### 7. TrustSecurity
- Illustration SecurityVault
- 6 features sécurité en grid
- Message mandat requis

### 8. FinalCTA
- Philosophie de marque
- 2 CTAs finaux
- Trust indicators

### 9. Footer
- Logo + description
- Liens légaux
- Copyright

## Copy intégré

Tous les textes sont intégrés selon le brief :
- Ton professionnel et sobre
- Pas de promesses exagérées
- Focus sur structure, clarté, confiance
- Vocabulaire "élite" sans ostentation

## Prochaines étapes possibles

1. **Navigation mobile**: Ajouter menu hamburger pour mobile
2. **Contact form**: Créer page de contact
3. **Pages légales**: Créer pages CGU, Confidentialité, etc.
4. **Animations avancées**: Parallax scroll sur certains éléments
5. **Tests E2E**: Ajouter tests Playwright ou Cypress
6. **Analytics**: Intégrer Google Analytics ou Plausible
7. **SEO**: Optimiser meta tags et structured data

## Notes techniques

- **MotionProvider**: Wrapper pour gérer `prefers-reduced-motion` globalement
- **Reveal component**: Réutilisable pour scroll reveals avec variants
- **StaggerContainer/Item**: Pour animer des listes avec délai
- **AnimatedCard**: Card avec tilt 3D optionnel
- **Button**: Animations spring avec Framer Motion
- **Illustrations**: SVG React avec animations Framer Motion

## Maintenance

- **Tailwind classes**: Préfixer les utilitaires custom avec `apple-`
- **Animations**: Toujours vérifier `shouldReduceMotion` dans les composants client
- **Colors**: Utiliser les variables CSS du design system
- **Spacing**: Utiliser les tokens Tailwind (4, 8, 16, etc.)

---

**Landing page créée avec ❤️ en style Apple 2026**
