import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useSiteData } from '../../app/SiteContext.tsx';
import { buildWaCheckoutMessage, buildWaUrl, formatIdr } from '../../services/api.ts';

export function CatalogPage() {
  const { data } = useSiteData();
  const [searchParams] = useSearchParams();
  const initialSlug = searchParams.get('produk');

  const [category, setCategory] = useState<'all' | 'atribut' | 'merch-dpw' | 'produk-kader'>('all');
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug && data.products.some((p) => p.slug === initialSlug)
      ? initialSlug
      : data.products[0]?.slug ?? '',
  );

  const selectedProduct = useMemo(
    () => data.products.find((p) => p.slug === selectedSlug) ?? data.products[0],
    [data.products, selectedSlug],
  );

  const [size, setSize] = useState<string>(selectedProduct?.sizes[0] ?? 'L');
  const [qty, setQty] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [domicile, setDomicile] = useState<string>('Kabupaten Sleman');
  const [deliveryNote, setDeliveryNote] = useState<string>('Ambil di Sekretariat DPW Umbulharjo');

  const filteredProducts =
    category === 'all' ? data.products : data.products.filter((p) => p.category === category);

  function selectProduct(slug: string) {
    setSelectedSlug(slug);
    const prod = data.products.find((p) => p.slug === slug);
    if (prod && prod.sizes.length) setSize(prod.sizes[0]);
    setQty(1);
  }

  const effectiveSize = selectedProduct.sizes.includes(size) ? size : selectedProduct.sizes[0] ?? 'All Size';
  const waPreview = buildWaCheckoutMessage({
    product: selectedProduct,
    size: effectiveSize,
    qty,
    buyerName,
    domicile,
    deliveryNote,
  });
  const waUrl = buildWaUrl(data.settings.adminWhatsapp, waPreview);

  return (
    <main className="gk-wrap py-12 lg:py-14">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-black tracking-[-0.02em] text-ink sm:text-[44px]">
          Katalog wilayah &amp; atribut kader.
        </h1>
        <p className="max-w-[720px] text-base leading-relaxed text-muted">
          Halaman khusus merchandise resmi DPW dan produk usaha kader. Pilih produk, lengkapi kebutuhan di samping, lalu kirim pesanan langsung lewat template WhatsApp otomatis.
        </p>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {(
          [
            ['all', 'Semua'],
            ['atribut', 'Atribut kader'],
            ['merch-dpw', 'Merch resmi DPW'],
            ['produk-kader', 'Produk usaha kader'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              category === key
                ? 'bg-ink text-white font-semibold'
                : 'border border-line bg-card text-ink hover:bg-zinc-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-9 lg:grid-cols-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {filteredProducts.map((p) => {
            const isSelected = p.slug === selectedProduct.slug;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProduct(p.slug)}
                className={`cursor-pointer overflow-hidden rounded-xl bg-card text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-gk-red border border-gk-red'
                    : 'border border-line hover:border-zinc-400'
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  {isSelected && (
                    <span className="absolute left-3 top-3 rounded bg-gk-red px-2 py-1 text-[11px] font-semibold text-white">
                      Dipilih
                    </span>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="text-[15px] font-semibold text-ink">{p.name}</h2>
                  <p className="text-xs text-muted">{p.sellerLabel}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-display text-base font-extrabold text-ink">
                      {formatIdr(p.priceIdr)}
                    </span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-gk-red' : 'text-ink'}`}>
                      {isSelected ? 'Di form WA' : '+ Pilih'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <aside className="rounded-xl border border-line bg-card p-6 lg:sticky lg:top-24 lg:col-span-5">
          <h2 className="font-display text-xl font-extrabold text-ink">Form pesanan WhatsApp</h2>

          <div className="mt-4 space-y-3 rounded-lg border border-line bg-paper p-3.5">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
              <span>{selectedProduct.name}</span>
              <span>{formatIdr(selectedProduct.priceIdr)}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold ${
                      effectiveSize === sz
                        ? 'bg-ink text-white'
                        : 'border border-line bg-card text-ink hover:bg-zinc-100'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div className="inline-flex items-center gap-3 rounded-md border border-line bg-card px-2.5 py-1 text-sm">
                <button
                  type="button"
                  aria-label="Kurangi jumlah"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="cursor-pointer text-muted hover:text-ink"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-4 text-center font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Tambah jumlah"
                  onClick={() => setQty((q) => q + 1)}
                  className="cursor-pointer text-ink"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-ink">Nama pemesan</span>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Nama lengkap kamu"
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-ink">Domisili Kabupaten / Kota</span>
              <select
                value={domicile}
                onChange={(e) => setDomicile(e.target.value)}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              >
                {data.regions.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
                <option value="Luar D.I. Yogyakarta">Luar D.I. Yogyakarta</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-ink">Pengambilan / pengiriman</span>
              <input
                type="text"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-line bg-zinc-100 p-3.5">
            <p className="text-xs font-semibold text-zinc-600">Preview pesan WhatsApp otomatis</p>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-800">
              {waPreview}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-medium text-muted">Total estimasi</span>
            <span className="font-display text-xl font-extrabold text-ink">
              {formatIdr(selectedProduct.priceIdr * qty)}
            </span>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gk-red py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Lanjut ke WhatsApp <ArrowRight size={15} />
          </a>
        </aside>
      </div>
    </main>
  );
}
