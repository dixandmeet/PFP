#!/usr/bin/env bash
set -euo pipefail

# Neon peut mettre quelques secondes à sortir de veille au cold start.
# On réessaie plusieurs fois avant d'échouer le build Vercel.
MAX_ATTEMPTS="${MIGRATE_MAX_ATTEMPTS:-5}"
WAIT_SECONDS="${MIGRATE_RETRY_WAIT_SECONDS:-12}"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  echo "prisma migrate deploy — tentative ${attempt}/${MAX_ATTEMPTS}..."
  if prisma migrate deploy; then
    echo "Migrations appliquées avec succès."
    exit 0
  fi

  if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
    echo "Échec de connexion, nouvel essai dans ${WAIT_SECONDS}s..."
    sleep "$WAIT_SECONDS"
  fi
done

echo "Échec des migrations après ${MAX_ATTEMPTS} tentatives."
exit 1
