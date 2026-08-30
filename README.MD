# 🚀 AURASCAN (QR Telemetry & Dynamic Inspiration Engine)

![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-Backend-lightgrey.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A production-grade, full-stack QR code analytics and redirection engine built with **Node.js**, **Express**, and **PostgreSQL**. It features high-performance background analytics, anti-race-condition request debouncing, and a vibrant, multi-API-powered joyful web interface.

---

## 📸 See It In Action

**The Dynamic Web Interface:**
![AuraScan Demo](./assets/quote.png)

**Database Telemetry Logs:**
![Database Logs](./assets/db.png)

**Dashboard:**
![Dashboard](./assets/dashboard.png)
---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup & Installation](#️-setup--installation-instructions)
- [Testing via Mobile QR](#-exposing-locally-for-mobile-qr-testing)
- [Database Cheat Sheet](#-database-query-cheat-sheet)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

* **⚡ Smart QR Redirection & Debouncing**: Prevents duplicate scan inflation caused by mobile camera pre-fetching and rapid-fire background pings using an in-memory TTL cache lock.
* **🌍 Real-Time Telemetry**: Tracks incoming IP addresses, ISP networks, user agents, and geolocation metadata.
* **🎨 Dynamic Multi-API Frontend**: Serves an animated, high-energy glassmorphism UI on every scan by pulling live random quotes and GIFs from external APIs, paired with floating CSS-animated emojis.
* **🛡️ Fault-Tolerant Architecture**: Independent try/catch blocks ensure that if external APIs or non-critical systems fail, safe fallback content keeps the application running smoothly without crashing.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL (`pg` driver)
* **APIs**: DummyJSON Quotes API, The Cat API (for dynamic GIFs)
* **Tunneling**: LocalTunnel / Pinggy / Ngrok (for local device testing via public QR codes)

---

## 📂 Project Structure

```text
AURASCAN/
├── .env                  # Environment variables (database URL, port, etc.)
├── .gitignore            # Git exclusion rules (node_modules, .env)
├── package.json          # Project metadata and dependency manifest
├── README.md             # Project documentation
├── database/             # SQL schema (source of truth) and seed data
└── src/                  # Source code root
    ├── config/           # Configuration files (database connection pools)
    ├── controllers/      # Request handlers (redirect, inspire)
    ├── middleware/       # Custom request processors
    ├── repositories/     # Database queries
    ├── routes/           # Express router endpoints
    ├── services/         # External API handlers
    ├── utils/            # Helper scripts
    ├── workers/          # Asynchronous telemetry enqueuers
    └── server.js         # Main application entry point
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:
* **[Node.js](https://nodejs.org/)** (v16.0 or higher recommended)
* **[npm](https://www.npmjs.com/)** (comes installed with Node.js)
* **[PostgreSQL](https://www.postgresql.org/)** (v14.0 or higher)
* **[Git](https://git-scm.com/)** (for cloning the repository)

---

## ⚙️ Setup & Installation Instructions

### 1. Clone & Install Dependencies
Open your terminal and install the required Node modules:
```bash
git clone https://github.com/yourusername/AURASCAN.git
cd AURASCAN
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values (do not commit `.env`):
```env
PORT=3000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/inspiro_db
ALLOWED_HOSTS=localhost,your-tunnel-url.loca.lt

# Required by GET /api/export/logs. Generate with: openssl rand -hex 32
ADMIN_API_KEY=your_long_random_admin_key
```

### 3. Setup PostgreSQL Database
Create the database, then apply the schema and seed data. `database/schema.sql` is the
single source of truth for the table definitions — do not hand-write them:
```bash
createdb inspiro_db
psql -d inspiro_db -f database/schema.sql
psql -d inspiro_db -f database/seeds/quotes.sql
```

### 4. Run the Application
Start your backend server locally:
```bash
node src/server.js
```
*The server is now running on `http://localhost:3000`.*

---

## 🚇 Exposing Locally for Mobile QR Testing 

To test scanning the QR code with a mobile device, expose your local server to the public internet using a separate terminal tab:

**LocalTunnel (No installation required):**
```bash
npx localtunnel --port 3000
```

**Pinggy (SSH-based):**
```bash
ssh -p 443 -R0:localhost:3000 a.pinggy.io
```
*(Remember to update the `ALLOWED_HOSTS` array in your `.env` file with the generated URL and restart the server!)*

---

## 📊 Database Query Cheat Sheet

View your most recent telemetry logs directly in PostgreSQL:

```sql
SELECT ip_address, city, os, browser, isp, scanned_at 
FROM scan_logs 
ORDER BY scanned_at DESC 
LIMIT 5;
```

---

## 📤 Exporting Telemetry Logs as CSV

`GET /api/export/logs` streams the contents of `scan_logs` back as a downloadable
`.csv`, newest first, for analysis in Excel, Google Sheets, or pandas.

**Authentication** — required. Send the value of `ADMIN_API_KEY` (from your `.env`)
in an `x-api-key` header. Requests without a valid key get `401`; if `ADMIN_API_KEY`
is not configured at all the endpoint fails closed with `503` rather than serving
data. The route also sits behind the shared rate limiter (100 requests / 15 min per IP).

**Query parameters**

| Param | Default | Range | Description |
|---|---|---|---|
| `limit` | `1000` | `1`–`EXPORT_MAX_LIMIT` (default `50000`) | Maximum rows to export. |
| `days`  | *(none)* | `1`–`3650` | Only include scans from the last N days. |

Both must be plain integers; anything else returns `400`.

```bash
# All defaults (most recent 1000 rows)
curl -H "x-api-key: $ADMIN_API_KEY" \
  -OJ http://localhost:3000/api/export/logs

# Last 7 days, up to 500 rows
curl -H "x-api-key: $ADMIN_API_KEY" \
  "http://localhost:3000/api/export/logs?days=7&limit=500" -o recent.csv
```

Columns are read from the live `scan_logs` table at request time, so the export
tracks the schema automatically rather than relying on a hardcoded list.

> **Note on leading apostrophes:** fields whose value begins with `=`, `+`, `-`, or
> `@` are prefixed with a single quote (`'`). `user_agent`, `referer`, and `isp` are
> attacker-controlled, and spreadsheet software executes cells starting with those
> characters. This is a deliberate safety measure, not corrupted data.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/vc079/AURASCAN/issues) if you want to contribute.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

