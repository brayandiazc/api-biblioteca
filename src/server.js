// API de biblioteca migrada de `http` nativo a Express.
// "app" es la aplicación Express; sobre ella montamos middleware, rutas y vistas.
import express from "express";
import path from "node:path";
import librosRouter from "./routes/libros.js";
import { libros } from "./data/libros.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// --- Middleware (corre en CADA petición, antes de las rutas) ---
app.use(express.json()); // parsea el cuerpo JSON a req.body (listo para POST/PUT)

// Middleware propio de registro: método + url de cada petición.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // sin next() la petición se quedaría colgada
});

// --- Vistas (SSR con EJS) ---
app.set("view engine", "ejs"); // Express renderizará plantillas EJS
app.set("views", path.resolve("views")); // carpeta donde viven las plantillas

// --- Rutas ---
// Salud del servicio; res.json pone el Content-Type y serializa por nosotros.
app.get("/health", (req, res) => res.json({ status: "ok" }));

// SSR: arma el HTML de views/index.ejs con la lista de libros.
app.get("/", (req, res) => res.render("index", { libros }));

// Vista de detalle de un libro; la plantilla decide qué mostrar si no existe.
app.get("/libros/:id/ver", (req, res) => {
  const libro = libros.find((l) => l.id === Number(req.params.id));
  res.render("detalle", { libro });
});

// API JSON del recurso: todo lo del router cuelga de /libros.
app.use("/libros", librosRouter);

// --- Manejo de errores centralizado ---
// 4 argumentos (err primero) → Express lo trata como manejador de errores.
// Debe ir SIEMPRE al final, después de las rutas.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Algo salió mal" });
});

// Iniciar el servidor en el puerto especificado.
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
