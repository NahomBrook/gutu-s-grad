import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Users, X, Upload as UploadIcon } from 'lucide-react';
import Lightbox   from 'yet-another-react-lightbox';
import Download   from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1000;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export default function Upload({ showToast }) {
  const [files,     setFiles]     = useState([]);
  const [previews,  setPreviews]  = useState([]);
  const [name,      setName]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [community, setCommunity] = useState([]);
  const [lbOpen,    setLbOpen]    = useState(false);
  const [lbIndex,   setLbIndex]   = useState(0);

  async function fetchCommunity() {
    try {
      const res = await fetch('/api/upload');
      if (!res.ok) return;
      const rows = await res.json();
      setCommunity(rows.map(r => ({
        id:  String(r.id),
        src: r.thumbnail,
        by:  r.uploader,
        at:  r.created_at,
      })));
    } catch {
      // API unavailable locally — keep empty
    }
  }

  useEffect(() => {
    fetchCommunity();
  }, []);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) showToast('Some files skipped — images under 10 MB only');
    setFiles(f => [...f, ...accepted]);
    const urls = accepted.map(f => URL.createObjectURL(f));
    setPreviews(p => [...p, ...urls]);
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:  { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    onDrop,
  });

  const remove = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(f  => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (!files.length) return;
    setLoading(true);

    const uploader = name.trim() || 'Anonymous';
    const newItems = [];

    for (const file of files) {
      const image = await compressImage(file);
      if (!image) continue;

      try {
        const res = await fetch('/api/upload', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name: uploader, image }),
        });

        if (res.ok) {
          const row = await res.json();
          newItems.push({
            id:  String(row.id),
            src: row.thumbnail,
            by:  row.uploader,
            at:  row.created_at,
          });
        } else {
          // Optimistic fallback
          newItems.push({ id: `opt-${Date.now()}`, src: image, by: uploader, at: new Date().toISOString() });
        }
      } catch {
        newItems.push({ id: `opt-${Date.now()}`, src: image, by: uploader, at: new Date().toISOString() });
      }
    }

    setCommunity(prev => [...newItems, ...prev]);
    previews.forEach(u => URL.revokeObjectURL(u));
    setFiles([]); setPreviews([]); setName('');
    setLoading(false);
    showToast(`${newItems.length} photo${newItems.length > 1 ? 's' : ''} shared! 🎉`);
  };

  const communitySlides = community.map(c => ({ src: c.src, alt: `Shared by ${c.by}` }));

  return (
    <section className="section section-alt" id="upload">
      <div className="container">
        <div className="s-head">
          <p className="s-eye">Share Your Memories</p>
          <h2 className="s-title">Upload Photos</h2>
          <p className="s-sub">Add your special moments to our community gallery</p>
        </div>

        <div className="upload-wrap">
          {/* Drop zone */}
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

          {/* Preview */}
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
                      <button
                        className="preview-rm"
                        onClick={() => remove(i)}
                        aria-label="Remove photo"
                      >
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
                  <button
                    className="btn btn-primary"
                    onClick={submit}
                    disabled={loading}
                  >
                    <UploadIcon size={16} />
                    {loading ? 'Sharing…' : 'Share Photos'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Community gallery */}
        <div className="community-wrap">
          <h3 className="community-title">
            <Users size={20} /> Community Gallery
          </h3>
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
                slides={communitySlides}
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
