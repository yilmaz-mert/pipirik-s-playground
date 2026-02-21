import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import "./Exam.css";
import { useModal } from '../../../components/useModal';

function Exam() {
  const { t } = useTranslation();
  // --- STATE MANAGEMENT ---
  const [questions, setQuestions] = useState([]); // Stores formatted questions from API
  const [currentIdx, setCurrentIdx] = useState(0); // Index of the currently displayed question
  const [answers, setAnswers] = useState({});     // Stores user answers in {questionIndex: "A"} format
  const [loading, setLoading] = useState(true);    // Loading state for API fetch
  const [timeLeft, setTimeLeft] = useState(600);   // 10-minute countdown timer (600 seconds)
  const [isFinished, setIsFinished] = useState(false); // Controls the result screen visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [openWrong, setOpenWrong] = useState({});
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;
  
  // --- FETCH QUESTIONS FROM API ---
  useEffect(() => {
    // Fetching 10 multiple-choice questions from OpenTDB
    fetch("https://opentdb.com/api.php?amount=10&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => {
          // Merge correct and incorrect answers and shuffle them
          const allChoices = [...q.incorrect_answers, q.correct_answer].sort(
            () => Math.random() - 0.5
          );
          return {
            question: q.question,
            choices: allChoices,
            correct: q.correct_answer,
          };
        });
        setQuestions(formatted);
        setLoading(false);
      });
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (timeLeft > 0 && !isFinished && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true); // Automatically finish exam when time is up
    }
  }, [timeLeft, isFinished, loading]);

  // --- HANDLER FUNCTIONS ---
  const handleSelect = (choiceIdx) => {
    const letter = ["A", "B", "C", "D", "E"][choiceIdx];
    setAnswers({ ...answers, [currentIdx]: letter });
  };

  const { showConfirm } = useModal();

  const finishExam = async () => {
    const confirmed = await showConfirm({ title: t('exam.finishExam'), message: t('exam.finishConfirm') });
    if (confirmed) {
      setIsFinished(true);
    }
  };

  const handleJumpToQuestion = (idx) => {
    setCurrentIdx(idx);
    setIsDrawerOpen(false); // Close drawer when a mobile user selects a question
  };

  // --- CONDITIONAL RENDERING: LOADING ---
  if (loading) return <div className="loading-screen">{t('exam.preparing')}</div>;

  // --- CONDITIONAL RENDERING: RESULT SCREEN ---
  if (isFinished) {
    const total = questions.length;
    let correct = 0;
    let answered = 0;
    const wrongList = [];

    questions.forEach((q, i) => {
      const userAnsLetter = answers[i];
      if (userAnsLetter) answered++;
      const correctIdx = q.choices.indexOf(q.correct);
      const correctLetter = ["A", "B", "C", "D", "E"][correctIdx];
      if (userAnsLetter === correctLetter) correct++;
      if (userAnsLetter && userAnsLetter !== correctLetter) {
        wrongList.push({ index: i, question: q.question, selected: userAnsLetter, correct: correctLetter, correctText: q.correct, choices: q.choices });
      }
    });

    const pct = Math.round((correct / total) * 100);

    return (
      <div className="home-wrapper">
        <div className="result-container">
          <div className="result-card result-card--modern">
            <div className="result-header">
              <h2>{t('exam.resultsTitle')}</h2>
              <div className="result-actions">
                <button className="cw-btn cw-btn-primary" onClick={() => window.location.reload()}>{t('exam.retry')}</button>
              </div>
            </div>

            <div className="score-section">
              <div className="score-circle large">
                <div className="score-number">{pct}<small>%</small></div>
                <div className="score-sub">{correct} / {total}</div>
              </div>

              <div className="score-details">
                <p className="result-text">{pct >= 60 ? t('exam.resultTextGood') : t('exam.resultTextBad')}</p>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                </div>

                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <div className="num">{correct}</div>
                    <div className="label">{t('exam.correct')}</div>
                  </div>
                  <div className="breakdown-item">
                    <div className="num">{wrongList.length}</div>
                    <div className="label">{t('exam.wrong')}</div>
                  </div>
                  <div className="breakdown-item">
                    <div className="num">{total - answered}</div>
                    <div className="label">{t('exam.unanswered')}</div>
                  </div>
                </div>
              </div>
            </div>

            {wrongList.length > 0 && (
              <button className="cw-btn cw-btn-secondary" onClick={() => setShowMistakeModal(true)}>
                {t('exam.viewMistakes', { count: wrongList.length })}
              </button>
            )}

            {showMistakeModal && createPortal(
              <div className="mistake-modal-overlay" onClick={() => setShowMistakeModal(false)}>
                <div className="mistake-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="mistake-modal-header">
                    <h2>{t('exam.reviewMistakes')}</h2>
                    <button className="close-btn" onClick={() => setShowMistakeModal(false)}>✕</button>
                  </div>
                  <div className="mistake-modal-body">
                    <div className="wrong-grid">
                      {wrongList.map((w) => (
                        <div key={w.index} className="wrong-card">
                          <div className="wrong-top">
                            <div className="wrong-bubble">{w.index + 1}</div>
                            <div className="wrong-q-text" dangerouslySetInnerHTML={{ __html: w.question }}></div>
                          </div>

                          <div className="wrong-meta">
                            <div className="meta-pill wrong-pill">{t('exam.your')}: {w.selected}</div>
                            <div className="meta-pill correct-pill">{t('exam.correct')}: {w.correct}</div>
                          </div>

                          <div className="wrong-actions">
                            <button className="cw-btn-ghost-full" onClick={() => setOpenWrong(prev => ({ ...prev, [w.index]: !prev[w.index] }))}>
                              {openWrong[w.index] ? `▼ ${t('exam.hideDetails')}` : `▶ ${t('exam.showDetails')}`}
                            </button>
                          </div>

                          <div className={`wrong-detail ${openWrong[w.index] ? 'open' : ''}`}>
                            <div className="choices-visual">
                              {w.choices.map((ch, ci) => {
                                const letter = ["A","B","C","D","E"][ci];
                                const isSelected = letter === w.selected;
                                const isCorrect = letter === w.correct;
                                return (
                                  <div key={ci} className={`choice-pill ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}>
                                    <strong>{letter})</strong>&nbsp;<span dangerouslySetInnerHTML={{ __html: ch }} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  // --- MAIN EXAM UI ---
  return (
    <div className="exam-page-wrapper">
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="exam-content-area">
        {/* CHANGE 1: Overlay moved here, inside the content area */}
        {isDrawerOpen && <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}></div>}

        <div className="exam-header-bar">
          <div className="timer-display">
            {t('exam.timeLeft', { minutes: Math.floor(timeLeft / 60), seconds: (timeLeft % 60).toString().padStart(2, '0') })}
          </div>
          <button className="finish-exam-btn" onClick={finishExam}>{t('exam.finishExam')}</button>
        </div>

        <div className="exam-main-layout">
          <div className="question-area">
            <div className="q-card">
              <span className="q-label">{t('exam.questionLabel', { num: currentIdx + 1 })}</span>
              <h2 dangerouslySetInnerHTML={{ __html: currentQ.question }}></h2>
              <div className="choices-list">
                {/* Note: API returns 4 choices, so keeping the array to 4 elements (A-D) is safer */}
                {currentQ.choices.map((choice, i) => (
                  <button
                    key={i}
                    className={`choice-item ${answers[currentIdx] === ["A", "B", "C", "D"][i] ? "active" : ""}`}
                    onClick={() => handleSelect(i)}
                    dangerouslySetInnerHTML={{ __html: `${["A", "B", "C", "D"][i]}) ${choice}` }}
                  />
                ))}
              </div>
            </div>

            <div className="nav-btns">
              <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}>{t('common.back')}</button>
              <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(currentIdx + 1)}>{t('common.next')}</button>
            </div>
          </div>

          <div className={`optical-sidebar ${isDrawerOpen ? "drawer-open" : ""}`}>
            <div className="optical-card">
              <div className="optical-grid-scroll">
                {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`opt-row ${currentIdx === i ? "current" : ""}`}
                    onClick={() => handleJumpToQuestion(i)} // On row click: jump to question and close drawer
                  >
                    <span className="opt-num">{i + 1}</span>
                    
                    {["A", "B", "C", "D"].map((letter) => (
                      <div
                        key={letter}
                        className={`opt-bubble ${answers[i] === letter ? "checked" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents the row click event
                          // CHANGE 2: Removed handleJump here; only marking occurs
                          setAnswers({ ...answers, [i]: letter });
                        }}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div 
        className={`floating-hub ${isDrawerOpen ? "active" : (isAllAnswered ? "completed" : "")}`} 
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      >
        <div className="hub-content">
          {/* Icon changes based on state: X when open, list when closed */}
          <span className="hub-icon">
            {isDrawerOpen ? "✕" : "📋"}
          </span>
          
          {!isDrawerOpen && (
            <span className="hub-status">{answeredCount}/{questions.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Exam;