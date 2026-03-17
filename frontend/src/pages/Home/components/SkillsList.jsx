// src/pages/Home/components/SkillsList.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import { useTranslation } from 'react-i18next';

export default function SkillsList() {
  const { t } = useTranslation();
  const skills = t('home.skills', { returnObjects: true }) || [];

  const container = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const item = {
    hidden:  { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
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
