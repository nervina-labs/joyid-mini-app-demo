import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import {esbuildCommonjs, viteCommonjs} from "@originjs/vite-plugin-commonjs";

const plugins: any[] = [
  viteCommonjs(),
  react(),
  // legacy({
  //   modernPolyfills: [
  //     // Safari 11 has modules, but throws > ReferenceError: Can't find variable: globalThis
  //     'es.global-this',
  //     'es.object.entries',
  //     'es.object.from-entries',
  //   ],
  //   additionalLegacyPolyfills: ['intl-pluralrules'],
  //   targets: ['Safari >= 14'],
  // }),
  // nodePolyfills({
  //   exclude: [
  //     'fs', // Excludes the polyfill for `fs` and `node:fs`.
  //   ],
  // }),
  // inject({ Buffer: ['buffer/', 'Buffer'] }),
];

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  if (mode === "development") {
    plugins.push(
      mkcert({
        hosts: ["joyid-bot.dev"],
      })
    );
  }
  return {
    server: {
      https: false,
    },
    build: {
      assetsInlineLimit: 5000,
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          esbuildCommonjs(["axios-mock-adapter"]),
          // NodeGlobalsPolyfillPlugin({
          //   buffer: true,
          // }),
        ],
        // target: ['chrome60', 'firefox60', 'safari11', 'edge18'],
      },
    },
    // build: {
    //   target: ['chrome60', 'firefox60', 'safari11', 'edge18'],
    // },
    plugins,
  };
});
