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

  			// CSS variables for shadcn/ui compatibility
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'rgb(var(--ring))',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			'primary-foreground': 'var(--primary-foreground)',
  			'secondary-foreground': 'var(--secondary-foreground)',
  			muted: 'var(--muted)',
  			'muted-foreground': 'var(--muted-foreground)',
  			accent: 'var(--accent)',
  			'accent-foreground': 'var(--accent-foreground)',
  			destructive: 'var(--destructive)',
  			'destructive-foreground': 'var(--destructive-foreground)',
  			popover: 'var(--popover)',
  			'popover-foreground': 'var(--popover-foreground)',
  			card: 'var(--card)',
  			'card-foreground': 'var(--card-foreground)',
  			sidebar: 'var(--sidebar)',
  			'sidebar-foreground': 'var(--sidebar-foreground)',
  			'sidebar-primary': 'var(--sidebar-primary)',
  			'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
  			'sidebar-accent': 'var(--sidebar-accent)',
  			'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
  			'sidebar-border': 'var(--sidebar-border)',
  			'sidebar-ring': 'var(--sidebar-ring)',
  			'input-background': 'var(--input-background)',
  			'switch-background': 'var(--switch-background)',
  			chart: {
  				1: 'var(--chart-1)',
  				2: 'var(--chart-2)',
  				3: 'var(--chart-3)',
  				4: 'var(--chart-4)',
  				5: 'var(--chart-5)',
  			},
  			'game-purple': 'var(--game-purple)',
  			'game-dark-purple': 'var(--game-dark-purple)',
  			'game-border': 'var(--game-border)',
  			'game-border-light': 'var(--game-border-light)',
  			'neon-cyan': 'var(--neon-cyan)',
  			'neon-pink': 'var(--neon-pink)',
  			'neon-yellow': 'var(--neon-yellow)',
  			'neon-green': 'var(--neon-green)',
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
