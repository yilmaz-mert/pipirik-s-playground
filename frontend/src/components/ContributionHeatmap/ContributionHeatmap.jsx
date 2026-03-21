/**
 * ContributionHeatmap — GitHub activity grid backed by live API data.
 *
 * Data source: https://github-contributions-api.deno.dev/yilmaz-mert.json
 * States: loading (skeleton) → success (single fade-in) → error.
 *
 * LAYOUT (CSS Grid — explicit, no flex tricks):
 *   ┌──────────────────────────────────────────────────┐
 *   │  [corner]  │  Jan ──── │ Feb ── │ Mar ───────── │  ← month labels row
 *   ├────────────┼──────────────────────────────────────┤
 *   │            │  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ...            │
 *   │  Mon       │  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ...            │  ← data grid (52 cols × 7 rows)
 *   │  Wed       │  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ...            │    grid-auto-flow: column
 *   │  Fri       │  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ...            │
 *   └────────────┴──────────────────────────────────────┘
 *
 * Fixed cell sizes (CELL × CELL px) with overflow-x: auto for mobile.
 * Single motion.div fade-in for the entire grid — no per-cell animation.
 *
 * PERFORMANCE:
 *   grid-auto-flow: column places 364 cells in column-major order without
 *   explicit grid-row/grid-column on each cell. One CSS property, zero JS math.
 */
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// ── API ────────────────────────────────────────────────────────────────────────
const GITHUB_API = 'https://github-contributions-api.deno.dev/yilmaz-mert.json';

// ── Constants ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const CELL  = 11;  // px — fixed cell width & height
const GAP   = 2;   // px — gap between cells
const DAY_W = 26;  // px — fixed width of the day-label column
const MONO  = "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace";

// ── Build 52×7 contribution grid from flat API data ────────────────────────────
// grid[w][d]: w = week index (0=oldest), d = day of week (0=Sun, 6=Sat)
function buildGrid(contributions) {
  const map = {};
  for (const item of contributions) {
    const key   = item.date || item.DATE || '';
    const count = item.count ?? item.contributionCount ?? item.total ?? 0;
    if (key) map[key] = Number(count);
  }

  const today = new Date();
  const dow   = today.getDay(); // 0=Sun … 6=Sat

  return Array.from({ length: 52 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(today);
      // Align to the Sunday-anchored column: go back to this week's Sunday then offset by d
      date.setDate(today.getDate() - (51 - w) * 7 - ((dow - d + 7) % 7));
      return map[date.toISOString().slice(0, 10)] || 0;
    })
  );
}

// ── Month spans: how many weeks each visible month spans ──────────────────────
// Returns [{ name, startW, span }] — startW is 0-indexed, spans sum to exactly 52.
// Uses the same Sunday-anchor formula as buildGrid to stay in sync.
function getMonthSpans() {
  const today = new Date();
  const dow   = today.getDay();
  const spans = [];
  let lastM   = -1;

  for (let w = 0; w < 52; w++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (51 - w) * 7 - dow); // week's Sunday
    const m = d.getMonth();
    if (m !== lastM) {
      if (spans.length > 0) spans[spans.length - 1].span = w - spans[spans.length - 1].startW;
      spans.push({ name: MONTH_NAMES[m], startW: w, span: 0 });
      lastM = m;
    }
  }
  if (spans.length > 0) spans[spans.length - 1].span = 52 - spans[spans.length - 1].startW;
  return spans;
}

// Computed once at module load (consistent with buildGrid's new Date() inside useEffect — same calendar day)
const MONTH_SPANS = getMonthSpans();

// ── Contribution level & color ─────────────────────────────────────────────────
function level(count) {
  if (count === 0) return 0;
  if (count <= 2)  return 1;
  if (count <= 5)  return 2;
  if (count <= 9)  return 3;
  return 4;
}

function cellColor(lvl) {
  if (lvl === 0) return 'var(--color-bg-surface)';
  const opacities = [0, 0.22, 0.42, 0.65, 1];
  return `color-mix(in srgb, var(--color-accent) ${Math.round(opacities[lvl] * 100)}%, var(--color-bg-surface))`;
}

// ── Shared grid styles ──────────────────────────────────────────────────────────
// Both the skeleton and live data grids use identical CSS Grid definitions.
const DATA_GRID = {
  display:             'grid',
  gridTemplateColumns: `repeat(52, ${CELL}px)`,
  gridTemplateRows:    `repeat(7, ${CELL}px)`,
  gap:                 `${GAP}px`,
  gridAutoFlow:        'column', // items flow column-by-column → week columns form naturally
};

const MONTH_GRID = {
  display:             'grid',
  gridTemplateColumns: `repeat(52, ${CELL}px)`,
  gap:                 `${GAP}px`,
};

const DAY_GRID = {
  display:             'grid',
  gridTemplateRows:    `repeat(7, ${CELL}px)`,
  gap:                 `${GAP}px`,
  width:               DAY_W,
  flexShrink:          0,
  fontSize:            '9px',
  fontFamily:          MONO,
  color:               'var(--color-text-muted)',
  textAlign:           'right',
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function ContributionHeatmap() {
  const [tooltip, setTooltip] = useState(null);
  const [status,  setStatus]  = useState('loading');
  const [grid,    setGrid]    = useState(null);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(GITHUB_API)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => {
        if (cancelled) return;
        const raw  = json.contributions || json.data || [];
        const flat = Array.isArray(raw[0]) ? raw.flat(1) : raw;
        if (!Array.isArray(flat) || flat.length === 0) throw new Error('Empty response');
        const g = buildGrid(flat);
        setGrid(g);
        setTotal(g.flat().reduce((a, b) => a + b, 0));
        setStatus('success');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, []);

  return (
    <div data-comp="ContributionHeatmap" className="relative">

      {/* Header */}
      <div className="flex items-baseline gap-3 mb-5">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: MONO }}>
          Engineering Activity
        </h3>
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {status === 'loading' && 'Fetching live data…'}
          {status === 'success' && `${total.toLocaleString()} contributions · last 12 months`}
          {status === 'error'   && 'github.com/yilmaz-mert'}
        </span>
      </div>

      {/* Error state */}
      {status === 'error' && (
        <div
          className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl"
          style={{ border: `1px dashed var(--color-border-subtle)` }}
        >
          <span style={{ color: 'var(--color-text-muted)', fontFamily: MONO, fontSize: '12px' }}>
            {'// unable to reach contributions API'}
          </span>
          <span style={{ color: 'var(--color-accent)', fontFamily: MONO, fontSize: '11px', opacity: 0.6 }}>
            Check your connection or try again later.
          </span>
        </div>
      )}

      {/* Grid */}
      {status !== 'error' && (
        <div className="overflow-x-auto pb-1">
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>

            {/* ── Month labels row ─────────────────────────────────────── */}
            {/* Left-pad by DAY_W + GAP to align with the data grid column */}
            <div style={{ paddingLeft: DAY_W + GAP, fontSize: '10px', fontFamily: MONO, color: 'var(--color-text-muted)' }}>
              <div style={MONTH_GRID}>
                {MONTH_SPANS.map(({ name, startW, span }) => (
                  <div
                    key={startW}
                    style={{ gridColumn: `span ${span}`, overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Day labels + data grid ──────────────────────────────── */}
            <div style={{ display: 'flex', gap: `${GAP}px`, alignItems: 'flex-start' }}>

              {/* Day labels column (Mon / Wed / Fri) */}
              <div style={DAY_GRID}>
                {DAY_LABELS.map((lbl, i) => (
                  <div key={i} style={{ lineHeight: `${CELL}px` }}>{lbl}</div>
                ))}
              </div>

              {/* Skeleton */}
              {status === 'loading' && (
                <div style={DATA_GRID}>
                  {Array.from({ length: 52 * 7 }, (_, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      style={{
                        width: CELL, height: CELL, borderRadius: '2px',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: `1px solid color-mix(in srgb, var(--color-border-subtle) 40%, transparent)`,
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Live data — single container fade-in (one animation, not 364 individual) */}
              {status === 'success' && (
                <motion.div
                  style={DATA_GRID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  {grid.flatMap((week, w) =>
                    week.map((count, d) => (
                      <div
                        key={`${w}-${d}`}
                        style={{
                          width: CELL, height: CELL, borderRadius: '2px',
                          backgroundColor: cellColor(level(count)),
                          border: `1px solid color-mix(in srgb, var(--color-border-subtle) 60%, transparent)`,
                          transition: 'background-color 0.3s, transform 0.15s',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setTooltip({ x: r.left + r.width / 2, y: r.top, count });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onMouseOver={e  => { e.currentTarget.style.transform = 'scale(1.35)'; }}
                        onMouseOut={e   => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </div>

            {/* Legend */}
            <div
              className="flex items-center gap-1.5 mt-2 justify-end"
              style={{ paddingLeft: DAY_W + GAP, fontFamily: MONO, fontSize: '10px', color: 'var(--color-text-muted)' }}
            >
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(lvl => (
                <div key={lvl} style={{
                  width: CELL, height: CELL, borderRadius: '2px', flexShrink: 0,
                  backgroundColor: cellColor(lvl),
                  border: `1px solid color-mix(in srgb, var(--color-border-subtle) 60%, transparent)`,
                }} />
              ))}
              <span>More</span>
            </div>

          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 rounded-lg text-[11px]"
          style={{
            left: tooltip.x, top: tooltip.y - 34, transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontFamily: MONO, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.count === 0 ? 'No contributions' : `${tooltip.count} commit${tooltip.count > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
