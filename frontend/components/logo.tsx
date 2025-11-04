"use client"

import Link from "next/link"

export function ModelMindLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative w-8 h-8">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Central mind/intelligence core */}
          <circle
            cx="16"
            cy="16"
            r="4"
            fill="currentColor"
            className="text-primary group-hover:text-accent transition-colors duration-300"
          />

          {/* Connecting nodes - top left */}
          <circle
            cx="8"
            cy="8"
            r="2.5"
            fill="currentColor"
            className="text-primary/70 group-hover:text-accent/70 transition-colors duration-300"
          />
          {/* Line to center */}
          <line
            x1="8"
            y1="8"
            x2="13"
            y2="13"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/40 group-hover:text-accent/40 transition-colors duration-300"
          />

          {/* Connecting nodes - top right */}
          <circle
            cx="24"
            cy="8"
            r="2.5"
            fill="currentColor"
            className="text-primary/70 group-hover:text-accent/70 transition-colors duration-300"
          />
          {/* Line to center */}
          <line
            x1="24"
            y1="8"
            x2="19"
            y2="13"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/40 group-hover:text-accent/40 transition-colors duration-300"
          />

          {/* Connecting nodes - bottom left */}
          <circle
            cx="8"
            cy="24"
            r="2.5"
            fill="currentColor"
            className="text-primary/70 group-hover:text-accent/70 transition-colors duration-300"
          />
          {/* Line to center */}
          <line
            x1="8"
            y1="24"
            x2="13"
            y2="19"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/40 group-hover:text-accent/40 transition-colors duration-300"
          />

          {/* Connecting nodes - bottom right */}
          <circle
            cx="24"
            cy="24"
            r="2.5"
            fill="currentColor"
            className="text-primary/70 group-hover:text-accent/70 transition-colors duration-300"
          />
          {/* Line to center */}
          <line
            x1="24"
            y1="24"
            x2="19"
            y2="19"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/40 group-hover:text-accent/40 transition-colors duration-300"
          />

          {/* Top connection */}
          <circle
            cx="16"
            cy="4"
            r="2"
            fill="currentColor"
            className="text-primary/50 group-hover:text-accent/50 transition-colors duration-300"
          />
          <line
            x1="16"
            y1="4"
            x2="16"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/30 group-hover:text-accent/30 transition-colors duration-300"
          />

          {/* Bottom connection */}
          <circle
            cx="16"
            cy="28"
            r="2"
            fill="currentColor"
            className="text-primary/50 group-hover:text-accent/50 transition-colors duration-300"
          />
          <line
            x1="16"
            y1="28"
            x2="16"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/30 group-hover:text-accent/30 transition-colors duration-300"
          />
        </svg>
      </div>
      <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
        ModelMind
      </span>
    </Link>
  )
}
