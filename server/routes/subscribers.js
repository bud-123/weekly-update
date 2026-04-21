const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const FILE = path.join(__dirname, '..', 'subscribers.json');

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  res.json(read());
});

router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const subs = read();
  if (subs.find(s => s.email === email)) return res.status(409).json({ error: 'Already subscribed' });
  subs.push({ name, email, addedAt: new Date().toISOString() });
  write(subs);
  res.status(201).json({ success: true });
});

router.delete('/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const subs = read();
  const next = subs.filter(s => s.email !== email);
  if (next.length === subs.length) return res.status(404).json({ error: 'Not found' });
  write(next);
  res.json({ success: true });
});

module.exports = router;
