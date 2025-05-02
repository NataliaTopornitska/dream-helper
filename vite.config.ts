// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
//
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: '/dream-helper/',
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/dream-helper/',
  server: {
    host: true,     // access from network of containers
    port: 5173,     // port
    strictPort: true, // forbidden change port
    open: false,    // not allowed auto opening (error xdg-open ENOENT)
    cors: false,     // on CORS for API-requests
  },
});
