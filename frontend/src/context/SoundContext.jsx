/**
 * SoundContext — Web Audio API synth layer.
 *
 * No audio files needed — every sound is generated procedurally with tiny
 * oscillator + gain graphs. The AudioContext is created lazily on the first
 * sound call (browsers require a preceding user gesture).
 *
 * Provided sounds:
 *   playTick()   → soft sine pop for hover feedback
 *   playWhoosh() → filtered noise sweep for theme transitions
 *
 * State:
 *   muted / toggleMute() — persisted to localStorage (pp-muted)
 */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const SoundContext = createContext(null);

function makeAC() {
  if (typeof window === 'undefined') return null;
  return new (window.AudioContext || window.webkitAudioContext)();
}

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(
    () => localStorage.getItem('pp-muted') === 'true'
  );

  const acRef = useRef(null);

  /** Lazily initialise and resume the AudioContext. */
  const getAC = useCallback(() => {
    if (!acRef.current) acRef.current = makeAC();
    if (acRef.current?.state === 'suspended') acRef.current.resume();
    return acRef.current;
  }, []);

  // Unlock AudioContext on first click (Safari / strict auto-play policies).
  useEffect(() => {
    const unlock = () => getAC();
    window.addEventListener('click', unlock, { once: true });
    return () => window.removeEventListener('click', unlock);
  }, [getAC]);

  /** Short sine sweep — "pop / tick" for hover feedback. */
  const playTick = useCallback(() => {
    if (muted) return;
    try {
      const ac   = getAC();
      if (!ac) return;
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ac.currentTime + 0.06);
      gain.gain.setValueAtTime(0.07, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.09);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.09);
    } catch { /* AudioContext unavailable — silently skip */ }
  }, [muted, getAC]);

  /** Band-pass filtered noise sweep — atmospheric whoosh for theme switch. */
  const playWhoosh = useCallback(() => {
    if (muted) return;
    try {
      const ac  = getAC();
      if (!ac) return;
      const dur = 0.38;
      const sz  = Math.floor(ac.sampleRate * dur);
      const buf = ac.createBuffer(1, sz, ac.sampleRate);
      const dat = buf.getChannelData(0);
      for (let i = 0; i < sz; i++) dat[i] = Math.random() * 2 - 1;

      const noise  = ac.createBufferSource();
      noise.buffer = buf;

      const filter = ac.createBiquadFilter();
      filter.type  = 'bandpass';
      filter.frequency.setValueAtTime(900, ac.currentTime);
      filter.frequency.exponentialRampToValueAtTime(160, ac.currentTime + dur);
      filter.Q.value = 0.5;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.11, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      noise.start(ac.currentTime);
    } catch { /* silently skip */ }
  }, [muted, getAC]);

  /**
   * High-passed noise transient — mechanical keyboard click.
   * 12ms burst, high-pass filtered at 2800 Hz for bright "click" character.
   * Volume 0.10 — extremely subtle, satisfying, non-intrusive.
   */
  const playClick = useCallback(() => {
    if (muted) return;
    try {
      const ac  = getAC();
      if (!ac) return;
      const dur = 0.012;
      const sz  = Math.floor(ac.sampleRate * dur);
      const buf = ac.createBuffer(1, sz, ac.sampleRate);
      const dat = buf.getChannelData(0);
      // Decaying noise burst: sharp attack, quadratic decay
      for (let i = 0; i < sz; i++) dat[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sz, 2);

      const src = ac.createBufferSource();
      src.buffer = buf;

      const hpf           = ac.createBiquadFilter();
      hpf.type            = 'highpass';
      hpf.frequency.value = 2800; // strips low rumble → crisp click character

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.10, ac.currentTime);

      src.connect(hpf);
      hpf.connect(gain);
      gain.connect(ac.destination);
      src.start(ac.currentTime);
    } catch { /* silently skip */ }
  }, [muted, getAC]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem('pp-muted', String(next));
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playTick, playWhoosh, playClick }}>
      {children}
    </SoundContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be inside <SoundProvider>');
  return ctx;
}
