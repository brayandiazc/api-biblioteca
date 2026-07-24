// Modelo Mongoose del recurso Libro.
import mongoose from "mongoose";

// El Schema es el "molde" del documento: campos, tipos y validaciones.
const libroSchema = new mongoose.Schema(
  {
    // required: obligatorio. Sin título no se guarda el libro.
    titulo: { type: String, required: true },
    // autor también obligatorio.
    autor: { type: String, required: true },
    // default: si no se envía, el libro se crea como disponible.
    disponible: { type: Boolean, default: true },
    // anio es opcional: sin required ni default.
    anio: { type: Number },
  },
  // timestamps: agrega createdAt y updatedAt automáticamente.
  { timestamps: true },
);

// El modelo es la puerta a la colección. Mongoose pluraliza 'Libro' → 'libros'.
export const Libro = mongoose.model("Libro", libroSchema);
