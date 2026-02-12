
//import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react";
//import path from "path";

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devPort = Number(env.VITE_DEV_PORT ?? env.PORT ?? 3000);

  return {
    plugins: [react()],
    server: {
      port: devPort,
      strictPort: true,
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  };
});
