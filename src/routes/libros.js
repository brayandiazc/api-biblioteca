// Router del recurso /libros: agrupa todas las rutas de este recurso en un
// "mini-app" que server.js monta bajo el prefijo /libros.
import { Router } from "express";
import { libros } from "../data/libros.js";

const router = Router();

// GET /libros → lista completa, o filtrada por ?disponible=true|false.
// Ojo: dentro del router las rutas son relativas al prefijo (/libros).
router.get("/", (req, res) => {
  const { disponible } = req.query;
  if (disponible === undefined) return res.json(libros);
  // La query llega como string: comparamos contra 'true'/'false'.
  const soloDisp = disponible === "true";
  res.json(libros.filter((l) => l.disponible === soloDisp));
});

// GET /libros/:id → un libro concreto, o 404 si no existe.
router.get("/:id", (req, res) => {
  // req.params.id llega como string → Number(...) para comparar con id numérico.
  const libro = libros.find((l) => l.id === Number(req.params.id));
  // Sin el return seguiríamos y responderíamos dos veces (error clásico).
  if (!libro) return res.status(404).json({ error: "Libro no encontrado" });
  res.json(libro);
});

export default router;
