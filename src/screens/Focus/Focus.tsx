import { useState, useEffect, useRef } from 'react';
import './Focus.css';

export default function Focus() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    pause();
    setSeconds(25 * 60);
  };

  useEffect(() => {
    if (seconds <= 0) {
      pause();
    }
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="focus-container">
      <h2 className="focus-title">Enfoque (Pomodoro)</h2>

      <div className="timer-circle">
        <span>
          {minutes.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="focus-buttons">
        {!running ? (
          <button className="focus-btn start" onClick={start}>
            Iniciar
          </button>
        ) : (
          <button className="focus-btn pause" onClick={pause}>
            Pausar
          </button>
        )}

        <button className="focus-btn reset" onClick={reset}>
          Reiniciar
        </button>
      </div>
    </div>
  );
}
