// webpack.config.js
import path from "node:path";

// Webpack acepta una FUNCIÓN (env, argv) que devuelve la config; así
// podemos leer el --mode que pasa cada script de build.
export default (env, argv) => ({
  target: "node", // empaqueta para Node, no para el navegador
  // Toma el --mode del script (development/production); si falta, dev.
  mode: argv.mode ?? "development",
  entry: "./src/server.js", // archivo raíz por donde empieza el bundle
  // Carpeta y nombre del archivo generado: dist/server.bundle.js.
  output: { path: path.resolve("dist"), filename: "server.bundle.js" },
  module: {
    // babel-loader pasa cada .js por Babel antes de empaquetar.
    rules: [{ test: /\.js$/, exclude: /node_modules/, use: "babel-loader" }],
  },
});
