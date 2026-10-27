import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiTarget = process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";
const websocketTarget = process.env.VITE_WS_URL || apiTarget.replace(/^http/, "ws");

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            "/api": {
                target: apiTarget,
                changeOrigin: true,
                secure: apiTarget.startsWith("https://"),
            },
            "/ws": {
                target: websocketTarget,
                changeOrigin: true,
                ws: true,
                secure: websocketTarget.startsWith("wss://"),
            },
        },
    },
});
