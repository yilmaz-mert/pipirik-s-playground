// src/pages/Home/components/SkillsList.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import { useTranslation } from 'react-i18next';

export default function SkillsList() {
  const { t, i18n } = useTranslation();
  // Guard against the translation key being returned as a string when the
  // new locale hasn't finished loading yet (race condition on lang switch).
  const raw    = t('home.skills', { returnObjects: true });
  const skills = Array.isArray(raw) ? raw : [];

  const container = {
    hidden:  { opacity: 0 },
    // delayChildren: 1.0s lets the Hero name + role scramble finish before chips appear
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 1.0 } },
  };

  const item = {
    hidden:  { opacity: 0, y: 14, scale: 0.88 },
    visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.38, ease: [0.2, 0, 0.2, 1] } },
  };

  return (
    <motion.div
      // key forces a full remount (and re-animation) whenever the active
      // language changes, so chips always reflect the current locale.
      key={i18n.language}
      data-comp="SkillsList"
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap justify-center lg:justify-start gap-1.5 max-w-md pt-0 md:pt-2"
    >
      {skills.map((skill) => (
        <motion.div key={skill} variants={item}>
          <Chip
            variant="flat"
            className="transition-colors cursor-default px-4 h-8 border"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor:     'var(--color-border-subtle)',
              color:           'var(--color-text-secondary)',
            }}
          >
            {skill}
          </Chip>
        </motion.div>
      ))}
    </motion.div>
  );
}
