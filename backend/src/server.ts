import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { JsonStore } from './services/store.ts';
import { handleApi } from './routes/api.ts';

const PORT = Number(process.env.PORT ?? 4000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function createAppServer(storePath?: string) {
  const store = new JsonStore(storePath);

  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }

    const sendJson = (status: number, payload: unknown) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders(),
      });
      res.end(JSON.stringify(payload));
    };

    try {
      const handled = await handleApi(req, url, store, sendJson);
      if (!handled) sendJson(404, { error: 'Endpoint tidak ditemukan' });
    } catch (err) {
      if (err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(413, { error: 'Ukuran payload melebihi batas 1MB' });
        return;
      }
      if (err instanceof SyntaxError) {
        sendJson(400, { error: 'Format JSON tidak valid' });
        return;
      }
      sendJson(500, { error: 'Terjadi kesalahan pada server' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createAppServer().listen(PORT, () => {
    console.log(`GK Yogyakarta API berjalan di http://localhost:${PORT}`);
  });
}
