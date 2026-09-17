"""NOW preview server: serves the Expo web export and proxies /api/* to FastAPI.

Usage:
  1. Build the web app:  EXPO_PUBLIC_BACKEND_URL="" npx expo export --platform web
  2. Run the backend:     python3 -m uvicorn server:app --host 0.0.0.0 --port 8000
  3. Run this server:     python3 preview-server.py   (serves http://0.0.0.0:8081)
"""
import mimetypes
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DIST = Path(__file__).resolve().parent / "dist"
BACKEND = "http://127.0.0.1:8000"

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/html", ".html")


class Handler(BaseHTTPRequestHandler):
    server_version = "PreviewServer/1.0"

    def log_message(self, *args):
        pass  # keep logs quiet

    def _proxy_api(self):
        url = BACKEND + self.path
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {k: v for k, v in self.headers.items()
                   if k.lower() in ("content-type", "authorization", "accept")}
        req = urllib.request.Request(url, data=body, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
                self.send_response(resp.status)
                ctype = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", e.headers.get("Content-Type", "application/json"))
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            msg = f'{{"detail":"backend unavailable: {e}"}}'.encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

    def _serve_static(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        target = (DIST / path.lstrip("/")).resolve()
        # prevent path traversal outside DIST
        if DIST not in target.parents and target != DIST:
            self.send_error(403)
            return
        if target.is_dir():
            target = target / "index.html"
        if not target.is_file():
            target = DIST / "index.html"  # SPA fallback for expo-router routes
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(str(target))[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def _route(self):
        if self.path.startswith("/api/"):
            self._proxy_api()
        else:
            self._serve_static()

    do_GET = _route
    do_POST = _route
    do_PUT = _route
    do_PATCH = _route
    do_DELETE = _route
    do_HEAD = _route
    do_OPTIONS = _route


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8081), Handler)
    print("Preview: http://0.0.0.0:8081  (static dist/ + /api proxy to :8000)", flush=True)
    server.serve_forever()
