import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { FALLBACK_DATA, type BootstrapPayload } from '../data/types.ts';
import { fetchBootstrap } from '../services/api.ts';

interface SiteContextValue {
  data: BootstrapPayload;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue>({
  data: FALLBACK_DATA,
  loading: false,
  refresh: async () => {},
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BootstrapPayload>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const live = await fetchBootstrap();
      setData(live);
    } catch {
      // Keep fallback data if backend is offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <SiteContext.Provider value={{ data, loading, refresh }}>{children}</SiteContext.Provider>;
}

export function useSiteData() {
  return useContext(SiteContext);
}
