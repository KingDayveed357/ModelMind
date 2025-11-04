import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"
// @ts-ignore: side-effect import of CSS; add a global declaration (e.g. declare module '*.css') to remove this ignore
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "ModelMind – Build, Train & Visualize Intelligent Models",
  description:
    "ModelMind helps you transform raw data into intelligent predictions. Build machine learning models, visualize insights, and automate workflows — all from one AI-powered dashboard.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="light" storageKey="modelmind-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
