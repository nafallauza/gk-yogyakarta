import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import {
  Calendar,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  Trash2,
  Users,
} from 'lucide-react';
import { useSiteData } from '../../app/SiteContext.tsx';
import { apiFetch, cmsHeaders, cmsLogin, fetchSubmissions, formatIdr } from '../../services/api.ts';
import type { JoinSubmission, RegencyId } from '../../data/types.ts';

type CmsSection = 'ringkasan' | 'daerah' | 'program' | 'kabar' | 'katalog' | 'pendaftar' | 'pengaturan';

const TOKEN_KEY = 'gkyk_cms_token';

export function CmsApp() {
  const { data, refresh } = useSiteData();
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [section, setSection] = useState<CmsSection>('ringkasan');
  const [submissions, setSubmissions] = useState<JoinSubmission[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Login state
  const [email, setEmail] = useState('admin@gkyk.id');
  const [password, setPassword] = useState('gkdiy2026');
  const [loginErr, setLoginErr] = useState<string | null>(null);

  // Quick create states
  const [progTitle, setProgTitle] = useState('');
  const [progCat, setProgCat] = useState<'rutin' | 'event'>('event');
  const [progSchedule, setProgSchedule] = useState('');
  const [progLocation, setProgLocation] = useState('');

  const [artTitle, setArtTitle] = useState('');
  const [artCat, setArtCat] = useState<'kabar' | 'opini' | 'artikel'>('kabar');
  const [artAuthor, setArtAuthor] = useState('');
  const [artBody, setArtBody] = useState('');

  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('85000');
  const [prodCat, setProdCat] = useState<'atribut' | 'merch-dpw' | 'produk-kader'>('merch-dpw');

  // Settings form
  const [heroHeadline, setHeroHeadline] = useState(data.settings.heroHeadline);
  const [nextAgendaTitle, setNextAgendaTitle] = useState(data.settings.nextAgendaTitle);
  const [adminWa, setAdminWa] = useState(data.settings.adminWhatsapp);

  useEffect(() => {
    setHeroHeadline(data.settings.heroHeadline);
    setNextAgendaTitle(data.settings.nextAgendaTitle);
    setAdminWa(data.settings.adminWhatsapp);
  }, [data.settings]);

  useEffect(() => {
    if (!token) return;
    fetchSubmissions(token)
      .then(setSubmissions)
      .catch(() => {});
  }, [token]);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginErr(null);
    try {
      const res = await cmsLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : 'Gagal masuk ke CMS');
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
  }

  async function addProgram(e: FormEvent) {
    e.preventDefault();
    if (!progTitle.trim()) return;
    await apiFetch('/programs', {
      method: 'POST',
      headers: cmsHeaders(token),
      body: JSON.stringify({
        title: progTitle,
        category: progCat,
        scheduleText: progSchedule || (progCat === 'rutin' ? 'Setiap Pekan' : 'Segera diumumkan'),
        location: progLocation || 'DI Yogyakarta',
      }),
    });
    setProgTitle('');
    setProgSchedule('');
    setProgLocation('');
    await refresh();
    flash('Program / agenda ditambahkan.');
  }

  async function deleteProgram(id: number) {
    await apiFetch(`/programs/${id}`, { method: 'DELETE', headers: cmsHeaders(token) });
    await refresh();
    flash('Program dihapus.');
  }

  async function addArticle(e: FormEvent) {
    e.preventDefault();
    if (!artTitle.trim()) return;
    await apiFetch('/articles', {
      method: 'POST',
      headers: cmsHeaders(token),
      body: JSON.stringify({
        title: artTitle,
        category: artCat,
        authorName: artAuthor || 'Redaksi GK DIY',
        body: artBody,
      }),
    });
    setArtTitle('');
    setArtAuthor('');
    setArtBody('');
    await refresh();
    flash('Tulisan diterbitkan.');
  }

  async function deleteArticle(id: number) {
    await apiFetch(`/articles/${id}`, { method: 'DELETE', headers: cmsHeaders(token) });
    await refresh();
    flash('Tulisan dihapus.');
  }

  async function addProduct(e: FormEvent) {
    e.preventDefault();
    if (!prodName.trim()) return;
    await apiFetch('/products', {
      method: 'POST',
      headers: cmsHeaders(token),
      body: JSON.stringify({
        name: prodName,
        priceIdr: Number(prodPrice) || 0,
        category: prodCat,
      }),
    });
    setProdName('');
    await refresh();
    flash('Produk katalog ditambahkan.');
  }

  async function deleteProduct(id: number) {
    await apiFetch(`/products/${id}`, { method: 'DELETE', headers: cmsHeaders(token) });
    await refresh();
    flash('Produk dihapus.');
  }

  async function updateSubmissionStatus(id: number, routedStatus: JoinSubmission['routedStatus']) {
    await apiFetch(`/submissions/${id}`, {
      method: 'PATCH',
      headers: cmsHeaders(token),
      body: JSON.stringify({ routedStatus }),
    });
    setSubmissions(await fetchSubmissions(token));
    flash('Status pendaftar diperbarui.');
  }

  async function updateRegionContact(id: RegencyId, chairperson: string, secretariatAddress: string) {
    await apiFetch(`/regions/${id}`, {
      method: 'PATCH',
      headers: cmsHeaders(token),
      body: JSON.stringify({ chairperson, secretariatAddress }),
    });
    await refresh();
    flash('Data DPD diperbarui.');
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    await apiFetch('/settings', {
      method: 'PATCH',
      headers: cmsHeaders(token),
      body: JSON.stringify({
        heroHeadline,
        nextAgendaTitle,
        adminWhatsapp: adminWa,
      }),
    });
    await refresh();
    flash('Pengaturan situs disimpan.');
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-5">
        <div className="w-full max-w-md rounded-xl border border-line bg-card p-8">
          <img src="/images/logo-dark.png" alt="Garuda Keadilan" className="h-9 w-auto" />
          <h1 className="mt-6 font-display text-2xl font-extrabold text-ink">Masuk CMS GK DIY</h1>
          <p className="mt-1.5 text-sm text-muted">
            Kelola agenda, artikel, jaringan DPD, katalog, dan pendaftar Smart Routing.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-ink">Email admin</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-ink">Kata sandi</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
              />
            </label>
            {loginErr && <p className="text-xs font-medium text-gk-red">{loginErr}</p>}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-gk-red py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Masuk CMS
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
            <span>Demo: admin@gkyk.id / gkdiy2026</span>
            <Link to="/" className="font-semibold text-ink hover:underline">
              Lihat situs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: CmsSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'daerah', label: 'Jaringan Daerah', icon: MapPin },
    { id: 'program', label: 'Program & Agenda', icon: Calendar },
    { id: 'kabar', label: 'Kabar & Opini', icon: FileText },
    { id: 'katalog', label: 'Katalog Wilayah', icon: ShoppingBag },
    { id: 'pendaftar', label: 'CTA & Pendaftar', icon: Users },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-line bg-card p-5">
        <div>
          <div className="flex items-center gap-2.5 pb-6">
            <img src="/images/logo-dark.png" alt="GK DIY" className="h-8 w-auto" />
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
              CMS · DIY
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((it) => {
              const Icon = it.icon;
              const active = section === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSection(it.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-ink font-semibold text-white' : 'font-medium text-zinc-600 hover:bg-zinc-100 hover:text-ink'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.6} />
                  {it.label}
                </button>
              );
            })}
          </nav>

          <Link
            to="/"
            className="mt-6 flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-zinc-50"
          >
            <ExternalLink size={14} /> Lihat situs publik
          </Link>
        </div>

        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink">Admin DPW</p>
              <p className="text-[11px] text-muted">Editor · semua wilayah</p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Keluar CMS"
              className="cursor-pointer rounded-lg p-2 text-muted hover:bg-zinc-100 hover:text-ink"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {notice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
              {notice}
            </div>
          )}

          {section === 'ringkasan' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-ink">Ringkasan CMS GK DIY</h1>
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  ['DPD Wilayah', String(data.regions.length)],
                  ['Program & Event', String(data.programs.length)],
                  ['Tulisan Terbit', String(data.articles.length)],
                  ['Pendaftar Masuk', String(submissions.length)],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl border border-line bg-card p-5">
                    <p className="text-xs font-medium text-muted">{label}</p>
                    <p className="mt-1 font-display text-3xl font-black text-ink">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'daerah' && (
            <div className="space-y-5">
              <h1 className="font-display text-2xl font-extrabold text-ink">Jaringan Daerah (5 DPD)</h1>
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                {data.regions.map((r) => (
                  <RegionRowEditor key={r.id} region={r} onSave={updateRegionContact} />
                ))}
              </div>
            </div>
          )}

          {section === 'program' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-ink">Program &amp; Agenda</h1>
              <form onSubmit={addProgram} className="grid gap-3 rounded-xl border border-line bg-card p-5 sm:grid-cols-4">
                <input
                  required
                  value={progTitle}
                  onChange={(e) => setProgTitle(e.target.value)}
                  placeholder="Judul kegiatan / event"
                  className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2"
                />
                <select
                  value={progCat}
                  onChange={(e) => setProgCat(e.target.value as 'rutin' | 'event')}
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                >
                  <option value="event">Event (Poster)</option>
                  <option value="rutin">Kegiatan Rutin</option>
                </select>
                <input
                  value={progSchedule}
                  onChange={(e) => setProgSchedule(e.target.value)}
                  placeholder="Jadwal (mis. Sab, 12 Des)"
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                />
                <input
                  value={progLocation}
                  onChange={(e) => setProgLocation(e.target.value)}
                  placeholder="Lokasi"
                  className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-3"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-gk-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Tambah
                </button>
              </form>

              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                {data.programs.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                    <div>
                      <span className="mr-2 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                        {p.category}
                      </span>
                      <span className="font-semibold text-ink">{p.title}</span>
                      <p className="text-xs text-muted">{p.scheduleText} · {p.location}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteProgram(p.id)}
                      className="cursor-pointer p-2 text-muted hover:text-gk-red"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'kabar' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-ink">Kabar, Opini &amp; Artikel</h1>
              <form onSubmit={addArticle} className="space-y-3 rounded-xl border border-line bg-card p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    required
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    placeholder="Judul tulisan"
                    className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2"
                  />
                  <select
                    value={artCat}
                    onChange={(e) => setArtCat(e.target.value as 'kabar' | 'opini' | 'artikel')}
                    className="rounded-lg border border-line px-3 py-2 text-sm"
                  >
                    <option value="kabar">Kabar</option>
                    <option value="opini">Opini</option>
                    <option value="artikel">Artikel</option>
                  </select>
                </div>
                <input
                  value={artAuthor}
                  onChange={(e) => setArtAuthor(e.target.value)}
                  placeholder="Nama penulis"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
                <textarea
                  rows={3}
                  value={artBody}
                  onChange={(e) => setArtBody(e.target.value)}
                  placeholder="Isi tulisan..."
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-gk-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Terbitkan Tulisan
                </button>
              </form>

              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                {data.articles.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                    <div>
                      <span className="mr-2 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                        {a.category}
                      </span>
                      <span className="font-semibold text-ink">{a.title}</span>
                      <p className="text-xs text-muted">{a.authorName} · {a.publishedLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteArticle(a.id)}
                      className="cursor-pointer p-2 text-muted hover:text-gk-red"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'katalog' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-extrabold text-ink">Katalog Wilayah</h1>
              <form onSubmit={addProduct} className="grid gap-3 rounded-xl border border-line bg-card p-5 sm:grid-cols-4">
                <input
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Nama produk / merch"
                  className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="Harga (IDR)"
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                />
                <select
                  value={prodCat}
                  onChange={(e) => setProdCat(e.target.value as 'atribut' | 'merch-dpw' | 'produk-kader')}
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                >
                  <option value="atribut">Atribut kader</option>
                  <option value="merch-dpw">Merch DPW</option>
                  <option value="produk-kader">Produk kader</option>
                </select>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-gk-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 sm:col-span-4 sm:justify-self-start"
                >
                  Tambah Produk
                </button>
              </form>

              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                {data.products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                    <div>
                      <p className="font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-muted">{p.sellerLabel} · {formatIdr(p.priceIdr)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      className="cursor-pointer p-2 text-muted hover:text-gk-red"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'pendaftar' && (
            <div className="space-y-5">
              <h1 className="font-display text-2xl font-extrabold text-ink">CTA &amp; Pendaftar (Smart Routing)</h1>
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                {submissions.length === 0 ? (
                  <p className="p-6 text-sm text-muted">Belum ada pendaftar masuk.</p>
                ) : (
                  submissions.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-ink">
                          {s.fullName} <span className="font-normal text-muted">· {s.whatsappNumber}</span>
                        </p>
                        <p className="text-xs text-muted">
                          Rute DPD: <strong className="text-ink">{s.regionId}</strong> ({s.districtName || 'DIY'}) · {s.campusOrActivity}
                        </p>
                      </div>
                      <select
                        value={s.routedStatus}
                        onChange={(e) =>
                          updateSubmissionStatus(s.id, e.target.value as JoinSubmission['routedStatus'])
                        }
                        className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink"
                      >
                        <option value="baru">Baru</option>
                        <option value="dihubungi">Dihubungi</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {section === 'pengaturan' && (
            <div className="space-y-5">
              <h1 className="font-display text-2xl font-extrabold text-ink">Pengaturan Situs</h1>
              <form onSubmit={saveSettings} className="space-y-4 rounded-xl border border-line bg-card p-6">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">Headline Hero Beranda</span>
                  <input
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">Agenda Terdekat (Strip Beranda)</span>
                  <input
                    value={nextAgendaTitle}
                    onChange={(e) => setNextAgendaTitle(e.target.value)}
                    className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink">Nomor WhatsApp Admin DPW (format 62...)</span>
                  <input
                    value={adminWa}
                    onChange={(e) => setAdminWa(e.target.value)}
                    className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-gk-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RegionRowEditor({
  region,
  onSave,
}: {
  region: { id: RegencyId; name: string; chairperson: string; secretariatAddress: string };
  onSave: (id: RegencyId, chairperson: string, address: string) => Promise<void>;
}) {
  const [chair, setChair] = useState(region.chairperson);
  const [addr, setAddr] = useState(region.secretariatAddress);

  return (
    <div className="grid items-center gap-3 px-5 py-4 text-sm sm:grid-cols-12">
      <div className="font-semibold text-ink sm:col-span-3">{region.name}</div>
      <input
        value={chair}
        onChange={(e) => setChair(e.target.value)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm sm:col-span-3"
        placeholder="Ketua DPD"
      />
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm sm:col-span-4"
        placeholder="Alamat sekretariat"
      />
      <button
        type="button"
        onClick={() => onSave(region.id, chair, addr)}
        className="cursor-pointer rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 sm:col-span-2"
      >
        Simpan
      </button>
    </div>
  );
}
