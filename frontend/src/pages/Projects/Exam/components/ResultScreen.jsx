// src/pages/Projects/Exam/components/ResultScreen.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Button, Progress } from "@heroui/react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

export default function ResultScreen({ results, onRetry, onViewMistakes }) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 relative z-10">
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <Card className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        <CardBody className="p-8 md:p-12 flex flex-col items-center text-center relative">
          
          <div className={`inline-flex p-4 rounded-full mb-6 ${results.isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {results.isSuccess ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('exam.resultsTitle')}</h2>
          <p className="text-slate-400 text-lg mb-8">{results.isSuccess ? t('exam.resultTextGood') : t('exam.resultTextBad')}</p>

          <div className="w-full max-w-md flex flex-col items-center gap-6 mb-10">
            <div className={`relative flex items-center justify-center w-40 h-40 rounded-full border-8 ${results.isSuccess ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
              <div className="flex flex-col items-center">
                <span className={`text-5xl font-black ${results.isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>{results.pct}%</span>
                <span className="text-slate-400 text-sm mt-1">{results.correct} / {results.total}</span>
              </div>
            </div>
            <Progress aria-label="Exam Score Percentage" size="lg" value={results.pct} color={results.isSuccess ? "success" : "danger"} className="max-w-md" showValueLabel={false} />
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <CheckCircle2 className="text-emerald-400 mb-2" />
              <span className="text-2xl font-bold text-white">{results.correct}</span>
              <span className="text-slate-400 text-sm">{t('exam.correct')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <XCircle className="text-rose-400 mb-2" />
              <span className="text-2xl font-bold text-white">{results.wrongList.length}</span>
              <span className="text-slate-400 text-sm">{t('exam.wrong')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <HelpCircle className="text-slate-400 mb-2" />
              <span className="text-2xl font-bold text-white">{results.total - results.answered}</span>
              <span className="text-slate-400 text-sm">{t('exam.unanswered')}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button color="primary" variant="shadow" size="lg" onPress={onRetry}>
              {t('exam.retry')}
            </Button>
            {results.wrongList.length > 0 && (
              <Button variant="bordered" color="danger" size="lg" onPress={onViewMistakes}>
                {t('exam.viewMistakes', { count: results.wrongList.length })}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}