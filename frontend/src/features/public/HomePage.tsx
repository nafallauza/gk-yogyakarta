import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteData } from '../../app/SiteContext.tsx';
import { DiyVectorMap } from './DiyVectorMap.tsx';
import { buildWaUrl, formatIdr } from '../../services/api.ts';
import type { RegencyId } from '../../data/types.ts';

const BOARD_MEMBERS = [
  { initials: 'AR', name: 'Ahmad Rasyid', role: 'Ketua DPW' },
  { initials: 'SN', name: 'Siti Nurhaliza', role: 'Sekretaris' },
  { initials: 'BW', name: 'Bayu Wijaya', role: 'Bendahara' },
  { initials: 'DK', name: 'Dina Kartika', role: 'Kaderisasi' },
];

export function HomePage() {
  const { data } = useSiteData();
  const [selectedRegion, setSelectedRegion] = useState<RegencyId>('kota-yogyakarta');
  const [programTab, setProgramTab] = useState<'semua' | 'rutin' | 'event'>('semua');
  const [programRegion, setProgramRegion] = useState<string>('all');
  const [articleTab, setArticleTab] = useState<'semua' | 'kabar' | 'opini' | 'artikel'>('semua');
  const [catalogRegion, setCatalogRegion] = useState<string>('all');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const posterScrollRef = useRef<HTMLDivElement>(null);

  const activeRegion = data.regions.find((r) => r.id === selectedRegion) ?? data.regions[0];

  const routinePrograms = data.programs.filter(
    (p) => p.category === 'rutin' && (programRegion === 'all' || p.regionId === programRegion || p.regionId === 'diy'),
  );
  const eventPrograms = data.programs.filter(
    (p) => p.category === 'event' && (programRegion === 'all' || p.regionId === programRegion || p.regionId === 'diy'),
  );

  const filteredArticles =
    articleTab === 'semua' ? data.articles : data.articles.filter((a) => a.category === articleTab);
  const featuredArticle = filteredArticles[0] ?? data.articles[0];
  const secondaryArticles = filteredArticles.slice(1, 4);

  const filteredProducts = data.products
    .filter((p) => (catalogRegion === 'all' ? true : p.regionId === catalogRegion))
    .filter((p) => (catalogCategory === 'all' ? true : p.category === catalogCategory))
    .slice(0, 3);

  function scrollPosters(dir: -1 | 1) {
    posterScrollRef.current?.scrollBy({ left: dir * 290, behavior: 'smooth' });
  }

  return (
    <main>
      {/* 01 Beranda — Full-bleed 1-screen hero + anchored agenda strip */}
      <section className="flex min-h-[calc(100svh-76px)] flex-col bg-ink text-white">
        <div className="relative flex flex-1 items-center overflow-hidden">
          <img
            src="/images/hero.jpg"
            alt="Kader Garuda Keadilan DI Yogyakarta"
            className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(11,11,12,0.95) 0%, rgba(11,11,12,0.82) 38%, rgba(11,11,12,0.30) 64%, rgba(11,11,12,0.18) 100%), linear-gradient(180deg, rgba(11,11,12,0.32) 0%, rgba(11,11,12,0.06) 45%, rgba(11,11,12,0.92) 100%)',
            }}
          />

          <div className="gk-wrap relative z-10 py-16 lg:py-20">
            <div className="max-w-[660px] space-y-6">
              <h1 className="font-display text-[clamp(2.75rem,5.2vw,5.4rem)] font-black leading-[1.01] tracking-[-0.025em] text-white">
                {data.settings.heroHeadline}
              </h1>
              <p className="max-w-[580px] text-base leading-relaxed text-zinc-200 sm:text-lg xl:text-xl">
                {data.settings.heroSubcopy}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/gabung"
                  className="rounded-lg bg-gk-red px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-red-700"
                >
                  Gabung GK Jogja
                </Link>
                <a
                  href="#program"
                  className="rounded-lg border border-white/25 bg-ink/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
                >
                  Lihat agenda
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 bg-ink">
          <div className="gk-wrap flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
              <span className="text-sm font-medium text-zinc-400">Agenda terdekat</span>
              <span className="text-base font-semibold text-white">{data.settings.nextAgendaTitle}</span>
              <span className="text-sm text-zinc-400">{data.settings.nextAgendaMeta}</span>
            </div>
            <Link
              to="/gabung"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gk-red hover:underline"
            >
              Daftar <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Profil Wilayah */}
      <section id="profil" className="gk-screen bg-paper py-16 lg:py-16">
        <div className="gk-wrap">
          <div className="border-t border-line pt-6">
            <h2 className="max-w-[900px] font-display text-[clamp(1.85rem,2.8vw,2.85rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              {data.settings.aboutHeadline}
            </h2>
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-6">
              <p className="max-w-[640px] text-base leading-[1.65] text-zinc-600 sm:text-[17px]">{data.settings.aboutBody}</p>
              <dl className="divide-y divide-line border-t border-b border-line">
                {[
                  ['Berdiri', data.settings.foundedYear],
                  ['Cakupan', data.settings.coverageText],
                  ['Ketua DPW', data.settings.chairpersonDpw],
                  ['Sekretariat', data.settings.secretariatAddress],
                ].map(([label, val]) => (
                  <div key={label} className="grid grid-cols-12 gap-4 py-3.5 text-sm">
                    <dt className="col-span-4 text-muted">{label}</dt>
                    <dd className="col-span-8 font-medium text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-line bg-card">
                <img
                  src="/images/rakernas.jpg"
                  alt="Rapat Kerja Garuda Keadilan DIY"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-line pt-8">
            <p className="text-sm font-medium text-muted">Pengurus inti</p>
            <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {BOARD_MEMBERS.map((m) => (
                <div key={m.role} className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-ink">
                    {m.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.name}</p>
                    <p className="text-xs text-muted">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Jaringan Daerah — Peta DIY Asli Interaktif + Tabel DPD */}
      <section id="jaringan" className="gk-screen bg-card py-16 lg:py-16">
        <div className="gk-wrap">
          <div className="border-t border-line pt-6 space-y-3">
            <h2 className="max-w-[860px] font-display text-[clamp(1.85rem,2.8vw,2.85rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              Cari pengurus terdekat, langsung hubungi.
            </h2>
            <p className="max-w-[660px] text-base text-muted sm:text-[17px]">
              Setiap kabupaten/kota punya pengurus daerah (DPD) sendiri. Klik wilayah pada peta untuk melihat kontak dan profil lengkap DPD.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-5">
              <DiyVectorMap selectedId={selectedRegion} onSelect={setSelectedRegion} />

              <div className="mt-4 hidden items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 lg:flex">
                <div>
                  <p className="text-sm font-semibold text-ink">{activeRegion.name}</p>
                  <p className="text-xs text-muted">
                    {activeRegion.activeDistricts}/{activeRegion.totalDistricts} {activeRegion.districtTerm} · {activeRegion.secretariatAddress}
                  </p>
                </div>
                <Link
                  to={`/daerah/${activeRegion.id}`}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-gk-red hover:underline"
                >
                  Profil DPD <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Mobile: region chips + clean DPD card (zero horizontal table overflow) */}
            <div className="min-w-0 space-y-4 lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.regions.map((r) => {
                  const active = r.id === selectedRegion;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRegion(r.id)}
                      className={`shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-gk-red text-white'
                          : 'border border-line bg-card text-ink hover:bg-zinc-100'
                      }`}
                    >
                      {r.shortName}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 rounded-xl border border-line bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-extrabold text-ink">DPD {activeRegion.name}</h3>
                  <Link
                    to={`/daerah/${activeRegion.id}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gk-red hover:underline"
                  >
                    Detail <ArrowRight size={13} />
                  </Link>
                </div>
                <dl className="divide-y divide-line text-sm">
                  <div className="py-2.5">
                    <dt className="text-xs text-muted">Ketua</dt>
                    <dd className="font-medium text-ink">{activeRegion.chairperson}</dd>
                  </div>
                  <div className="py-2.5">
                    <dt className="text-xs text-muted">{activeRegion.districtTerm} aktif</dt>
                    <dd className="font-medium text-ink">
                      {activeRegion.activeDistricts} dari {activeRegion.totalDistricts} {activeRegion.districtTerm.toLowerCase()}
                    </dd>
                  </div>
                  <div className="py-2.5">
                    <dt className="text-xs text-muted">Sekretariat</dt>
                    <dd className="font-medium text-ink">{activeRegion.secretariatAddress}</dd>
                  </div>
                </dl>
                <a
                  href={buildWaUrl(
                    activeRegion.whatsappNumber,
                    `Halo Admin ${activeRegion.name}, saya ingin terhubung dengan pengurus GK setempat.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-lg bg-gk-red py-3 text-center text-sm font-semibold text-white hover:bg-red-700"
                >
                  Chat admin WhatsApp
                </a>
              </div>
            </div>

            {/* Desktop: full 5-row interactive DPD table */}
            <div className="hidden min-w-0 lg:col-span-7 lg:block">
              <div className="overflow-hidden rounded-xl border border-line bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-paper/60 text-xs font-medium text-muted">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">Wilayah</th>
                      <th className="px-4 py-3.5 font-medium">Ketua DPD</th>
                      <th className="px-4 py-3.5 font-medium">Cakupan</th>
                      <th className="px-4 py-3.5 font-medium">Sekretariat</th>
                      <th className="px-5 py-3.5 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.regions.map((r) => {
                      const active = r.id === selectedRegion;
                      return (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedRegion(r.id)}
                          className={`cursor-pointer transition-colors ${
                            active ? 'bg-red-50/70' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-ink">
                            <Link to={`/daerah/${r.id}`} className="hover:text-gk-red hover:underline">
                              {r.shortName}
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-zinc-700">{r.chairperson}</td>
                          <td className="whitespace-nowrap px-4 py-4 tabular-nums text-zinc-700">
                            {r.activeDistricts}/{r.totalDistricts}
                          </td>
                          <td className="px-4 py-4 text-zinc-700">{r.secretariatAddress}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <a
                              href={buildWaUrl(
                                r.whatsappNumber,
                                `Halo Admin ${r.name}, saya ingin terhubung dengan pengurus GK setempat.`,
                              )}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-gk-red hover:underline"
                            >
                              Chat WA
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program & Agenda — Kategori Rutin/Event + Poster Event Horizontal Scroll */}
      <section id="program" className="gk-screen bg-paper py-16 lg:py-16">
        <div className="gk-wrap">
          <div className="border-t border-line pt-6">
            <h2 className="max-w-[920px] font-display text-[clamp(1.85rem,2.8vw,2.85rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              Program yang rutin jalan, agenda yang bisa kamu datangi minggu ini.
            </h2>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Kategori program dan agenda">
              {(
                [
                  ['semua', 'Semua'],
                  ['rutin', 'Kegiatan Rutin'],
                  ['event', 'Event'],
                ] as const
              ).map(([key, label]) => {
                const active = programTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setProgramTab(key)}
                    className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-ink text-white font-semibold'
                        : 'border border-line bg-card text-ink hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <select
                aria-label="Filter wilayah program"
                value={programRegion}
                onChange={(e) => setProgramRegion(e.target.value)}
                className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-medium text-ink focus:border-ink focus:outline-none"
              >
                <option value="all">Semua wilayah</option>
                {data.regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.shortName}
                  </option>
                ))}
              </select>

              {programTab !== 'rutin' && (
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    aria-label="Geser poster ke kiri"
                    onClick={() => scrollPosters(-1)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-zinc-600 transition-colors hover:border-ink hover:text-ink"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Geser poster ke kanan"
                    onClick={() => scrollPosters(1)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-ink text-white transition-colors hover:bg-zinc-800"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className={`mt-8 grid items-start gap-8 ${
              programTab === 'semua' ? 'lg:grid-cols-12' : 'grid-cols-1'
            }`}
          >
            {programTab !== 'event' && (
              <div className={programTab === 'semua' ? 'lg:col-span-4' : ''}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-ink">Kegiatan rutin</h3>
                  <span className="text-xs text-muted">Tiap pekan &amp; bulanan</span>
                </div>
                <div
                  className={`overflow-hidden rounded-xl border border-line bg-card ${
                    programTab === 'rutin' ? 'grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0' : 'divide-y divide-line'
                  }`}
                >
                  {routinePrograms.map((item) => {
                    const isWeekly = item.frequencyLabel === 'PEKANAN';
                    return (
                      <div key={item.id} className="space-y-1.5 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                              isWeekly ? 'bg-red-50 text-gk-red' : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {item.frequencyLabel}
                          </span>
                          <span className="text-xs font-medium text-muted">{item.scheduleText}</span>
                        </div>
                        <p className="text-[15px] font-semibold text-ink">{item.title}</p>
                        <p className="text-xs leading-relaxed text-muted">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {programTab !== 'rutin' && (
              <div className={programTab === 'semua' ? 'min-w-0 lg:col-span-8' : 'min-w-0'}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-ink">Poster event</h3>
                  <span className="text-xs font-medium text-muted">Geser ke samping →</span>
                </div>

                <div
                  ref={posterScrollRef}
                  className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 scroll-smooth"
                >
                  {eventPrograms.map((ev) => (
                    <article
                      key={ev.id}
                      className="w-[264px] xl:w-[296px] shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-card transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
                        <img
                          src={ev.posterUrl}
                          alt={ev.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        />

                        {!ev.isPreDesignedPoster ? (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  'linear-gradient(180deg, rgba(11,11,12,0.55) 0%, rgba(11,11,12,0.16) 35%, rgba(11,11,12,0.82) 66%, rgba(11,11,12,0.96) 100%)',
                              }}
                            />
                            <span className="absolute left-3 top-3 rounded bg-gk-red px-2 py-1 text-[10px] font-semibold tracking-wider text-white">
                              EVENT
                            </span>
                            <span className="absolute right-3 top-3 rounded border border-white/20 bg-ink/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-white">
                              {ev.dateBadge}
                            </span>
                            <div className="absolute inset-x-3.5 bottom-3.5 space-y-1.5">
                              <span className="block h-[3px] w-6 bg-gk-red" />
                              <p className="font-display text-xl font-black leading-[1.08] tracking-tight text-white">
                                {ev.posterHeadline ?? ev.title}
                              </p>
                              <p className="text-xs leading-snug text-zinc-200">{ev.posterSub ?? ev.description}</p>
                              <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                {ev.location}
                              </p>
                            </div>
                          </>
                        ) : (
                          <span className="absolute bottom-3 left-3 rounded bg-gk-red px-2 py-1 text-[10px] font-semibold tracking-wider text-white">
                            EVENT
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 p-3.5">
                        <p className="text-xs font-medium text-muted">{ev.scheduleText}</p>
                        <h4 className="text-[15px] font-semibold leading-snug text-ink">{ev.title}</h4>
                        <div className="flex items-center justify-between pt-1.5">
                          <span
                            className={`text-xs font-medium ${
                              ev.statusTone === 'green'
                                ? 'text-emerald-700'
                                : ev.statusTone === 'amber'
                                  ? 'text-amber-700'
                                  : 'text-muted'
                            }`}
                          >
                            {ev.statusLabel}
                          </span>
                          <Link
                            to="/gabung"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gk-red hover:underline"
                          >
                            {ev.ctaLabel} <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Kabar, Opini & Artikel */}
      <section id="kabar" className="gk-screen bg-card py-16 lg:py-16">
        <div className="gk-wrap">
          <div className="flex flex-col justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-end">
            <h2 className="max-w-[820px] font-display text-[clamp(1.85rem,2.8vw,2.85rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              Tulisan dari kader dan pengurus GK Jogja.
            </h2>
            <Link
              to={`/kabar/${featuredArticle.slug}`}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Semua tulisan
            </Link>
          </div>

          <div className="mt-7 flex gap-6 border-b border-line">
            {(
              [
                ['semua', 'Semua'],
                ['kabar', 'Kabar'],
                ['opini', 'Opini'],
                ['artikel', 'Artikel'],
              ] as const
            ).map(([key, label]) => {
              const active = articleTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setArticleTab(key)}
                  className={`cursor-pointer pb-3 text-sm transition-colors ${
                    active
                      ? 'border-b-2 border-gk-red font-semibold text-ink'
                      : 'font-medium text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-12">
            {featuredArticle && (
              <Link to={`/kabar/${featuredArticle.slug}`} className="group block space-y-4 lg:col-span-7">
                <div className="overflow-hidden rounded-xl border border-line">
                  <img
                    src={featuredArticle.coverUrl}
                    alt={featuredArticle.title}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="text-xs font-semibold text-gk-red capitalize">
                  {featuredArticle.category} · {featuredArticle.publishedLabel} · {featuredArticle.readTime}
                </p>
                <h3 className="font-display text-2xl font-extrabold leading-snug text-ink group-hover:text-gk-red">
                  {featuredArticle.title}
                </h3>
                <p className="text-sm text-muted">
                  {featuredArticle.authorName}, {featuredArticle.authorRole}
                </p>
              </Link>
            )}

            <div className="divide-y divide-line lg:col-span-5">
              {secondaryArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/kabar/${art.slug}`}
                  className="group flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-line">
                    <img
                      src={art.coverUrl}
                      alt={art.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted capitalize">
                      {art.category} · {art.publishedLabel}
                    </p>
                    <h4 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-gk-red">
                      {art.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Katalog Wilayah — Preview + tautan ke halaman khusus /katalog */}
      <section id="katalog" className="gk-screen bg-paper py-16 lg:py-16">
        <div className="gk-wrap">
          <div className="flex flex-col justify-between gap-6 border-t border-line pt-6 lg:flex-row lg:items-end">
            <div className="space-y-3">
              <h2 className="max-w-[760px] font-display text-[clamp(1.85rem,2.8vw,2.85rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">
                Merch resmi dan produk usaha kader.
              </h2>
              <p className="max-w-[540px] text-base text-muted">
                Pembayaran dan pengiriman diatur langsung oleh admin wilayah lewat WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="Filter wilayah katalog"
                value={catalogRegion}
                onChange={(e) => setCatalogRegion(e.target.value)}
                className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm text-ink"
              >
                <option value="all">Semua wilayah</option>
                <option value="diy">DPW DIY</option>
                {data.regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.shortName}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter kategori katalog"
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm text-ink"
              >
                <option value="all">Semua kategori</option>
                <option value="atribut">Atribut kader</option>
                <option value="merch-dpw">Merch resmi DPW</option>
                <option value="produk-kader">Produk kader</option>
              </select>
            </div>
          </div>

          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="group space-y-3.5">
                <Link
                  to={`/katalog?produk=${prod.slug}`}
                  className="block overflow-hidden rounded-xl border border-line bg-card"
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </Link>
                <div>
                  <h3 className="text-base font-semibold text-ink">{prod.name}</h3>
                  <p className="text-sm text-muted">{prod.sellerLabel}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-display text-lg font-extrabold text-ink">
                    {formatIdr(prod.priceIdr)}
                  </span>
                  <Link
                    to={`/katalog?produk=${prod.slug}`}
                    className="text-sm font-semibold text-gk-red hover:underline"
                  >
                    Pesan via WA
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Buka halaman katalog &amp; form WA <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Gabung — Dark 2-column split */}
      <section id="gabung" className="gk-screen bg-ink py-16 text-white lg:py-16">
        <div className="gk-wrap">
          <div className="grid gap-12 border-t border-white/15 pt-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <h2 className="font-display text-[clamp(1.85rem,2.8vw,2.85rem)] font-extrabold leading-tight tracking-[-0.02em] text-white">
                Mulai dari langkah yang paling nyaman buatmu.
              </h2>
              <p className="text-base leading-relaxed text-zinc-400">
                Pilih jalur yang sesuai — daftar langsung lewat Smart Routing domisili, ikut satu kegiatan dulu, atau ngobrol dengan admin wilayah.
              </p>
            </div>

            <div className="divide-y divide-white/15 lg:col-span-7">
              <Link
                to="/gabung"
                className="group flex items-center justify-between gap-4 py-6 first:pt-0"
              >
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-extrabold text-white group-hover:text-gk-red">
                    Daftar jadi anggota
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Isi formulir Smart Routing domisili, admin DPD wilayahmu akan menghubungi dalam 2 hari.
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gk-red text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </Link>

              <a
                href="#program"
                className="group flex items-center justify-between gap-4 py-6"
              >
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-extrabold text-white group-hover:text-gk-red">
                    Datang ke satu agenda dulu
                  </h3>
                  <p className="text-sm text-zinc-400">Kenalan dulu dengan orang-orangnya, baru putuskan.</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gk-red text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </a>

              <a
                href={buildWaUrl(
                  data.settings.adminWhatsapp,
                  'Halo Admin GK DIY, saya mau tanya-tanya soal Garuda Keadilan Yogyakarta.',
                )}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 py-6 last:pb-0"
              >
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-extrabold text-white group-hover:text-gk-red">
                    Tanya admin lewat WhatsApp
                  </h3>
                  <p className="text-sm text-zinc-400">Dibalas Senin–Sabtu, 09.00–20.00.</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gk-red text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
