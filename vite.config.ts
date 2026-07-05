import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base './' = relative paths. Works on Vercel/Netlify and local preview.
  // For a GitHub Pages PROJECT site (user.github.io/REPO-NAME/) it also works
  // because the app uses a hash router (no server-side path rewriting needed).
  base: "./",
});
