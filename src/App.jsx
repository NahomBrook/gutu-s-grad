import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar       from './components/Navbar';
import Hero         from './components/Hero';
import Gallery      from './components/Gallery';
import Upload       from './components/Upload';
import Guestbook    from './components/Guestbook';
import Slideshow    from './components/Slideshow';
import Share        from './components/Share';
import Footer       from './components/Footer';
import MusicToggle  from './components/MusicToggle';
import Toast        from './components/Toast';

export default function App() {
  const [toast, setToast] = useState({ show: false, msg: '' });
  const timerRef = useRef(null);

  const showToast = (msg, ms = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, msg });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), ms);
  };

  useEffect(() => {
    if (sessionStorage.getItem('confetti-done')) return;
    sessionStorage.setItem('confetti-done', '1');
    const fire = (opts) => confetti({ spread: 80, startVelocity: 40, ...opts });
    setTimeout(() => {
      fire({ particleCount: 80, origin: { x: 0.2, y: 0.55 }, colors: ['#c9a84c','#e8c970','#fff'] });
      fire({ particleCount: 80, origin: { x: 0.8, y: 0.55 }, colors: ['#c9a84c','#e8c970','#fff'] });
      fire({ particleCount: 60, origin: { x: 0.5, y: 0.4  }, colors: ['#ffd700','#ffec80','#c9a84c'] });
    }, 800);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Gallery    showToast={showToast} />
        <Upload     showToast={showToast} />
        <Guestbook  showToast={showToast} />
        <Slideshow />
        <Share      showToast={showToast} />
        <Footer />
      </main>
      <MusicToggle />
      <Toast show={toast.show} msg={toast.msg} />
    </>
  );
}
