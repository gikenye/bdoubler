import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * 
 * This configuration centralizes all theme colors for the mini app.
 * To change the app's color scheme, simply update the 'primary' color value below.
 * 
 * Example theme changes:
 * - Blue theme: primary: "#3182CE"
 * - Green theme: primary: "#059669" 
 * - Red theme: primary: "#DC2626"
 * - Orange theme: primary: "#EA580C"
 */
export default {
    darkMode: "media",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Retro RPG theme colors
  			primary: "#6b8e5a", // Main brand color (dark green)
  			"primary-light": "#8ba87a", // For hover states
  			"primary-dark": "#4a5d3d", // For active states
  			
  			// Secondary colors for backgrounds and text
  			secondary: "#d4c5a9", // Light backgrounds (beige)
  			"secondary-dark": "#5c4a2e", // Dark backgrounds (dark brown)
  			
  			// Retro RPG specific colors
  			"rpg-brown": "#8b6f47",
  			"rpg-beige": "#d4c5a9",
  			"rpg-dark-brown": "#5c4a2e",
  			"rpg-darker-brown": "#3d2f1f",
  			"rpg-green": "#6b8e5a",
  			"rpg-dark-green": "#4a5d3d",
  			"rpg-gold": "#d4af37",
  			
  			// Legacy CSS variables for backward compatibility
  			background: 'var(--background)',
  			foreground: 'var(--foreground)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Custom spacing for consistent layout
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  		},
  		// Custom container sizes
  		maxWidth: {
  			'xs': '20rem',
  			'sm': '24rem',
  			'md': '28rem',
  			'lg': '32rem',
  			'xl': '36rem',
  			'2xl': '42rem',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
