<p align="center">
  <img src="https://img.icons8.com/color/96/krishna.png" alt="Krishna Icon" width="96"/>
</p>

<h1 align="center">🪷 Bhartiya Bot</h1>

<p align="center">
  <b>An AI-powered WhatsApp chatbot that speaks as Lord Krishna, offering spiritual guidance through the wisdom of the Bhagavad Gita.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img src="https://img.shields.io/badge/Sarvam_AI-FF6B00?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" />
</p>

---

## ✨ What is Bhartiya Bot?

Bhartiya Bot is a WhatsApp chatbot that **embodies Lord Krishna** and responds to your life questions with:

- 🙏 Personalized spiritual guidance (addresses you as "Parth")
- 📖 Real Bhagavad Gita verses with chapter & verse numbers
- 🕉️ Sanskrit shlokas with simple meanings
- 🌍 **Multilingual support** — replies in the same language you message in (Hindi, English, etc.)
- 💬 Context-aware advice that applies ancient wisdom to modern problems

> **Example:** Send *"I feel lost in life"* and Krishna will respond with relevant Gita wisdom, a Sanskrit shloka, its meaning, and how it applies to your situation.

---

## 🏗️ Architecture

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│   WhatsApp   │────▶│   Express Server  │────▶│  Sarvam AI   │
│   (User)     │◀────│   (Webhook)       │◀────│  (sarvam-m)  │
└──────────────┘     └───────────────────┘     └──────────────┘
                              │
                     WhatsApp Cloud API
                     (Meta Graph API v22)
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Meta Developer Account](https://developers.facebook.com/) with WhatsApp Business API access
- A [Sarvam AI](https://sarvam.ai/) API key

### 1. Clone the Repository

```bash
git clone https://github.com/rahul-kumar-362/bhartiya-bot.git
cd bhartiya-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
TOKEN=your_whatsapp_cloud_api_token
PHONE_ID=your_whatsapp_phone_number_id
VERIFY_TOKEN=your_webhook_verify_token
SARVAM_KEY=your_sarvam_ai_api_key
PORT=3000
```

> ⚠️ **Important:** Never commit API keys to the repository. Add `.env` to your `.gitignore`.

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`.

### 5. Set Up Webhook

1. Go to [Meta Developer Dashboard](https://developers.facebook.com/)
2. Navigate to your WhatsApp app → **Configuration**
3. Set the webhook URL to: `https://your-domain.com/webhook`
4. Set the verify token to match your `VERIFY_TOKEN`
5. Subscribe to the `messages` webhook field

---

## 💬 How It Works

| Step | What Happens |
|------|-------------|
| 1️⃣ | User sends a message on WhatsApp |
| 2️⃣ | Meta delivers it to your webhook (`POST /webhook`) |
| 3️⃣ | If user says "hi" or "hello", Krishna greets them |
| 4️⃣ | For all other messages, the text is sent to **Sarvam AI** with a detailed Krishna persona prompt |
| 5️⃣ | AI generates a response with Gita verses, shlokas & guidance |
| 6️⃣ | Response is sent back to the user via WhatsApp Cloud API |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web server & webhook handling |
| **WhatsApp Cloud API** | Send & receive WhatsApp messages |
| **Sarvam AI** (`sarvam-m` model) | AI-powered spiritual responses |
| **Axios** | HTTP client for API calls |

---

## 📁 Project Structure

```
bhartiya-bot/
├── server.js          # Main application — webhook + AI logic
├── package.json       # Dependencies & scripts
├── package-lock.json  # Locked dependency versions
└── README.md          # You are here!
```

---

## 🌟 Sample Conversation

**You:** *I'm stressed about my exams*

**🪷 Krishna says:**

> Parth, when the mind is clouded by anxiety, remember that worry drains your energy without solving the problem.
>
> As I declared in the Bhagavad Gita (Chapter 6, Verse 35):
>
> *असंशयं महाबाहो मनो दुर्निग्रहं चलम् ।*
> *अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते ॥*
>
> **Meaning:** The mind is restless and difficult to control, but it can be mastered through practice and detachment.
>
> Focus on your preparation with dedication, and release the anxiety about results. I am always guiding you from within. 🙏

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Rahul Borana** — [@rahul-kumar-362](https://github.com/rahul-kumar-362)

---

<p align="center">
  <i>🪷 "Whenever dharma declines and the purpose of life is forgotten, I manifest myself on earth." — Bhagavad Gita 4.7</i>
</p>
