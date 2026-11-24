import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Every bundled image, font and sound works inside a GitHub project subdirectory.
  base: './',
});
