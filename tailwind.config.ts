import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'toon-yellow': '#FFD02F',
        'toon-purple': '#A688FA',
        'toon-green': '#33E092',
        'toon-pink': '#FF80BF',
        'toon-blue': '#40C4FF',
        'toon-dark': '#1F2937',
      },
      boxShadow: {
        
        'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
      },
      borderRadius: {
        'neo': '12px',
      },
      borderWidth: {
        '3': '3px', 
      },
    },
  },
  plugins: [],
};
export default config;
