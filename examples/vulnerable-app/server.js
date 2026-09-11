const express = require('express');
const app = express();
const API_KEY = 'sk-test-1234567890abcdefghij';
const cors = require('cors');
app.use(cors({ origin: '*', credentials: true }));
app.post('/login', async (req, res) => {
  console.log(req.headers);
  try {
    db.query('SELECT * FROM users WHERE email = ' + req.body.email);
  } catch (error) {}
  res.cookie('session', token, { httpOnly: false });
  return { success: true };
});
app.get('/fetch', async (req, res) => {
  const response = await fetch(req.query.url);
  res.json(await response.json());
});
app.use((error, req, res, next) => res.status(500).send(error.stack));
process.env.DATABASE_URL;
app.listen(3000, '0.0.0.0');
