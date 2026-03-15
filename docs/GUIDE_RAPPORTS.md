# Guide d'Utilisation - Mes Rapports

## 🎯 Introduction

La section "Mes Rapports" vous permet de créer, gérer et partager des rapports professionnels sur les performances des joueurs.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Créer un rapport](#créer-un-rapport)
3. [Consulter les rapports](#consulter-les-rapports)
4. [Modifier un rapport](#modifier-un-rapport)
5. [Partager un rapport](#partager-un-rapport)
6. [Supprimer un rapport](#supprimer-un-rapport)
7. [Filtres et recherche](#filtres-et-recherche)

---

## 📊 Vue d'ensemble

### Page principale : `/player/reports`

La page affiche :
- **Statistiques** : Nombre total de rapports par statut
- **Barre de recherche** : Recherchez rapidement vos rapports
- **Filtres** : Filtrez par statut, type d'auteur ou triez les résultats
- **Liste des rapports** : Vos rapports sous forme de cartes

### Statuts disponibles

| Statut | Description | Icône |
|--------|-------------|-------|
| 🕐 **Brouillon** | Rapport en cours de rédaction | Horloge |
| ⚠️ **En attente** | Rapport soumis, en attente d'approbation | Alerte |
| ✅ **Approuvé** | Rapport validé et publié | Check |
| ❌ **Refusé** | Rapport non approuvé | Croix |

---

## ➕ Créer un rapport

### Étapes :

1. **Cliquez sur "Nouveau rapport"** (bouton bleu-violet en haut à droite)

2. **Remplissez les informations** :
   - **Titre** : Nom descriptif du rapport (min. 5 caractères)
     - Exemple : "Rapport de performance T1 2026"
   - **Type d'auteur** : Votre rôle
     - Joueur
     - Agent
     - Recruteur
     - Entraîneur

3. **Cliquez sur "Créer le rapport"**

4. Le rapport est créé en mode **Brouillon** et vous pouvez :
   - Le modifier pour ajouter des sections
   - Changer son statut
   - L'enregistrer pour plus tard

### Exemple de rapport
```
Titre : Rapport de performance - Saison 2025/2026
Type : Joueur
Statut : Brouillon (par défaut)
Sections : (à ajouter lors de l'édition)
```

---

## 👀 Consulter les rapports

### Vue liste

Dans la page principale, chaque carte affiche :
- **Titre du rapport**
- **Version** et **type d'auteur**
- **Badge de statut** (avec couleur)
- **Avatar de l'auteur** (initiales)
- **Nom de l'auteur**
- **Date de création**
- **Boutons d'action** :
  - 👁️ Voir
  - 🔗 Partager
  - ⋮ Menu (Modifier, Supprimer, etc.)

### Vue détaillée

Cliquez sur "Voir" pour accéder à la page détaillée : `/player/reports/[id]`

Cette page affiche :
- **En-tête** avec badges (statut, version)
- **Titre complet**
- **Métadonnées** :
  - Auteur du rapport
  - Sujet du rapport (joueur évalué)
  - Date de création
- **Sections du rapport** (contenu complet)
- **Actions** : Modifier, Partager, Télécharger, Supprimer

---

## ✏️ Modifier un rapport

### Accès à l'édition

**Option 1** : Depuis la page principale
- Cliquez sur le menu "⋮" sur une carte
- Sélectionnez "Modifier"

**Option 2** : Depuis la page de détails
- Cliquez sur "Modifier" en haut à droite

### Interface d'édition : `/player/reports/[id]/edit`

#### Informations générales
Modifiez :
- Titre du rapport
- Type d'auteur
- Statut (Brouillon → En attente → Approuvé/Refusé)

#### Gestion des sections

**Ajouter une section** :
1. Cliquez sur "+ Ajouter une section"
2. Remplissez :
   - **Titre de la section** (ex: "Performance technique")
   - **Contenu** (description détaillée)
3. Répétez pour ajouter plusieurs sections

**Supprimer une section** :
- Cliquez sur l'icône 🗑️ (corbeille) sur la section

**Réorganiser les sections** :
- Utilisez la poignée ⋮⋮ (drag handle) pour déplacer les sections

#### Enregistrer
- Cliquez sur "Enregistrer les modifications"
- Une notification confirme la sauvegarde

---

## 🔗 Partager un rapport

### Méthode 1 : Bouton Partager
1. Cliquez sur l'icône 🔗 sur une carte ou en haut de la page de détails
2. Le lien est automatiquement copié dans votre presse-papiers
3. Une notification confirme la copie
4. Partagez le lien par email, message, etc.

### Méthode 2 : Menu d'actions
1. Ouvrez le menu "⋮" sur une carte
2. Sélectionnez "Copier le lien"
3. Le lien est copié

### Format du lien
```
https://votre-domaine.com/player/reports/[id-du-rapport]
```

---

## 🗑️ Supprimer un rapport

⚠️ **Attention** : La suppression est **irréversible**.

### Étapes :
1. Ouvrez le menu "⋮" sur une carte de rapport
2. Sélectionnez "Supprimer" (en rouge)
3. Un dialogue de confirmation apparaît :
   - "Êtes-vous sûr ?"
   - "Cette action est irréversible..."
4. Cliquez sur "Supprimer" pour confirmer ou "Annuler"
5. Le rapport est définitivement supprimé

---

## 🔍 Filtres et recherche

### Barre de recherche
- Recherchez par **titre** du rapport
- Recherchez par **nom de l'auteur**
- La recherche est instantanée (sans validation)

### Filtre par statut
Options :
- Tous les statuts (par défaut)
- Brouillon
- En attente
- Approuvé
- Refusé

### Filtre par type d'auteur
Options :
- Tous les types (par défaut)
- Joueur
- Agent
- Recruteur
- Entraîneur

### Tri
Options :
- **Plus récents** (par défaut) : Tri par date de création décroissante
- **Titre (A-Z)** : Tri alphabétique
- **Statut** : Tri par ordre de statut

### Combinaisons
Vous pouvez combiner :
- Recherche + Filtres + Tri
- Exemple : Rechercher "performance" + Filtre "Approuvé" + Tri "Plus récents"

### Réinitialiser les filtres
Si aucun résultat n'est trouvé :
- Un bouton "Réinitialiser les filtres" apparaît
- Cliquez pour effacer tous les filtres

---

## 📱 Utilisation Mobile

L'interface est entièrement responsive :
- **Navigation simplifiée** : Filtres empilés verticalement
- **Cartes adaptées** : Une colonne sur mobile
- **Boutons tactiles** : Taille optimisée pour le toucher
- **Menus déroulants** : Faciles à utiliser au doigt

---

## 💡 Astuces

### Workflow recommandé
1. **Créez** un rapport en mode Brouillon
2. **Éditez** et ajoutez des sections progressivement
3. **Sauvegardez** régulièrement vos modifications
4. Quand c'est prêt, changez le statut en "En attente"
5. Après validation, le statut passe à "Approuvé"
6. **Partagez** le rapport approuvé

### Organisation
- Utilisez des **titres descriptifs** (avec dates)
- Créez des **sections thématiques** :
  - Performance technique
  - Qualités mentales
  - Statistiques
  - Recommandations
- Mettez à jour les **versions** régulièrement

### Bonnes pratiques
- ✅ Enregistrez votre travail fréquemment
- ✅ Utilisez des sections courtes et claires
- ✅ Vérifiez le statut avant de partager
- ✅ Utilisez les filtres pour retrouver vos rapports
- ❌ Ne supprimez pas un rapport sans confirmation
- ❌ N'oubliez pas de changer le statut après édition

---

## 🆘 FAQ

### Puis-je modifier un rapport approuvé ?
Oui, mais cela créera une nouvelle version. Le rapport garde un historique des versions.

### Combien de sections puis-je ajouter ?
Il n'y a pas de limite. Ajoutez autant de sections que nécessaire.

### Puis-je télécharger un rapport en PDF ?
Cette fonctionnalité est en cours de développement et sera disponible prochainement.

### Les rapports sont-ils sauvegardés automatiquement ?
Non, vous devez cliquer sur "Enregistrer" pour sauvegarder vos modifications.

### Puis-je voir les rapports des autres ?
Vous voyez les rapports dont vous êtes l'auteur ou le sujet. Les permissions peuvent être configurées via l'accessPolicy.

### Comment retrouver un ancien rapport ?
Utilisez la barre de recherche ou les filtres. Vous pouvez aussi trier par "Plus récents" pour voir les derniers en premier.

---

## 📞 Support

Pour toute question ou problème :
- Consultez cette documentation
- Vérifiez que votre navigateur est à jour
- Contactez le support technique

---

**Bonne utilisation ! 🚀**
