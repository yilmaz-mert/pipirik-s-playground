import { useState, useEffect, useCallback } from "react";
import "./Hangman.css";

function Hangman() {
  /* --- STATE MANAGEMENT --- */
  
  // The target word to be guessed
  const [word, setWord] = useState(""); 
  // Array of letters the user has clicked or typed
  const [guessedLetters, setGuessedLetters] = useState([]);
  // Count of incorrect guesses
  const [mistakes, setMistakes] = useState(0);
  // Controls UI feedback animations ('none', 'correct', or 'incorrect')
  const [flashState, setFlashState] = useState('none');
  // Loading state for the API request
  const [isLoading, setIsLoading] = useState(true);

  /* --- API INTEGRATION --- */

  // Function to fetch a random word from an external API
  const fetchNewWord = useCallback(async () => {
    setIsLoading(true);
    try {
      // Generate a random length between 5 and 8 characters for variety
      const randomLength = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
      
      // Fetch request to the random word API with the specified length
      const response = await fetch(`https://random-word-api.herokuapp.com/word?number=1&length=${randomLength}`);
      
      const data = await response.json();
      // Set the word to uppercase for consistent comparison
      setWord(data[0].toUpperCase());
      // Reset game states for the new round
      setGuessedLetters([]);
      setMistakes(0);
      setFlashState('none');
    } catch (error) {
      console.error("Failed to fetch word:", error);
      // Fallback word in case the API is down
      setWord("REACT"); 
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch a word when the component first mounts
  useEffect(() => {
    fetchNewWord();
  }, [fetchNewWord]);

  // Wrapper for the reset button
  const resetGame = () => {
    fetchNewWord();
  };

  // Easter egg: Console message for curious users in production
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.log("%cNo cheating, Pipirik is watching you! 👀", "color: #06b6d4; font-size: 20px; font-weight: bold;");
    }
  }, []);

  /* --- GAME LOGIC --- */

  // Derived state: User wins if every letter in the word is in the guessedLetters array
  const isWinner = word && word.split("").every((l) => guessedLetters.includes(l));
  
  // Derived state: User loses if they reach 6 mistakes (matching the 6 body parts)
  const isLoser = mistakes >= 6;

  // Primary function to handle a letter guess
  const handleGuess = useCallback((letter) => {
    // Prevent action if game is over, letter was already guessed, or word isn't loaded
    if (isWinner || isLoser || guessedLetters.includes(letter) || !word) return;

    if (word.includes(letter)) {
      // Trigger green flash for correct guess
      setFlashState('correct');
    } else {
      // Increment mistake count and trigger red flash
      setMistakes((prev) => prev + 1);
      setFlashState('incorrect');
    }

    // Add the letter to the history of guessed letters
    setGuessedLetters((prev) => [...prev, letter]);

    // Reset the flash animation state after 1 second
    setTimeout(() => {
      setFlashState('none');
    }, 1000);

  }, [word, guessedLetters, isWinner, isLoser]);

  /* --- KEYBOARD SUPPORT --- */

  // Listen for physical keyboard presses
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      // If the pressed key is a valid letter, process the guess
      if (alphabet.includes(key)) handleGuess(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    // Cleanup listener when component unmounts to prevent memory leaks
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGuess]);

  /* --- RENDER HELPERS --- */

  // Logic to progressively show Pipirik's body parts based on mistake count
  const renderPipirik = () => {
    return (
      <div className="hangman-drawing-container">
        {/* Static gallows elements */}
        <div className="gallows-pole"></div>
        <div className="gallows-top"></div>
        <div className="gallows-rope"></div>

        {/* Head and 'X' eyes appear on the first mistake and game over respectively */}
        <div className={`pipirik-part pipirik-head ${mistakes >= 1 ? 'visible' : ''}`}>
          {isLoser && <div className="dead-eyes"><span>X</span><span>X</span></div>}
        </div>

        {/* Sequential body parts linked to mistake count */}
        <div className={`pipirik-part pipirik-body ${mistakes >= 2 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-arm-left ${mistakes >= 3 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-arm-right ${mistakes >= 4 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-leg-left ${mistakes >= 5 ? 'visible' : ''}`}></div>
        <div className={`pipirik-part pipirik-leg-right ${mistakes >= 6 ? 'visible' : ''}`}></div>
      </div>
    );
  };

  // Show a simple loading screen while the API call is in progress
  if (isLoading) {
    return (
      <div className="home-wrapper">
        <h1 className="hero-title">Loading <span>Word...</span></h1>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      {/* Background decoration consistent with other pages */}
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      {/* Main card with dynamic classes for win/loss flash effects */}
      <div className={`hangman-wrapper ${flashState === 'correct' ? 'flash-green' : ''} ${flashState === 'incorrect' ? 'flash-red' : ''}`}>
        <h1 className="hero-title"> <span>Hangman</span></h1>
        
        {/* Status Message Display */}
        <div className="game-message-area">
          {isWinner && <h2 className="win-msg">🎉 Splendid! You saved him.</h2>}
          {isLoser && <h2 className="lose-msg">💀 Mission Failed. Word: {word}</h2>}
        </div>

        {renderPipirik()}

        {/* Word Display: Shows letters or underscores */}
        <div className="word-slots-container">
          {word.split("").map((l, i) => (
            <span key={i} className="slot">
              {guessedLetters.includes(l) ? l : "_"}
            </span>
          ))}
        </div>

        {/* Virtual Keyboard: Standard QWERTY layout */}
        <div className="keyboard">
          {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((l) => (
            <button
              key={l}
              onClick={() => handleGuess(l)}
              // Disable button if already guessed or game is finished
              disabled={guessedLetters.includes(l) || isWinner || isLoser}
              // Conditional styling for correct/wrong buttons
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