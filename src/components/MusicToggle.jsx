import { useState, useRef, useEffect } from 'react';
import { Music, Music2 } from 'lucide-react';
import { createPianoPlayer } from '../lib/piano';

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const player  = useRef(null);
  const started = useRef(false);

  // Auto-start on the very first user gesture (browsers require it for AudioContext)
  useEffect(() => {
    const EVENTS = ['click', 'scroll', 'keydown', 'touchstart'];

    const onFirstGesture = () => {
      if (started.current) return;
      started.current = true;
      EVENTS.forEach(e => window.removeEventListener(e, onFirstGesture));
      player.current = createPianoPlayer();
      player.current.start();
      setPlaying(true);
    };

    EVENTS.forEach(e =>
      window.addEventListener(e, onFirstGesture, { once: true, passive: true })
    );

    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, onFirstGesture));
    };
  }, []);

  const toggle = () => {
    started.current = true; // prevent double-start from the gesture listener
    if (playing) {
      player.current?.stop();
      player.current = null;
      setPlaying(false);
    } else {
      player.current = createPianoPlayer();
      player.current.start();
      setPlaying(true);
    }
  };

  return (
    <button
      className={`music-btn${playing ? ' playing' : ''}`}
      onClick={toggle}
      title={playing ? 'Pause piano music' : 'Play graduation piano music'}
      aria-label={playing ? 'Pause music' : 'Play music'}
      aria-pressed={playing}
    >
      {playing ? <Music2 size={20} /> : <Music size={20} />}
    </button>
  );
}
