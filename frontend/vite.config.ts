import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        tailwindcss(),

        {
            name: "stock-page",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url?.startsWith("/page/")) {
                        req.url = "/page.html";
                    }

                    next();
                });
            },
        },

    ],

    build: {
        sourcemap: true,
        minify: false
    }

});
