const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const FILE = path.join(__dirname, '..', 'test-recipient.json');

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return {}; }
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
  write({ name, email });
  res.json({ success: true });
});

router.delete('/', (req, res) => {
  write({});
  res.json({ success: true });
});

module.exports = router;
