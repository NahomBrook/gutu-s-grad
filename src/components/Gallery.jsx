import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox      from 'yet-another-react-lightbox';
import Fullscreen    from 'yet-another-react-lightbox/plugins/fullscreen';
import Download      from 'yet-another-react-lightbox/plugins/download';
import Thumbnails    from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { GALLERY_IMAGES } from '../data';

const CATS = ['all', 'ceremony', 'family', 'friends', 'celebration'];
const CAP  = s => s.charAt(0).toUpperCase() + s.slice(1);

export default function Gallery({ showToast }) {
  const [filter,  setFilter]  = useState('all');
  const [lbOpen,  setLbOpen]  = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const filtered = filter === 'all'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(i => i.category === filter);

  const slides = filtered.map(img => ({
    src:  img.realSrc || img.svgSrc,
    alt:  img.label,
    downloadUrl:    img.realSrc || img.svgSrc,
    downloadFilename: img.label,
  }));

  const openAt = (idx) => { setLbIndex(idx); setLbOpen(true); };

  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="s-head">
          <p className="s-eye">Captured Moments</p>
          <h2 className="s-title">Photo Gallery</h2>
          <p className="s-sub">Relive the beautiful moments from the graduation celebration</p>
        </div>

        <div className="gallery-filters">
          {CATS.map(cat => (
            <button
              key={cat}
              className={`filter-btn${filter === cat ? ' active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Photos' : CAP(cat)}
            </button>
          ))}
        </div>

        <motion.div layout className="gallery-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((img, idx) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.28 }}
                className="g-item"
                onClick={() => openAt(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openAt(idx)}
                aria-label={`Open photo: ${img.label}`}
              >
                {/* Gradient placeholder — always visible */}
                <div
                  className="g-placeholder"
                  style={{ background: img.gradient }}
                >
                  <span className="g-emoji" aria-hidden>{img.emoji}</span>
                </div>

                {/* Real image overlaid on top if provided */}
                {img.realSrc && (
                  <img
                    src={img.realSrc}
                    alt={img.label}
                    className="g-img-real"
                    loading="lazy"
                    onError={e => { e.target.style.opacity = '0'; }}
                  />
                )}

                <div className="g-overlay" aria-hidden>
                  <div>
                    <div className="g-label">{img.label}</div>
                    <div className="g-cat">{img.category}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <Lightbox
          open={lbOpen}
          close={() => setLbOpen(false)}
          index={lbIndex}
          slides={slides}
          plugins={[Fullscreen, Download, Thumbnails]}
          styles={{
            container: { backgroundColor: 'rgba(0,0,0,0.97)' },
          }}
        />
      </div>
    </section>
  );
}
