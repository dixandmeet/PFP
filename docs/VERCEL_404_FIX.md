# Résolution de l’erreur 404 NOT_FOUND sur Vercel

## 1. Correction recommandée

### Cause la plus probable : **Root Directory** (répertoire racine du projet)

D’après la structure de ton dépôt (le repo est à la racine utilisateur et l’app est dans `PFP/`), Vercel a sans doute construit et servi depuis la mauvaise racine. Résultat : aucun build Next.js valide n’est servi, et **toutes** les URLs renvoient la page d’erreur 404 de Vercel (pas celle de Next.js).

**À faire :**

1. **Vercel Dashboard** → ton projet **PFP** → **Settings** → **General**.
2. Dans **Root Directory**, indique le dossier qui contient `package.json` de l’app :
   - Si le repo connecté contient uniquement le code de PFP (ex. `github.com/.../PFP`), laisse **vide** ou `.`.
   - Si le repo est plus large (monorepo ou repo parent) et que l’app est dans un sous-dossier, mets ce sous-dossier, par ex. **`PFP`** (sans slash final).
3. **Save**, puis **Redeploy** (Deployments → … sur le dernier déploiement → Redeploy).

Ensuite, vérifie les **logs de build** du dernier déploiement :

- **Deployments** → dernier déploiement → **Building** / **Logs**.
- Vérifie que la commande exécutée est bien dans le bon répertoire (là où il y a `package.json` et `next.config.js`).
- Vérifie qu’il n’y a pas d’erreur de build (TypeScript, dépendances, variables d’environnement manquantes, etc.).

Si le build échoue, la 404 peut aussi apparaître car aucun artefact valide n’est publié.

---

## 2. Cause racine : ce qui se passe vraiment

- **Ce que fait Vercel** : il lance `install` puis `build` dans le **Root Directory** configuré, puis sert le résultat (fichiers statiques + fonctions serverless pour Next.js).
- **Ce qui se passe en cas de mauvaise racine** :  
  - Si la racine est le repo parent (sans sous-dossier), il n’y a souvent pas de `package.json` Next.js à la racine → le build échoue ou ne produit pas l’app.  
  - Même si le build “réussit” ailleurs, Vercel sert l’output de ce build. S’il n’y a pas d’app Next.js dedans, **aucune route** n’existe → chaque requête (y compris `/`) renvoie la 404 **Vercel** (code `NOT_FOUND`).
- **Pourquoi tu vois “404: NOT FOUND” avec un ID Vercel** : cette page est celle de la **plateforme** Vercel (“la ressource demandée n’existe pas”), pas la page 404 de ton app Next.js. Donc la requête n’atteint pas Next.js : Vercel ne trouve pas de déploiement ou de route correspondante pour cette URL.

En résumé :  
**Mauvaise Root Directory (ou build qui échoue) → pas d’app déployée pour ce projet → toutes les URLs → 404 NOT_FOUND côté Vercel.**

---

## 3. Principe derrière cette erreur

- **À quoi sert cette 404** : éviter de servir n’importe quoi quand une URL ne correspond à aucun déploiement ou fichier connu. Mieux vaut une page d’erreur explicite qu’une page blanche ou un contenu incorrect.
- **Modèle mental** :  
  - **Vercel** : “J’ai un déploiement actif, un build, et une liste de routes (fichiers/API). Si la requête ne correspond à rien, je renvoie NOT_FOUND.”  
  - Si le build n’a pas produit les bonnes routes (mauvaise racine ou build en échec), **toutes** les URLs sont “inconnues” → 404 partout.
- **Dans l’écosystème** : sur Vercel, la 404 peut venir soit de la plateforme (comme ici : pas de ressource pour cette URL dans ce déploiement), soit de ton app (Next.js qui renvoie sa propre 404). Ici, l’ID d’erreur et le style de page indiquent clairement la 404 **Vercel**.

---

## 4. Signes à surveiller pour ne pas revivre le problème

- **Repo avec plusieurs apps ou sous-dossiers** : toujours vérifier **Root Directory** dans les paramètres du projet Vercel.
- **404 sur toutes les URLs** (y compris `/`) : en général, ce n’est pas une route manquante dans le code, mais un souci de déploiement (racine, build, ou mauvais projet).
- **Page 404 avec “Code: NOT_FOUND” et un ID type `cdg1:...`** : c’est la 404 Vercel, pas celle de Next.js.
- **À faire après chaque changement de structure** : vérifier que Root Directory pointe toujours vers le dossier qui contient `package.json` et `next.config.js`, et que le build passe dans les logs.

Erreurs proches possibles :  
- **Build failed** : même effet “rien à servir” si on ne corrige pas.  
- **Wrong project / wrong branch** : le bon code n’est pas déployé.  
- **Output directory personnalisé** : si tu changeais `distDir` ou un “export” statique sans adapter Vercel, les fichiers servis pourraient ne pas être ceux attendus.

---

## 5. Autres approches et variantes

| Approche | Idée | Quand l’utiliser |
|----------|------|-------------------|
| **Root Directory** (recommandé) | Dire à Vercel où est l’app dans le repo. | Repo = monorepo ou dossier parent (ton cas typique). |
| **Repo dédié** | Un repo qui ne contient que le code de PFP (racine = dossier de l’app). | Pour éviter de toucher à Root Directory. |
| **Turborepo / Nx** | Gérer plusieurs apps avec des configs de build explicites. | Si tu ajoutes d’autres apps dans le même repo. |
| **Vercel CLI** | Déployer avec `vercel --cwd PFP` pour forcer le répertoire. | Déploiements manuels ou CI depuis un repo parent. |

En pratique : corriger **Root Directory** (et s’assurer que le build passe) suffit dans la grande majorité des cas pour ce type de 404.
