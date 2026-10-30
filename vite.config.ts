import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this repo at https://kochiuyu.github.io/minigame/.
// Production builds (and `vite preview`, which defaults to production mode)
// prefix assets with /minigame/. The dev server keeps base `/` so
// `npm run dev` still opens at http://localhost:3000/.
export default defineConfig(({ command, mode }) => ({
  base: command === 'build' || mode === 'production' ? '/minigame/' : '/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
}));
