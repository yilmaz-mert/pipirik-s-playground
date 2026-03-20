// src/pages/Home/components/SocialLinks.jsx
import { Button } from "@heroui/react";
import { FaGithub, FaLinkedin } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function SocialLinks() {
  return (
    <motion.div
      data-comp="SocialLinks"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.35, duration: 0.45, ease: [0.2, 0, 0.2, 1] }}
      className="flex items-center justify-center lg:justify-start gap-3 pt-1 md:pt-4"
    >
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
          '--hover-border': 'var(--color-accent)',
          '--hover-color':  'var(--color-accent)',
        }}
        // HeroUI doesn't forward style vars to hover state, so we keep
        // the hover classes as Tailwind — accent is already a CSS var
        // so any future theme change to --color-accent flows through here.
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
    </motion.div>
  );
}
