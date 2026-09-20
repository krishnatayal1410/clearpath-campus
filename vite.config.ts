import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
export default defineConfig({plugins:[react(),wasm()],base: process.env.BASE_PATH || '/',build:{target:'esnext'},server:{proxy:{'/api':'http://127.0.0.1:8787'}}});
