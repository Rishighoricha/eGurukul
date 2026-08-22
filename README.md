# eGurukul – Smart Academic Attendance Intelligence System

> A modern academic attendance monitoring and advisory tool built for **SAKEC Semester III** — aligned with **UN SDG 4 (Quality Education)** and **SDG 10 (Reduced Inequalities)**.

**Team:** Aditya Ghosh (Roll No. 14) & Rishi Ghoricha (Roll No. 13) | SAKEC, Sem III

---

## 🚀 Features

- 📋 **Attendance Management** – Track attendance for all 10 SAKEC Sem-III subjects
- 📄 **PDF Warning Letters** – Generate official 7-day parent intimation notices (jsPDF)
- 🤖 **GurukulBot AI Advisor** – AI-powered assistant (NVIDIA Llama 3.1) for attendance risk queries
- 📊 **Dashboard & Analytics** – Real-time risk overview, doughnut charts, and SDG impact metrics
- 📦 **Bulk Import/Export** – CSV/JSON roster import and full data backup
- 💬 **WhatsApp Alerts** – Dispatch parent notices directly via WhatsApp
- 🌙 **Dark Mode** – Full dark/light theme toggle with localStorage persistence
- 📱 **Fully Responsive** – Works on all screen sizes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Front-end | React 18, Vite, React Router |
| UI | Bootstrap 5, Bootstrap Icons, Vanilla CSS |
| State | Context API + LocalStorage |
| PDF | jsPDF |
| AI | NVIDIA Llama 3.1 (via API) |
| Build | npm / Vite |

## ⚡ Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/AdityaG-jpg/eGurukul.git
cd eGurukul

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
src/
├── components/     # Navbar, Modals, GurukulBot widget
├── context/        # EduTrackContext (global state)
├── data/           # Default subjects & sample students
├── pages/          # Dashboard, Students, Subjects, Pipeline, SDG
└── services/       # pdfService.js, aiService.js
```

## 👥 Credits

- **Aditya Ghosh** – Roll No. 14, SAKEC Sem III
- **Rishi Ghoricha** – Roll No. 13, SAKEC Sem III

## 📜 License

MIT License — free to fork and contribute!
