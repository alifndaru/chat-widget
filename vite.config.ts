import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

// Plugin untuk inject CSS ke dalam JS bundle
function injectCssPlugin(): Plugin {
  return {
    name: "inject-css",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      // Cari file CSS dan JS
      const cssFileName = Object.keys(bundle).find((fileName) =>
        fileName.endsWith(".css")
      );
      const jsFileName = Object.keys(bundle).find((fileName) =>
        fileName.endsWith(".js")
      );

      if (cssFileName && jsFileName) {
        const cssAsset = bundle[cssFileName];
        const jsAsset = bundle[jsFileName];

        if (
          cssAsset &&
          cssAsset.type === "asset" &&
          jsAsset &&
          jsAsset.type === "chunk"
        ) {
          // Escape CSS content untuk dijadikan string
          const cssContent = cssAsset.source
            .toString()
            .replace(/\\/g, "\\\\")
            .replace(/`/g, "\\`")
            .replace(/\$/g, "\\$");

          // Inject CSS ke dalam JS
          const cssInjectionCode = `
(function() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.setAttribute('data-bnpb-chat-widget', '');
    style.textContent = \`${cssContent}\`;
    document.head.appendChild(style);
  }
})();
`;

          // Prepend CSS injection code ke JS bundle
          jsAsset.code = cssInjectionCode + jsAsset.code;

          // Hapus file CSS dari bundle karena sudah di-inline
          delete bundle[cssFileName];
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      // Critical: Define process.env.NODE_ENV for browser compatibility
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": JSON.stringify({}),
      
      "process.env.VITE_APP_API_URL": JSON.stringify(env.VITE_APP_API_URL),
      "process.env.VITE_BASE_CONFIG": JSON.stringify(env.VITE_BASE_CONFIG),
      "process.env.VITE_APP_NAME": JSON.stringify(env.VITE_APP_NAME),
      "process.env.VITE_APP_VERSION": JSON.stringify(env.VITE_APP_VERSION),
      "process.env.VITE_APP_DEMO": JSON.stringify(env.VITE_APP_DEMO),
      "process.env.VITE_APP_SENTRY_DSN": JSON.stringify(
        env.VITE_APP_SENTRY_DSN
      ),
    },

    plugins: [vue(), tailwindcss(), injectCssPlugin()],

    resolve: {
      alias: {
        "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    optimizeDeps: {
      include: ["vue"],
    },

    build: {
      emptyOutDir: true,
      cssCodeSplit: false, // supaya CSS embed ke JS
      minify: true,
      sourcemap: false,
      lib: {
        entry: fileURLToPath(new URL("./src/main.ts", import.meta.url)),
        name: "BNPBChatWidget",
        fileName: "chat-widget",
        formats: ["iife"],
      },
      rollupOptions: {
        output: {
          entryFileNames: "chat-widget.iife.js",
          inlineDynamicImports: true,
          // Expose functions to window object
          extend: true,
          globals: {
            vue: "Vue",
          },
        },
        external: [],
      },
    },

    base: "./", // agar path asset relatif, cocok untuk CDN

    server: {
      port: 3333,
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:9000", // backend dev kamu
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts: [".ngrok-free.app"],
    },

    preview: {
      port: 3334,
      host: true,
    },
  };
});
