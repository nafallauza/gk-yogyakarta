import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { SiteProvider } from './SiteContext.tsx';
import { PublicLayout } from './PublicLayout.tsx';
import { HomePage } from '../features/public/HomePage.tsx';
import { RegionDetailPage } from '../features/public/RegionDetailPage.tsx';
import { CatalogPage } from '../features/public/CatalogPage.tsx';
import { JoinPage } from '../features/public/JoinPage.tsx';
import { ArticleDetailPage } from '../features/public/ArticleDetailPage.tsx';
import { CmsApp } from '../features/cms/CmsApp.tsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function App() {
  return (
    <SiteProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/cms/*" element={<CmsApp />} />
        <Route
          path="*"
          element={
            <PublicLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/daerah/:slug" element={<RegionDetailPage />} />
                <Route path="/katalog" element={<CatalogPage />} />
                <Route path="/gabung" element={<JoinPage />} />
                <Route path="/kabar/:slug" element={<ArticleDetailPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </PublicLayout>
          }
        />
      </Routes>
    </SiteProvider>
  );
}
