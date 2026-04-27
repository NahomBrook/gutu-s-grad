import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { DEFAULT_MESSAGES } from '../data';

const EMOJIS    = ['🎓','❤️','🎉','⭐','🙏','🏆','💪','🌟'];
const RELATIONS = ['Family','Friend','Colleague','Classmate','Professor','Other'];
const LS_KEY    = 'grad-messages-v2';

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function normalise(row) {
  return {
    id:       String(row.id ?? row.id),
    name:     row.name,
    relation: row.relation || 'Guest',
    message:  row.message,
    emoji:    row.emoji || '🎓',
    time:     row.created_at || row.time || new Date().toISOString(),
  };
}

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_MESSAGES.map(normalise);
}

function lsSave(msgs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(msgs)); } catch {}
}

export default function Guestbook({ showToast }) {
  const [messages, setMessages] = useState(lsLoad);
  const [name,     setName]     = useState('');
  const [relation, setRelation] = useState('');
  const [text,     setText]     = useState('');
  const [emoji,    setEmoji]    = useState('🎓');
  const [loading,  setLoading]  = useState(false);
  const apiOk = useRef(false);

  // Fetch from API; update localStorage if we get real data back
  async function syncFromApi() {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) return;
      apiOk.current = true;
      const normalised = rows.map(normalise);
      setMessages(normalised);
      lsSave(normalised);
    } catch {}
  }

  useEffect(() => {
    syncFromApi();
    const id = setInterval(syncFromApi, 30_000);
    return () => clearInterval(id);
  }, []);

  const submit = async () => {
    if (!name.trim())           { showToast('Please enter your name'); return; }
    if (text.trim().length < 8) { showToast('Message is too short');  return; }

    const newMsg = {
      id:       `local-${Date.now()}`,
      name:     name.trim(),
      relation: relation || 'Guest',
      message:  text.trim(),
      emoji,
      time:     new Date().toISOString(),
    };

    // Show immediately and persist to localStorage
    setMessages(prev => {
      const next = [newMsg, ...prev];
      lsSave(next);
      return next;
    });
    setName(''); setRelation(''); setText(''); setEmoji('🎓');
    showToast('Message sent — thank you! 🎓');

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     newMsg.name,
          relation: newMsg.relation,
          message:  newMsg.message,
          emoji:    newMsg.emoji,
        }),
      });
      if (res.ok) {
        // Swap the optimistic local entry for the real DB row
        const row = normalise(await res.json());
        setMessages(prev => {
          const next = prev.map(m => m.id === newMsg.id ? row : m);
          lsSave(next);
          return next;
        });
      }
    } catch {}
    setLoading(false);
  };

  return (
    <section className="section" id="guestbook">
      <div className="container">
        <div className="s-head">
          <p className="s-eye">From the Heart</p>
          <h2 className="s-title">Guestbook</h2>
          <p className="s-sub">Leave a message of congratulations for Dr. Gutu</p>
        </div>

        <div className="guestbook-layout">
          {/* ---- Form ---- */}
          <div className="form-card">
            <h3 className="form-title">Write a Message</h3>

            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                className="form-field"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <select
                className="form-field form-sel"
                value={relation}
                onChange={e => setRelation(e.target.value)}
              >
                <option value="">Select…</option>
                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Your Message *</label>
              <textarea
                className="form-field form-ta"
                placeholder="Share your congratulations, memories, or wishes…"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={500}
                onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') submit(); }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reaction</label>
              <div className="emoji-row">
                {EMOJIS.map(em => (
                  <span
                    key={em}
                    className={`emoji-opt${emoji === em ? ' active' : ''}`}
                    onClick={() => setEmoji(em)}
                    role="radio"
                    aria-checked={emoji === em}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setEmoji(em)}
                  >
                    {em}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={submit}
              disabled={loading}
            >
              <Send size={16} /> {loading ? 'Sending…' : 'Send Message'}
            </button>
          </div>

          {/* ---- Messages ---- */}
          <div>
            <div className="msgs-header">
              <h3 className="msgs-title">Messages</h3>
              <span className="msg-count">{messages.length}</span>
            </div>
            <div className="msgs-list">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    className="msg-card"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="msg-head">
                      <div className="msg-emoji-w" aria-hidden>{msg.emoji}</div>
                      <div className="msg-meta">
                        <div className="msg-name">{msg.name}</div>
                        <div className="msg-rel">{msg.relation}</div>
                      </div>
                      <div className="msg-time">{timeAgo(msg.time)}</div>
                    </div>
                    <p className="msg-text">"{msg.message}"</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
