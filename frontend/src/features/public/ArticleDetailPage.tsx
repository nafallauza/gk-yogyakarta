import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Check, ChevronLeft } from 'lucide-react';
import { useSiteData } from '../../app/SiteContext.tsx';

export function ArticleDetailPage() {
  const { slug } = useParams();
  const { data } = useSiteData();
  const [copied, setCopied] = useState(false);

  const article = data.articles.find((a) => a.slug === slug) ?? data.articles[0];
  const related = data.articles.filter((a) => a.id !== article.id).slice(0, 3);

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${article.title} — ${window.location.href}`)}`;

  return (
    <main className="bg-card">
      <article className="gk-wrap py-12 lg:py-14">
        <div className="mx-auto max-w-[760px] space-y-4">
          <Link
            to="/#kabar"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <ChevronLeft size={15} /> Kabar, Opini &amp; Artikel
          </Link>
          <p className="text-xs font-semibold text-gk-red capitalize">
            {article.category} · {article.publishedLabel} · {article.readTime}
          </p>
          <h1 className="font-display text-3xl font-black leading-[1.12] tracking-[-0.02em] text-ink sm:text-[42px]">
            {article.title}
          </h1>
          <p className="text-sm text-muted">
            Ditulis oleh {article.authorName} · {article.authorRole}
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-line">
          <img
            src={article.coverUrl}
            alt={article.title}
            className="aspect-[16/8] max-h-[480px] w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-10 max-w-[680px] space-y-6 text-[17px] leading-[1.72] text-zinc-800">
          {article.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}

          {article.pullQuote && (
            <blockquote className="border-l-[3px] border-gk-red py-1 pl-5 font-display text-xl font-extrabold leading-snug text-ink">
              “{article.pullQuote}”
            </blockquote>
          )}

          {article.subheading && (
            <h2 className="pt-2 font-display text-2xl font-extrabold text-ink">{article.subheading}</h2>
          )}

          {article.closingParagraph && <p>{article.closingParagraph}</p>}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <span className="text-sm font-medium text-muted">Bagikan tulisan ini</span>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-ink"
              >
                {copied ? <><Check size={14} /> Tersalin</> : 'Salin tautan'}
              </button>
              <a
                href={waShareUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-ink"
              >
                Bagikan ke WA
              </a>
            </div>
          </div>
        </div>

        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-2xl font-extrabold text-ink">Tulisan lainnya</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to={`/kabar/${r.slug}`} className="group space-y-2.5">
                <div className="overflow-hidden rounded-xl border border-line">
                  <img
                    src={r.coverUrl}
                    alt={r.title}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="text-xs font-medium text-muted capitalize">
                  {r.category} · {r.publishedLabel}
                </p>
                <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-gk-red">
                  {r.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
