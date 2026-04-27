import { useState, useRef, useEffect } from 'react';
import { Music, Music2 } from 'lucide-react';

const VIDEO_ID = 'R2qLIm-dzjQ';

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const playerRef  = useRef(null);
  const readyRef   = useRef(false);
  const pendingRef = useRef(false); // play as soon as player is ready

  useEffect(() => {
    // Inject YouTube IFrame API script once
    if (!document.getElementById('yt-iframe-api')) {
      const tag    = document.createElement('script');
      tag.id       = 'yt-iframe-api';
      tag.src      = 'https://www.youtube.com/iframe_api';
      tag.async    = true;
      document.head.appendChild(tag);
    }

    function createPlayer() {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player('yt-player-anchor', {
        videoId:    VIDEO_ID,
        height:     '1',
        width:      '1',
        playerVars: {
          autoplay:        0,
          controls:        0,
          disablekb:       1,
          fs:              0,
          iv_load_policy:  3,
          loop:            1,
          playlist:        VIDEO_ID, // required for loop
          modestbranding:  1,
          rel:             0,
          playsinline:     1,
          origin:          window.location.origin, // required to fix cross-origin postMessage errors
        },
        events: {
          onReady() {
            readyRef.current = true;
            if (pendingRef.current) {
              pendingRef.current = false;
              playerRef.current.setVolume(70);
              playerRef.current.playVideo();
            }
          },
          onStateChange(e) {
            // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
            setPlaying(e.data === 1);
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        createPlayer();
      };
    }

    // Auto-start on the first user interaction (required by browsers)
    const EVENTS = ['click', 'scroll', 'keydown', 'touchstart'];
    let fired = false;

    function onFirstGesture() {
      if (fired) return;
      fired = true;
      EVENTS.forEach(ev => window.removeEventListener(ev, onFirstGesture));

      if (readyRef.current && playerRef.current) {
        playerRef.current.setVolume(70);
        playerRef.current.playVideo();
      } else {
        pendingRef.current = true;
      }
    }

    EVENTS.forEach(ev =>
      window.addEventListener(ev, onFirstGesture, { once: true, passive: true })
    );

    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, onFirstGesture));
    };
  }, []);

  const toggle = () => {
    if (!playerRef.current || !readyRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <>
      {/* Hidden anchor div — YouTube IFrame API replaces this with an iframe */}
      <div
        id="yt-player-anchor"
        style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: 1, height: 1 }}
        aria-hidden
      />
      <button
        className={`music-btn${playing ? ' playing' : ''}`}
        onClick={toggle}
        title={playing ? 'Pause music' : 'Play graduation music'}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
      >
        {playing ? <Music2 size={20} /> : <Music size={20} />}
      </button>
    </>
  );
}
