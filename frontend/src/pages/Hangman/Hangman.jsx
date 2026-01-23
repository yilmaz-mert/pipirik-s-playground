import { useState, useEffect, useCallback } from "react";
import "./Hangman.css";

const WORDS = ["REACT", "FRONTEND", "COMPONENT", "ROUTER", "JAVASCRIPT"];

function Hangman() {
  // Kelimeyi başlangıçta bir kez seçiyoruz
  const [word] = useState(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    return WORDS[randomIndex];
  });
  
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);

  const [flashState, setFlashState] = useState('none');

  const isWinner = word.split("").every((l) => guessedLetters.includes(l));
  const isLoser = mistakes >= 6;

  // Harf tahmin etme fonksiyonu (useCallback ile hafızaya alıyoruz)
  const handleGuess = useCallback((letter) => {
    // Oyun bittiyse veya harf zaten seçildiyse işlem yapma
    if (isWinner || isLoser || guessedLetters.includes(letter)) return;

    if (word.includes(letter)) {
      // Doğru tahmin
      setFlashState('correct');
    } else {
      // Yanlış tahmin
      setMistakes((prev) => prev + 1);
      setFlashState('incorrect');
    }

    // Harfi denenenler listesine ekle
    setGuessedLetters((prev) => [...prev, letter]);

    setTimeout(() => {
      setFlashState('none');
    }, 1000);

  }, [word, guessedLetters, isWinner, isLoser]);

  // Fiziksel klavye dinleyicisi
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLocaleUpperCase('tr-TR');
      const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

      if (alphabet.includes(key)) {
        handleGuess(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGuess]);

  useEffect(() => {
  // Önce tüm olası sınıfları temizleyelim
  document.body.classList.remove('flash-correct', 'flash-incorrect', 'final-win', 'final-lose');

  if (isWinner) {
    // Kazanınca kalıcı yeşil
    document.body.classList.add('final-win');
  } else if (isLoser) {
    // Kaybedince kalıcı kırmızı
    document.body.classList.add('final-lose');
  } else if (flashState === 'correct') {
    // Oyun sürerken doğru tahmin efekti
    document.body.classList.add('flash-correct');
  } else if (flashState === 'incorrect') {
    // Oyun sürerken yanlış tahmin efekti
    document.body.classList.add('flash-incorrect');
  }

  return () => {
    document.body.classList.remove('flash-correct', 'flash-incorrect', 'final-win', 'final-lose');
  };
}, [isWinner, isLoser, flashState]);

  // Pipirik (Adam Asmaca) Çizimi
  const renderPipirik = () => {
    return (
      <div className="hangman-drawing-container">
        <div className="gallows-pole"></div>
        <div className="gallows-top"></div>
        <div className="gallows-rope"></div>

        <div className={`pipirik-part pipirik-head ${mistakes >= 1 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-body ${mistakes >= 2 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-arm-left ${mistakes >= 3 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-arm-right ${mistakes >= 4 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-leg-left ${mistakes >= 5 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-leg-right ${mistakes >= 6 ? 'visible' : ''}`}></div>
      </div>
    );
  };

  return (
    <div className="hangman-wrapper">
      <h1>Adam Asmaca</h1>
      
      {renderPipirik()}

      <div className="word-slots">
        {word.split("").map((l, i) => (
          <span key={i} className="slot">
            {guessedLetters.includes(l) ? l : "_"}
          </span>
        ))}
      </div>

      <div className="keyboard">
        {"ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("").map((l) => (
          <button
            key={l}
            onClick={() => handleGuess(l)}
            disabled={guessedLetters.includes(l) || isWinner || isLoser}
            // İsteğe bağlı: Doğru/yanlış tuşları da renklendirebiliriz
            className={guessedLetters.includes(l) ? (word.includes(l) ? 'btn-correct' : 'btn-wrong') : ''}
          >
            {l}
          </button>
        ))}
      </div>

      {isWinner && <h2 className="win-msg">🎉 Kazandın!</h2>}
      {isLoser && <h2 className="lose-msg">💀 Kaybettin! Kelime: {word}</h2>}

      <button className="reset-btn" onClick={() => window.location.reload()}>
        Tekrar Dene
      </button>
    </div>
  );
}

export default Hangman;