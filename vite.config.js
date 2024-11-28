import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path';
import { promises as fs } from 'fs';
import { minify } from 'html-minifier-terser';

export default defineConfig({
  server: {open: true,},

  base: '/glbanimation/', // GitHub Pages의 리포지토리 이름에 맞게 base 경로 설정
  build: {
    minify: 'terser', // 자바스크립트 및 CSS 압축
    terserOptions: {
      compress: {
        drop_console: true,  // console.log 제거
        drop_debugger: true, // debugger 제거
      },
      mangle: true, // 난독화
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
    {
      name: 'copy-and-minify-404-html',
      closeBundle: async () => {
        const distDir = resolve(__dirname, 'dist');
        const sourcePath = resolve(__dirname, '404.html');
        const destPath = resolve(distDir, '404.html');
        await fs.access(sourcePath);
        const html = await fs.readFile(sourcePath, 'utf-8');
        const minifiedHtml = await minify(html, {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          minifyCSS: true,
          minifyJS: true,
        });
        await fs.writeFile(destPath, minifiedHtml);
      }
    }
  ],
});
