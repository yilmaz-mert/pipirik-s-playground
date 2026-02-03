import { useState, useEffect, useCallback } from "react";
import "./Hangman.css";

function Hangman() {
  const [word, setWord] = useState(""); // Başlangıçta kelime boş
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [flashState, setFlashState] = useState('none');
  const [isLoading, setIsLoading] = useState(true); // Kelime yükleniyor mu?

  // API'den yeni kelime çeken fonksiyon
  const fetchNewWord = useCallback(async () => {
    setIsLoading(true);
    try {
      // Rastgele bir uzunluk seçiyoruz (örneğin 5 ile 8 harf arası)
      const randomLength = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
      
      // API'ye bu uzunluk bilgisini gönderiyoruz
      const response = await fetch(`https://random-word-api.herokuapp.com/word?number=1&length=${randomLength}`);
      
      const data = await response.json();
      setWord(data[0].toUpperCase());
      setGuessedLetters([]);
      setMistakes(0);
      setFlashState('none');
    } catch (error) {
      console.error("Kelime çekilemedi:", error);
      setWord("REACT"); 
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Sayfa ilk açıldığında kelimeyi çek
  useEffect(() => {
    fetchNewWord();
  }, [fetchNewWord]);

  const resetGame = () => {
    fetchNewWord();
  };

  useEffect(() => {
    if (import.meta.env.PROD) {
      console.log("%cNo cheating, Pipirik is watching you! 👀", "color: #06b6d4; font-size: 20px; font-weight: bold;");
    }
  }, []);

  const isWinner = word && word.split("").every((l) => guessedLetters.includes(l));
  const isLoser = mistakes >= 6;

  const handleGuess = useCallback((letter) => {
    if (isWinner || isLoser || guessedLetters.includes(letter) || !word) return;

    if (word.includes(letter)) {
      setFlashState('correct');
    } else {
      setMistakes((prev) => prev + 1);
      setFlashState('incorrect');
    }

    setGuessedLetters((prev) => [...prev, letter]);

    setTimeout(() => {
      setFlashState('none');
    }, 1000);

  }, [word, guessedLetters, isWinner, isLoser]);

  // Klavye desteği
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase(); // İngilizce standart büyük harf
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // İngilizce Q Klavye dizisi
      if (alphabet.includes(key)) handleGuess(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGuess]);

  const renderPipirik = () => {
    return (
      <div className="hangman-drawing-container">
        <div className="gallows-pole"></div>
        <div className="gallows-top"></div>
        <div className="gallows-rope"></div>

        <div className={`pipirik-part pipirik-head ${mistakes >= 1 ? 'visible' : ''}`}>
          {isLoser && <div className="dead-eyes"><span>X</span><span>X</span></div>}
        </div>

        <div className={`pipirik-part pipirik-body ${mistakes >= 2 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-arm-left ${mistakes >= 3 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-arm-right ${mistakes >= 4 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-leg-left ${mistakes >= 5 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-leg-right ${mistakes >= 6 ? 'visible' : ''}`}></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="home-wrapper">
        <h1 className="hero-title">Loading <span>Word...</span></h1>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className={`hangman-wrapper ${flashState === 'correct' ? 'flash-green' : ''} ${flashState === 'incorrect' ? 'flash-red' : ''}`}>
        <h1 className="hero-title"> <span>Hangman</span></h1>
        
        <div className="game-message-area">
          {isWinner && <h2 className="win-msg">🎉 Splendid! You saved him.</h2>}
          {isLoser && <h2 className="lose-msg">💀 Mission Failed. Word: {word}</h2>}
        </div>

        {renderPipirik()}

        <div className="word-slots-container">
          {word.split("").map((l, i) => (
            <span key={i} className="slot">
              {guessedLetters.includes(l) ? l : "_"}
            </span>
          ))}
        </div>

        <div className="keyboard">
          {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((l) => (
            <button
              key={l}
              onClick={() => handleGuess(l)}
              disabled={guessedLetters.includes(l) || isWinner || isLoser}
              className={guessedLetters.includes(l) ? (word.includes(l) ? 'btn-correct' : 'btn-wrong') : ''}
            >
              {l}
            </button>
          ))}
        </div>

        <button className="reset-btn" onClick={resetGame}>New Game</button>
      </div>
    </div>
  );
}

export default Hangman;