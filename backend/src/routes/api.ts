import crypto from 'node:crypto';
import type http from 'node:http';
import type { JsonStore, RegencyId } from '../services/store.ts';

const VALID_REGIONS = new Set<RegencyId>([
  'kota-yogyakarta',
  'sleman',
  'bantul',
  'kulon-progo',
  'gunungkidul',
]);

// shortcut: single admin account for local CMS demo; replace with DB users + bcrypt for production
const CMS_EMAIL = process.env.CMS_ADMIN_EMAIL ?? 'admin@gkyk.id';
const CMS_PASSWORD = process.env.CMS_ADMIN_PASSWORD ?? 'gkdiy2026';
const TOKEN_SECRET = process.env.CMS_TOKEN_SECRET ?? 'gkyk-dev-secret';

function makeToken(email: string): string {
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(email).digest('hex').slice(0, 24);
  return `${Buffer.from(email).toString('base64url')}.${sig}`;
}

function isAuthorized(req: http.IncomingMessage): boolean {
  const auth = req.headers.authorization ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7).trim();
  return token === makeToken(CMS_EMAIL);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

async function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > 1_000_000) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

export type SendJson = (status: number, payload: unknown) => void;

export async function handleApi(
  req: http.IncomingMessage,
  url: URL,
  store: JsonStore,
  sendJson: SendJson,
): Promise<boolean> {
  const method = req.method ?? 'GET';
  const p = url.pathname;

  if (method === 'GET' && p === '/api/health') {
    sendJson(200, { ok: true, service: 'gk-yogyakarta-backend' });
    return true;
  }

  if (method === 'GET' && p === '/api/bootstrap') {
    const d = store.read();
    sendJson(200, {
      settings: d.settings,
      regions: d.regions,
      programs: d.programs.filter((x) => x.isPublished),
      articles: d.articles.filter((x) => x.isPublished),
      products: d.products.filter((x) => x.isActive),
    });
    return true;
  }

  // Auth
  if (method === 'POST' && p === '/api/auth/login') {
    const body = await readJsonBody(req);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (email !== CMS_EMAIL || password !== CMS_PASSWORD) {
      sendJson(401, { error: 'Email atau kata sandi salah' });
      return true;
    }
    sendJson(200, {
      token: makeToken(email),
      user: { email, name: 'Admin DPW GK DIY', role: 'Editor · semua wilayah' },
    });
    return true;
  }

  // Public reads
  if (method === 'GET' && p === '/api/regions') {
    sendJson(200, store.read().regions);
    return true;
  }
  if (method === 'GET' && p.startsWith('/api/regions/')) {
    const id = p.slice('/api/regions/'.length);
    const region = store.read().regions.find((r) => r.id === id);
    if (!region) { sendJson(404, { error: 'Wilayah tidak ditemukan' }); return true; }
    sendJson(200, region);
    return true;
  }
  if (method === 'GET' && p === '/api/programs') {
    sendJson(200, store.read().programs);
    return true;
  }
  if (method === 'GET' && p === '/api/articles') {
    sendJson(200, store.read().articles);
    return true;
  }
  if (method === 'GET' && p.startsWith('/api/articles/')) {
    const slug = p.slice('/api/articles/'.length);
    const article = store.read().articles.find((a) => a.slug === slug);
    if (!article) { sendJson(404, { error: 'Artikel tidak ditemukan' }); return true; }
    sendJson(200, article);
    return true;
  }
  if (method === 'GET' && p === '/api/products') {
    sendJson(200, store.read().products);
    return true;
  }

  // Public Smart Routing join submission
  if (method === 'POST' && p === '/api/submissions') {
    const body = await readJsonBody(req);
    const fullName = String(body.fullName ?? '').trim();
    const whatsappNumber = String(body.whatsappNumber ?? '').trim();
    const regionId = String(body.regionId ?? '').trim() as RegencyId;
    if (!fullName || !whatsappNumber || !VALID_REGIONS.has(regionId)) {
      sendJson(400, { error: 'Nama lengkap, nomor WhatsApp, dan domisili kabupaten/kota wajib diisi' });
      return true;
    }
    const region = store.read().regions.find((r) => r.id === regionId)!;
    let createdId = 0;
    store.write((d) => {
      createdId = (d.submissions.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1;
      d.submissions.unshift({
        id: createdId,
        fullName,
        whatsappNumber,
        regionId,
        districtName: String(body.districtName ?? '').trim(),
        campusOrActivity: String(body.campusOrActivity ?? '').trim(),
        interests: Array.isArray(body.interests) ? body.interests.map(String) : [],
        notes: String(body.notes ?? '').trim(),
        routedStatus: 'baru',
        createdAt: new Date().toISOString(),
      });
    });
    const waText = encodeURIComponent(
      `Halo Admin ${region.name}, saya ${fullName} dari ${String(body.districtName ?? region.shortName).trim()} ingin bergabung dengan GK Yogyakarta.`,
    );
    sendJson(201, {
      id: createdId,
      routedRegion: region,
      whatsappUrl: `https://wa.me/${region.whatsappNumber}?text=${waText}`,
    });
    return true;
  }

  // Protected CMS endpoints
  if (!isAuthorized(req)) {
    if (
      p === '/api/submissions' ||
      p.startsWith('/api/submissions/') ||
      p === '/api/settings' ||
      p.startsWith('/api/regions/') ||
      p === '/api/programs' ||
      p.startsWith('/api/programs/') ||
      p === '/api/articles' ||
      p.startsWith('/api/articles/') ||
      p === '/api/products' ||
      p.startsWith('/api/products/')
    ) {
      sendJson(401, { error: 'Autentikasi CMS diperlukan' });
      return true;
    }
    return false;
  }

  if (method === 'GET' && p === '/api/submissions') {
    sendJson(200, store.read().submissions);
    return true;
  }

  if (method === 'PATCH' && p.startsWith('/api/submissions/')) {
    const id = Number(p.slice('/api/submissions/'.length));
    const body = await readJsonBody(req);
    const status = String(body.routedStatus ?? '');
    if (!['baru', 'dihubungi', 'selesai'].includes(status)) {
      sendJson(400, { error: 'Status pendaftar tidak valid' });
      return true;
    }
    let updated = null;
    store.write((d) => {
      const target = d.submissions.find((s) => s.id === id);
      if (target) {
        target.routedStatus = status as 'baru' | 'dihubungi' | 'selesai';
        updated = target;
      }
    });
    if (!updated) { sendJson(404, { error: 'Data pendaftar tidak ditemukan' }); return true; }
    sendJson(200, updated);
    return true;
  }

  if (method === 'PATCH' && p === '/api/settings') {
    const body = await readJsonBody(req);
    const data = store.write((d) => {
      for (const key of Object.keys(d.settings) as (keyof typeof d.settings)[]) {
        if (typeof body[key] === 'string') d.settings[key] = body[key] as string;
      }
    });
    sendJson(200, data.settings);
    return true;
  }

  if (method === 'PATCH' && p.startsWith('/api/regions/')) {
    const id = p.slice('/api/regions/'.length);
    const body = await readJsonBody(req);
    let updated = null;
    store.write((d) => {
      const reg = d.regions.find((r) => r.id === id);
      if (!reg) return;
      if (typeof body.chairperson === 'string') reg.chairperson = body.chairperson;
      if (typeof body.secretariatAddress === 'string') reg.secretariatAddress = body.secretariatAddress;
      if (typeof body.whatsappNumber === 'string') reg.whatsappNumber = body.whatsappNumber;
      if (typeof body.activeDistricts === 'number') reg.activeDistricts = body.activeDistricts;
      updated = reg;
    });
    if (!updated) { sendJson(404, { error: 'Wilayah tidak ditemukan' }); return true; }
    sendJson(200, updated);
    return true;
  }

  if (method === 'POST' && p === '/api/programs') {
    const body = await readJsonBody(req);
    const title = String(body.title ?? '').trim();
    if (!title) { sendJson(400, { error: 'Judul program/event wajib diisi' }); return true; }
    const category = body.category === 'rutin' ? 'rutin' : 'event';
    let created = null;
    store.write((d) => {
      const id = (d.programs.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
      created = {
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        category,
        frequencyLabel: String(body.frequencyLabel ?? (category === 'rutin' ? 'PEKANAN' : 'EVENT')),
        regionId: (VALID_REGIONS.has(body.regionId as RegencyId) ? body.regionId : 'diy') as RegencyId | 'diy',
        scheduleText: String(body.scheduleText ?? 'Segera diumumkan'),
        dateBadge: String(body.dateBadge ?? 'AGENDA'),
        location: String(body.location ?? 'DI Yogyakarta'),
        statusLabel: String(body.statusLabel ?? 'Terbuka untuk umum'),
        statusTone: 'green' as const,
        description: String(body.description ?? ''),
        posterUrl: String(body.posterUrl ?? '/images/rakernas.jpg'),
        posterHeadline: title.toUpperCase(),
        posterSub: String(body.description ?? ''),
        ctaLabel: category === 'event' ? 'Daftar' : 'Ikut',
        isPublished: true,
      };
      d.programs.unshift(created);
    });
    sendJson(201, created);
    return true;
  }

  if (method === 'DELETE' && p.startsWith('/api/programs/')) {
    const id = Number(p.slice('/api/programs/'.length));
    store.write((d) => {
      d.programs = d.programs.filter((x) => x.id !== id);
    });
    sendJson(200, { deleted: id });
    return true;
  }

  if (method === 'POST' && p === '/api/articles') {
    const body = await readJsonBody(req);
    const title = String(body.title ?? '').trim();
    if (!title) { sendJson(400, { error: 'Judul tulisan wajib diisi' }); return true; }
    const category = ['kabar', 'opini', 'artikel'].includes(String(body.category))
      ? (String(body.category) as 'kabar' | 'opini' | 'artikel')
      : 'kabar';
    let created = null;
    store.write((d) => {
      const id = (d.articles.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
      const content = String(body.body ?? '').trim();
      created = {
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        category,
        regionId: (VALID_REGIONS.has(body.regionId as RegencyId) ? body.regionId : 'diy') as RegencyId | 'diy',
        authorName: String(body.authorName ?? 'Redaksi GK DIY'),
        authorRole: 'DPW DI Yogyakarta',
        publishedLabel: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        readTime: '3 menit baca',
        coverUrl: String(body.coverUrl ?? '/images/article.jpg'),
        excerpt: content.slice(0, 140),
        paragraphs: content ? content.split(/\n+/).filter(Boolean) : [title],
        isPublished: true,
      };
      d.articles.unshift(created);
    });
    sendJson(201, created);
    return true;
  }

  if (method === 'DELETE' && p.startsWith('/api/articles/')) {
    const id = Number(p.slice('/api/articles/'.length));
    store.write((d) => {
      d.articles = d.articles.filter((x) => x.id !== id);
    });
    sendJson(200, { deleted: id });
    return true;
  }

  if (method === 'POST' && p === '/api/products') {
    const body = await readJsonBody(req);
    const name = String(body.name ?? '').trim();
    const priceIdr = Number(body.priceIdr ?? 0);
    if (!name || Number.isNaN(priceIdr) || priceIdr < 0) {
      sendJson(400, { error: 'Nama produk dan harga valid wajib diisi' });
      return true;
    }
    let created = null;
    store.write((d) => {
      const id = (d.products.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
      created = {
        id,
        slug: `${slugify(name)}-${id}`,
        name,
        category: (['atribut', 'merch-dpw', 'produk-kader'].includes(String(body.category))
          ? String(body.category)
          : 'merch-dpw') as 'atribut' | 'merch-dpw' | 'produk-kader',
        regionId: (VALID_REGIONS.has(body.regionId as RegencyId) ? body.regionId : 'diy') as RegencyId | 'diy',
        sellerLabel: String(body.sellerLabel ?? 'Merch resmi DPW'),
        priceIdr,
        imageUrl: String(body.imageUrl ?? '/images/merch-totebag.png'),
        sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes.map(String) : ['All Size'],
        isActive: true,
      };
      d.products.unshift(created);
    });
    sendJson(201, created);
    return true;
  }

  if (method === 'DELETE' && p.startsWith('/api/products/')) {
    const id = Number(p.slice('/api/products/'.length));
    store.write((d) => {
      d.products = d.products.filter((x) => x.id !== id);
    });
    sendJson(200, { deleted: id });
    return true;
  }

  return false;
}
