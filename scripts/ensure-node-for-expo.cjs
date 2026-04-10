#!/usr/bin/env node
/**
 * Expo / EAS CLI (SDK 52) ne fonctionne pas correctement avec Node 23+ (ex. erreur
 * ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING sur expo-modules-core).
 * Le monorepo déclare engines: node >=18 <22.18 — utiliser Node 20 LTS est recommandé.
 */
if (process.env.SKIP_NODE_CHECK === "1") {
  process.exit(0)
}

const major = parseInt(process.version.slice(1).split(".")[0], 10)

const allowed = major === 18 || major === 20 || major === 21 || major === 22

if (!allowed) {
  console.error(
    `[PFP] Node ${process.version} n’est pas pris en charge pour les commandes Expo/EAS de l’app mobile.`
  )
  console.error("[PFP] Utilisez Node 20 LTS (voir .nvmrc à la racine du repo), par exemple :")
  console.error("    nvm install && nvm use")
  console.error("    # ou depuis la racine du repo (charge nvm automatiquement) :")
  console.error("    pnpm mobile:dev")
  console.error("    # ou : fnm use")
  console.error("[PFP] Pour ignorer ce contrôle (non recommandé) : SKIP_NODE_CHECK=1")
  process.exit(1)
}

process.exit(0)
