import { Link, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { useSiteData } from '../../app/SiteContext.tsx';
import { DiyVectorMap } from './DiyVectorMap.tsx';
import { buildWaUrl } from '../../services/api.ts';

export function RegionDetailPage() {
  const { slug } = useParams();
  const { data } = useSiteData();
  const region = data.regions.find((r) => r.id === slug) ?? data.regions[0];
  const regionalArticles = data.articles.filter((a) => a.regionId === region.id || a.regionId === 'diy').slice(0, 3);

  return (
    <main className="gk-wrap py-12 lg:py-14">
      <Link
        to="/#jaringan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ChevronLeft size={15} /> Jaringan Daerah / {region.shortName}
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-3xl font-black tracking-[-0.02em] text-ink sm:text-[44px]">
          DPD {region.name}
        </h1>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={buildWaUrl(
              region.whatsappNumber,
              `Halo Admin DPD ${region.name}, saya ingin terhubung dengan pengurus GK setempat.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-gk-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Hubungi Admin DPD
          </a>
          <Link
            to={`/gabung?domisili=${region.id}`}
            className="rounded-lg border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink"
          >
            Daftar ke {region.shortName}
          </Link>
        </div>
      </div>

      {/* Pindah antar 5 DPD */}
      <div className="mt-6 flex flex-wrap gap-2">
        {data.regions.map((r) => (
          <Link
            key={r.id}
            to={`/daerah/${r.id}`}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              r.id === region.id
                ? 'bg-ink text-white'
                : 'border border-line bg-card text-ink hover:bg-zinc-100'
            }`}
          >
            {r.shortName}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DiyVectorMap selectedId={region.id} isolatedRegionId={region.id} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          <p className="text-base leading-relaxed text-zinc-600">{region.description}</p>
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
            {[
              ['Ketua DPD', `${region.chairperson} · Periode 2026–2028`],
              ['Cakupan wilayah', `${region.activeDistricts} dari ${region.totalDistricts} ${region.districtTerm.toLowerCase()} aktif`],
              ['Sekretariat', region.secretariatAddress],
              ['Agenda rutin', region.routineSchedule],
              ['Kontak & media', `${region.instagramHandle} · WhatsApp Admin DPD`],
            ].map(([label, val]) => (
              <div key={label} className="grid grid-cols-12 gap-4 px-5 py-3.5 text-sm">
                <dt className="col-span-4 text-muted">{label}</dt>
                <dd className="col-span-8 font-medium text-ink">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="font-display text-2xl font-extrabold text-ink">
          Jaringan {region.districtTerm.toLowerCase()} aktif
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {region.districts.map((dist) => (
            <span
              key={dist}
              className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-medium text-ink"
            >
              {dist}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="font-display text-2xl font-extrabold text-ink">Kegiatan terkait {region.shortName}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {regionalArticles.map((art) => (
            <Link
              key={art.id}
              to={`/kabar/${art.slug}`}
              className="group overflow-hidden rounded-xl border border-line bg-card"
            >
              <img
                src={art.coverUrl}
                alt={art.title}
                className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="space-y-1.5 p-4">
                <p className="text-xs font-medium text-muted capitalize">
                  {art.category} · {art.publishedLabel}
                </p>
                <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-gk-red">
                  {art.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
