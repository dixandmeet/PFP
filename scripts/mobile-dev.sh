#!/usr/bin/env bash
# Lance Expo avec la version Node du .nvmrc (évite Node 24 par défaut dans un terminal neuf).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -s "${NVM_DIR:=$HOME/.nvm}/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  if [[ -f "$ROOT/.nvmrc" ]]; then
    nvm use
  fi
elif command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env)"
  fnm use
fi

exec pnpm --filter @pfp/mobile dev
