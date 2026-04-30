import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV = [
  { href: '#gallery',   label: 'Gallery'   },
  { href: '#upload',    label: 'Upload'    },
  { href: '#guestbook', label: 'Guestbook' },
  { href: '#slideshow', label: 'Slideshow' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!e.target.closest('.nav-inner')) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#hero" className="nav-logo">
          <span>✦</span> Dr. Gutu
        </a>

        <button
          className={`nav-toggle${open ? ' open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-links${open ? ' open' : ''}`}>
          {NAV.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
