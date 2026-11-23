import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSiteData } from '../../app/SiteContext.tsx';
import { DiyVectorMap } from './DiyVectorMap.tsx';
import { buildWaUrl, submitJoinForm } from '../../services/api.ts';
import type { RegencyId } from '../../data/types.ts';

const INTEREST_OPTIONS = [
  'Kaderisasi & Kepemimpinan',
  'Kajian & Opini',
  'Aksi Sosial',
  'Wirausaha Kader',
];

export function JoinPage() {
  const { data } = useSiteData();
  const [searchParams] = useSearchParams();
  const paramRegion = searchParams.get('domisili') as RegencyId | null;

  const [regionId, setRegionId] = useState<RegencyId>(
    paramRegion && data.regions.some((r) => r.id === paramRegion) ? paramRegion : 'sleman',
  );
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [campusOrActivity, setCampusOrActivity] = useState('');
  const [interests, setInterests] = useState<string[]>(['Kaderisasi & Kepemimpinan']);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ whatsappUrl: string; regionName: string } | null>(null);

  const routedRegion = data.regions.find((r) => r.id === regionId) ?? data.regions[0];

  function toggleInterest(item: string) {
    setInterests((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !whatsappNumber.trim()) {
      setError('Nama lengkap dan nomor WhatsApp wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitJoinForm({
        fullName,
        whatsappNumber,
        regionId,
        districtName,
        campusOrActivity,
        interests,
        notes,
      });
      setResult({ whatsappUrl: res.whatsappUrl, regionName: res.routedRegion.name });
    } catch {
      // Fallback jika backend sedang mati: tetap arahkan ke WhatsApp DPD sesuai Smart Routing
      const waText = `Halo Admin DPD ${routedRegion.name}, saya ${fullName.trim()} (${districtName || routedRegion.shortName}) ingin bergabung dengan GK Yogyakarta.`;
      setResult({
        whatsappUrl: buildWaUrl(routedRegion.whatsappNumber, waText),
        regionName: routedRegion.name,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="gk-wrap py-12 lg:py-14">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-black tracking-[-0.02em] text-ink sm:text-[44px]">
          Bergabung bersama GK Yogyakarta.
        </h1>
        <p className="max-w-[720px] text-base leading-relaxed text-muted">
          Pilih domisili kabupaten atau kota tempat tinggalmu — pendaftaranmu otomatis diteruskan ke admin DPD wilayah setempat.
        </p>
      </div>

      <div className="mt-9 grid items-start gap-10 lg:grid-cols-12">
        <div className="rounded-xl border border-line bg-card p-6 sm:p-7 lg:col-span-7">
          {result ? (
            <div className="space-y-5 py-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={22} />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Pendaftaran diteruskan ke DPD {result.regionName}
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Data kamu sudah masuk ke daftar pendaftar DPD {result.regionName}. Kamu juga bisa langsung menyapa admin lewat WhatsApp sekarang.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={result.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-gk-red px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Chat Admin DPD {result.regionName} <ArrowRight size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setFullName('');
                    setWhatsappNumber('');
                    setNotes('');
                  }}
                  className="cursor-pointer rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-ink"
                >
                  Isi form lagi
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <span className="block text-sm font-semibold text-ink">
                  Domisili Kabupaten / Kota (Smart Routing)
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.regions.map((r) => {
                    const active = r.id === regionId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegionId(r.id)}
                        className={`cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-gk-red font-semibold text-white'
                            : 'border border-line bg-card text-ink hover:bg-zinc-100'
                        }`}
                      >
                        {r.shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">Nama lengkap *</span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Nadia Kusuma"
                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">Nomor WhatsApp *</span>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">{routedRegion.districtTerm} / Kecamatan</span>
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    placeholder={`Contoh: ${routedRegion.districts[0] ?? routedRegion.shortName}`}
                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">Kampus / Aktivitas</span>
                  <input
                    type="text"
                    value={campusOrActivity}
                    onChange={(e) => setCampusOrActivity(e.target.value)}
                    placeholder="Mahasiswa / Profesional / Wirausaha"
                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-medium text-ink">
                  Minat kegiatan (boleh pilih lebih dari satu)
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => {
                    const active = interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleInterest(opt)}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-ink font-semibold text-white'
                            : 'border border-line bg-card text-ink hover:bg-zinc-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-ink">Harapan bergabung (opsional)</span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tulis minat kegiatan atau pertanyaan singkat..."
                  className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                />
              </label>

              {error && <p className="text-sm font-medium text-gk-red">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gk-red py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? 'Mengirim...' : `Kirim & Hubungi DPD ${routedRegion.shortName}`}
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        <aside className="rounded-xl border border-line bg-card p-6 lg:col-span-5 space-y-5">
          <h2 className="font-display text-lg font-extrabold text-ink">Tujuan routing wilayah</h2>
          <DiyVectorMap selectedId={regionId} onSelect={setRegionId} compact />
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50/70 p-4">
            <h3 className="font-display text-base font-extrabold text-ink">DPD {routedRegion.name}</h3>
            <p className="text-xs font-medium text-zinc-700">
              {routedRegion.activeDistricts}/{routedRegion.totalDistricts} {routedRegion.districtTerm.toLowerCase()} aktif · {routedRegion.secretariatAddress}
            </p>
            <p className="text-xs leading-relaxed text-zinc-600">
              Admin DPD {routedRegion.shortName} akan menyapamu lewat WhatsApp maksimal 2 hari kerja sekaligus mengundang ke agenda pekanan terdekat.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
