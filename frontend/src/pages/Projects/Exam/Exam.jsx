// src/pages/Projects/Exam/Exam.jsx
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { HelpCircle } from "lucide-react";

// Tüm Modüler Bileşenlerimiz
import LoadingScreen from "./components/LoadingScreen";
import ActiveExam from "./components/ActiveExam";
import OpticalSidebar from "./components/OpticalSidebar";
import ResultDashboard from "./components/ResultDashboard"; 

export default function Exam() {
  const { t } = useTranslation();
  
  // --- STATE KONTROLLERİ ---
  const [questions, setQuestions] = useState([]); 
  const [currentIdx, setCurrentIdx] = useState(0); 
  const [answers, setAnswers] = useState({});     
  const [loading, setLoading] = useState(true);    
  const [timeLeft, setTimeLeft] = useState(600);   
  const [isFinished, setIsFinished] = useState(false); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Yeni State Eklendi
  
  const confirmDisclosure = useDisclosure(); 
  
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  // --- API İSTEĞİ ---
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=10&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => {
          const allChoices = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
          return { question: q.question, choices: allChoices, correct: q.correct_answer };
        });
        setQuestions(formatted);
        setLoading(false);
      });
  }, []);

  // --- ZAMANLAYICI ---
  useEffect(() => {
    if (timeLeft > 0 && !isFinished && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true); 
    }
  }, [timeLeft, isFinished, loading]);

  // --- SONUÇ HESAPLAMA ---
  const results = useMemo(() => {
    if (!isFinished) return null;
    let correct = 0;
    let answered = 0;
    const wrongList = [];

    questions.forEach((q, i) => {
      const userAnsLetter = answers[i];
      if (userAnsLetter) answered++;
      const correctIdx = q.choices.indexOf(q.correct);
      const correctLetter = ["A", "B", "C", "D", "E"][correctIdx];
      
      if (userAnsLetter === correctLetter) correct++;
      else if (userAnsLetter) wrongList.push({ index: i, question: q.question, selected: userAnsLetter, correct: correctLetter, choices: q.choices });
    });

    const pct = Math.round((correct / totalQuestions) * 100);
    return { correct, answered, wrongList, pct, total: totalQuestions, isSuccess: pct >= 60 };
  }, [isFinished, questions, answers, totalQuestions]);

  // --- YÜKLEME EKRANI ---
  if (loading) return <LoadingScreen />;

  // --- API ÇÖKME KORUMASI ---
  if (!loading && questions.length === 0 && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <p className="text-rose-400 font-bold">{t('exam.apiError', {defaultValue: 'API limitine takıldınız. Lütfen 5 saniye sonra sayfayı yenileyin.'})}</p>
        <Button onPress={() => window.location.reload()}>{t('exam.retry', {defaultValue: 'Tekrar Dene'})}</Button>
      </div>
    );
  }

  // --- SONUÇ EKRANI ---
  if (isFinished && results) {
    return (
        <ResultDashboard 
            results={results} 
            onRetry={() => window.location.reload()} 
        />
    );
  }

  // --- ODAK MODU (Sınav Devam Ediyor) ---
  return (
    <div className="w-full min-h-[calc(100dvh-7.5rem)] pb-12 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Immersive Arka Plan Efektleri */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] -z-10 pointer-events-none transition-colors duration-1000 ${timeLeft < 60 ? 'bg-rose-500/20' : 'bg-cyan-500/10'}`} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Ana Soru Bileşeni */}
      <ActiveExam 
        questionData={questions[currentIdx]}
        currentIdx={currentIdx}
        totalQuestions={totalQuestions}
        currentAnswer={answers[currentIdx]}
        timeLeft={timeLeft}
        onSelect={(i) => setAnswers({ ...answers, [currentIdx]: ["A", "B", "C", "D"][i] })}
        onNext={() => currentIdx < totalQuestions - 1 && setCurrentIdx(currentIdx + 1)}
        onPrev={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
        onFinish={confirmDisclosure.onOpen}
      />

      {/* Sağ Altta Yüzen Optik Form Çekmecesi */}
      <OpticalSidebar 
        questions={questions}
        currentIdx={currentIdx}
        answers={answers}
        onJump={(idx) => setCurrentIdx(idx)}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onFinish={confirmDisclosure.onOpen} 
      />

      {/* Bitirme Onay Modalı */}
      <Modal 
        isOpen={confirmDisclosure.isOpen} 
        onOpenChange={confirmDisclosure.onOpenChange} 
        backdrop="blur"
        classNames={{
            base: "bg-slate-900/95 backdrop-blur-2xl border border-white/10",
            header: "border-b border-white/10 text-slate-100",
            footer: "border-t border-white/10",
            body: "text-slate-300 py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader><HelpCircle className="mr-2 text-cyan-400" />{t('exam.finishExam')}</ModalHeader>
              <ModalBody>
                <p>{t('exam.finishConfirm')}</p>
                {answeredCount < totalQuestions && (
                  <p className="text-rose-400 mt-2 text-sm">
                    {t('exam.unansweredWarning', { count: totalQuestions - answeredCount })}
                  </p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="ghost" onPress={onClose}>{t('common.cancel')}</Button>
                <Button color="primary" onPress={() => { setIsFinished(true); onClose(); }}>{t('common.ok')}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}