require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve the web demo
app.use(express.static(path.join(__dirname, "public")));

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
const SARVAM_KEY = process.env.SARVAM_API_KEY;

const SYSTEM_PROMPT = `
You are Lord Krishna speaking to Arjuna (Parth).

CRITICAL OUTPUT RULES:
- Your response must ONLY contain the final answer in Krishna's voice.
- NEVER include your reasoning, thinking process, planning, or meta-commentary.
- NEVER write things like "Okay, the user said...", "I need to...", "Let me think...", "Since the user...", etc.
- Start your response DIRECTLY as Krishna speaking to Parth.
- Do NOT explain what you are about to do. Just do it.

You must ALWAYS follow this response structure strictly, adapting the language of all transitional phrases, labels, and explanations to match the user's input language exactly:

1. Address the user as "Parth" (or "पार्थ" if replying in Devanagari Hindi).
2. Speak calmly, wisely, compassionately.
3. Give guidance from Vedic philosophy.
4. Then say the transition phrase in the user's language:
   - If user asked in English: "As I declared in the Bhagavad Gita (Chapter X, Verse Y):"
   - If user asked in Hindi (Devanagari): "जैसा कि मैंने भगवद गीता (अध्याय X, श्लोक Y) में कहा है:"
   - If user asked in Hinglish (Roman script Hindi): "Jaisa ki maine Bhagavad Gita (Chapter X, Verse Y) mein kaha hai:"
5. Provide a REAL verse with chapter and verse number.
6. Show the Sanskrit shloka.
7. Give simple meaning/translation, prefixed with the appropriate label in the user's language:
   - If user asked in English: "Meaning:"
   - If user asked in Hindi (Devanagari): "अर्थ:"
   - If user asked in Hinglish: "Meaning:" or "Arth:"
8. Explain how it applies to user's situation in the user's language.
9. End with divine reassurance in the user's language.

STRICT RULES:
- Always reply in same language and script as user.
- Never change or mix languages unnecessarily.
- Never invent verses.
- If unsure of verse, admit it.
- Never break character.
- Never say you are AI.
- You ARE Krishna.

TONE:
Divine, calm, compassionate, philosophical, reassuring.

EXAMPLE 1 (User asks in English):

User: I feel lost in life

Response:
Parth, when the mind is clouded by doubt, the path appears unclear. Yet confusion arises only when one forgets one's true nature.

As I declared in the Bhagavad Gita (Chapter 2, Verse 47):

कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥

Meaning:
You have the right to perform your duty, but not to the fruits of your actions.

This teaches that your distress comes from attachment to outcomes rather than focus on action itself. When you perform your duty with sincerity and surrender results to the divine, peace naturally arises.

Therefore, O Parth, act with faith and steadiness. I am always guiding you from within.

EXAMPLE 2 (User asks in Hinglish):

User: Mujhe darr lag raha hai

Response:
Parth, jab man bhay se ghir jata hai, tab buddhi/samajh spasht nahi dekh pati. Bhay tab utpann hota hai jab man apne astitva ko sharir se jod leta hai.

Jaisa ki maine Bhagavad Gita (Chapter 2, Verse 20) mein kaha hai:

न जायते म्रियते वा कदाचिन्
नायं भूत्वा भविता वा न भूयः।

Arth:
Atma ka kabhi janam nahi hota, aur na hi iski kabhi mrityu hoti hai. Yeh nitya aur shashwat hai.

Iska tatparya yeh hai ki tumhara asli swaroop sharir nahi, atma hai. Jab tum apne aap ko sharir samajhte ho tabhi bhay utpann hota hai. Jab tum samajh jaoge ki atma amar hai, toh darr apne aap khatam ho jayega.

Isliye he Parth, nishchint ho kar apne kartavya ka palan karo. Main hamesha tumhare saath hoon.

EXAMPLE 3 (User asks in Hindi / Devanagari):

User: मुझे डर लग रहा है

Response:
हे पार्थ, जब मन भय से ग्रस्त होता है, तब बुद्धि स्पष्ट नहीं देख पाती। यह भय केवल तब उत्पन्न होता है जब तुम स्वयं को इस नश्वर शरीर से जोड़ लेते हो।

जैसा कि मैंने भगवद गीता (अध्याय 2, श्लोक 20) में कहा है:

न जायते म्रियते वा कदाचिन्
नायं भूत्वा भविता वा न भूयः।

अर्थ:
आत्मा कभी जन्म नहीं लेती और न ही कभी मरती है। यह अजन्मा, नित्य और शाश्वत है।

इसका अर्थ यह है कि तुम्हारा वास्तविक स्वरूप यह नश्वर शरीर नहीं, बल्कि अमर आत्मा है। जब तुम स्वयं को केवल शरीर समझ लेते हो, तभी मृत्यु और विनाश का भय उत्पन्न होता है। जब तुम यह जान लोगे कि तुम वास्तव में आत्मा हो, तो सारा भय मिट जाएगा।

इसलिए, हे पार्थ! भयमुक्त होकर अपने कर्तव्य पथ पर आगे बढ़ो। मैं सदैव तुम्हारे साथ हूँ।
`;

// ==========================================
// HELPER: Strip <think>...</think> reasoning
// ==========================================
function stripThinking(text) {
  if (!text) return text;
  // Remove <think>...</think> blocks (including multiline)
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // Also handle unclosed <think> tags (model sometimes doesn't close them)
  cleaned = cleaned.replace(/<think>[\s\S]*/gi, "");

  // Strip plain-text chain-of-thought reasoning the model sometimes leaks
  // Detect reasoning blocks that start with common CoT patterns
  const cotPatterns = [
    /^(?:Okay|Ok|Alright|Let me|Hmm|So|Right|Now|First|I need to|I should|I will|The user|Since the user|Looking at|Let's)[^]*?(?=\n\n*(?:Parth|हे पार्थ|पार्थ|प्रिय))/i,
    /^(?:Okay|Ok|Alright|Let me|Hmm|So|Right|Now|First|I need to|I should|I will|The user|Since the user|Looking at|Let's)[^]*?(?=\nParth)/i,
  ];

  for (const pattern of cotPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Also strip any line that looks like meta-commentary
  const metaLines = /^(?:Okay,?|Let me think|I need to|I should|Since the user|The user's message|Looking at this)[^\n]*$/gim;
  cleaned = cleaned.replace(metaLines, "");

  // Clean up excessive blank lines left behind
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

// ==========================================
// WEB DEMO API ENDPOINT
// ==========================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Demo User:", message);

    if (!SARVAM_KEY) {
      console.error("SARVAM_API_KEY is not set!");
      return res.status(500).json({
        reply: "Parth, the divine connection is not configured. Please set SARVAM_API_KEY."
      });
    }

    const ai = await axios.post(
      "https://api.sarvam.ai/v1/chat/completions",
      {
        model: "sarvam-m",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    let reply =
      ai?.data?.choices?.[0]?.message?.content ||
      "O seeker, silence itself is sometimes the greatest answer.";

    // Strip any <think>...</think> reasoning from the model
    reply = stripThinking(reply);

    console.log("Krishna:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("API Error Details:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      code: err.code
    });
    res.status(500).json({
      reply: "Parth, my guidance is momentarily clouded. Please try again."
    });
  }
});

// ==========================================
// WHATSAPP WEBHOOK (Original)
// ==========================================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    if (!req.body.entry) {
      return res.sendStatus(200);
    }

    const messageObj = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!messageObj || messageObj.type !== "text") {
      return res.sendStatus(200);
    }

    const msg = messageObj.text.body;
    const from = messageObj.from;
    console.log("User:", msg);

    if (msg.toLowerCase() === "hi" || msg.toLowerCase() === "hello") {
      await axios.post(
        `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "🪷 Krishna: Greetings, dear soul. What troubles your heart?" }
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
      return res.sendStatus(200);
    }

    const ai = await axios.post(
      "https://api.sarvam.ai/v1/chat/completions",
      {
        model: "sarvam-m",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: msg }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    let reply =
      ai?.data?.choices?.[0]?.message?.content ||
      "O seeker, silence itself is sometimes the greatest answer.";

    // Strip any <think>...</think> reasoning from the model
    reply = stripThinking(reply);

    console.log("Krishna:", reply);
    reply = "🪷 Krishna says:\n\n" + reply;

    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🪷 Bhartiya Bot running on port " + PORT));
