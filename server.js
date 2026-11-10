import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

// Serve o build do Vite no Azure App Service (Node.js).
const publicDir = resolve(process.cwd(), "dist");
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

http.createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Requisição inválida");
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let file = resolve(publicDir, "." + pathname);
  if (file !== publicDir && !file.startsWith(publicDir + sep)) {
    response.writeHead(403).end("Acesso negado");
    return;
  }

  if (pathname.endsWith("/")) file = resolve(file, "index.html");

  let content;
  try {
    content = await readFile(file);
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "EISDIR") {
      response.writeHead(500).end("Erro interno");
      return;
    }
    // React Router e navegação SPA: caminhos sem extensão retornam index.html.
    if (extname(pathname)) {
      response.writeHead(404).end("Arquivo não encontrado");
      return;
    }
    file = resolve(publicDir, "index.html");
    try {
      content = await readFile(file);
    } catch {
      response.writeHead(503).end("Build do site indisponível. Execute npm run build.");
      return;
    }
  }

  const type = mimeTypes[extname(file).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
  });
  response.end(request.method === "HEAD" ? undefined : content);
}).listen(port, "0.0.0.0", () => {
  console.log(`ShopFeel Web listening on port ${port}`);
});
