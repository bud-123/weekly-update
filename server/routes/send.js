const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const generateEmail = require('../emailTemplate');

const router = express.Router();

function readSubscribers() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'subscribers.json'), 'utf8')); }
  catch { return []; }
}

function readTestRecipient() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'test-recipient.json'), 'utf8')); }
  catch { return {}; }
}

router.post('/', async (req, res) => {
  const { weekLabel, metrics, progress, blockers, focus, morale, ask, testOnly } = req.body;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: 'Gmail credentials not configured. Check your .env file.' });
  }

  let recipients;
  if (testOnly) {
    const t = readTestRecipient();
    if (!t.email) return res.status(400).json({ error: 'No test recipient configured. Add one in the Subscribers tab.' });
    recipients = [t];
  } else {
    recipients = readSubscribers();
    if (recipients.length === 0) return res.status(400).json({ error: 'No subscribers found. Add subscribers first.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const html = generateEmail({ weekLabel, metrics, progress, blockers, focus, morale, ask });

  const results = [];
  for (const sub of recipients) {
    try {
      await transporter.sendMail({
        from: `"Weekly Update" <${process.env.GMAIL_USER}>`,
        to: `${sub.name} <${sub.email}>`,
        subject: `Weekly Update — ${weekLabel}`,
        html,
      });
      results.push({ email: sub.email, sent: true });
    } catch (err) {
      results.push({ email: sub.email, sent: false, error: err.message });
    }
  }

  res.json({
    success: true,
    sent: results.filter(r => r.sent).length,
    failed: results.filter(r => !r.sent).length,
    results,
  });
});

module.exports = router;
