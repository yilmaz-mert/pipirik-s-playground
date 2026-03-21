// src/pages/Home/components/SocialLinks.jsx
import { useRef } from 'react';
import { Button } from "@heroui/react";
import { FaGithub, FaLinkedin } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring } from "framer-motion";

const IS_FINE_POINTER = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

// ── Magnetic spring config — high tension, snaps back instantly ───────────────
const MAGNETIC_SPRING = { stiffness: 400, damping: 25 };
const MAX_PULL = 15; // px

function MagneticWrapper({ children }) {
  const ref  = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x    = useSpring(rawX, MAGNETIC_SPRING);
  const y    = useSpring(rawY, MAGNETIC_SPRING);

  const onPointerMove = (e) => {
    if (!IS_FINE_POINTER || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = e.clientX - cx;
    const dy   = e.clientY - cy;
    rawX.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * 0.45)));
    rawY.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * 0.45)));
  };

  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.div>
  );
}

export default function SocialLinks() {
  return (
    <motion.div
      data-comp="SocialLinks"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.35, duration: 0.45, ease: [0.2, 0, 0.2, 1] }}
      className="flex items-center justify-center lg:justify-start gap-3 pt-1 md:pt-4"
    >
      <MagneticWrapper>
        <Button
          as="a"
          href="https://github.com/yilmaz-mert"
          target="_blank"
          isIconOnly
          variant="flat"
          size="lg"
          className="transition-all h-14 w-14 border"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor:     'var(--color-border-subtle)',
            color:           'var(--color-text-muted)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.color       = 'var(--color-accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            e.currentTarget.style.color       = 'var(--color-text-muted)';
          }}
        >
          <FaGithub size={24} />
        </Button>
      </MagneticWrapper>

      <MagneticWrapper>
        <Button
          as="a"
          href="https://www.linkedin.com/in/yilmaz-mert/"
          target="_blank"
          isIconOnly
          variant="flat"
          size="lg"
          className="transition-all h-14 w-14 border"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor:     'var(--color-border-subtle)',
            color:           'var(--color-text-muted)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-accent-2)';
            e.currentTarget.style.color       = 'var(--color-accent-2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            e.currentTarget.style.color       = 'var(--color-text-muted)';
          }}
        >
          <FaLinkedin size={24} />
        </Button>
      </MagneticWrapper>
    </motion.div>
  );
}
