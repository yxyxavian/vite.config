import { defineConfig } from 'vite';

// base: './' 让构建产物使用相对路径，
// 这样部署到 GitHub Pages 的任意子路径（如 /knight-trials/）都能正常加载资源。
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    port: 5173,
  },
});
