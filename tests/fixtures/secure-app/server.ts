import express from 'express';
import { z } from 'zod';
const envSchema = z.object({ DATABASE_URL: z.string().url() });
const env = envSchema.parse(process.env);
const app = express();
const allowedOrigins = new Set(['https://app.example.com']);
app.use(express.json({ limit: '100kb' }));
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
app.post('/login', loginRateLimiter, async (req, res) => {
  await database.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
  res.cookie('session', 'redacted', { secure: true, httpOnly: true, sameSite: 'strict' });
  res.status(200).json({ success: true });
});
app.use((error, _req, res, _next) => res.status(500).json({ error: 'internal_error' }));
app.listen(3000);
