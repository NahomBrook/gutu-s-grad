import { neon }   from '@neondatabase/serverless';
import { createHash } from 'crypto';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Cloudinary signed upload (no extra package — just crypto + fetch) ──────
function cldSignature(params, secret) {
  const str = Object.keys(params).sort()
    .map(k => `${k}=${params[k]}`).join('&') + secret;
  return createHash('sha256').update(str).digest('hex');
}

async function uploadToCloudinary(base64DataUrl) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null; // Cloudinary not configured

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = 'gutus-grad';
  const overwrite = 'true';

  const sigParams = { folder, overwrite, timestamp };
  const signature = cldSignature(sigParams, apiSecret);

  const form = new FormData();
  form.append('file',      base64DataUrl);
  form.append('timestamp', String(timestamp));
  form.append('api_key',   apiKey);
  form.append('signature', signature);
  form.append('folder',    folder);
  form.append('overwrite', overwrite);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body:   form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary ${res.status}: ${err.error?.message ?? 'upload failed'}`);
  }

  return (await res.json()).secure_url;
}

// ── Neon table ────────────────────────────────────────────────────────────
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

// ── Handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'DATABASE_URL not configured' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await ensureTable(sql);

    // ── GET: list all uploads ────────────────────────────────────────────
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, uploader, thumbnail, created_at
        FROM   grad_uploads
        ORDER  BY created_at DESC
        LIMIT  100
      `;
      return res.json(rows);
    }

    // ── POST: receive compressed base64 → upload to Cloudinary → save URL ─
    if (req.method === 'POST') {
      const { name, image } = req.body ?? {};
      if (!image) return res.status(400).json({ error: 'image is required' });

      const uploader = name?.trim() || 'Anonymous';

      // Try Cloudinary first; fall back to storing the base64 directly
      let thumbnail;
      try {
        thumbnail = await uploadToCloudinary(image) ?? image;
      } catch (cldErr) {
        console.error('Cloudinary upload failed, storing base64:', cldErr.message);
        thumbnail = image; // graceful fallback
      }

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
