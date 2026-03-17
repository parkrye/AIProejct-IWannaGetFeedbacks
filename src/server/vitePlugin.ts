import type { Plugin } from "vite";
import { createApp } from "./app.ts";

export function apiServerPlugin(): Plugin {
  return {
    name: "api-server",
    configureServer(server) {
      const app = createApp();
      server.middlewares.use(app);
    },
  };
}
