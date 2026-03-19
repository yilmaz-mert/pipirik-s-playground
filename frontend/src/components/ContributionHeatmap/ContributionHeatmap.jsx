/**
 * ContributionHeatmap — GitHub-style activity grid.
 *
 * 52 weeks × 7 days of deterministic mock data (seeded RNG — no hydration
 * mismatch across renders). Intensity levels 0-4 are mapped to different
 * opacities of --color-accent so the grid reacts to theme changes instantly.
 *
 * Layout:
 *   - Month labels across the top
 *   - Day-of-week labels on the left (Mon / Wed / Fri)
 *   - 10 × 10 px cells with 3 px gap
 *   - Horizontally scrollable on narrow viewports
 *   - Tooltip on hover showing exact commit count
 */
import { useState } from 'react';

// ── Deterministic data ────────────────────────────────────────────────────────
function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
    s ^= s >>> 16;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function buildHeatmapData() {
  const rand  = seededRand(0xDEAD_BEEF);
  const WEEKS = 52;
  const DAYS  = 7;   // 0 = Sun … 6 = Sat

  return Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: DAYS }, (_, d) => {
      const isWeekend  = d === 0 || d === 6;
      const isBurst    = w % 7 === 3 || w % 13 === 9;
      const r = rand();

      if (isWeekend)  return r < 0.22 ? Math.ceil(rand() * 3) : 0;
      if (isBurst)    return Math.ceil(rand() * 10) + 3;
      return r < 0.62 ? Math.ceil(rand() * 7) : 0;
    })
  );
}

const DATA = buildHeatmapData(); // computed once at module load, stable

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', ''];  // sparse — only odd rows

function getMonthLabels() {
  // Walk 52 weeks and note which week each month starts in (approx)
  const today  = new Date();
  const labels = [];
  let   lastM  = -1;
  for (let w = 0; w < 52; w++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (51 - w) * 7);
    const m = d.getMonth();
    if (m !== lastM) { labels.push({ w, name: MONTH_NAMES[m] }); lastM = m; }
  }
  return labels;
}

const MONTH_LABELS = getMonthLabels();

/** Map commit count → 0-4 intensity. */
function level(count) {
  if (count === 0) return 0;
  if (count <= 2)  return 1;
  if (count <= 5)  return 2;
  if (count <= 9)  return 3;
  return 4;
}

/** CSS color for a given intensity level using the active theme accent. */
function cellColor(lvl) {
  if (lvl === 0) return 'var(--color-bg-surface)';
  const opacity = [0, 0.22, 0.42, 0.65, 1][lvl];
  return `color-mix(in srgb, var(--color-accent) ${Math.round(opacity * 100)}%, var(--color-bg-surface))`;
}

const CELL = 11;  // cell size in px
const GAP  = 3;   // gap between cells

// ── Component ─────────────────────────────────────────────────────────────────
export default function ContributionHeatmap() {
  const [tooltip, setTooltip] = useState(null); // { x, y, count }
  const mono = "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace";

  const totalCommits = DATA.flat().reduce((a, b) => a + b, 0);

  return (
    <div data-comp="ContributionHeatmap" className="relative">
      {/* Section header */}
      <div className="flex items-baseline gap-3 mb-5">
        <h3
          className="text-lg font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: mono }}
        >
          Engineering Activity
        </h3>
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {totalCommits} contributions · last 12 months
        </span>
      </div>

      {/* Scrollable grid wrapper */}
      <div className="overflow-x-auto pb-1">
        <div style={{ position: 'relative', display: 'inline-block' }}>

          {/* Month labels row */}
          <div
            style={{
              display:     'grid',
              gridTemplateColumns: `20px repeat(52, ${CELL}px)`,
              gap:         `0 ${GAP}px`,
              marginBottom: '4px',
              fontFamily:  mono,
              fontSize:    '10px',
              color:       'var(--color-text-muted)',
            }}
          >
            <div /> {/* spacer for day-label column */}
            {Array.from({ length: 52 }, (_, w) => {
              const lbl = MONTH_LABELS.find(m => m.w === w);
              return (
                <div key={w} style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
                  {lbl ? lbl.name : ''}
                </div>
              );
            })}
          </div>

          {/* Day labels + cells grid */}
          <div style={{ display: 'flex', gap: `${GAP}px` }}>

            {/* Day-of-week labels */}
            <div
              style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           `${GAP}px`,
                fontFamily:    mono,
                fontSize:      '10px',
                color:         'var(--color-text-muted)',
                width:         '17px',
                flexShrink:    0,
              }}
            >
              {DAY_LABELS.map((lbl, i) => (
                <div key={i} style={{ height: CELL, lineHeight: `${CELL}px`, textAlign: 'right' }}>
                  {lbl}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {DATA.map((week, w) => (
              <div
                key={w}
                style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}
              >
                {week.map((count, d) => {
                  const lvl = level(count);
                  return (
                    <div
                      key={d}
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setTooltip({ x: r.left + r.width / 2, y: r.top, count });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        width:        CELL,
                        height:       CELL,
                        borderRadius: '2px',
                        backgroundColor: cellColor(lvl),
                        border: `1px solid color-mix(in srgb, var(--color-border-subtle) 60%, transparent)`,
                        transition:   'background-color 0.3s, transform 0.15s',
                        cursor:       'default',
                        flexShrink:   0,
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.35)'; }}
                      onMouseOut={(e)  => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-1.5 mt-3 justify-end"
            style={{ fontFamily: mono, fontSize: '10px', color: 'var(--color-text-muted)' }}
          >
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(lvl => (
              <div
                key={lvl}
                style={{
                  width:           CELL,
                  height:          CELL,
                  borderRadius:    '2px',
                  backgroundColor: cellColor(lvl),
                  border:          `1px solid color-mix(in srgb, var(--color-border-subtle) 60%, transparent)`,
                  flexShrink:      0,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 rounded-lg text-[11px]"
          style={{
            left:            tooltip.x,
            top:             tooltip.y - 34,
            transform:       'translateX(-50%)',
            backgroundColor: 'var(--color-bg-overlay)',
            border:          '1px solid var(--color-border)',
            color:           'var(--color-text-primary)',
            fontFamily:      mono,
            boxShadow:       '0 4px 16px rgba(0,0,0,0.4)',
            whiteSpace:      'nowrap',
          }}
        >
          {tooltip.count === 0 ? 'No contributions' : `${tooltip.count} commit${tooltip.count > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
