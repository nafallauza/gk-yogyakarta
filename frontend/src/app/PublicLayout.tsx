import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Instagram, Menu, MessageCircle, X, Youtube } from 'lucide-react';
import { useSiteData } from './SiteContext.tsx';
import { buildWaUrl } from '../services/api.ts';

const NAV_ITEMS = [
  { label: 'Profil Wilayah', hash: '#profil' },
  { label: 'Jaringan', hash: '#jaringan' },
  { label: 'Program & Agenda', hash: '#program' },
  { label: 'Kabar', hash: '#kabar' },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data } = useSiteData();
  const location = useLocation();
  const navigate = useNavigate();

  function handleSectionNav(hash: string) {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${hash}`);
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <header className="sticky top-0 z-40 bg-ink border-b border-white/10">
        <div className="gk-wrap flex h-[76px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 focus-visible:outline-2 focus-visible:outline-gk-red">
            <img src="/images/logo-white.png" alt="Garuda Keadilan" className="h-9 w-auto object-contain" />
            <span className="h-5 w-px bg-white/20" />
            <span className="text-sm font-medium text-zinc-200">Yogyakarta</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.hash}
                type="button"
                onClick={() => handleSectionNav(item.hash)}
                className="cursor-pointer text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/gabung"
              className="rounded-lg bg-gk-red px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0"
            >
              Gabung
            </Link>
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
          >
            {menuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink px-5 py-5 text-white md:hidden">
          <div className="flex items-center justify-between">
            <img src="/images/logo-white.png" alt="Garuda Keadilan" className="h-9 w-auto" />
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>
          <nav className="mt-8 flex flex-col divide-y divide-white/10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.hash}
                type="button"
                onClick={() => handleSectionNav(item.hash)}
                className="py-5 text-left font-display text-2xl font-extrabold text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-4">
            <Link
              to="/gabung"
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-lg bg-gk-red py-3.5 text-center text-sm font-semibold text-white"
            >
              Gabung GK Jogja
            </Link>
            <p className="text-xs text-zinc-400">
              {data.settings.email} · {data.settings.secretariatAddress}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1">{children}</div>

      <footer className="bg-ink text-white border-t border-white/10">
        <div className="gk-wrap py-14">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4 space-y-4">
              <img src="/images/logo-white.png" alt="Garuda Keadilan DIY" className="h-9 w-auto" />
              <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
                Garuda Keadilan Dewan Pimpinan Wilayah Daerah Istimewa Yogyakarta.
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href={data.settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram GK Yogyakarta"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-zinc-300 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Instagram size={16} strokeWidth={1.5} />
                </a>
                <a
                  href="https://garudakeadilan.id"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Garuda Keadilan Nasional"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-zinc-300 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Youtube size={16} strokeWidth={1.5} />
                </a>
                <a
                  href={buildWaUrl(data.settings.adminWhatsapp, 'Halo Admin GK DIY, saya ingin bertanya tentang kegiatan GK Yogyakarta.')}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Admin GK DIY"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-zinc-300 transition-colors hover:border-white/40 hover:text-white"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400">Halaman</h3>
              <ul className="space-y-2.5 text-sm text-zinc-300">
                <li><button type="button" onClick={() => handleSectionNav('#profil')} className="hover:text-white cursor-pointer">Profil Wilayah</button></li>
                <li><button type="button" onClick={() => handleSectionNav('#jaringan')} className="hover:text-white cursor-pointer">Jaringan</button></li>
                <li><button type="button" onClick={() => handleSectionNav('#program')} className="hover:text-white cursor-pointer">Program &amp; Agenda</button></li>
                <li><button type="button" onClick={() => handleSectionNav('#kabar')} className="hover:text-white cursor-pointer">Kabar &amp; Opini</button></li>
                <li><Link to="/katalog" className="hover:text-white">Katalog Wilayah</Link></li>
                <li><Link to="/cms" className="text-zinc-500 hover:text-zinc-200">CMS Admin</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400">Wilayah DIY</h3>
              <ul className="space-y-2.5 text-sm text-zinc-300">
                {data.regions.map((r) => (
                  <li key={r.id}>
                    <Link to={`/daerah/${r.id}`} className="hover:text-white">
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400">Sekretariat DPW</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{data.settings.secretariatAddress}</p>
              <p className="text-sm text-zinc-400">{data.settings.email}</p>
              <Link
                to="/gabung"
                className="inline-block pt-1 text-sm font-semibold text-gk-red hover:underline"
              >
                Formulir Smart Routing →
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
            <span>© 2026 Garuda Keadilan DI Yogyakarta</span>
            <span>Bagian dari garudakeadilan.id</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
