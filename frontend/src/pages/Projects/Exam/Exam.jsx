import { useState, useEffect } from "react";
import "./Exam.css";
import "../../../App.css"; // Global animations and layout styles

function Exam() {
  // --- STATE MANAGEMENT ---
  const [questions, setQuestions] = useState([]); // Stores formatted questions from API
  const [currentIdx, setCurrentIdx] = useState(0); // Index of the currently displayed question
  const [answers, setAnswers] = useState({});     // Stores user answers in {questionIndex: "A"} format
  const [loading, setLoading] = useState(true);    // Loading state for API fetch
  const [timeLeft, setTimeLeft] = useState(600);   // 10-minute countdown timer (600 seconds)
  const [isFinished, setIsFinished] = useState(false); // Controls the result screen visibility

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

  const finishExam = () => {
    if (window.confirm("Are you sure you want to finish the exam?")) {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const userAnsLetter = answers[i];
      const correctIdx = q.choices.indexOf(q.correct);
      const correctLetter = ["A", "B", "C", "D", "E"][correctIdx];
      if (userAnsLetter === correctLetter) correct++;
    });
    return correct;
  };

  // --- CONDITIONAL RENDERING: LOADING ---
  if (loading) return <div className="loading-screen">Preparing questions, please wait...</div>;

  // --- CONDITIONAL RENDERING: RESULT SCREEN ---
  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="home-wrapper">
        <div className="result-container review-mode">
          <div className="result-card">
            <h1>Exam Results</h1>
            
            <div className="score-circle">
              <span>{score} / {questions.length}</span>
            </div>

            <p className="result-text">
              {score >= (questions.length / 2) ? "Great Job! 🎉" : "Keep practicing! 📚"}
            </p>

            {/* ERROR ANALYSIS & REVIEW LIST */}
            <div className="review-list">
              {questions.map((q, i) => {
                const userAnsLetter = answers[i];
                const correctIdx = q.choices.indexOf(q.correct);
                const correctLetter = ["A", "B", "C", "D", "E"][correctIdx];
                const isCorrect = userAnsLetter === correctLetter;

                return (
                  <div key={i} className={`review-item ${isCorrect ? 'correct' : 'wrong'}`}>
                    <div className="review-header">
                      <strong>Question {i + 1}</strong>
                      <span className={`status-badge ${isCorrect ? 'c-bg' : 'w-bg'}`}>
                        {isCorrect ? "Correct" : "Wrong"}
                      </span>
                    </div>
                    
                    <p className="review-q-body" dangerouslySetInnerHTML={{ __html: q.question }}></p>
                    
                    <div className="review-details">
                      <div className="ans-box">
                        <small>Your Answer:</small>
                        <span className={isCorrect ? "text-success" : "text-danger"}>
                          {userAnsLetter ? `${userAnsLetter}) ` : "Not Answered"} 
                          {userAnsLetter && (
                            <span dangerouslySetInnerHTML={{ __html: q.choices[["A", "B", "C", "D", "E"].indexOf(userAnsLetter)] }}></span>
                          )}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="ans-box">
                          <small>Correct Answer:</small>
                          <span className="text-success">
                            {correctLetter}) <span dangerouslySetInnerHTML={{ __html: q.correct }}></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => window.location.reload()} className="restart-btn">
              Restart Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  // --- MAIN EXAM UI ---
  return (
    <div className="exam-page-wrapper">
      {/* Background visual effects */}
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="exam-content-area">
        {/* TOP BAR: Timer and Finish Button */}
        <div className="exam-header-bar">
          <div className="timer-display">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button className="finish-exam-btn" onClick={finishExam}>Finish Exam</button>
        </div>

        <div className="exam-main-layout">
          {/* LEFT SECTION: Question and Choices */}
          <div className="question-area">
            <div className="q-card">
              <span className="q-label">Question {currentIdx + 1}</span>
              <h2 dangerouslySetInnerHTML={{ __html: currentQ.question }}></h2>
              <div className="choices-list">
                {currentQ.choices.map((choice, i) => (
                  <button
                    key={i}
                    className={`choice-item ${answers[currentIdx] === ["A", "B", "C", "D", "E"][i] ? "active" : ""}`}
                    onClick={() => handleSelect(i)}
                    dangerouslySetInnerHTML={{ __html: `${["A", "B", "C", "D", "E"][i]}) ${choice}` }}
                  />
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="nav-btns">
              <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}>Back</button>
              <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(currentIdx + 1)}>Next</button>
            </div>
          </div>

          {/* RIGHT SECTION: Optical Form Sidebar */}
          <div className="optical-sidebar">
            <div className="optical-card">
              <h3>Optical Form</h3>
              <div className="optical-grid-scroll">
                {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`opt-row ${currentIdx === i ? "current" : ""}`}
                    onClick={() => setCurrentIdx(i)}
                  >
                    <span className="opt-num">{i + 1}</span>
                    
                    {["A", "B", "C", "D"].map((letter) => (
                      <div
                        key={letter}
                        className={`opt-bubble ${answers[i] === letter ? "checked" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from triggering twice
                          setCurrentIdx(i);
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
    </div>
  );
}

export default Exam;