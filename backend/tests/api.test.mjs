import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAppServer } from '../src/server.ts';

async function withServer(fn) {
  const tmpStore = path.join(os.tmpdir(), `gkyk-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  const server = createAppServer(tmpStore);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tmpStore, { force: true });
  }
}

test('GET /api/bootstrap mengembalikan data 5 wilayah DIY, program, artikel, dan katalog', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/bootstrap`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.regions.length, 5);
    assert.ok(data.programs.some((p) => p.category === 'rutin'));
    assert.ok(data.programs.some((p) => p.category === 'event'));
    assert.ok(data.products.length >= 3);
  });
});

test('POST /api/submissions melakukan Smart Routing ke DPD Sleman dan menolak input kosong', async () => {
  await withServer(async (base) => {
    const bad = await fetch(`${base}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: '', regionId: 'invalid' }),
    });
    assert.equal(bad.status, 400);

    const ok = await fetch(`${base}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Budi Santoso',
        whatsappNumber: '08123456789',
        regionId: 'sleman',
        districtName: 'Depok',
      }),
    });
    assert.equal(ok.status, 201);
    const body = await ok.json();
    assert.equal(body.routedRegion.id, 'sleman');
    assert.ok(body.whatsappUrl.includes('wa.me/6281200000002'));
  });
});

test('Endpoint CMS dilindungi autentikasi Bearer dan menerima CRUD setelah login', async () => {
  await withServer(async (base) => {
    const denied = await fetch(`${base}/api/submissions`);
    assert.equal(denied.status, 401);

    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gkyk.id', password: 'gkdiy2026' }),
    });
    assert.equal(loginRes.status, 200);
    const { token } = await loginRes.json();

    const createRes = await fetch(`${base}/api/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Ngopi Kebangsaan Sleman', category: 'event', regionId: 'sleman' }),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.title, 'Ngopi Kebangsaan Sleman');
  });
});
