// src/pages/Projects/Exam/components/LoadingScreen.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        />
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-cyan-400 font-medium tracking-widest uppercase text-sm"
        >
          {t('exam.preparing', { defaultValue: 'Loading Exam...' })}
        </motion.p>
      </div>
    </div>
  );
}