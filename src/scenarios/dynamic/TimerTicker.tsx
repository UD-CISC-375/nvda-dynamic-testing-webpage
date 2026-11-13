import { useEffect, useRef, useState } from 'react';
import { ScenarioProps } from '../types';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function useTimer(intervalMs: number) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const step = intervalMs > 0 ? intervalMs : 1000;
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, step);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [running, intervalMs]);

  const start = () => setRunning(true);
  const stop = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setSeconds(0);
  };

  return { seconds, start, stop, reset };
}

export function Accessible({ delay }: ScenarioProps) {
  const { seconds, start, stop, reset } = useTimer(delay);

  return (
    <>
      <div className="controls">
        <button type="button" className="btn" data-testid="trigger" onClick={start}>
          Start timer
        </button>
        <button type="button" className="btn" onClick={stop}>
          Stop
        </button>
        <button type="button" className="btn" onClick={reset}>
          Reset
        </button>
      </div>
      <section aria-labelledby="timer-heading">
        <h2 id="timer-heading">Elapsed time</h2>
        <output
          data-testid="timer"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Elapsed Time Counter"
        >
          {formatTime(seconds)}
        </output>
      </section>
    </>
  );
}

export function Broken({ delay }: ScenarioProps) {
  const { seconds, start, stop, reset } = useTimer(delay);

  return (
    <>
      <div className="controls">
        {/* Non-semantic divs without role or tabindex */}
        <div className="btn" data-testid="trigger" onClick={start}>
          Start timer
        </div>
        {/* Button with no accessible name */}
        <button type="button" className="btn" aria-label="" onClick={stop} />
        <div className="btn" onClick={reset}>
          Reset
        </div>
      </div>
      <section>
        <h2>Elapsed time</h2>
        {/* Plain div with no timer role or live region */}
        <div data-testid="timer">{formatTime(seconds)}</div>
      </section>
    </>
  );
}