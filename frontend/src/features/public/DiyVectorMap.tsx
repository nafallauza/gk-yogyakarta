import { DIY_MAP_VIEWBOX, diyRegionGeometry, type RegencyId } from '../../data/diyMapPaths.ts';

interface DiyVectorMapProps {
  selectedId: RegencyId;
  onSelect?: (id: RegencyId) => void;
  isolatedRegionId?: RegencyId;
  compact?: boolean;
}

const REGION_META: Record<RegencyId, { label: string; mapLabel: string; labelPos: [number, number] }> = {
  'kulon-progo': { label: 'Kulon Progo', mapLabel: 'Kulon Progo', labelPos: [145, 284] },
  sleman: { label: 'Sleman', mapLabel: 'Sleman', labelPos: [375, 160] },
  bantul: { label: 'Bantul', mapLabel: 'Bantul', labelPos: [338, 360] },
  gunungkidul: { label: 'Gunungkidul', mapLabel: 'Gunungkidul', labelPos: [575, 440] },
  'kota-yogyakarta': { label: 'Kota Yogyakarta', mapLabel: 'Kota', labelPos: [358, 260] },
};

const ORDER: RegencyId[] = ['kulon-progo', 'sleman', 'bantul', 'gunungkidul', 'kota-yogyakarta'];

export function DiyVectorMap({ selectedId, onSelect, isolatedRegionId, compact }: DiyVectorMapProps) {
  if (isolatedRegionId) {
    const geom = diyRegionGeometry[isolatedRegionId];
    const [bx, by, bw, bh] = geom.bbox;
    const pad = Math.max(bw, bh) * 0.14;
    const vb = `${bx - pad} ${by - pad} ${bw + pad * 2} ${bh + pad * 2}`;
    return (
      <div className="rounded-xl border border-line bg-card p-5">
        <div className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-zinc-100 p-4">
          <svg viewBox={vb} className="h-full w-full" role="img" aria-label={`Peta wilayah ${REGION_META[isolatedRegionId].label}`}>
            <path
              d={geom.path}
              fill="#E3262C"
              stroke="#991B1B"
              strokeWidth={Math.max(bw, bh) * 0.014}
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-medium text-ink">Peta administrasi {REGION_META[isolatedRegionId].label}</span>
          <span className="font-semibold text-gk-red">D.I. Yogyakarta</span>
        </div>
      </div>
    );
  }

  const activeName = REGION_META[selectedId].label;

  return (
    <div className="rounded-xl border border-line bg-zinc-100 p-4">
      <div className="relative">
        <span className="pointer-events-none absolute right-1 top-1 z-10 inline-flex items-center gap-1.5 rounded-md bg-gk-red px-2.5 py-1 text-[11px] font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {activeName}
        </span>

        <svg
          viewBox={DIY_MAP_VIEWBOX}
          className="h-auto w-full select-none"
          role="img"
          aria-label="Peta interaktif 5 kabupaten dan kota Daerah Istimewa Yogyakarta"
        >
          {ORDER.map((id) => {
            const geom = diyRegionGeometry[id];
            const isActive = id === selectedId;
            return (
              <g key={id}>
                <path
                  d={geom.path}
                  fill={isActive ? '#E3262C' : '#FFFFFF'}
                  stroke={isActive ? '#991B1B' : '#71717A'}
                  strokeWidth={isActive ? 2.8 : 2.2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onClick={() => onSelect?.(id)}
                  className={
                    onSelect
                      ? 'cursor-pointer transition-colors duration-150 hover:fill-red-50'
                      : 'transition-colors duration-150'
                  }
                  style={isActive ? { fill: '#E3262C' } : undefined}
                >
                  <title>{REGION_META[id].label}</title>
                </path>

                <text
                  x={REGION_META[id].labelPos[0]}
                  y={REGION_META[id].labelPos[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? '#FFFFFF' : '#27272A'}
                  fontSize={id === 'kota-yogyakarta' ? (compact ? 17 : 15) : compact ? 22 : 19}
                  fontWeight={id === 'kota-yogyakarta' ? 700 : 600}
                  fontFamily="Inter, sans-serif"
                  className="pointer-events-none"
                >
                  {REGION_META[id].mapLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-zinc-500 bg-white" />
            Wilayah DIY
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-red-800 bg-gk-red" />
            Terpilih (klik daerah)
          </span>
        </div>
      )}
    </div>
  );
}
