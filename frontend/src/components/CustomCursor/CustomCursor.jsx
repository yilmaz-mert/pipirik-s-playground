/**
 * CustomCursor — Morphing hollow-ring cursor for fine-pointer (mouse) devices.
 *
 * STATES:
 *   default → 20px hollow accent ring, 80% opacity
 *   link    → 8px solid accent dot (on <a>, <button>, [role="button"])
 *   card    → 52px glass ring with backdrop-blur (on Bento Grid project cards)
 *
 * PERFORMANCE:
 *   - Position: useMotionValue direct (no spring) — pixel-perfect 60fps tracking,
 *     zero React re-renders on mousemove.
 *   - Variant: React state only changes on element-type transitions (rare).
 *   - willChange: transform keeps it on the GPU compositor layer.
 *   - Only renders visuals on pointer:fine devices — no overhead on touch.
 */
import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue } from 'framer-motion';

// Module-level constant — evaluated once at import time, no ref needed.
// Avoids the react-hooks/refs lint error from reading .current during render.
const IS_FINE_POINTER = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

// ── Cursor variant styles ─────────────────────────────────────────────────────
const VARIANTS = {
  default: {
    x: '-50%',
    y: '-50%',
    width:           20,
    height:          20,
    opacity:         0.80,
    backgroundColor: 'transparent',
    borderWidth:     1.5,
    borderColor:     'var(--color-accent)',
    backdropFilter:  'blur(0px)',
  },
  link: {
    x: '-50%',
    y: '-50%',
    width:           8,
    height:          8,
    opacity:         1,
    backgroundColor: 'var(--color-accent)',
    borderWidth:     0,
    borderColor:     'transparent',
    backdropFilter:  'blur(0px)',
  },
  card: {
    x: '-50%',
    y: '-50%',
    width:           52,
    height:          52,
    opacity:         0.75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.28)',
    backdropFilter:  'blur(6px)',
  },
};

// ── Selectors for interaction zones ──────────────────────────────────────────
const LINK_SEL = 'a, button, [role="button"], label[for]';
const CARD_SEL = [
  'multiplication-mania', 'flight-tracker', 'exam', 'todolist', 'hangman',
].map(id => `[data-comp="${id}"]`).join(', ');

export default function CustomCursor() {
  // All hooks MUST be called unconditionally — pointer check is deferred to render
  // Direct MotionValues — no spring on position = zero lag, pixel-perfect 60fps tracking
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const [variant, setVariant] = useState('default');
  const stateRef = useRef('default');

  useEffect(() => {
    // Skip all listener setup on touch / stylus devices
    if (!IS_FINE_POINTER) return;

    const updateVariant = (next) => {
      if (stateRef.current === next) return;
      stateRef.current = next;
      setVariant(next);
    };

    const onMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // mouseover bubbles — use for delegation without extra per-element listeners
    const onOver = (e) => {
      if (e.target.closest(CARD_SEL))      updateVariant('card');
      else if (e.target.closest(LINK_SEL)) updateVariant('link');
      else                                   updateVariant('default');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  // mouseX / mouseY are stable MotionValues — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't paint anything on touch / stylus — CSS cursor:none only applies on pointer:fine
  if (!IS_FINE_POINTER) return null;

  return (
    <motion.div
      aria-hidden="true"
      variants={VARIANTS}
      animate={variant}
      transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.6 }}
      style={{
        position:      'fixed',
        left:          mouseX,
        top:           mouseY,
        borderRadius:  '50%',
        borderStyle:   'solid',
        pointerEvents: 'none',
        zIndex:        99999,
        willChange:    'transform, width, height',
      }}
    />
  );
}
