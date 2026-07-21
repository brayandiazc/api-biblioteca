// Importación de módulos nativos de Node.js
import http from "node:http";

// Puerto en el que escuchará el servidor.
const PORT = process.env.PORT ?? 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json"); // todo se responde en JSON

  // Salud del servicio
  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: "ok" }));
    return; // cortar para no responder dos veces
  }

  // Catálogo de libros de ejemplo.
  if (req.method === "GET" && req.url === "/libros") {
    res.statusCode = 200;
    res.end(
      JSON.stringify([
        { id: 1, titulo: "Cien años de soledad", disponible: true },
        { id: 2, titulo: "El Quijote", disponible: false },
        { id: 3, titulo: "La sombra del viento", disponible: true },
      ]),
    );
    return;
  }

  // Bienvenida por defecto.
  res.statusCode = 200;
  res.end(JSON.stringify({ mensaje: "API de biblioteca", version: "1.0.0" }));
});

// Iniciar el servidor en el puerto especificado.
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
