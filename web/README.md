# Constructionary Browser

## Run locally
1. From the repo root, build the manifest:
   ```bash
   npm run build:web
   ```
2. Start a local server (from repo root):
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000/web/`.

The browser reads YAML/MD/TEX/PDF files directly from the repo via HTTP.
