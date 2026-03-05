# Implémentation de la page "Mon Profil"

## Vue d'ensemble

La page "Mon Profil" a été implémentée avec succès pour tous les types d'utilisateurs (Player, Agent, Club). Chaque page de profil est composée de deux parties principales :

1. **Carte de profil** : affichage de la photo de profil, photo de couverture, statistiques (posts, abonnés, abonnements) et boutons d'action
2. **Feed utilisateur** : liste de tous les posts publiés par l'utilisateur

## Fichiers créés/modifiés

### Schéma Prisma

- ✅ `prisma/schema.prisma` : Ajout du champ `coverPhoto` dans `PlayerProfile`, `AgentProfile` et `ClubProfile`
- ✅ `prisma/migrations/add_cover_photo.sql` : Migration SQL manuelle à exécuter

### APIs

- ✅ `src/app/api/posts/route.ts` : Ajout du filtre `userId` pour récupérer les posts d'un utilisateur spécifique
- ✅ `src/app/api/users/[id]/route.ts` : Nouvelle API pour récupérer un utilisateur avec ses statistiques
- ✅ `src/app/api/users/[id]/follow/route.ts` : API pour gérer le follow/unfollow et les statistiques

### Composants

- ✅ `src/components/profile/ProfileCard.tsx` : Carte de profil avec photo de couverture, stats et boutons
- ✅ `src/components/profile/UserFeed.tsx` : Composant d'affichage du feed utilisateur

### Pages de consultation

- ✅ `src/app/player/profile/page.tsx` : Page "Mon Profil" pour les joueurs (refactorisée)
- ✅ `src/app/agent/profile/page.tsx` : Page "Mon Profil" pour les agents (refactorisée)
- ✅ `src/app/club/profile/page.tsx` : Page "Mon Profil" pour les clubs (refactorisée)

### Pages d'édition

- ✅ `src/app/player/profile/edit/page.tsx` : Formulaire d'édition du profil joueur
- ✅ `src/app/agent/profile/edit/page.tsx` : Formulaire d'édition du profil agent
- ✅ `src/app/club/profile/edit/page.tsx` : Formulaire d'édition du profil club

### Page publique

- ✅ `src/app/profile/[id]/page.tsx` : Page publique accessible à tous pour consulter n'importe quel profil

### Validators

- ✅ `src/lib/validators/schemas.ts` : Ajout des champs `profilePicture` et `coverPhoto` dans les schémas

## Fonctionnalités implémentées

### Carte de profil (ProfileCard)

- Photo de profil circulaire superposée sur la photo de couverture
- Photo de couverture avec ratio 16:9 (hauteur 300px)
- Upload de photo de couverture (uniquement pour le propriétaire)
- Badge de vérification pour les profils vérifiés
- Statistiques en 3 colonnes : Posts, Abonnés, Abonnements
- Boutons d'action :
  - "Modifier le profil" → redirige vers `/[role]/profile/edit`
  - "Consulter la page publique" → redirige vers `/profile/[id]`

### Feed utilisateur (UserFeed)

- Affichage des posts filtrés par `userId`
- Pagination avec bouton "Charger plus"
- Utilisation du composant `FeedCard` existant
- Message vide si aucun post

### Pages d'édition

- Formulaires complets avec validation Zod
- Upload de photo de profil et photo de couverture
- Tous les champs spécifiques à chaque type de profil
- Boutons "Enregistrer" et "Annuler"
- Gestion des états de chargement et d'erreur

### Page publique

- Accessible à tous (authentifiés ou non)
- Bouton "Suivre" / "Ne plus suivre" (si connecté et pas propriétaire)
- Bouton de partage
- Affichage des posts publics de l'utilisateur
- Respect de la visibilité du profil (isPublic)

## Étapes de déploiement

### 1. Migration de la base de données

Exécutez le script SQL manuellement dans le dashboard Neon :

```bash
# Ouvrez https://console.neon.tech/
# Allez dans SQL Editor
# Copiez et exécutez le contenu de prisma/migrations/add_cover_photo.sql
```

**OU** si vous avez résolu le problème de connexion TLS :

```bash
npx prisma migrate deploy
```

### 2. Générer le client Prisma (déjà fait)

```bash
npx prisma generate
```

### 3. Tester localement

Démarrez le serveur de développement :

```bash
npm run dev
```

Testez les routes suivantes :

- `/player/profile` - Page de profil joueur
- `/agent/profile` - Page de profil agent
- `/club/profile` - Page de profil club
- `/player/profile/edit` - Édition profil joueur
- `/profile/[id]` - Page publique (remplacez [id] par un vrai ID)

### 4. Vérifier les APIs

- `GET /api/posts?userId={userId}` - Posts d'un utilisateur
- `GET /api/users/[id]` - Profil avec statistiques
- `GET /api/users/[id]/follow` - Statistiques de suivi
- `POST /api/users/[id]/follow` - Suivre un utilisateur
- `DELETE /api/users/[id]/follow` - Ne plus suivre

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Pages de Profil                         │
│  /player/profile  |  /agent/profile  |  /club/profile       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │        ProfileCard Component        │
        │  - Photo couverture                 │
        │  - Photo profil                     │
        │  - Stats (Posts/Abonnés/Abonnts)    │
        │  - Boutons d'action                 │
        └────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │        UserFeed Component           │
        │  - Posts filtrés par userId         │
        │  - Pagination                       │
        └────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │           APIs Backend              │
        │  - GET /api/posts?userId=...        │
        │  - GET /api/users/[id]              │
        │  - GET/POST/DELETE .../follow       │
        └────────────────────────────────────┘
```

## Design UI/UX

Le design suit les couleurs et le style existants du projet :

- **Palette de couleurs** : pitch-* (vert) et stadium-* (gris/neutre)
- **Photo de couverture** : Gradient par défaut si non définie
- **Photo de profil** : Avatar avec icône par défaut si non définie
- **Responsive** : Mobile-first, adaptatif sur tous les écrans
- **Animations** : Framer Motion pour les transitions douces

## Notes importantes

1. **Migration Prisma** : La migration automatique a échoué à cause d'un problème TLS. Utilisez le script SQL manuel fourni.

2. **Upload S3** : Les photos utilisent l'API existante `/api/files/upload` qui gère les uploads vers S3.

3. **Permissions** : Les pages d'édition vérifient que l'utilisateur connecté est bien le propriétaire du profil.

4. **Performance** : Les statistiques de followers sont comptées en temps réel. Pour de meilleures performances en production, envisagez la mise en cache.

5. **SEO** : Ajoutez des meta tags dans les pages publiques pour améliorer le référencement.

## Prochaines étapes suggérées

- [ ] Ajouter la liste des followers/following (pages dédiées)
- [ ] Implémenter les suggestions de profils à suivre
- [ ] Ajouter des filtres de recherche dans le feed utilisateur
- [ ] Optimiser les requêtes avec des index Prisma supplémentaires
- [ ] Ajouter des tests unitaires pour les composants
- [ ] Implémenter le système de notifications push pour les nouveaux followers

## Support

En cas de problème, vérifiez :

1. La migration SQL a bien été exécutée sur Neon
2. Le client Prisma a été généré (`npx prisma generate`)
3. Les variables d'environnement sont correctement configurées
4. Les dépendances sont à jour (`npm install`)
