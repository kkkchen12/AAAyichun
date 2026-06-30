const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const portArgIndex = process.argv.indexOf("--port");
const port = Number(portArgIndex >= 0 ? process.argv[portArgIndex + 1] : process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"]
]);

function resolveRequest(url) {
  const requestPath = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const candidate = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const resolved = path.resolve(root, candidate);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

const server = http.createServer((request, response) => {
  const resolved = resolveRequest(request.url);
  if (!resolved || !fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const type = contentTypes.get(path.extname(resolved).toLowerCase()) || "application/octet-stream";
  response.writeHead(200, { "content-type": type });
  fs.createReadStream(resolved).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Static server listening at http://${host}:${port}`);
});

