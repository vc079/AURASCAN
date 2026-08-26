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
\`\`\`bash
git clone https://github.com/yourusername/AURASCAN.git
cd AURASCAN
npm install
\`\`\`

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your configurations (do not commit this file):
\`\`\`env
PORT=3000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/inspiro_db
ALLOWED_HOSTS=localhost,your-tunnel-url.loca.lt
\`\`\`

### 3. Setup PostgreSQL Database
Open your PostgreSQL shell and run the following commands to create the database and table:
\`\`\`sql
CREATE DATABASE inspiro_db;
\c inspiro_db

CREATE TABLE scan_logs (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    os VARCHAR(50),
    browser VARCHAR(50),
    device_type VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(100),
    isp VARCHAR(100),
    request_path VARCHAR(255),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 4. Run the Application
Start your backend server locally:
\`\`\`bash
node src/server.js
\`\`\`
*The server is now running on `http://localhost:3000`.*

---

## 🚇 Exposing Locally for Mobile QR Testing 

To test scanning the QR code with a mobile device, expose your local server to the public internet using a separate terminal tab:

**LocalTunnel (No installation required):**
\`\`\`bash
npx localtunnel --port 3000
\`\`\`

**Pinggy (SSH-based):**
\`\`\`bash
ssh -p 443 -R0:localhost:3000 a.pinggy.io
\`\`\`
*(Remember to update the `ALLOWED_HOSTS` array in your `.env` file with the generated URL and restart the server!)*

---

## 📊 Database Query Cheat Sheet

View your most recent telemetry logs directly in PostgreSQL:

\`\`\`sql
SELECT ip_address, city, os, browser, isp, scanned_at 
FROM scan_logs 
ORDER BY scanned_at DESC 
LIMIT 5;
\`\`\`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/vc079/AURASCAN/issues) if you want to contribute.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

