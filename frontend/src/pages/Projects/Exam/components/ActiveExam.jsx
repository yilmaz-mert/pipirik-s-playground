import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Progress } from "@heroui/react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";

export default function ActiveExam({ 
  questionData, 
  currentIdx, 
  totalQuestions, 
  currentAnswer, 
  timeLeft, 
  onSelect, 
  onNext, 
  onPrev,
  onFinish
}) {
  const { t } = useTranslation();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const isTimeRunningOut = timeLeft < 60;
  const progressValue = ((currentIdx + 1) / totalQuestions) * 100;

  // Soru geçiş animasyonları (Fade ve hafif kayma)
  const slideVariants = {
    enter: { opacity: 0, x: 20, scale: 0.98 },
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col justify-center min-h-[70vh] relative z-10">
      
      {/* Üst Bar: İnce Progress ve Süre */}
      <div className="w-full mb-8 flex flex-col gap-4">
        <div className="flex justify-between items-end px-2">
            <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase">
                {t('exam.questionLabel', { num: currentIdx + 1 })} / {totalQuestions}
            </span>
            <div className={`flex items-center gap-2 font-mono text-xl font-bold transition-colors ${isTimeRunningOut ? "text-rose-400 animate-pulse" : "text-slate-300"}`}>
                <Clock className="w-5 h-5" />
                {minutes}:{seconds}
            </div>
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
            key={currentIdx} // Key değiştiğinde animasyon tetiklenir
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex flex-col gap-8"
          >
            {/* Soru Metni */}
            <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-100 leading-tight md:leading-snug"
                dangerouslySetInnerHTML={{ __html: questionData.question }} 
            />

            {/* Şıklar */}
            <div className="flex flex-col gap-3 md:gap-4 mt-4">
              {questionData.choices.map((choice, i) => {
                const letter = ["A", "B", "C", "D"][i];
                const isSelected = currentAnswer === letter;

                return (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => {
                        onSelect(i);
                        // Seçim yapıldıktan çok kısa süre sonra otomatik sonrakine geçiş (Typeform hissiyatı)
                        if (currentIdx < totalQuestions - 1) {
                            setTimeout(onNext, 400); 
                        }
                      }}
                      className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group
                        ${isSelected 
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                            : 'bg-[#1e293b]/50 border-white/5 hover:border-white/20 hover:bg-[#1e293b]/80'
                        }`}
                    >
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors
                        ${isSelected ? 'bg-cyan-400 text-slate-900' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}
                      `}>
                        {letter}
                      </div>
                      <span 
                        className={`flex-1 text-base md:text-lg ${isSelected ? 'text-cyan-50 font-medium' : 'text-slate-300'}`}
                        dangerouslySetInnerHTML={{ __html: choice }} 
                      />
                      {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                          </motion.div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alt Navigasyon Barı */}
      <div className="mt-12 flex justify-between items-center border-t border-white/10 pt-6">
         <Button 
            variant="light" 
            className="text-slate-400 hover:text-white"
            isDisabled={currentIdx === 0} 
            onPress={onPrev}
         >
            ← {t('common.back', {defaultValue: 'Geri'})}
         </Button>
         
         {currentIdx === totalQuestions - 1 ? (
             <Button color="primary" variant="shadow" onPress={onFinish} size="lg" className="px-8 font-bold animate-pulse">
                {t('exam.finishExam')}
             </Button>
         ) : (
             <Button 
                variant="flat"
                className="bg-white/5 text-white hover:bg-white/10"
                onPress={onNext}
             >
                {t('common.next', {defaultValue: 'Geç'})} →
             </Button>
         )}
      </div>
    </div>
  );
}