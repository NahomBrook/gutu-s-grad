import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Users, X, Upload as UploadIcon } from 'lucide-react';
import Lightbox  from 'yet-another-react-lightbox';
import Download  from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';

const LS_KEY     = 'grad-uploads-v3';
const MAX_STORED = 30;

// ── helpers ──────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function toItem(row) {
  return {
    id:      String(row.id),
    src:     row.thumbnail || row.src,
    by:      row.uploader  || row.by,
    at:      row.created_at || row.at,
    pending: row.pending || false,
  };
}

function lsRead() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
}
function lsWrite(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_STORED))); } catch {}
}

function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1000;
      let { width, height } = img;
      if (width > height) {
        if (width  > MAX) { height = Math.round(height * MAX / width);  width  = MAX; }
      } else {
        if (height > MAX) { width  = Math.round(width  * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ── component ──────────────────────────────────────────────────────────────
export default function Upload({ showToast }) {
  const [files,     setFiles]     = useState([]);
  const [previews,  setPreviews]  = useState([]);
  const [name,      setName]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [community, setCommunity] = useState(lsRead);
  const [lbOpen,    setLbOpen]    = useState(false);
  const [lbIndex,   setLbIndex]   = useState(0);

  // Merge DB items with any pending (unconfirmed) local uploads
  const mergeWithDb = useCallback((dbItems) => {
    setCommunity(prev => {
      const dbIds   = new Set(dbItems.map(i => i.id));
      const pending = prev.filter(i => i.pending && !dbIds.has(i.id));
      const merged  = [...pending, ...dbItems];
      lsWrite(merged);
      return merged;
    });
  }, []);

  // Fetch from API and retry any pending uploads
  const sync = useCallback(async () => {
    try {
      const res = await fetch('/api/upload');
      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows)) return;
      mergeWithDb(rows.map(toItem));

      // Retry pending uploads that never reached the DB
      setCommunity(prev => {
        prev.filter(i => i.pending).forEach(item => {
          fetch('/api/upload', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name: item.by, image: item.src }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(row => {
              if (!row) return;
              const confirmed = toItem(row);
              setCommunity(cur => {
                const next = cur.map(x => x.id === item.id ? confirmed : x);
                lsWrite(next);
                return next;
              });
            })
            .catch(() => {});
        });
        return prev;
      });
    } catch {}
  }, [mergeWithDb]);

  useEffect(() => {
    sync();
    const id = setInterval(sync, 30_000);
    return () => clearInterval(id);
  }, [sync]);

  // ── dropzone ─────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) showToast('Some files skipped — images under 10 MB only');
    setFiles(f => [...f, ...accepted]);
    setPreviews(p => [...p, ...accepted.map(f => URL.createObjectURL(f))]);
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:  { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    onDrop,
  });

  const remove = idx => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(f  => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!files.length) return;
    setLoading(true);
    const uploader = name.trim() || 'Anonymous';

    for (const file of files) {
      const image = await compressImage(file);
      if (!image) continue;

      const tempId   = `pending-${Date.now()}-${Math.random()}`;
      const tempItem = { id: tempId, src: image, by: uploader, at: new Date().toISOString(), pending: true };

      // 1. Show immediately + persist locally
      setCommunity(prev => { const next = [tempItem, ...prev]; lsWrite(next); return next; });

      // 2. Save to DB
      fetch('/api/upload', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: uploader, image }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(row => {
          if (!row) return; // stays pending, sync() will retry
          const confirmed = toItem(row);
          setCommunity(prev => {
            const next = prev.map(x => x.id === tempId ? confirmed : x);
            lsWrite(next);
            return next;
          });
        })
        .catch(() => {});
    }

    previews.forEach(u => URL.revokeObjectURL(u));
    setFiles([]); setPreviews([]); setName('');
    setLoading(false);
    showToast(`${files.length} photo${files.length > 1 ? 's' : ''} shared! 🎉`);
  };

  const slides = community.map(c => ({ src: c.src, alt: `Shared by ${c.by}` }));

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <section className="section section-alt" id="upload">
      <div className="container">
        <div className="s-head">
          <p className="s-eye">Share Your Memories</p>
          <h2 className="s-title">Upload Photos</h2>
          <p className="s-sub">Add your special moments to our community gallery</p>
        </div>

        <div className="upload-wrap">
          <div
            {...getRootProps()}
            className={`upload-zone${isDragActive ? ' over' : ''}`}
            role="button"
            aria-label="Upload photos"
          >
            <input {...getInputProps()} />
            <div className="upload-icon"><CloudUpload size={44} /></div>
            <p className="upload-title">
              {isDragActive ? 'Drop photos here…' : 'Drag & Drop Photos Here'}
            </p>
            <p className="upload-sub">or click to browse your files</p>
            <p className="upload-hint">JPG · PNG · WEBP — max 10 MB each</p>
          </div>

          <AnimatePresence>
            {previews.length > 0 && (
              <motion.div
                className="preview-box"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{ opacity: 0, y: 16 }}
              >
                <p className="preview-ttl">Ready to Share ({previews.length})</p>
                <div className="preview-grid">
                  {previews.map((url, i) => (
                    <div key={i} className="preview-item">
                      <img src={url} alt={`Preview ${i + 1}`} />
                      <button className="preview-rm" onClick={() => remove(i)} aria-label="Remove photo">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="upload-form">
                  <input
                    className="upload-input"
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={60}
                  />
                  <button className="btn btn-primary" onClick={submit} disabled={loading}>
                    <UploadIcon size={16} />
                    {loading ? 'Sharing…' : 'Share Photos'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="community-wrap">
          <h3 className="community-title"><Users size={20} /> Community Gallery</h3>
          <p className="community-sub">Photos shared by family and friends</p>

          {community.length === 0 ? (
            <p className="community-empty">📷<br />Be the first to share a photo!</p>
          ) : (
            <>
              <div className="gallery-grid">
                {community.map((img, idx) => (
                  <div
                    key={img.id}
                    className="g-item"
                    onClick={() => { setLbIndex(idx); setLbOpen(true); }}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && (setLbIndex(idx), setLbOpen(true))}
                  >
                    <img
                      src={img.src}
                      alt={`Shared by ${img.by}`}
                      className="g-img-real"
                      style={{ opacity: 1, objectPosition: 'center 15%' }}
                    />
                    <div className="g-overlay" aria-hidden>
                      <div>
                        <div className="g-label">Shared by {img.by}</div>
                        <div className="g-cat">{timeAgo(img.at)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Lightbox
                open={lbOpen}
                close={() => setLbOpen(false)}
                index={lbIndex}
                slides={slides}
                plugins={[Download]}
                styles={{ container: { backgroundColor: 'rgba(0,0,0,0.97)' } }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
