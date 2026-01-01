import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foru.ms Brand Colors - matching the HTML template
        primary: "#1337ec", // Primary blue
        "background-light": "#f6f6f8", // Light theme background
        "background-dark": "#101322", // Dark theme background
        "surface-dark": "#1e2439", // Dark surface color
        "border-dark": "#323b67", // Dark border color
        "text-secondary": "#929bc9", // Secondary text color
        "sidebar-dark": "#111422", // Sidebar background
        "sidebar-hover": "#232948", // Sidebar hover state
        "sidebar-profile": "#1a2036", // Sidebar profile section
        "card-dark": "#151a2d", // Dark card background
        "table-header": "#1c2236", // Table header background
        "success-green": "#0bda65", // Success/trending color
        
        // Shadcn/ui compatible colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem", // 4px - matching template
        lg: "0.5rem", // 8px
        xl: "0.75rem", // 12px
        full: "9999px",
      },
      boxShadow: {
        "primary": "0 4px 14px 0 rgba(19, 55, 236, 0.39)",
        "primary-lg": "0 10px 25px -3px rgba(19, 55, 236, 0.1), 0 4px 6px -2px rgba(19, 55, 236, 0.05)",
        "blue-glow": "0 0 10px rgba(19, 55, 236, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;