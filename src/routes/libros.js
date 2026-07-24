// Router del recurso /libros: agrupa todas las rutas de este recurso en un
// "mini-app" que server.js monta bajo el prefijo /libros.
// Módulo 4: el arreglo en memoria se cambió por consultas a MongoDB.
// Toda consulta es asíncrona → async/await + try/catch + next(error).
import { Router } from "express";
import { Libro } from "../models/libro.js";

const router = Router();

// GET /libros → lista completa, o filtrada por ?disponible=true|false.
// Ojo: dentro del router las rutas son relativas al prefijo (/libros).
router.get("/", async (req, res, next) => {
  try {
    const { disponible } = req.query;
    // La query llega como string: comparamos contra 'true'.
    // Sin el parámetro, el filtro {} significa "todos".
    const filtro =
      disponible === undefined ? {} : { disponible: disponible === "true" };
    // find() es asíncrono: await espera los documentos de la BD.
    res.json(await Libro.find(filtro));
  } catch (error) {
    // Cualquier fallo de la consulta se manda al manejador central.
    next(error);
  }
});

// POST /libros → crea un libro con el JSON del cuerpo (req.body).
// Así es como entran los datos ahora: los escribe el cliente, no un seed.
router.post("/", async (req, res, next) => {
  try {
    // create() valida contra el Schema ANTES de insertar: si falta titulo o
    // autor lanza ValidationError y no se guarda nada.
    const libro = await Libro.create(req.body);
    // 201 = creado. Devolvemos el documento ya con su _id y timestamps.
    res.status(201).json(libro);
  } catch (error) {
    // El manejador central traduce ValidationError a un 400.
    next(error);
  }
});

// GET /libros/:id → un libro concreto, o 404 si no existe.
router.get("/:id", async (req, res, next) => {
  try {
    // findById busca por el _id (un ObjectId) que genera MongoDB.
    const libro = await Libro.findById(req.params.id);
    // Sin el return seguiríamos y responderíamos dos veces (error clásico).
    if (!libro) return res.status(404).json({ error: "Libro no encontrado" });
    res.json(libro);
  } catch (error) {
    // Un _id con formato inválido lanza CastError: cae aquí, no revienta.
    next(error);
  }
});

export default router;
