import { defineConfig } from "vite";

import templates from "@malobre/vite-plugin-templates";

export default defineConfig({
  plugins: [templates()],
});
