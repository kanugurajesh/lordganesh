import { defineConfig } from 'vite';
import { cp } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

export default defineConfig({
  base: './',
  // Keep the 143 MB source scan locally; publish only its prepared web versions.
  build: { copyPublicDir: false, rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
  plugins: [{
    name: 'copy-web-assets', apply: 'build',
    async writeBundle(options) {
      await cp(resolve('public'), resolve(options.dir!), {
        recursive: true, filter: source => basename(source) !== 'lord_ganesha_hindu_deity',
      });
    },
  }],
});
