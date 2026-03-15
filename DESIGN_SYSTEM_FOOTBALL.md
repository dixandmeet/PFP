# Design System Football Premium - Profoot Profile

## Vue d'ensemble

Design premium inspiré de l'univers du football professionnel, avec des couleurs évoquant la pelouse, les stades et la victoire. Le design combine élégance, modernité et performance pour une expérience utilisateur haut de gamme.

## Palette de couleurs

### Pitch (Vert pelouse)
Couleur principale représentant le terrain de football.

- **pitch-50**: `#f0fdf4` - Très clair, fond subtil
- **pitch-100**: `#dcfce7` - Fond léger
- **pitch-200**: `#bbf7d0` - Bordures
- **pitch-300**: `#86efac` - Hover léger
- **pitch-400**: `#4ade80` - Accents
- **pitch-500**: `#22c55e` - **Principal** ⭐
- **pitch-600**: `#16a34a` - Gradients foncés
- **pitch-700**: `#15803d` - Headers
- **pitch-800**: `#166534` - Texte sur fond clair
- **pitch-900**: `#14532d` - Très foncé
- **pitch-950**: `#052e16` - Presque noir

### Stadium (Gris structure)
Couleurs neutres évoquant l'infrastructure du stade.

- **stadium-50** à **stadium-950**: Échelle de gris moderne
- Utilisé pour les textes, bordures et éléments neutres

### Gold (Or victoire)
Couleur d'accent représentant le succès et l'excellence.

- **gold-50**: `#fefce8` - Très clair
- **gold-400**: `#facc15` - **Accent principal** ⭐
- **gold-600**: `#ca8a04` - Gradients riches
- Utilisé pour les badges, récompenses et highlights

### Victory (Orange passion)
Couleur secondaire représentant l'énergie et la détermination.

- **victory-50**: `#fff7ed` - Très clair
- **victory-500**: `#f97316` - **Principal** ⭐
- **victory-600**: `#ea580c` - Gradients
- Utilisé pour les CTAs importants et notifications

## Composants principaux

### 1. DashboardHeader
Header immersif avec gradient vert pelouse et animations fluides.

```tsx
<DashboardHeader
  title="Tableau de bord"
  subtitle="Bienvenue, "
  userName="John Doe"
  stats={[
    { label: "Profil", value: "100%" },
  ]}
/>
```

**Caractéristiques:**
- Gradient `pitch-600` → `pitch-500` → `pitch-700`
- Motif terrain de foot en arrière-plan (cercle central)
- Badge "Pro" avec animation spring
- Barre de progression animée
- Effets de lumière (blur gold/pitch)

### 2. StatsCard
Cartes de statistiques premium avec gradients et animations.

```tsx
<StatsCard
  title="Candidatures actives"
  value={15}
  subtitle="En cours de traitement"
  icon={FileText}
  gradient="pitch" // pitch | gold | victory | stadium
  trend={{ value: "+12%", isPositive: true }}
  link={{ href: "/applications", label: "Voir tout" }}
  delay={0}
/>
```

**Caractéristiques:**
- 4 gradients disponibles (pitch, gold, victory, stadium)
- Icône avec gradient en cercle
- Animation d'entrée (fade + slide)
- Hover effect: scale + shadow
- Badge de tendance (↑ vert ou ↓ rouge)
- Lien d'action optionnel
- Effet de brillance au hover

### 3. Card Stadium
Carte premium avec bordure pitch et shadow premium.

**Classe CSS:**
```css
.card-stadium
```

**Caractéristiques:**
- Background blanc avec gradient subtil vers `pitch-50/30`
- Bordure 2px `pitch-100`
- Shadow custom avec teinte verte
- Hover: translate-y + shadow augmentée + bordure `pitch-200`
- Border-radius 2xl (1rem)

### 4. Stat Card
Carte de statistique avec barre de gradient supérieure.

**Classe CSS:**
```css
.stat-card
```

**Caractéristiques:**
- Barre gradient en haut (pitch → gold)
- Background gradient subtil
- Hover: scale-105 + shadow premium
- Border 2px pitch

## Classes utilitaires

### Glass Effects

```css
.glass-pitch       /* Glassmorphism avec teinte verte */
.glass-stadium     /* Glassmorphism opaque */
```

### Text Gradients

```css
.text-gradient-pitch    /* Gradient vert pelouse */
.text-gradient-gold     /* Gradient or victoire */
.text-gradient-victory  /* Gradient orange → or */
```

### Patterns

```css
.pitch-pattern  /* Grille subtile évoquant un terrain */
```

### Badges

```css
.badge-premium  /* Badge stylisé avec tracking et uppercase */
```

## Background principal

Le body utilise un gradient subtil:
```css
bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30
```

Cela crée une ambiance lumineuse et aérée avec une légère teinte verte.

## Animations

### Animations Framer Motion

**StatsCard:**
- Initial: `opacity: 0, y: 20`
- Animate: `opacity: 1, y: 0`
- Duration: 0.4s avec délai progressif

**DashboardHeader:**
- Badge: animation spring scale
- Barre de progression: width 0 → 75%
- Stats: stagger animation

**Hover Effects:**
- Cards: `-translate-y-1` + shadow augmentée
- Icons: `scale-110`
- Buttons: `translate-x-1` (liens d'action)

### Keyframes Tailwind

```js
'fade-in-up': 'fade-in-up 0.6s ease-out',
'scale-in': 'scale-in 0.5s ease-out',
'shimmer': 'shimmer 3s ease-in-out infinite',
```

## Structure des dashboards

### Layout type
```
<div className="min-h-screen pitch-pattern">
  <div className="container mx-auto p-6 space-y-8 max-w-7xl">
    {/* Header Premium */}
    <DashboardHeader />
    
    {/* Stats Cards */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard />...
    </div>
    
    {/* Section principale */}
    <div className="card-stadium">...</div>
    
    {/* Actions rapides */}
    <div className="card-stadium">...</div>
  </div>
</div>
```

## Gradients d'icônes

Les icônes dans les composants utilisent des gradients spécifiques:

- **pitch**: `from-pitch-500 to-pitch-600` - Statistiques principales
- **gold**: `from-gold-400 to-gold-600` - Éléments premium
- **victory**: `from-victory-500 to-gold-500` - CTAs importants
- **stadium**: `from-stadium-700 to-stadium-900` - Éléments secondaires

## Status Badges

Les badges de statut utilisent des couleurs football:

```tsx
// Exemple pour candidatures
SUBMITTED: "bg-blue-100 text-blue-700"
UNDER_REVIEW: "bg-yellow-100 text-yellow-700"
SHORTLISTED: "bg-purple-100 text-purple-700"
ACCEPTED: "bg-pitch-100 text-pitch-700"  // Vert football
SIGNED: "bg-pitch-600 text-white"         // Vert foncé
```

## Responsive Design

- **Mobile first**: Toutes les cards empilées verticalement
- **md (768px)**: Grid 2 colonnes pour stats
- **lg (1024px)**: Grid 4 colonnes pour stats, 3 pour actions
- **Container max-width**: 7xl (80rem / 1280px)

## Accessibilité

- Contraste WCAG AA vérifié sur tous les éléments
- Focus states visibles avec ring `pitch-500`
- Support `prefers-reduced-motion`
- Animations désactivables

## Performance

- **Animations légères**: Utilisation de transform/opacity uniquement
- **GPU acceleration**: translate3d implicite
- **Stagger intelligent**: Délais de 0.1s entre cartes
- **Will-change**: Appliqué automatiquement par Framer Motion

## Exemples de gradients combinés

### Header hero
```tsx
className="bg-gradient-to-br from-pitch-600 via-pitch-500 to-pitch-700"
```

### Card subtle
```tsx
className="bg-gradient-to-br from-white to-pitch-50/30"
```

### Button CTA
```tsx
className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800"
```

## Thème général

Le design évoque:
- 🟢 **Pelouse**: Fraîcheur, professionnalisme, terrain de jeu
- 🏟️ **Stade**: Structure, solidité, infrastructure
- 🏆 **Victoire**: Excellence, réussite, ambition
- ⚡ **Performance**: Rapidité, efficacité, modernité

---

**Design créé avec passion pour Profoot Profile** ⚽
