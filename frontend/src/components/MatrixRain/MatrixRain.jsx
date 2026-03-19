/**
 * MatrixRain — Easter egg: "Execute Matrix Protocol"
 *
 * Full-screen canvas digital rain for exactly 4 seconds.
 * Characters: Katakana + hex digits.
 * Head of each column: bright white. Tail: active theme accent colour.
 * After 4 s the canvas fades out via Framer Motion exit animation.
 * Console message fires at 3.8 s so it appears while the rain is still visible.
 *
 * Props:
 *   onDone() — called after the fade-out completes so the parent can unmount.
 */
import { useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const CHARS  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF#@$%';
const FONT   = 14;       // px — column width & row height
const RAIN_DURATION = 4000; // ms before fade-out begins
const FADE_DURATION = 600;  // ms for the exit animation

function rndChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

export default function MatrixRain({ onDone }) {
  const canvasRef = useRef(null);
  const doneRef   = useRef(onDone);

  // Keep the ref current without mutating during render
  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W   = (canvas.width  = window.innerWidth);
    const H   = (canvas.height = window.innerHeight);
    const cols = Math.floor(W / FONT);

    // Each column tracks how far down its "head" is (in row units)
    const drops = Array.from({ length: cols }, () => Math.random() * -(H / FONT));

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim() || '#00d980';

    let raf;
    const start = performance.now();
    let fadingOut = false;

    const draw = (now) => {
      const elapsed = now - start;

      // After RAIN_DURATION, stop the loop and trigger unmount
      if (elapsed >= RAIN_DURATION && !fadingOut) {
        fadingOut = true;
        console.log('%cWake up, Mert...', `color:${accent};font-size:22px;font-family:monospace;font-weight:bold;`); // eslint-disable-line no-console
        setTimeout(() => doneRef.current?.(), FADE_DURATION);
        return; // stop drawing — canvas freezes while Framer fades it
      }

      // Semi-transparent black overlay to fade old characters
      ctx.fillStyle = 'rgba(0, 0, 0, 0.055)';
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${FONT}px monospace`;

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FONT;

        // Leading character: bright white
        ctx.fillStyle = '#ffffff';
        ctx.fillText(rndChar(), i * FONT, y);

        // One character behind head: full accent
        ctx.fillStyle = accent;
        ctx.fillText(rndChar(), i * FONT, y - FONT);

        // Reset column randomly once it passes the bottom
        if (y > H && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []); // run once on mount

  return (
    <motion.div
      className="fixed inset-0 z-[9999] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </motion.div>
  );
}
