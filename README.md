# Weekly Updater

A local dev tool for writing and sending structured weekly updates to anyone who needs to stay in the loop: investors, a board, a manager, a skip-level, a cross-functional team. Founders, PMs, team leads, ICs reporting up. If you send a recurring update to a group, this is for you.

Inspired by YC Startup School's weekly check-in format. That tool showed that a short, structured update, sent consistently, is more valuable than a long one sent occasionally. The format here borrows that philosophy: a few fixed fields, no freeform rambling, fast to fill out, good to receive.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite (port 5173) |
| Backend | Express (port 3001) |
| Email | Nodemailer + Gmail App Password |
| Data | `server/subscribers.json`, `server/test-recipient.json` |

---

## Setup

### 1. Get a Gmail App Password

You need an App Password, not your regular Gmail password. Google requires 2-Step Verification to be enabled first.

1. Go to [myaccount.google.com](https://myaccount.google.com) → **Security**
2. Enable **2-Step Verification** if it's not already on
3. Search for **"App passwords"** in the Google Account search bar
4. Click **App passwords**, then create a new one (name it anything, "Weekly Updater" works)
5. Copy the 16-character password shown (spaces included or not, both work)

### 2. Configure your credentials

```bash
cp .env.example .env
```

Edit `.env`:

```
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
PORT=3001
```

### 3. Install dependencies

```bash
npm run setup
```

This installs packages for the root, client, and server.

### 4. Run

```bash
npm run dev
```

Opens both the client at **http://localhost:5173** and the API server at **http://localhost:3001**.

---

## Usage

1. Open **http://localhost:5173**
2. Go to the **Subscribers** tab and add your stakeholders (name + email)
3. Switch to the **Update** tab and fill out the week's update
4. Hit **Send to All →**

Each subscriber gets a formatted HTML email with your update. The week label is auto-generated from the current date.

---

## Update Fields

| Field | Description |
|---|---|
| **Key Metrics** | Dynamic label/value pairs, add as many as you need |
| **Progress & Wins** | What shipped or moved forward |
| **Blockers & Challenges** | What's unresolved or slowing things down |
| **Focus for Next Week** | Top priority heading into next week |
| **Morale** | 1-5 rating, shown as a trend arrow (up / flat / down) with label in the email |
| **The Ask** | What you need from stakeholders |

---

## Data

Subscribers are stored in `server/subscribers.json` and the test recipient in `server/test-recipient.json`. Both files are created automatically the first time you save anything through the UI, no manual setup required. They're gitignored so real email addresses are never committed.
