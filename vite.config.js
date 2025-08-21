import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/orders': 'http://localhost:5000'
    }
  }
});
