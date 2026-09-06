import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import metricsHandler from "./api/metrics.js";

function metricsApiPlugin() {
  return {
    name: "metrics-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/metrics" || req.url?.startsWith("/api/metrics?")) {
          const mockRes = {
            statusCode: 200,
            setHeader(name, val) {
              res.setHeader(name, val);
            },
            status(code) {
              this.statusCode = code;
              res.statusCode = code;
              return this;
            },
            json(data) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
            },
            end(str) {
              res.end(str);
            },
          };
          try {
            await metricsHandler(req, mockRes);
          } catch (e) {
            next(e);
          }
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), metricsApiPlugin()],
});
