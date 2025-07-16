import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Include @paljs/admin components
    '../../packages/admin/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Custom utilities for RTL support
      screens: {
        rtl: { raw: '[dir="rtl"] &' },
        ltr: { raw: '[dir="ltr"] &' },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
