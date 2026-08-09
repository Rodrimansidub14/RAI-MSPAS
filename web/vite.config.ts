import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectId = env.VITE_FIREBASE_PROJECT_ID || "directorio-medicos-sergio";
  const apiTarget = env.VITE_DIRECTORIO_API_TARGET || `http://127.0.0.1:5001/${projectId}/us-central1`;
  const usingEmulator = !env.VITE_DIRECTORIO_API_TARGET;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/directorio": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          ...(usingEmulator ? {headers: {"X-Forwarded-For": "127.0.0.1"}} : {}),
        },
      },
    },
  };
});
