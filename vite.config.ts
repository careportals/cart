import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const ENV_FILE_MAP: Record<string, string> = {
  dev: 'environment.ts',
  prod: 'environment.prod.ts'
};
const stage = process.env.STAGE ?? 'dev';
const envFile = ENV_FILE_MAP[stage] ?? 'environment.ts';

// Where the built assets are served from. Set CART_CDN_BASE at build time to
// an absolute URL (e.g. https://cdn.example.com/cart/); defaults to relative.
const cdnBase = process.env.CART_CDN_BASE ?? '';

const renderBootstrap = (jsFile: string, cssFile: string) =>
  `(function () {
    if (window.__cpCartLoaderRan) return;
    window.__cpCartLoaderRan = true;

    var hostUrl = ${JSON.stringify(cdnBase)};

    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = hostUrl + ${JSON.stringify(cssFile)};
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.type = 'module';
    js.src = hostUrl + ${JSON.stringify(jsFile)};
    js.async = true;
    document.head.appendChild(js);
  })();
  `;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cart-bootstrap',
      writeBundle(opts, bundle) {
        const jsFile = Object.values(bundle).find(
          b => b.type === 'chunk' && b.isEntry
        )?.fileName;
        const cssFile = Object.values(bundle).find(
          b => b.type === 'asset' && b.fileName.endsWith('.css')
        )?.fileName;

        if (!jsFile || !cssFile) {
          this.error(
            `cart-bootstrap: missing ${
              !jsFile ? 'JS entry' : 'CSS asset'
            } in build output`
          );
        }

        fs.writeFileSync(
          path.resolve(opts.dir ?? 'dist', 'scripts.js'),
          renderBootstrap(jsFile, cssFile)
        );
      }
    }
  ],
  resolve: {
    alias: [
      {
        find: /^\.\.\/environments\/environment$/,
        replacement: path.resolve(__dirname, `src/environments/${envFile}`)
      }
    ]
  }
});
