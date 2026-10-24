/* Tiny dependency-free static server for the Dr Gayatri's Dental Clinic landing page. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);

  // Keep requests inside the project root
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  const ext = path.extname(filePath).toLowerCase();

  // Range requests (needed for <video> scrubbing/seeking)
  const range = req.headers.range;
  if (range && /^bytes=\d*-\d*(,|\s*$)/.test(range)) {
    fs.stat(filePath, (err, stat) => {
      if (err || stat.isDirectory()) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Not found: " + urlPath);
      }
      const parts = range.replace(/bytes=|,.*$/g, "").split("-");
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const clampedEnd = Math.min(end, stat.size - 1);
      if (start >= stat.size || start > clampedEnd) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        return res.end();
      }
      res.writeHead(206, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Content-Range": `bytes ${start}-${clampedEnd}/${stat.size}`,
        "Content-Length": clampedEnd - start + 1,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(filePath, { start, end: clampedEnd }).pipe(res);
    });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found: " + urlPath);
    }
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`BrightSmile landing page → http://localhost:${PORT}`);
});
