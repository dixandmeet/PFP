import type { Metadata } from "next"
import Link from "next/link"
import { Code, Key, Globe, FileJson, ArrowRight, Lock, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "API Documentation | Profoot Profile",
  description: "Documentation de l'API Profoot Profile. Intégrez nos données dans vos applications.",
}

const endpoints = [
  {
    method: "GET",
    path: "/api/players",
    description: "Liste des joueurs avec filtres (poste, âge, nationalité...)",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/players/:id",
    description: "Détails d'un joueur spécifique",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/clubs",
    description: "Liste des clubs avec filtres",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/listings",
    description: "Annonces de recrutement actives",
    auth: true,
  },
  {
    method: "POST",
    path: "/api/search",
    description: "Recherche avancée multi-critères",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/football/teams/:id",
    description: "Données d'une équipe (effectif, stats)",
    auth: true,
  },
]

const methodColors: Record<string, string> = {
  GET: "bg-green-50 text-green-600 border-green-200",
  POST: "bg-blue-50 text-blue-600 border-blue-200",
  PUT: "bg-amber-50 text-amber-600 border-amber-200",
  DELETE: "bg-red-50 text-red-600 border-red-200",
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-stadium-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pitch-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">PF</span>
            </div>
            <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-stadium-900">API Documentation</h1>
        </div>
        <p className="text-lg text-stadium-500 mb-12">
          Int&eacute;grez les donn&eacute;es Profoot Profile dans vos applications.
        </p>

        {/* Getting started */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-6">D&eacute;marrage rapide</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-stadium-200">
              <Key className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-stadium-900 text-sm mb-1">1. Obtenez une cl&eacute; API</h3>
              <p className="text-xs text-stadium-500">Cr&eacute;ez un compte et g&eacute;n&eacute;rez votre cl&eacute; depuis les param&egrave;tres.</p>
            </div>
            <div className="p-5 rounded-xl border border-stadium-200">
              <Globe className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-stadium-900 text-sm mb-1">2. Faites vos requ&ecirc;tes</h3>
              <p className="text-xs text-stadium-500">Utilisez l&apos;API REST avec votre cl&eacute; dans le header Authorization.</p>
            </div>
            <div className="p-5 rounded-xl border border-stadium-200">
              <FileJson className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-stadium-900 text-sm mb-1">3. Recevez les donn&eacute;es</h3>
              <p className="text-xs text-stadium-500">Les r&eacute;ponses sont au format JSON avec pagination int&eacute;gr&eacute;e.</p>
            </div>
          </div>
        </section>

        {/* Base URL */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-stadium-900 mb-4">URL de base</h2>
          <div className="bg-stadium-900 text-green-400 rounded-xl p-4 font-mono text-sm">
            https://api.profootprofile.com/v1
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-stadium-900 mb-4">Authentification</h2>
          <div className="bg-stadium-50 border border-stadium-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-primary" />
              <span className="font-semibold text-stadium-900 text-sm">Bearer Token</span>
            </div>
            <p className="text-sm text-stadium-500 mb-4">
              Incluez votre cl&eacute; API dans le header de chaque requ&ecirc;te :
            </p>
            <div className="bg-stadium-900 text-green-400 rounded-lg p-3 font-mono text-xs">
              Authorization: Bearer votre_cle_api
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-stadium-900 mb-6">Endpoints principaux</h2>
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <div
                key={`${endpoint.method}-${endpoint.path}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-stadium-200 hover:border-primary/20 transition-colors"
              >
                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${methodColors[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono text-stadium-700 flex-1">{endpoint.path}</code>
                <span className="text-xs text-stadium-400 hidden sm:block">{endpoint.description}</span>
                {endpoint.auth && (
                  <Lock className="w-3.5 h-3.5 text-stadium-300 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Rate limits */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-stadium-900 mb-4">Limites</h2>
          <div className="bg-stadium-50 border border-stadium-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-stadium-900 text-sm">Rate Limiting</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-stadium-500">Starter</span>
                <p className="font-semibold text-stadium-900">100 req/heure</p>
              </div>
              <div>
                <span className="text-stadium-500">Pro</span>
                <p className="font-semibold text-stadium-900">1 000 req/heure</p>
              </div>
              <div>
                <span className="text-stadium-500">Elite</span>
                <p className="font-semibold text-stadium-900">10 000 req/heure</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-stadium-900 mb-2">
            Besoin d&apos;aide avec l&apos;API ?
          </h2>
          <p className="text-stadium-500 text-sm mb-6">
            Notre &eacute;quipe technique est disponible pour vous accompagner dans l&apos;int&eacute;gration.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Contacter le support technique
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-stadium-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pitch-600 hover:text-pitch-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour &agrave; l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  )
}
