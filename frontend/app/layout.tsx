import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from '@/components/ui/sonner'

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
  title: "RegressLab - AI-Powered Regression Analysis",
  description:
    "Transform your data into insights with sophisticated regression analysis. Upload, train, and predict with multiple ML models in a beautiful interface.",
    generator: 'v0.app'
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
        <ThemeProvider defaultTheme="light" storageKey="regresslab-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
