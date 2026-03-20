// src/pages/Home/components/ProfileSection.jsx
import { useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import mertProfile from '../../../assets/mert-profile.webp';

// Only apply hover interactions on pointer devices (not touch)
const IS_HOVER_DEVICE =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

// ── Holographic Glitch keyframes ──────────────────────────────────────────────
// Red channel: shifts RIGHT + slight Y jitter, hue-rotated toward red/orange
const RED_CHANNEL = {
  rest:   { x: 0, y: 0, opacity: 0 },
  glitch: {
    x:       [0,  4,  8,  3,  7,  0],
    y:       [0,  1, -1,  1, -0.5, 0],
    opacity: [0, 0.55, 0.70, 0.55, 0.70, 0],
  },
};

// Cyan channel: shifts LEFT + opposing Y jitter, hue-rotated toward cyan
const CYAN_CHANNEL = {
  rest:   { x: 0, y: 0, opacity: 0 },
  glitch: {
    x:       [0, -4, -8, -3, -7,  0],
    y:       [0, -1,  1, -1,  0.5, 0],
    opacity: [0, 0.55, 0.70, 0.55, 0.70, 0],
  },
};

// Timing shared by RGB channel animations
const CHANNEL_TRANSITION = {
  duration: 0.65,
  times:    [0, 0.12, 0.30, 0.55, 0.75, 1],
  ease:     'easeInOut',
};

// Digital noise overlay — horizontal scan-line interference with rapid flicker
const NOISE_VARIANT = {
  rest:   { opacity: 0 },
  glitch: { opacity: [0, 0.8, 0.3, 1.0, 0.5, 0] },
};

const NOISE_TRANSITION = {
  duration: 0.55,
  times:    [0, 0.10, 0.30, 0.50, 0.75, 1],
  ease:     'linear',
};

export default function ProfileSection() {
  const [glitching, setGlitching]   = useState(false);
  const glitchTimeout                = useRef(null);
  const shouldReduceMotion           = useReducedMotion();

  const startGlitch = () => {
    if (shouldReduceMotion || !IS_HOVER_DEVICE) return;
    clearTimeout(glitchTimeout.current);
    setGlitching(true);
  };

  const stopGlitch = () => {
    // Short hold before clearing so the return-to-rest animation completes
    clearTimeout(glitchTimeout.current);
    glitchTimeout.current = setTimeout(() => setGlitching(false), 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      data-comp="ProfileSection"
      className="flex justify-center lg:justify-end"
    >
      <div
        className="relative w-36 h-36 md:w-104 md:h-104 group"
        onMouseEnter={startGlitch}
        onMouseLeave={stopGlitch}
      >

        {/* Ambient aura — large, very subtle radial glow */}
        <div
          className="hidden md:block absolute -inset-10 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-1000 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, var(--color-accent) 0%, var(--color-accent-2) 35%, transparent 68%)',
            filter:          'blur(160px)',
          }}
        />

        {/* ── Morphing image container ─────────────────────────────────────── */}
        {/* Opaque bg ensures the canvas / decoder never bleeds through the
            transparent regions of the webp alpha channel.
            motion.div enables the brightness flash at glitch onset.          */}
        <motion.div
          className="relative w-full h-full border-2 overflow-hidden transition-[border-color,box-shadow,transform] duration-1000 ease-in-out group-hover:scale-[1.02] shadow-2xl animate-morph"
          style={{
            backgroundColor: 'var(--color-bg-card-solid)',
            borderColor:     'var(--color-border-subtle)',
          }}
          animate={glitching ? {
            filter: ['brightness(1)', 'brightness(1.55)', 'brightness(1)'],
          } : {
            filter: 'brightness(1)',
          }}
          transition={glitching ? {
            duration: 0.22,
            times:    [0, 0.08, 1],
            ease:     'easeOut',
          } : {
            duration: 0.12,
          }}
        >
          {/* Base image */}
          <img
            src={mertProfile}
            alt="Mert's Profile"
            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
          />

          {/* ── Holographic Glitch layers ── */}

          {/* Red channel — shifts right+y, screen-blends over the base image */}
          <motion.img
            src={mertProfile}
            aria-hidden="true"
            variants={RED_CHANNEL}
            animate={glitching ? 'glitch' : 'rest'}
            transition={CHANNEL_TRANSITION}
            className="absolute inset-0 w-full h-full object-cover scale-110 pointer-events-none select-none"
            style={{
              mixBlendMode: 'screen',
              // Boost saturation + rotate hue toward red/orange
              filter:       'saturate(600%) hue-rotate(-40deg) brightness(0.9)',
            }}
          />

          {/* Cyan channel — shifts left+y, screen-blends over the base image */}
          <motion.img
            src={mertProfile}
            aria-hidden="true"
            variants={CYAN_CHANNEL}
            animate={glitching ? 'glitch' : 'rest'}
            transition={CHANNEL_TRANSITION}
            className="absolute inset-0 w-full h-full object-cover scale-110 pointer-events-none select-none"
            style={{
              mixBlendMode: 'screen',
              // Boost saturation + rotate hue toward cyan
              filter:       'saturate(600%) hue-rotate(155deg) brightness(0.9)',
            }}
          />

          {/* Digital noise — horizontal scan-line interference pattern */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            variants={NOISE_VARIANT}
            animate={glitching ? 'glitch' : 'rest'}
            transition={NOISE_TRANSITION}
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,234,0.06) 2px, rgba(0,255,234,0.06) 4px)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Scan line — sweeps top to bottom during the glitch burst */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              top:        0,
              background: 'linear-gradient(to right, transparent 0%, rgba(0,255,234,0.85) 30%, rgba(0,255,234,0.85) 70%, transparent 100%)',
              boxShadow:  '0 0 8px 2px rgba(0,255,234,0.4)',
            }}
            animate={glitching ? {
              y:       [0, 440],
              opacity: [0, 0.9, 0.9, 0],
            } : {
              y:       0,
              opacity: 0,
            }}
            transition={glitching ? {
              duration: 0.55,
              ease:     'easeIn',
              times:    [0, 0.05, 0.85, 1],
            } : {
              duration: 0.12,
            }}
          />

          {/* Bottom fade — blends image into page background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, var(--color-image-overlay), transparent)',
            }}
          />
        </motion.div>

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
