/* global process */
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE || '/api'
  const backend = env.VITE_BACKEND_URL || 'http://localhost:5000'

  // If apiBase is a path like '/api', proxy that path to the backend.
  // When apiBase is a full URL (starts with http), client code should call that directly.
  const proxy = {}
  if (apiBase.startsWith('/')) {
    proxy[apiBase] = {
      target: backend,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(new RegExp(`^${apiBase}`), ''),
    }
  }

  return defineConfig({
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
      proxy,
    },
  })
}
