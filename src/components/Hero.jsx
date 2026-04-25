import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Images, Heart } from 'lucide-react';

const PHRASES = [
  'Congratulations, Doctor! 🎓',
  'May 10, 2026 — The Dream is Real ✨',
  'Years of Hard Work, One Glorious Day',
  'We Are So Proud of You ❤️',
];

function useTyping() {
  const [text, setText] = useState('');

  useEffect(() => {
    let pIdx = 0, cIdx = 0, deleting = false, timer;

    function tick() {
      const phrase = PHRASES[pIdx];
      if (deleting) {
        setText(phrase.slice(0, cIdx - 1));
        cIdx--;
        if (cIdx === 0) {
          deleting = false;
          pIdx = (pIdx + 1) % PHRASES.length;
          timer = setTimeout(tick, 500);
          return;
        }
      } else {
        setText(phrase.slice(0, cIdx + 1));
        cIdx++;
        if (cIdx === phrase.length) {
          deleting = true;
          timer = setTimeout(tick, 3200);
          return;
        }
      }
      timer = setTimeout(tick, deleting ? 42 : 72);
    }

    const start = setTimeout(tick, 1400);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, []);

  return text;
}

export default function Hero() {
  const typing = useTyping();

  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left:     `${Math.random() * 100}%`,
      duration: `${(Math.random() * 14 + 10).toFixed(1)}s`,
      delay:    `${(Math.random() * 14).toFixed(1)}s`,
      size:     `${(Math.random() * 2.5 + 1).toFixed(1)}px`,
    })), []);

  const fade = (delay) => ({
    initial:    { opacity: 0, y: 24 },
    animate:    { opacity: 1, y: 0  },
    transition: { duration: 0.75, delay, ease: [0.4, 0, 0.2, 1] },
  });

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" />

      <div className="hero-particles" aria-hidden>
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left:              p.left,
              width:             p.size,
              height:            p.size,
              animationDuration: p.duration,
              animationDelay:    p.delay,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <motion.p className="hero-date" {...fade(0.3)}>
          May 10, 2026
        </motion.p>

        <motion.h1 className="hero-title" {...fade(0.5)}>
          <span className="hero-prefix">Dr.</span>
          <span className="hero-name">Gutu Amanuel</span>
        </motion.h1>

        <motion.p className="hero-typing" {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.7 } }}>
          {typing}<span className="cursor" aria-hidden>|</span>
        </motion.p>

        <motion.p className="hero-tagline" {...fade(0.9)}>
          A journey of dedication, sacrifice, and triumph
        </motion.p>

        <motion.div className="hero-btns" {...fade(1.1)}>
          <a href="#gallery"   className="btn btn-primary">
            <Images size={18} /> View Memories
          </a>
          <a href="#guestbook" className="btn btn-outline">
            <Heart  size={18} /> Leave a Message
          </a>
        </motion.div>
      </div>

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        aria-hidden
      >
        <span>Scroll to explore</span>
        <div className="scroll-line" />
      </motion.div>
    </section>
  );
}
