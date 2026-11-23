import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../src/server.ts';

test('GET /api/health mengembalikan status ok', async () => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { ok: true, service: 'gk-yogyakarta-backend' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
