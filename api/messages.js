import { neon } from '@neondatabase/serverless';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS grad_messages (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      relation   TEXT DEFAULT 'Guest',
      message    TEXT NOT NULL,
      emoji      TEXT DEFAULT '🎓',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

async function sendTelegram(name, relation, message, emoji) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text =
    `${emoji} <b>New message for Dr. Gutu!</b>\n\n` +
    `From: <b>${name}</b> (${relation || 'Guest'})\n\n` +
    `"${message}"\n\n` +
    `— Graduation Celebration Website`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = neon(process.env.DATABASE_URL);

  try {
    await ensureTable(sql);

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, name, relation, message, emoji, created_at
        FROM   grad_messages
        ORDER  BY created_at DESC
        LIMIT  200
      `;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { name, relation, message, emoji } = req.body ?? {};

      if (!name?.trim() || !message?.trim()) {
        return res.status(400).json({ error: 'Name and message are required' });
      }

      const [row] = await sql`
        INSERT INTO grad_messages (name, relation, message, emoji)
        VALUES (${name.trim()}, ${relation || 'Guest'}, ${message.trim()}, ${emoji || '🎓'})
        RETURNING id, name, relation, message, emoji, created_at
      `;

      sendTelegram(name.trim(), relation, message.trim(), emoji || '🎓')
        .catch(e => console.error('Telegram message error:', e));

      return res.status(201).json(row);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('messages handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
