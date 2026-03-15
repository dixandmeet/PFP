"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowRight, Star, Zap, Crown, HelpCircle, Users, Shield, TrendingUp, Coins, BarChart3 } from "lucide-react"
import { TopNav } from "@/components/nav/TopNav"
import { Footer } from "@/components/footer/Footer"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const plans = [
  {
    name: "Gratuit",
    description: "Accédez à la plateforme",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Users,
    iconBg: "bg-stadium-100",
    iconColor: "text-stadium-600",
    credits: 0,
    redistribution: null,
    features: [
      "Accès à la plateforme",
      "Profil visible sans crédits inclus",
    ],
    extraInfo: "Recharge possible à l\u2019unité",
    cta: "Commencer gratuitement",
    href: "/register",
    popular: false,
    borderColor: "",
  },
  {
    name: "Starter",
    description: "Lancez votre visibilité football",
    monthlyPrice: 10,
    yearlyPrice: 8,
    icon: Zap,
    iconBg: "bg-stadium-100",
    iconColor: "text-stadium-700",
    credits: 10,
    redistribution: 25,
    features: [
      "Lancez votre visibilité football",
      "Premiers contacts avec les clubs",
    ],
    extraInfo: null,
    cta: "Passer à Starter",
    href: "/register",
    popular: false,
    borderColor: "",
  },
  {
    name: "Growth",
    description: "Multipliez vos opportunités",
    monthlyPrice: 50,
    yearlyPrice: 40,
    icon: TrendingUp,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    credits: 50,
    redistribution: 30,
    features: [
      "Multipliez vos opportunités de recrutement",
      "Suivez vos performances avec les analytics",
    ],
    extraInfo: null,
    cta: "Passer à Growth",
    href: "/register",
    popular: true,
    borderColor: "",
  },
  {
    name: "Pro",
    description: "Analytics avancés et support prioritaire",
    monthlyPrice: 200,
    yearlyPrice: 160,
    icon: Star,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    credits: 200,
    redistribution: 40,
    features: [
      "Accès complet aux analytics avancés",
      "Support prioritaire pour vos démarches",
    ],
    extraInfo: null,
    cta: "Passer à Pro",
    href: "/register",
    popular: false,
    borderColor: "",
  },
  {
    name: "Elite",
    description: "Accompagnement premium dédié",
    monthlyPrice: 500,
    yearlyPrice: 400,
    icon: Crown,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    credits: 500,
    redistribution: 50,
    features: [
      "Accompagnement premium avec manager dédié",
      "Visibilité et accès illimités",
    ],
    extraInfo: null,
    cta: "Passer à Elite",
    href: "/contact",
    popular: false,
    borderColor: "",
  },
]

const faqs = [
  {
    question: "Comment fonctionne le système de crédits\u00a0?",
    answer:
      "1 crédit = 1\u00a0\u20ac. Chaque plan inclut un nombre de crédits mensuels. Les crédits servent à débloquer des profils, envoyer des propositions, accéder à des rapports et utiliser les outils de la plateforme. Le plan Gratuit permet la recharge à l\u2019unité.",
  },
  {
    question: "Qu\u2019est-ce que la redistribution\u00a0?",
    answer:
      "La redistribution est le pourcentage de la valeur des crédits utilisés qui est reversé aux créateurs de contenu et aux profils consultés sur la plateforme. Plus votre plan est élevé, plus votre taux de redistribution est important (de 25\u00a0% à 50\u00a0%).",
  },
  {
    question: "Puis-je changer de plan à tout moment\u00a0?",
    answer:
      "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement prend effet immédiatement et le montant est ajusté au prorata de votre période de facturation en cours.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous\u00a0?",
    answer:
      "Nous acceptons les cartes Visa, Mastercard, American Express, ainsi que les virements SEPA pour les abonnements annuels. Tous les paiements sont sécurisés via Stripe.",
  },
  {
    question: "Y a-t-il un engagement minimum\u00a0?",
    answer:
      "Aucun engagement minimum pour les abonnements mensuels. Vous pouvez annuler à tout moment. Les abonnements annuels sont facturés pour 12 mois avec une réduction de 20\u00a0%.",
  },
  {
    question: "Le plan Gratuit donne-t-il vraiment accès à la plateforme\u00a0?",
    answer:
      "Oui, le plan Gratuit vous permet de créer votre profil et d\u2019accéder à la plateforme. Cependant, aucun crédit mensuel n\u2019est inclus. Vous pouvez acheter des crédits à l\u2019unité pour débloquer les fonctionnalités payantes.",
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen">
      <TopNav />

      <main>
        {/* Hero section */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 bg-[#fafafa]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.07),transparent_50%)]" />

          <motion.div
            className="relative container px-4 md:px-6 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[13px] font-medium text-stadium-500">
                  Sans engagement &middot; Annulez à tout moment
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-stadium-900 tracking-[-0.02em] leading-[1.1] mb-5"
            >
              Des tarifs{" "}
              <AnimatedGradientText>simples et transparents</AnimatedGradientText>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-[17px] text-stadium-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Facturation mensuelle &middot; 1 crédit = 1&nbsp;&euro;.
              Choisissez l&apos;offre adaptée à votre activité.
            </motion.p>

            {/* Toggle mensuel/annuel */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-4">
              <span
                className={`text-sm font-medium transition-colors ${
                  !isYearly ? "text-stadium-900" : "text-stadium-400"
                }`}
              >
                Mensuel
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  isYearly ? "bg-primary" : "bg-stadium-300"
                }`}
                aria-label="Basculer entre mensuel et annuel"
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{ x: isYearly ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span
                className={`text-sm font-medium transition-colors ${
                  isYearly ? "text-stadium-900" : "text-stadium-400"
                }`}
              >
                Annuel
              </span>
              <AnimatePresence>
                {isYearly && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                  >
                    -20%
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </section>

        {/* Plans */}
        <section className="relative pb-20 sm:pb-28 bg-[#fafafa]">
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-7xl mx-auto -mt-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={`relative rounded-2xl border bg-white p-6 flex flex-col transition-shadow duration-300 ${
                    plan.popular
                      ? "border-primary/30 shadow-xl shadow-primary/[0.08] lg:scale-[1.03]"
                      : "border-stadium-200 hover:shadow-lg hover:shadow-stadium-200/50"
                  }`}
                >
                  {plan.popular && <BorderBeam size={200} duration={12} delay={0} />}

                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-primary/25 whitespace-nowrap">
                      Recommandé
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}
                    >
                      <plan.icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <h2 className="text-xl font-bold text-stadium-900">{plan.name}</h2>
                  </div>

                  <div className="mb-1">
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-3xl font-bold text-stadium-900">Gratuit</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={isYearly ? "yearly" : "monthly"}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="text-3xl font-bold text-stadium-900"
                          >
                            {isYearly ? plan.yearlyPrice : plan.monthlyPrice}&nbsp;&euro;
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-stadium-400 text-sm">/mois</span>
                      </div>
                    )}
                    {plan.monthlyPrice > 0 && isYearly && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary mt-0.5 font-medium"
                      >
                        Facturé {plan.yearlyPrice * 12}&nbsp;&euro;/an
                      </motion.p>
                    )}
                  </div>

                  <p className="text-stadium-400 text-xs mb-5">
                    {plan.credits > 0 ? `${plan.credits} cr./mois` : "Recharge à l\u2019unité"}
                  </p>

                  <ul className="space-y-3 mb-5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-primary" : "text-primary"}`} />
                        <span className="text-sm text-stadium-600 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Credits & redistribution info */}
                  <div className="space-y-2 mb-5 pt-4 border-t border-stadium-100">
                    <div className="flex items-center gap-2 text-xs text-stadium-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{plan.credits > 0 ? `${plan.credits} crédits/mois` : "0 crédit/mois inclus"}</span>
                    </div>
                    {plan.redistribution ? (
                      <div className="flex items-center gap-2 text-xs text-stadium-400">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Redistribution {plan.redistribution}%</span>
                      </div>
                    ) : plan.extraInfo ? (
                      <div className="flex items-center gap-2 text-xs text-stadium-400">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{plan.extraInfo}</span>
                      </div>
                    ) : null}
                  </div>

                  {plan.popular ? (
                    <Link href={plan.href}>
                      <ShimmerButton className="w-full text-sm py-3">
                        {plan.cta}
                      </ShimmerButton>
                    </Link>
                  ) : (
                    <Link
                      href={plan.href}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full ${
                        plan.monthlyPrice === 0
                          ? "bg-stadium-100 text-stadium-700 hover:bg-stadium-200"
                          : plan.name === "Elite"
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : plan.name === "Pro"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-stadium-900 text-white hover:bg-stadium-800"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center text-stadium-400 text-sm mt-10"
            >
              Tous les prix sont HT. TVA applicable selon votre pays de résidence.
            </motion.p>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-20 sm:py-28 bg-white">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />

          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-stadium-900 tracking-[-0.02em]">
                  Questions fréquentes
                </h2>
                <p className="text-stadium-500 mt-3 text-[17px]">
                  Tout ce que vous devez savoir sur nos offres
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-0">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-stadium-200 last:border-b-0"
                  >
                    <AccordionTrigger className="text-base font-medium text-stadium-800 hover:no-underline hover:text-stadium-900 py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-stadium-500 text-[15px] leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative py-20 sm:py-28 overflow-hidden bg-white">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />

          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto"
            >
              <div className="relative rounded-[2rem] bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(34,197,94,0.1),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_110%,rgba(34,197,94,0.06),transparent)]" />
                <div
                  className="absolute inset-0 opacity-[0.2]"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative px-8 py-14 md:px-16 md:py-20 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.06] mb-8">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-[13px] font-medium text-white/50">
                        Offres sur mesure disponibles
                      </span>
                    </div>
                  </motion.div>

                  <motion.h2
                    className="text-3xl md:text-4xl font-bold text-white leading-[1.1] tracking-[-0.02em] mb-4"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Besoin d&apos;une offre personnalisée&nbsp;?
                  </motion.h2>

                  <motion.p
                    className="text-white/50 text-[17px] max-w-lg mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Académies, fédérations, groupes d&apos;agents — contactez-nous pour une offre adaptée à la taille de votre structure.
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-stadium-900 text-sm font-semibold hover:bg-white/90 transition-colors"
                    >
                      Contactez-nous
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      Créer un compte gratuit
                    </Link>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center gap-6 mt-8 text-white/30 text-xs"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Paiements sécurisés
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Sans engagement
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
