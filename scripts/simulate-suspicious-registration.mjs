#!/usr/bin/env node
/**
 * Simule des tentatives d'inscription « suspectes » (style bot) contre l'API locale ou distante.
 *
 * Prérequis : serveur Next qui tourne (ex. npm run dev).
 *
 * Usage :
 *   node scripts/simulate-suspicious-registration.mjs
 *   SIMULATE_REGISTER_URL=https://votre-domaine.com node scripts/simulate-suspicious-registration.mjs
 *
 * Si TURNSTILE_SECRET_KEY est défini côté serveur, les scénarios web échouent sans jeton.
 * Pour tester quand même le rate limit / email jetable, fournissez le secret mobile aligné sur MOBILE_API_SECRET :
 *   MOBILE_API_SECRET=votre_secret node scripts/simulate-suspicious-registration.mjs
 *
 * Les inscriptions de rafale utilisent des e-mails uniques ; en dev sans Turnstile, la 6e peut renvoyer 429 (limite IP).
 */

const BASE_URL = (
  process.env.SIMULATE_REGISTER_URL ||
  process.env.AUTH_URL ||
  "http://localhost:3000"
).replace(/\/$/, "")
const REGISTER_URL = `${BASE_URL}/api/auth/register`

const VALID_PASSWORD = "BotSim1!x" // respecte passwordSchema serveur

const mobileHeaders =
  process.env.MOBILE_API_SECRET && process.env.MOBILE_API_SECRET.length > 0
    ? {
        "x-pfp-client": "pfp-mobile",
        "x-pfp-mobile-secret": process.env.MOBILE_API_SECRET,
      }
    : {}

function logBlock(title) {
  console.log("\n" + "=".repeat(60))
  console.log(title)
  console.log("=".repeat(60))
}

const FETCH_TIMEOUT_MS = Number(process.env.SIMULATE_FETCH_TIMEOUT_MS || 8000)

async function registerAttempt(label, body, extraHeaders = {}) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS)
  let res
  try {
    res = await fetch(REGISTER_URL, {
      method: "POST",
      signal: ac.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // UA type script / bot
        "User-Agent": "python-requests/2.28.0 (compatible; BotRegistry/1.0)",
        ...extraHeaders,
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    clearTimeout(t)
    const msg = e?.name === "AbortError" ? `timeout après ${FETCH_TIMEOUT_MS}ms` : String(e.message || e)
    console.log(`\n[${label}] ERREUR RÉSEAU — ${msg}`)
    console.log("(Le serveur Next tourne-t-il sur cette URL ?)")
    return { status: 0, payload: {} }
  }
  clearTimeout(t)

  let payload
  const text = await res.text()
  try {
    payload = JSON.parse(text)
  } catch {
    payload = { _raw: text.slice(0, 200) }
  }

  console.log(`\n[${label}] HTTP ${res.status}`)
  console.log(JSON.stringify(payload, null, 2))
  return { status: res.status, payload }
}

async function main() {
  console.log(`Cible : ${REGISTER_URL}`)
  if (Object.keys(mobileHeaders).length) {
    console.log("Mode : en-têtes mobile + MOBILE_API_SECRET (contourne Turnstile côté API).")
  } else {
    console.log(
      "Mode : requêtes « web » (sans secret mobile). Si Turnstile est actif, attendez des 400 sans jeton valide."
    )
  }

  logBlock("1) Mot de passe trop faible (bot qui ne respecte pas les règles)")
  await registerAttempt(
    "weak-password",
    {
      email: "legit-looking@example.com",
      password: "12345678",
      role: "PLAYER",
    },
    mobileHeaders
  )

  logBlock("2) E-mail domaine jetable (souvent utilisé par des bots)")
  await registerAttempt(
    "disposable-email",
    {
      email: "spam_test@mailinator.com",
      password: VALID_PASSWORD,
      role: "PLAYER",
    },
    mobileHeaders
  )

  logBlock("3) Requête « navigateur » sans jeton Turnstile (si Turnstile activé → 400)")
  await registerAttempt("no-turnstile-web", {
    email: "human@example.com",
    password: VALID_PASSWORD,
    role: "PLAYER",
  })

  logBlock("4) Jeton Turnstile bidon (si Turnstile activé → 400)")
  await registerAttempt(
    "fake-turnstile",
    {
      email: "another@example.com",
      password: VALID_PASSWORD,
      role: "PLAYER",
      turnstileToken: "0.FAKE_TOKEN_FROM_BOT_SCRIPT",
    }
    // sans en-têtes mobile : teste le rejet Turnstile côté serveur
  )

  logBlock(
    "5) Rafale : plusieurs inscriptions avec e-mails différents (même IP → 429 après le quota)"
  )
  const burst = 6
  for (let i = 0; i < burst; i++) {
    const email = `bot_flood_${Date.now()}_${i}@example.com`
    await registerAttempt(`burst-${i + 1}/${burst}`, {
      email,
      password: VALID_PASSWORD,
      role: "PLAYER",
    }, mobileHeaders)
  }

  logBlock("Terminé")
  console.log(
    "Interprétation rapide : 400 jetable / validation, 400 Turnstile, 429 = rate limit IP ou e-mail."
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
