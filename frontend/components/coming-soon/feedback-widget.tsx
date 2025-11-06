"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Lightbulb, Bug, Sparkles, HelpCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type FeedbackType = "suggestion" | "bug" | "feature" | "other"

interface FeedbackForm {
  email: string
  name: string
  feedback_type: FeedbackType
  subject: string
  message: string
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<FeedbackForm>({
    email: "",
    name: "",
    feedback_type: "suggestion",
    subject: "",
    message: "",
  })

  const feedbackTypes = [
    { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-yellow-500" },
    { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-500" },
    { value: "feature", label: "Feature Request", icon: Sparkles, color: "text-purple-500" },
    { value: "other", label: "Other", icon: HelpCircle, color: "text-blue-500" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.subject || !formData.message) {
      setError("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch(`${API_URL}/coming-soon/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          email: "",
          name: "",
          feedback_type: "suggestion",
          subject: "",
          message: "",
        })
        setTimeout(() => {
          setSubmitted(false)
          setIsOpen(false)
        }, 3000)
      } else {
        setError(data.detail || "Failed to submit feedback")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-primary text-white rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-medium">Feedback</span>
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-violet-500 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Share Your Feedback</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-white/90">Help us improve ModelMind with your insights</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                    <p className="text-muted-foreground">Your feedback has been submitted successfully.</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Feedback Type Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Type of Feedback</label>
                      <div className="grid grid-cols-2 gap-2">
                        {feedbackTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, feedback_type: type.value as FeedbackType })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.feedback_type === type.value
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-border hover:border-border/80"
                            }`}
                          >
                            <type.icon className={`w-5 h-5 mx-auto mb-1 ${type.color}`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name and Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name (Optional)</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Brief description of your feedback"
                        required
                        className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us more about your thoughts..."
                        required
                        rows={5}
                        className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 dark:text-red-400 font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                    >
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </motion.button>
                  </>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}