/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Ensure Vite env types are properly merged
declare module 'vite/client' {
  interface ImportMetaEnv extends ImportMetaEnv {}
} 