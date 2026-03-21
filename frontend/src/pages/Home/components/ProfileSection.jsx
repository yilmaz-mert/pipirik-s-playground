// src/pages/Home/components/ProfileSection.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import mertProfile from '../../../assets/mert-profile.webp';

export default function ProfileSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      data-comp="ProfileSection"
      className="flex justify-center lg:justify-end"
    >
      <div className="relative w-36 h-36 md:w-104 md:h-104 group">

        {/* Ambient aura — large, very subtle radial glow */}
        <div
          className="hidden md:block absolute -inset-10 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-1000 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, var(--color-accent) 0%, var(--color-accent-2) 35%, transparent 68%)',
            filter:          'blur(160px)',
          }}
        />

        {/* ── Image container ──────────────────────────────────────────────── */}
        <div
          className="relative w-full h-full border-2 overflow-hidden transition-[border-color,box-shadow,transform] duration-1000 ease-in-out group-hover:scale-[1.02] shadow-2xl animate-morph"
          style={{
            backgroundColor: 'var(--color-bg-card-solid)',
            borderColor:     'var(--color-border-subtle)',
          }}
        >
          {/* Base image */}
          <img
            src={mertProfile}
            alt="Mert's Profile"
            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
          />

          {/* Bottom fade — blends image into page background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, var(--color-image-overlay), transparent)',
            }}
          />
        </div>

        {/* Status badge */}
        <div
          className="absolute -bottom-2 -right-2 backdrop-blur-xl px-3 py-2 rounded-xl hidden md:flex items-center gap-2 shadow-2xl animate-bounce-slow border"
          style={{
            backgroundColor: 'var(--color-bg-overlay)',
            borderColor:     'var(--color-border)',
            fontFamily:      "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
          }}
        >
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          </span>
          <div className="flex flex-col leading-none">
            <span
              className="text-[9px] uppercase tracking-[0.15em] font-bold"
              style={{ color: 'var(--color-text-muted)' }}
            >
              status
            </span>
            <span
              className="text-xs font-bold mt-0.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Developing...
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
