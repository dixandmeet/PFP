"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, MapPin, Send, MessageSquare, Building2, User } from "lucide-react"

const subjects = [
  "Question générale",
  "Partenariat",
  "Support technique",
  "Presse / Média",
  "Autre",
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    role: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: envoyer les données du formulaire via API
    setSubmitted(true)
  }

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
        <h1 className="text-4xl font-bold text-stadium-900 mb-4">
          Contactez-nous
        </h1>
        <p className="text-lg text-stadium-500 mb-12">
          Une question, un partenariat ou besoin d&apos;aide ? Notre &eacute;quipe vous r&eacute;pond sous 48h.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-stadium-900 mb-1">Email</h3>
              <a href="mailto:contact@profootprofile.com" className="text-sm text-primary hover:underline">
                contact@profootprofile.com
              </a>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-stadium-900 mb-1">Adresse</h3>
              <p className="text-sm text-stadium-500">
                Paris, France
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-stadium-900 mb-1">Support</h3>
              <Link href="/support" className="text-sm text-primary hover:underline">
                Centre d&apos;aide
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-stadium-900 mb-2">Message envoy&eacute; !</h2>
                <p className="text-stadium-500">
                  Merci pour votre message. Notre &eacute;quipe vous r&eacute;pondra dans les plus brefs d&eacute;lais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-stadium-700 mb-1.5">
                      <User className="w-4 h-4 inline mr-1" />
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-stadium-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stadium-700 mb-1.5">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-stadium-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-stadium-700 mb-1.5">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Sujet
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-stadium-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors bg-white"
                    >
                      <option value="">S&eacute;lectionnez un sujet</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stadium-700 mb-1.5">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Vous &ecirc;tes
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-stadium-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors bg-white"
                    >
                      <option value="">S&eacute;lectionnez votre profil</option>
                      <option value="player">Joueur</option>
                      <option value="agent">Agent</option>
                      <option value="club">Club</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stadium-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-stadium-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                    placeholder="D&eacute;crivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Envoyer le message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
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
