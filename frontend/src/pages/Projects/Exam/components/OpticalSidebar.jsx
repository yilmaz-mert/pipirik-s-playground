// src/pages/Projects/Exam/components/OpticalSidebar.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle, Map } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function OpticalSidebar({ 
  questions, 
  currentIdx, 
  answers, 
  onJump, 
  isDrawerOpen, 
  setIsDrawerOpen 
}) {
  const { t } = useTranslation();
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // --- İlerleme Halkası Hesaplamaları ---
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (answeredCount / totalQuestions) * circumference;

  // Sidebar genişliği (w-80 = 20rem = 320px)
  const sidebarWidth = 320;

  return (
    <>
      {/* --- YÜZEN BUTON (FAB) & DİNAMİK İLERLEME HALKASI --- */}
      {/* motion.div ekledik ve isDrawerOpen durumuna göre x ekseninde kaydırdık */}
      <motion.div 
        className="fixed bottom-12 right-6 z-60 flex items-center justify-center group"
        initial={false}
        animate={{ 
          x: isDrawerOpen ? -sidebarWidth : 0,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40,
          mass: 1 
        }}
      >
        {/* İlerleme Halkası (SVG) */}
        <svg width="76" height="76" className="absolute -rotate-90 pointer-events-none drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
          <circle 
            cx="38" cy="38" r={radius} 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="3" 
          />
          <motion.circle 
            cx="38" cy="38" r={radius} 
            fill="none" 
            stroke="#22d3ee" 
            strokeWidth="3" 
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Butonun Kendisi */}
        <button 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isDrawerOpen ? 'bg-slate-800 text-slate-300 scale-90 shadow-xl border-white/10' : 'bg-[#0f172a] text-cyan-400 hover:bg-cyan-950/50 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
        >
          {isDrawerOpen ? <XCircle className="w-6 h-6" /> : <Map className="w-6 h-6" />}
        </button>
      </motion.div>


      {/* --- ÇEKMECE (DRAWER) ARKAPLAN KARARTMASI --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </AnimatePresence>


      {/* --- MİNİMAP ÇEKMECESİ (DRAWER) --- */}
      <motion.div 
        initial={false}
        animate={{ x: isDrawerOpen ? 0 : "100%" }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40 
        }}
        className="fixed top-18 right-0 z-50 w-80 bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col h-[calc(100dvh-4.5rem)]"
      >
        {/* Çekmece Başlığı */}
        <div className="p-6 border-b border-white/10 bg-linear-to-b from-white/5 to-transparent flex justify-between items-center">
          <h3 className="font-bold text-slate-100 flex items-center gap-3 text-lg">
            <Map className="text-cyan-400 w-5 h-5" />
            {t('exam.answerSheet', {defaultValue: 'Minimap'})}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-cyan-400 leading-none">{answeredCount}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">/ {totalQuestions} {t('exam.solved')}</span>
          </div>
        </div>

        {/* Minimap Grid Alanı */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-4 gap-3">
            {questions.map((_, i) => {
              const isCurrent = currentIdx === i;
              const userAnswer = answers[i];
              const isAnswered = !!userAnswer;

              let boxStyle = "aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-300 cursor-pointer border-2 relative overflow-hidden group ";
              
              if (isCurrent) {
                boxStyle += "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110 z-10";
              } else if (isAnswered) {
                boxStyle += "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20";
              } else {
                boxStyle += "border-white/5 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300";
              }

              return (
                <div 
                  key={i} 
                  className={boxStyle}
                  onClick={() => {
                    onJump(i);
                    if (window.innerWidth < 1024) setIsDrawerOpen(false);
                  }}
                >
                  <span className={`text-xl ${isCurrent ? 'scale-110' : ''} transition-transform`}>
                    {i + 1}
                  </span>

                  {isAnswered && (
                    <span className="text-[10px] uppercase font-black opacity-60 mt-0.5">
                      {userAnswer}
                    </span>
                  )}

                  {isCurrent && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 bg-cyan-400/20 blur-md rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alt Bilgi */}
          <div className="p-4 border-t border-white/10 text-center text-xs text-slate-500 font-medium bg-black/20">
            {t('exam.jumpHint', {defaultValue: 'Bir soruya gitmek için dokun.'})}
          </div>
      </motion.div>
    </>
  );
}