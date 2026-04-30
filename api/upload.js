import { neon } from '@neondatabase/serverless';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
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

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'DATABASE_URL not configured' });
  }

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
      const { name, imageUrl, image } = req.body ?? {};
      // imageUrl = Cloudinary CDN URL (preferred)
      // image    = base64 data URL (fallback when Cloudinary not configured)
      const thumbnail = imageUrl || image;

      if (!thumbnail) return res.status(400).json({ error: 'imageUrl or image is required' });

      const uploader = name?.trim() || 'Anonymous';

      const [row] = await sql`
        INSERT INTO grad_uploads (uploader, thumbnail)
        VALUES (${uploader}, ${thumbnail})
        RETURNING id, uploader, thumbnail, created_at
      `;

      return res.status(201).json(row);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('upload handler error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
