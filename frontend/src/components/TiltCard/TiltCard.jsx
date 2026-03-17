/**
 * TiltCard — 3D perspective tilt wrapper driven by Framer Motion.
 *
 * HOW IT WORKS:
 *   On mousemove, we normalise the cursor position within the card to [-1, 1]
 *   on each axis, map those to rotateX / rotateY values, and spring-smooth the
 *   result so the tilt feels physical rather than instant.
 *
 *   A radial shimmer gradient tracks the cursor position inside the card,
 *   fading in on mouseenter and out on mouseleave via a separate spring.
 *
 * ACCESSIBILITY:
 *   prefers-reduced-motion is respected — all motion is disabled, the card
 *   renders as a plain div with no transform side-effects.
 *
 * USAGE:
 *   <TiltCard>
 *     <YourCard />        ← fill 100% of the grid cell
 *   </TiltCard>
 *
 * The shimmer overlay is absolutely-positioned on top of children with
 * pointer-events: none so it never blocks clicks.
 */
import { useRef } from 'react';
import {
  motion,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';

// Shared spring configs
const TILT_SPRING   = { stiffness: 160, damping: 22, mass: 0.1 };
const SCALE_SPRING  = { stiffness: 220, damping: 26, mass: 0.08 };
const SHINE_SPRING  = { stiffness: 180, damping: 22 };

export default function TiltCard({
  children,
  maxTilt      = 10,     // max rotation in degrees
  perspective  = 900,    // CSS perspective depth in px
  scaleOnHover = 1.028,  // subtle scale-up on hover
  className    = '',
}) {
  const ref = useRef(null);

  // Check once at mount — if user prefers reduced motion, skip all transforms
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ).current;

  // ── Raw motion values ────────────────────────────────────────────────────
  const rotX    = useMotionValue(0);
  const rotY    = useMotionValue(0);
  const scaleV  = useMotionValue(1);
  const shineOp = useMotionValue(0);
  // Cursor position inside card as 0..100 percentages (for the shimmer gradient)
  const mouseXPct = useMotionValue(50);
  const mouseYPct = useMotionValue(50);

  // ── Spring-smoothed values ───────────────────────────────────────────────
  const springRotX    = useSpring(rotX,    TILT_SPRING);
  const springRotY    = useSpring(rotY,    TILT_SPRING);
  const springScale   = useSpring(scaleV,  SCALE_SPRING);
  const springShineOp = useSpring(shineOp, SHINE_SPRING);

  // Shimmer gradient derived from mouse position inside the card
  const shineGradient = useTransform(
    [mouseXPct, mouseYPct],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(181,126,220,0.16) 0%, rgba(212,168,240,0.06) 40%, transparent 65%)`,
  );

  // ── Event handlers ───────────────────────────────────────────────────────
  const onMouseMove = (e) => {
    if (reducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    // Normalise to [-1, 1] centred at card centre
    const nx = (e.clientX - rect.left)  / rect.width  - 0.5;  // -0.5 .. 0.5
    const ny = (e.clientY - rect.top)   / rect.height - 0.5;

    rotY.set( nx * 2 * maxTilt);   // right edge tilts toward viewer when mouse is right
    rotX.set(-ny * 2 * maxTilt);   // top edge tilts toward viewer when mouse is up

    mouseXPct.set((nx + 0.5) * 100);
    mouseYPct.set((ny + 0.5) * 100);
  };

  const onMouseEnter = () => {
    if (reducedMotion) return;
    scaleV.set(scaleOnHover);
    shineOp.set(1);
  };

  const onMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
    scaleV.set(1);
    shineOp.set(0);
  };

  // Reduced-motion: render as a plain passthrough div
  if (reducedMotion) {
    return <div className={`relative w-full h-full ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={`relative w-full h-full ${className}`}
      style={{
        rotateX:              springRotX,
        rotateY:              springRotY,
        scale:                springScale,
        transformPerspective: perspective,
        transformStyle:       'preserve-3d',
        willChange:           'transform',
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}

      {/*
        Shimmer overlay — positioned over children with matching border-radius.
        pointer-events: none means it never intercepts clicks on the card link.
        z-index is 5 to sit above the card background but below any z-10 content
        layers inside the HeroUI Card (icons, text, chips).
      */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: shineGradient,
          opacity:    springShineOp,
          zIndex:     5,
        }}
      />
    </motion.div>
  );
}
