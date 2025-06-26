import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import json from "@rollup/plugin-json";

// import css from 'rollup-plugin-css-only';
import sveltePreprocess from "svelte-preprocess";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: false,
    format: "cjs",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    json({
      compact: true,
    }),
    svelte({
      preprocess: sveltePreprocess({ postcss: true }),
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: (css) => {
        css.write("public/build/bundle.css");
      },
    }),
    // css({ output:'public/extra.css'}),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      preferBuiltins: true,
      browser: true,
      dedupe: (importee) =>
        importee === "svelte" || importee.startsWith("svelte/"),
    }),
    commonjs(),
    globals(),
    builtins(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
          env: {
            ...process.env,
            SVELTE_NO_LOGS: 'true',
            NODE_ENV: 'production'  // This will suppress some additional logs
          }
        });
      }
    },
  };
}
