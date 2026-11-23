import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWaCheckoutMessage, buildWaUrl, formatIdr } from '../src/services/api.ts';

test('formatIdr memformat rupiah dengan pemisah ribuan Indonesia', () => {
  assert.equal(formatIdr(165000), 'Rp165.000');
});

test('buildWaCheckoutMessage dan buildWaUrl menyusun template pesan WA otomatis', () => {
  const msg = buildWaCheckoutMessage({
    product: {
      id: 1,
      slug: 'rompi-gaskan-gk-diy',
      name: 'Rompi GASKAN! GK DIY',
      category: 'atribut',
      regionId: 'diy',
      sellerLabel: 'Atribut resmi DPW',
      priceIdr: 165000,
      imageUrl: '/images/merch-rompi.jpg',
      sizes: ['M', 'L'],
      isActive: true,
    },
    size: 'L',
    qty: 2,
    buyerName: 'Raka Pratama',
    domicile: 'Sleman',
    deliveryNote: 'Ambil di sekretariat',
  });
  assert.ok(msg.includes('Rompi GASKAN! GK DIY (L) × 2 — Rp330.000'));
  assert.ok(msg.includes('Raka Pratama'));
  const url = buildWaUrl('+62 812-0000-0000', msg);
  assert.ok(url.startsWith('https://wa.me/6281200000000?text='));
});
