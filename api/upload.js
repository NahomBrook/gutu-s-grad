import { neon } from '@neondatabase/serverless';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS grad_uploads (
      id         SERIAL PRIMARY KEY,
      uploader   TEXT DEFAULT 'Anonymous',
      thumbnail  TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

async function sendTelegramPhoto(uploader, dataUrl) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const mime   = (dataUrl.match(/^data:(image\/\w+);base64,/) || [])[1] ?? 'image/jpeg';
  const ext    = mime.split('/')[1] || 'jpg';

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', `📸 Photo shared by ${uploader} — Dr. Gutu's Graduation Celebration!`);
  form.append('photo', new Blob([buffer], { type: mime }), `photo.${ext}`);

  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form,
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
        SELECT id, uploader, thumbnail, created_at
        FROM   grad_uploads
        ORDER  BY created_at DESC
        LIMIT  100
      `;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { name, image } = req.body ?? {};

      if (!image) return res.status(400).json({ error: 'Image is required' });

      const uploader = name?.trim() || 'Anonymous';

      const [row] = await sql`
        INSERT INTO grad_uploads (uploader, thumbnail)
        VALUES (${uploader}, ${image})
        RETURNING id, uploader, thumbnail, created_at
      `;

      sendTelegramPhoto(uploader, image)
        .catch(e => console.error('Telegram photo error:', e));

      return res.status(201).json(row);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('upload handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
