"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight } from "lucide-react"

export function ComingSoonHero() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Calculate countdown to release date (90 days from now)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const releaseDate = new Date()
      releaseDate.setDate(releaseDate.getDate() + 90)
      const difference = releaseDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
    },
  }

  return (
    <section className="hero-grid-bg relative min-h-screen flex items-center justify-center px-4 py-20 md:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-violet-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/30 mb-8"
        >
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            Built with ModelMind Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="block text-foreground">Your data.</span>
          <span className="block text-foreground">Smarter decisions.</span>
          <span className="block bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600 bg-clip-text text-transparent">
            Coming soon.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          An intelligent assistant built to supercharge your analytics workflow. Interact with data, manage projects,
          and gain insights seamlessly from one central dashboard.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto mb-12 px-4">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Minutes" },
            { value: timeLeft.seconds, label: "Seconds" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="matte-panel p-3 md:p-4 rounded-lg text-center bg-muted/50 backdrop-blur-sm border border-border/50"
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-500 to-violet-500 bg-clip-text text-transparent">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Email Input and CTA */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8"
        >
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            {submitted ? (
              <>
                <span className="w-5 h-5 bg-white rounded-full animate-pulse" />
                Joining...
              </>
            ) : (
              <>
                Notify Me
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Success Message */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-green-600 dark:text-green-400 font-medium"
          >
            ✓ Thanks! We'll notify you when we launch.
          </motion.div>
        )}

        {/* Additional CTA */}
        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground mb-4">Or explore our main platform</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/docs"
              className="px-6 py-2 rounded-lg border border-border hover:bg-muted/50 transition-all text-foreground"
            >
              View Documentation
            </a>
            <a
              href="/sign-up"
              className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all text-foreground"
            >
              Try ModelMind
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
