import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, BookOpen, Award, Heart } from 'lucide-react';
import { TIMELINE } from '../data';

const STATS = [
  { icon: GraduationCap, num: 6,   suffix: '+', label: 'Years of Study'    },
  { icon: BookOpen,      num: 50,  suffix: '+', label: 'Research Papers'   },
  { icon: Award,         num: 12,  suffix: '',  label: 'Awards & Honours'  },
  { icon: Heart,         num: 100, suffix: '+', label: 'Hearts Inspired'   },
];

function Counter({ target, suffix }) {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else                 { setCount(Math.floor(start)); }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div className="stat-num" ref={ref}>
      {count}{inView ? suffix : ''}
    </div>
  );
}

function TlItem({ item, idx }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const even   = idx % 2 === 1;

  return (
    <div
      ref={ref}
      className="tl-item"
      style={{
        opacity:   inView ? 1 : 0,
        transform: inView
          ? 'translateX(0)'
          : `translateX(${even ? '30px' : '-30px'})`,
        transition: `opacity 0.6s ease ${idx * 0.1}s, transform 0.6s ease ${idx * 0.1}s`,
      }}
    >
      <div className={`tl-dot${item.gold ? ' gold' : ''}`} />
      <div className={`tl-card${item.gold ? ' gold' : ''}`}>
        <div className="tl-year">{item.year}</div>
        <h3 className="tl-heading">{item.title}</h3>
        <p className="tl-text">{item.text}</p>
      </div>
    </div>
  );
}

export default function Highlights() {
  return (
    <section className="section section-alt" id="highlights">
      <div className="container">
        <div className="s-head">
          <p className="s-eye">The Journey</p>
          <h2 className="s-title">Achievements & Milestones</h2>
          <p className="s-sub">From humble beginnings to extraordinary heights</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {STATS.map(({ icon: Icon, num, suffix, label }, i) => (
            <motion.div
              key={label}
              className="stat-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="stat-icon"><Icon size={32} /></div>
              <Counter target={num} suffix={suffix} />
              <div className="stat-lbl">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="timeline">
          <div className="tl-line" aria-hidden />
          {TIMELINE.map((item, idx) => (
            <TlItem key={item.year} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
