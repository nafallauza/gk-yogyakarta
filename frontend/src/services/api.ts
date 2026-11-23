import type {
  BootstrapPayload,
  CatalogProduct,
  DpdRegion,
  JoinSubmission,
  RegencyId,
} from '../data/types.ts';

const API_BASE = '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) msg = err.error;
    } catch {
      // ignore non-json error body
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export function fetchBootstrap(): Promise<BootstrapPayload> {
  return apiFetch<BootstrapPayload>('/bootstrap');
}

export function submitJoinForm(payload: {
  fullName: string;
  whatsappNumber: string;
  regionId: RegencyId;
  districtName: string;
  campusOrActivity: string;
  interests: string[];
  notes: string;
}): Promise<{ id: number; routedRegion: DpdRegion; whatsappUrl: string }> {
  return apiFetch('/submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cmsLogin(email: string, password: string): Promise<{
  token: string;
  user: { email: string; name: string; role: string };
}> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function cmsHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function fetchSubmissions(token: string): Promise<JoinSubmission[]> {
  return apiFetch('/submissions', { headers: cmsHeaders(token) });
}

export function formatIdr(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

export function buildWaCheckoutMessage(opts: {
  product: CatalogProduct;
  size: string;
  qty: number;
  buyerName: string;
  domicile: string;
  deliveryNote: string;
}): string {
  const total = formatIdr(opts.product.priceIdr * opts.qty);
  const name = opts.buyerName.trim() || '-';
  const dom = opts.domicile.trim() || 'DI Yogyakarta';
  const note = opts.deliveryNote.trim() || 'Mohon info pengiriman/pengambilan';
  return [
    'Halo Admin GK DIY, saya mau pesan:',
    `• ${opts.product.name} (${opts.size}) × ${opts.qty} — ${total}`,
    `Nama: ${name} · Domisili: ${dom}`,
    `Pengambilan/Catatan: ${note}`,
  ].join('\n');
}

export function buildWaUrl(phone: string, text: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
