# GK Yogyakarta — Website & CMS

Portal resmi Garuda Keadilan DPW Daerah Istimewa Yogyakarta beserta CMS admin.

## Referensi
- Figma UI: https://www.figma.com/design/q5lW4Qo6uqBalJBu0ZutUC/GK-Yogyakarta-%E2%80%94-Website-UI
- ClickUp Brief: `Projek > GK Yogyakarta > Draft GKYK`

## Struktur Folder
- `frontend/` — React 19 + Vite + TypeScript + Tailwind CSS v4 (halaman publik & CMS)
- `backend/` — Node.js TypeScript REST API + skema database SQL
- `docs/` — Dokumentasi teknis & catatan proyek

## Menjalankan Proyek
```bash
npm --prefix frontend install
npm run dev:be   # API di http://localhost:4000
npm run dev:fe   # Frontend di http://localhost:5173
npm test         # Menjalankan test backend
```
