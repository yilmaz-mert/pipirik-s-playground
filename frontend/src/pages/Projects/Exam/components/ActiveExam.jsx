// src/pages/Projects/Exam/components/ActiveExam.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Progress } from "@heroui/react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Flag } from "lucide-react"; // Flag ikonu eklendi

export default function ActiveExam({ 
  questionData, 
  currentIdx, 
  totalQuestions, 
  currentAnswer, 
  timeLeft, 
  onSelect, 
  onNext, 
  onPrev,
  onFinish // Bu hala gerekli
}) {
  const { t } = useTranslation();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const isTimeRunningOut = timeLeft < 60;
  const progressValue = ((currentIdx + 1) / totalQuestions) * 100;

  const slideVariants = {
    enter: { opacity: 0, x: 20, scale: 0.98 },
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col justify-center min-h-[60vh] relative z-10">
      
      {/* Üst Bar: İlerleme, Sayaç ve BİTİR BUTONU */}
      <div className="w-full mb-8 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
            <div className="flex flex-col">
              <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase">
                  {t('exam.questionLabel', { num: currentIdx + 1 })} / {totalQuestions}
              </span>
              <div className={`flex items-center gap-2 font-mono text-xl font-bold transition-colors ${isTimeRunningOut ? "text-rose-400 animate-pulse" : "text-slate-300"}`}>
                  <Clock className="w-4 h-4" />
                  {minutes}:{seconds}
              </div>
            </div>

            {/* ARTIK BURADA: Her zaman erişilebilir Bitir Butonu */}
            <Button 
              color="danger" 
              variant="flat" 
              size="sm" 
              onPress={onFinish}
              className="font-bold border border-rose-500/20 hover:bg-rose-500/20"
            >
              {t('exam.finishExam')}
            </Button>
        </div>
        <Progress 
            aria-label="Exam Progress"
            size="sm" 
            value={progressValue} 
            color="primary" 
            classNames={{ indicator: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" }}
        />
      </div>

      {/* Soru ve Şıklar (Animasyonlu Kapsayıcı) */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex flex-col gap-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight" dangerouslySetInnerHTML={{ __html: questionData.question }} />

            <div className="flex flex-col gap-3 mt-4">
              {questionData.choices.map((choice, i) => {
                const letter = ["A", "B", "C", "D"][i];
                const isSelected = currentAnswer === letter;

                return (
                  <motion.div key={i} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
                    <button
                      onClick={() => {
                        onSelect(i);
                        if (currentIdx < totalQuestions - 1) {
                            setTimeout(onNext, 400); 
                        }
                      }}
                      className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group
                        ${isSelected 
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                            : 'bg-[#1e293b]/50 border-white/5 hover:border-white/20 hover:bg-[#1e293b]/80'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors
                        ${isSelected ? 'bg-cyan-400 text-slate-900' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}
                      `}>
                        {letter}
                      </div>
                      <span className={`flex-1 text-base ${isSelected ? 'text-cyan-50 font-medium' : 'text-slate-300'}`} dangerouslySetInnerHTML={{ __html: choice }} />
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alt Navigasyon: Sadece Geri/İleri kaldı */}
      <div className="mt-12 flex justify-between items-center border-t border-white/10 pt-6">
         <Button variant="light" className="text-slate-400 hover:text-white" isDisabled={currentIdx === 0} onPress={onPrev}>
            ← {t('common.back')}
         </Button>
         
         <Button variant="flat" className="bg-white/5 text-white hover:bg-white/10" isDisabled={currentIdx === totalQuestions - 1} onPress={onNext}>
            {t('common.next')} →
         </Button>
      </div>
    </div>
  );
}