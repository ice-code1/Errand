import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from "rollup-plugin-visualizer";
import { prerender } from 'vite-plugin-prerender-spa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
    // prerender({
    //   routes: [
    //     // '/',
    //     // '/auth/login',
    //     // '/auth/signup',
    //     // '/auth/forgot-password',
    //     // '/dashboard',
    //     // '/tasks',
    //     // '/create-task',
    //     // '/profile'
    //     '/admin',
    //     '/admin/analytics',
    //     '/admin/users',
    //     '/admin/tasks',
    //     '/admin/settings'
    //   ],
    //   minify: true,
    // })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});