// Conexión a MongoDB. Vive aparte del servidor porque no depende de la entidad:
// este archivo es idéntico en cualquier API que use Mongoose.
import mongoose from "mongoose";

// Función asíncrona: abre la conexión y no sigue hasta lograrla.
export async function conectarDB() {
  const uri = process.env.MONGODB_URI;

  // Fallar temprano y con un mensaje claro: sin esto, Mongoose lanza
  // "The uri parameter must be a string" y nadie entiende qué pasó.
  if (!uri) {
    throw new Error(
      "Falta la variable de entorno MONGODB_URI. Copia .env.example a .env y pon tu URL de Atlas.",
    );
  }

  // connect() abre la conexión; await espera a que la BD responda.
  await mongoose.connect(uri);
  console.log("Conectado a MongoDB");
}
