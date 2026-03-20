/**
 * ContributionHeatmap — GitHub activity grid backed by live API data.
 *
 * Data source: https://github-contributions-api.deno.dev/yilmaz-mert.json
 * States: loading (skeleton) → success (single fade-in, responsive grid) → error.
 *
 * PERFORMANCE NOTE:
 *   Animating individual motion.divs (364+ nodes) causes major FPS drops.
 *   Fix: the entire grid fades in as ONE motion element — a single opacity
 *   animation on one DOM node instead of hundreds.
 *
 * LAYOUT:
 *   Week columns use flex:1 so they stretch to fill the container.
 *   Cells use width:100% + aspectRatio:1 so they stay square at any size.
 *   On narrow viewports, overflow-x:auto provides horizontal scroll (like GitHub).
 */
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// ── API ───────────────────────────────────────────────────────────────────────
const GITHUB_API = 'https://github-contributions-api.deno.dev/yilmaz-mert.json';

// ── Build 52×7 grid from an array of { date, count } objects ─────────────────
function buildGrid(contributions) {
  const map = {};
  for (const item of contributions) {
    const key   = item.date   || item.DATE   || '';
    const count = item.count  ?? item.contributionCount ?? item.total ?? 0;
    if (key) map[key] = Number(count);
  }

  const today = new Date();
  return Array.from({ length: 52 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (51 - w) * 7 - ((today.getDay() - d + 7) % 7));
      return map[date.toISOString().slice(0, 10)] || 0;
    })
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getMonthLabels() {
  const today = new Date();
  const out   = [];
  let lastM   = -1;
  for (let w = 0; w < 52; w++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (51 - w) * 7);
    const m = d.getMonth();
    if (m !== lastM) { out.push({ w, name: MONTH_NAMES[m] }); lastM = m; }
  }
  return out;
}

const MONTH_LABELS = getMonthLabels();

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

const MIN_CELL = 11;  // px — minimum cell size; columns expand beyond this on wide screens
const GAP      = 3;
const MONO     = "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace";
const DAY_W    = 17; // px — fixed day-label column width

// ── Skeleton cell ─────────────────────────────────────────────────────────────
function SkeletonCell() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%', aspectRatio: '1', borderRadius: '2px', flexShrink: 0,
        backgroundColor: 'var(--color-bg-surface)',
        border: `1px solid color-mix(in srgb, var(--color-border-subtle) 40%, transparent)`,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ContributionHeatmap() {
  const [tooltip, setTooltip] = useState(null);
  const [status, setStatus]   = useState('loading');
  const [grid, setGrid]       = useState(null);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(GITHUB_API)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        const raw = json.contributions || json.data || [];
        // Deno API returns a 2D array: [[{date,contributionCount},...week1], ...]
        // Flatten one level so buildGrid receives a flat [{date, contributionCount}] list
        const flat = raw.length > 0 && Array.isArray(raw[0]) ? raw.flat(1) : raw;
        if (!Array.isArray(flat) || flat.length === 0) {
          throw new Error('Empty response');
        }
        const g = buildGrid(flat);
        setGrid(g);
        setTotal(g.flat().reduce((a, b) => a + b, 0));
        setStatus('success');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, []);

  // Shared row layout: fixed day-label column + 52 flex-1 week columns
  const rowStyle = { display: 'flex', gap: `${GAP}px`, width: '100%' };

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

      {/* Grid (skeleton while loading, live data when ready) */}
      {status !== 'error' && (
        <div className="overflow-x-auto pb-1">
          <div style={{ position: 'relative', display: 'inline-block', width: '100%', minWidth: `${DAY_W + GAP + 52 * (MIN_CELL + GAP)}px` }}>

            {/* Month labels — aligned with week columns via matching flex layout */}
            <div style={{ ...rowStyle, marginBottom: '4px', fontFamily: MONO, fontSize: '10px', color: 'var(--color-text-muted)' }}>
              <div style={{ width: DAY_W, flexShrink: 0 }} />
              {Array.from({ length: 52 }, (_, w) => {
                const lbl = MONTH_LABELS.find(m => m.w === w);
                return (
                  <div key={w} style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', minWidth: MIN_CELL }}>
                    {lbl?.name ?? ''}
                  </div>
                );
              })}
            </div>

            {/* Day labels + week columns */}
            {status === 'loading' ? (
              // Skeleton — static, no animation overhead
              <div style={rowStyle}>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: `${GAP}px`,
                  fontFamily: MONO, fontSize: '10px', color: 'var(--color-text-muted)',
                  width: DAY_W, flexShrink: 0,
                }}>
                  {DAY_LABELS.map((lbl, i) => (
                    <div key={i} style={{ aspectRatio: '1', lineHeight: `${MIN_CELL}px`, textAlign: 'right', minWidth: 0 }}>{lbl}</div>
                  ))}
                </div>
                {Array.from({ length: 52 }, (_, w) => (
                  <div key={w} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${GAP}px`, minWidth: MIN_CELL }}>
                    {Array.from({ length: 7 }, (_, d) => <SkeletonCell key={d} />)}
                  </div>
                ))}
              </div>
            ) : (
              // Live data — SINGLE container fade-in (one animation, not 364+)
              <motion.div
                style={rowStyle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                {/* Day labels */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: `${GAP}px`,
                  fontFamily: MONO, fontSize: '10px', color: 'var(--color-text-muted)',
                  width: DAY_W, flexShrink: 0,
                }}>
                  {DAY_LABELS.map((lbl, i) => (
                    <div key={i} style={{ aspectRatio: '1', lineHeight: `${MIN_CELL}px`, textAlign: 'right' }}>{lbl}</div>
                  ))}
                </div>

                {/* Week columns — flex:1 so they expand to fill the container */}
                {grid.map((week, w) => (
                  <div
                    key={w}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${GAP}px`, minWidth: MIN_CELL }}
                  >
                    {week.map((count, d) => (
                      <div
                        key={d}
                        onMouseEnter={e => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setTooltip({ x: r.left + r.width / 2, y: r.top, count });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onMouseOver={e  => { e.currentTarget.style.transform = 'scale(1.35)'; }}
                        onMouseOut={e   => { e.currentTarget.style.transform = 'scale(1)'; }}
                        style={{
                          width: '100%', aspectRatio: '1', borderRadius: '2px', flexShrink: 0,
                          backgroundColor: cellColor(level(count)),
                          border: `1px solid color-mix(in srgb, var(--color-border-subtle) 60%, transparent)`,
                          transition: 'background-color 0.3s, transform 0.15s',
                          cursor: 'default',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end"
              style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--color-text-muted)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(lvl => (
                <div key={lvl} style={{
                  width: MIN_CELL, height: MIN_CELL, borderRadius: '2px', flexShrink: 0,
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
