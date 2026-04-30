import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Users, X, Upload as UploadIcon } from 'lucide-react';
import Lightbox  from 'yet-another-react-lightbox';
import Download  from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';

const LS_KEY     = 'grad-uploads-v3';
const MAX_STORED = 30;

const CLD_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ── helpers ───────────────────────────────────────────────────────────────
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

function lsRead()        { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } }
function lsWrite(items)  { try { localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_STORED))); } catch {} }

// Resize to 1200 px max, JPEG 82%
function compressToBlob(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;
      if (width > height ? width > MAX : height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width);  width  = MAX; }
        else                { width  = Math.round(width  * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// Upload blob directly to Cloudinary (unsigned preset) → returns CDN URL
async function uploadToCloudinary(blob, filename) {
  const form = new FormData();
  form.append('file',           blob, filename);
  form.append('upload_preset',  CLD_PRESET);
  form.append('folder',         'grad-celebration');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, {
    method: 'POST',
    body:   form,
  });
  if (!res.ok) throw new Error(`Cloudinary error ${res.status}`);
  return (await res.json()).secure_url;
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

  // Merge DB rows with any pending local items
  const mergeWithDb = useCallback((dbItems) => {
    setCommunity(prev => {
      const dbIds   = new Set(dbItems.map(i => i.id));
      const pending = prev.filter(i => i.pending && !dbIds.has(i.id));
      const merged  = [...pending, ...dbItems];
      lsWrite(merged);
      return merged;
    });
  }, []);

  const sync = useCallback(async () => {
    try {
      const res = await fetch('/api/upload');
      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows)) return;
      mergeWithDb(rows.map(toItem));

      // Retry any pending items whose imageUrl is already set (Cloudinary succeeded but API call failed)
      setCommunity(prev => {
        prev.filter(i => i.pending && i.src?.startsWith('http')).forEach(item => {
          fetch('/api/upload', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name: item.by, imageUrl: item.src }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(row => {
              if (!row) return;
              const confirmed = toItem(row);
              setCommunity(cur => { const next = cur.map(x => x.id === item.id ? confirmed : x); lsWrite(next); return next; });
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

  // ── dropzone ──────────────────────────────────────────────────────────────
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
      // Compress first (always, for preview quality)
      const blob = await compressToBlob(file);
      if (!blob) continue;

      // Optimistic preview using a local object URL
      const previewUrl = URL.createObjectURL(blob);
      const tempId     = `pending-${Date.now()}-${Math.random()}`;
      const tempItem   = { id: tempId, src: previewUrl, by: uploader, at: new Date().toISOString(), pending: true };

      setCommunity(prev => { const next = [tempItem, ...prev]; lsWrite(next); return next; });

      // Upload to Cloudinary → then save URL to our DB
      ;(async () => {
        try {
          let imageUrl;

          if (CLD_CLOUD && CLD_PRESET) {
            // Path 1: Cloudinary CDN
            imageUrl = await uploadToCloudinary(blob, file.name);
          } else {
            // Path 2: fallback — store compressed base64 in DB (works without Cloudinary)
            const reader = new FileReader();
            imageUrl = await new Promise(res => { reader.onload = e => res(e.target.result); reader.readAsDataURL(blob); });
          }

          // Save to DB
          const res = await fetch('/api/upload', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name: uploader, imageUrl }),
          });

          if (res.ok) {
            const row       = toItem(await res.json());
            URL.revokeObjectURL(previewUrl);
            setCommunity(prev => { const next = prev.map(x => x.id === tempId ? row : x); lsWrite(next); return next; });
          } else {
            // DB failed but upload succeeded — keep local item with CDN url so retry works
            setCommunity(prev => {
              const next = prev.map(x => x.id === tempId ? { ...x, src: imageUrl } : x);
              lsWrite(next);
              return next;
            });
          }
        } catch (err) {
          // Keep temp item visible (pending), sync() will retry
          console.error('upload error', err);
        }
      })();
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
            role="button" aria-label="Upload photos"
          >
            <input {...getInputProps()} />
            <div className="upload-icon"><CloudUpload size={44} /></div>
            <p className="upload-title">{isDragActive ? 'Drop photos here…' : 'Drag & Drop Photos Here'}</p>
            <p className="upload-sub">or click to browse your files</p>
            <p className="upload-hint">JPG · PNG · WEBP — max 10 MB each</p>
          </div>

          <AnimatePresence>
            {previews.length > 0 && (
              <motion.div
                className="preview-box"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              >
                <p className="preview-ttl">Ready to Share ({previews.length})</p>
                <div className="preview-grid">
                  {previews.map((url, i) => (
                    <div key={i} className="preview-item">
                      <img src={url} alt={`Preview ${i + 1}`} />
                      <button className="preview-rm" onClick={() => remove(i)} aria-label="Remove photo"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="upload-form">
                  <input
                    className="upload-input" type="text" placeholder="Your name (optional)"
                    value={name} onChange={e => setName(e.target.value)} maxLength={60}
                  />
                  <button className="btn btn-primary" onClick={submit} disabled={loading}>
                    <UploadIcon size={16} />{loading ? 'Sharing…' : 'Share Photos'}
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
                    key={img.id} className="g-item"
                    onClick={() => { setLbIndex(idx); setLbOpen(true); }}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && (setLbIndex(idx), setLbOpen(true))}
                  >
                    <img
                      src={img.src} alt={`Shared by ${img.by}`}
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
                open={lbOpen} close={() => setLbOpen(false)}
                index={lbIndex} slides={slides} plugins={[Download]}
                styles={{ container: { backgroundColor: 'rgba(0,0,0,0.97)' } }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
