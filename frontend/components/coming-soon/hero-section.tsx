"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Skeleton Loader Component for Timer
function TimerSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full space-y-2">
        <div className="h-8 md:h-10 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded animate-pulse" />
        <div className="h-3 md:h-4 bg-muted/30 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ComingSoonHero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [launchDate, setLaunchDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch launch date ONCE from backend
  useEffect(() => {
    const fetchLaunchDate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/coming-soon/launch-config`);
        
        if (!response.ok) {
          console.error("Failed to fetch launch config:", response.status);
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        const date = new Date(data.launch_date);
        setLaunchDate(date);
        
        console.log("Launch date fetched:", date.toISOString());
      } catch (err) {
        console.error("Failed to fetch countdown:", err);
      } finally {
        // Add a small delay to prevent flash
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchLaunchDate();
  }, []); 

  // Calculate countdown client-side every second
  useEffect(() => {
    if (!launchDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Launch date has passed
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Calculate immediately
    const timer = setInterval(calculateTimeLeft, 1000); // Then every second
    
    return () => clearInterval(timer);
  }, [launchDate]); // Re-run only when launchDate changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter a valid email");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/coming-soon/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.detail || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      setError("Network error. Please check your connection.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

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
            ease: [0.42, 0, 0.58, 1],
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
            ease: [0.42, 0, 0.58, 1],
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
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
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
          An intelligent assistant built to supercharge your analytics workflow.
          Interact with data, manage projects, and gain insights seamlessly from
          one central dashboard.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto mb-12 px-4"
        >
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Minutes" },
            { value: timeLeft.seconds, label: "Seconds" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="matte-panel p-3 md:p-4 rounded-lg text-center bg-muted/50 backdrop-blur-sm border border-border/50 min-h-[80px] md:min-h-[100px] flex flex-col justify-center"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TimerSkeleton />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-500 to-violet-500 bg-clip-text text-transparent">
                      {launchDate ? String(item.value).padStart(2, "0") : "--"}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                      {item.label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Email Input and CTA */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
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
            disabled={submitted}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Joined!
              </>
            ) : (
              <>
                Notify Me
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Messages */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-green-600 dark:text-green-400 font-medium mb-4"
            >
              ✓ Thanks! We'll notify you when we launch.
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-red-600 dark:text-red-400 font-medium mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-border/30"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Or explore our main platform
          </p>
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
  );
}