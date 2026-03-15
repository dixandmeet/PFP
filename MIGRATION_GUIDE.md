# Guide de Migration - Fonctionnalités Sociales

## Problème

La commande `npm run db:push` échoue avec l'erreur :
```
Error: P1011: Error opening a TLS connection: bad certificate format
```

C'est un problème connu entre Prisma et Neon PostgreSQL.

## Solution : Migration manuelle via Neon Console

### Étape 1 : Accéder au SQL Editor

1. Allez sur [https://console.neon.tech/](https://console.neon.tech/)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche

### Étape 2 : Exécuter le script SQL

1. Ouvrez le fichier `prisma/migrations/manual_social_features.sql`
2. Copiez tout le contenu
3. Collez-le dans le SQL Editor de Neon
4. Cliquez sur **Run** pour exécuter le script

### Étape 3 : Vérifier la migration

Le script va créer :
- ✅ 5 nouvelles tables : `Share`, `Bookmark`, `Mention`, `Hashtag`, `PostHashtag`
- ✅ Tous les index nécessaires
- ✅ Toutes les contraintes de clés étrangères
- ✅ Les nouveaux types de notifications

### Étape 4 : Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis relancer :
npm run dev
```

## Alternative : Utiliser l'endpoint non-poolé

Si vous préférez utiliser Prisma CLI, vous pouvez essayer avec l'endpoint non-poolé :

1. Dans Neon console, allez dans **Dashboard** > **Connection Details**
2. Copiez la **Connection string** (pas celle du pooler)
3. Remplacez dans `.env` :

```env
# Avant (pooler)
DATABASE_URL="postgresql://...@ep-xxx-pooler.c-2.eu-central-1.aws.neon.tech/..."

# Après (direct)
DATABASE_URL="postgresql://...@ep-xxx.c-2.eu-central-1.aws.neon.tech/..."
```

4. Puis exécutez :
```bash
npm run db:push
```

## Vérification

Après la migration, votre base de données devrait avoir ces nouvelles tables :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('Share', 'Bookmark', 'Mention', 'Hashtag', 'PostHashtag')
ORDER BY table_name;
```

Vous devriez voir 5 tables dans les résultats.

## En cas de problème

Si l'exécution du script échoue :

1. **Vérifiez que les tables n'existent pas déjà** :
   ```sql
   DROP TABLE IF EXISTS "PostHashtag" CASCADE;
   DROP TABLE IF EXISTS "Share" CASCADE;
   DROP TABLE IF EXISTS "Bookmark" CASCADE;
   DROP TABLE IF EXISTS "Mention" CASCADE;
   DROP TABLE IF EXISTS "Hashtag" CASCADE;
   ```

2. **Exécutez à nouveau le script de migration**

3. **Si les enums posent problème** :
   ```sql
   -- Vérifier les valeurs de l'enum
   SELECT enumlabel FROM pg_enum 
   WHERE enumtypid = 'NotificationType'::regtype;
   
   -- Si POST_SHARE et MENTION n'existent pas, ils seront ajoutés par le script
   ```

## Support

Pour toute question, consultez :
- [Documentation Neon](https://neon.tech/docs/introduction)
- [Documentation Prisma](https://www.prisma.io/docs/concepts/components/prisma-migrate)
