// API de biblioteca sobre Express, con persistencia en MongoDB (Módulo 4).
// "app" es la aplicación Express; sobre ella montamos middleware, rutas y vistas.
import express from "express";
import path from "node:path";
import { conectarDB } from "./db.js";
import { Libro } from "./models/libro.js";
import librosRouter from "./routes/libros.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// --- Middleware (corre en CADA petición, antes de las rutas) ---
app.use(express.json()); // parsea el cuerpo JSON a req.body (curl -d, Postman)
// Los formularios HTML no mandan JSON: mandan application/x-www-form-urlencoded.
// Sin esta línea, req.body llegaría vacío al enviar el formulario.
app.use(express.urlencoded({ extended: true }));

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

// SSR: arma el HTML de views/index.ejs con la lista de libros de la BD.
// Ahora es async porque la consulta va a MongoDB.
app.get("/", async (req, res, next) => {
  try {
    res.render("index", { libros: await Libro.find() });
  } catch (error) {
    next(error);
  }
});

// --- Formulario web (tercera forma de crear, tras curl y Postman) ---
// OJO: estas rutas van ANTES de montar el router, porque si no "nuevo" caería
// en GET /libros/:id y Mongo intentaría buscar un libro con _id "nuevo".

// Muestra el formulario vacío.
app.get("/libros/nuevo", (req, res) => {
  res.render("nuevo", { valores: {}, errores: [] });
});

// Recibe el formulario. Usa su propia ruta para no mezclar el flujo HTML
// (que redirige) con el de la API JSON (que responde 201 + documento).
app.post("/libros/nuevo", async (req, res, next) => {
  try {
    // Un checkbox no marcado NO se envía: por eso "disponible" se calcula aquí
    // en vez de dejar que llegue undefined al modelo.
    await Libro.create({
      titulo: req.body.titulo,
      autor: req.body.autor,
      // Los campos de un formulario llegan SIEMPRE como string.
      anio: req.body.anio ? Number(req.body.anio) : undefined,
      disponible: req.body.disponible === "on",
    });
    // PRG (Post/Redirect/Get): redirigir evita que al recargar se cree otro libro.
    res.redirect("/");
  } catch (error) {
    // Si el modelo rechaza los datos, volvemos a pintar el formulario con los
    // errores y lo ya escrito, en vez de mandar al alumno a una pantalla de 500.
    if (error.name === "ValidationError") {
      return res.status(400).render("nuevo", {
        valores: req.body,
        errores: Object.values(error.errors).map((e) => e.message),
      });
    }
    next(error);
  }
});

// Vista de detalle de un libro; la plantilla decide qué mostrar si no existe.
app.get("/libros/:id/ver", async (req, res, next) => {
  try {
    res.render("detalle", { libro: await Libro.findById(req.params.id) });
  } catch (error) {
    // Un _id mal formado lanza CastError: mostramos la vista de "no encontrado"
    // en vez de un error 500, que en una página HTML queda feo.
    res.render("detalle", { libro: null });
  }
});

// API JSON del recurso: todo lo del router cuelga de /libros.
app.use("/libros", librosRouter);

// --- Manejo de errores centralizado ---
// 4 argumentos (err primero) → Express lo trata como manejador de errores.
// Debe ir SIEMPRE al final, después de las rutas.
app.use((err, req, res, next) => {
  console.error(err);

  // El cliente mandó datos que el Schema rechaza (falta titulo, autor...).
  // Es culpa del cliente, no del servidor → 400, no 500.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: Object.values(err.errors).map((e) => e.message),
    });
  }

  // El _id no tiene formato de ObjectId (ej. /libros/abc).
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Identificador inválido" });
  }

  res.status(500).json({ error: "Algo salió mal" });
});

// Conectar a la BD ANTES de escuchar: si no hay base, la API no debe arrancar.
await conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
