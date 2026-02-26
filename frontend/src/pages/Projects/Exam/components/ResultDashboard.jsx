// src/pages/Projects/Exam/components/ResultDashboard.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Progress, Chip } from "@heroui/react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, ChevronDown, Target } from "lucide-react";

export default function ResultDashboard({ results, onRetry }) {
  const { t } = useTranslation();
  const [openDetailIdx, setOpenDetailIdx] = useState(null);

  const toggleDetail = (idx) => {
    setOpenDetailIdx(openDetailIdx === idx ? null : idx);
  };

  const isSuccess = results.isSuccess;
  const glowClass = isSuccess ? "bg-emerald-500/20" : "bg-rose-500/20";
  const textClass = isSuccess ? "text-emerald-400" : "text-rose-400";
  const borderClass = isSuccess ? "border-emerald-500/30" : "border-rose-500/30";

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-8 relative z-10 min-h-[80vh] flex flex-col gap-8">
      {/* Dinamik Arka Plan Işıkları */}
      <div className={`absolute top-0 left-1/4 w-125 h-125 ${glowClass} rounded-full blur-[150px] -z-10 pointer-events-none`} />
      <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-cyan-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* ÜST KISIM: Bento Grid İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ana Skor Kartı (2 Sütun Kaplar) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className={`absolute -right-10 -top-10 w-40 h-40 ${glowClass} blur-3xl rounded-full pointer-events-none`} />
          
          <div className={`relative flex items-center justify-center w-40 h-40 rounded-full border-8 ${borderClass} shrink-0`}>
            <div className="flex flex-col items-center">
              <span className={`text-5xl font-black ${textClass}`}>{results.pct}%</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('exam.resultsTitle')}</h2>
            <p className="text-slate-400 text-lg mb-6">{isSuccess ? t('exam.resultTextGood') : t('exam.resultTextBad')}</p>
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2 font-medium">
                 <span className="text-slate-300"><Target className="inline w-4 h-4 mr-1"/> {t('exam.successRate')}</span>
                 <span className={textClass}>{results.correct} / {results.total}</span>
              </div>
              <Progress size="md" value={results.pct} color={isSuccess ? "success" : "danger"} classNames={{ indicator: isSuccess ? "bg-emerald-400" : "bg-rose-400" }} />
            </div>
          </div>
        </motion.div>

        {/* Yan İstatistikler (Doğru, Yanlış, Boş) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4">
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center justify-between">
             <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" /> <span className="text-slate-300 font-medium">{t('exam.correct')}</span></div>
             <span className="text-2xl font-bold text-emerald-400">{results.correct}</span>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center justify-between">
             <div className="flex items-center gap-3"><XCircle className="text-rose-400" /> <span className="text-slate-300 font-medium">{t('exam.wrong')}</span></div>
             <span className="text-2xl font-bold text-rose-400">{results.wrongList.length}</span>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center justify-between">
             <div className="flex items-center gap-3"><HelpCircle className="text-slate-400" /> <span className="text-slate-300 font-medium">{t('exam.unanswered')}</span></div>
             <span className="text-2xl font-bold text-slate-400">{results.total - results.answered}</span>
          </div>
        </motion.div>
      </div>

      {/* ORTA KISIM: Aksiyon Butonu */}
      <div className="flex justify-center my-4">
        <Button color="primary" variant="shadow" size="lg" onPress={onRetry} className="px-12 font-bold text-lg h-14" startContent={<RotateCcw />}>
          {t('exam.retry')}
        </Button>
      </div>

      {/* ALT KISIM: Satır İçi Hata İnceleme (Inline Mistake Review) */}
      {results.wrongList.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mt-4">
          <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
             <XCircle className="text-rose-400" /> 
             {t('exam.reviewMistakes')}
             <Chip size="sm" color="danger" variant="flat">{results.wrongList.length}</Chip>
          </h3>

          <div className="flex flex-col gap-4">
            {results.wrongList.map((w, i) => {
              const isOpen = openDetailIdx === i;
              return (
                <div key={w.index} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-[#1e293b]/80 border-white/20 shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}`}>
                  
                  {/* Akordeon Başlığı (Tıklanabilir) */}
                  <div className="p-5 flex items-start sm:items-center gap-4 cursor-pointer" onClick={() => toggleDetail(i)}>
                     <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                        {w.index + 1}
                     </div>
                     <div className="flex-1">
                        <h4 className="text-slate-200 font-medium text-lg leading-snug line-clamp-2 sm:line-clamp-1" dangerouslySetInnerHTML={{ __html: w.question }} />
                     </div>
                     <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-500 shrink-0">
                        <ChevronDown />
                     </motion.div>
                  </div>

                  {/* Akordeon İçeriği (Detaylar) */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="p-5 pt-0 border-t border-white/5 mt-2 bg-black/20">
                           <div className="flex flex-wrap gap-3 mb-6 mt-4">
                              <Chip size="md" variant="flat" color="danger" className="font-medium text-sm">
                                  {t('exam.your')}: <strong className="ml-1">{w.selected}</strong>
                              </Chip>
                              <Chip size="md" variant="flat" color="success" className="bg-emerald-500/20 text-emerald-300 font-medium text-sm">
                                  {t('exam.correct')}: <strong className="ml-1">{w.correct}</strong>
                              </Chip>
                           </div>

                           <div className="flex flex-col gap-2">
                              {w.choices.map((ch, ci) => {
                                  const letter = ["A","B","C","D","E"][ci];
                                  const isSelected = letter === w.selected;
                                  const isCorrect = letter === w.correct;
                                  
                                  let itemClass = "p-4 rounded-xl border text-sm md:text-base flex items-center gap-4 transition-colors ";
                                  if (isCorrect) itemClass += "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium";
                                  else if (isSelected) itemClass += "bg-rose-500/10 border-rose-500/50 text-rose-300 opacity-90";
                                  else itemClass += "bg-white/5 border-transparent text-slate-400";

                                  return (
                                      <div key={ci} className={itemClass}>
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? 'bg-emerald-500/20' : isSelected ? 'bg-rose-500/20' : 'bg-white/5'}`}>
                                            {letter}
                                          </div>
                                          <span className="flex-1" dangerouslySetInnerHTML={{ __html: ch }} />
                                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                                      </div>
                                  );
                              })}
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}