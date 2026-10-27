import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const raizProyecto = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(raizProyecto, "index.html"),
        tarea: resolve(raizProyecto, "tarea.html"),
        eventos: resolve(raizProyecto, "eventos.html"),
        agenda: resolve(raizProyecto, "agenda.html"),
        gastos: resolve(raizProyecto, "gastos.html"),
        configuracion: resolve(raizProyecto, "conf_inicial.html"),
      },
    },
  },
});
