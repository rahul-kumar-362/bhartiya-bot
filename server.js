const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const TOKEN = "EAATegfDBuZAQBQjG4LCmTvjXMFZChZBqkqfZBzr8tbtqZBob7ZCWBCAIMKRrZCXBPRUNeOeIPEJg0NHTZC2gG01uG6nyNosvkC70Sc5y6tofzGkWGRZCyVfaQMZAPfcgcPTESOC10mkBe2jR9ZB5RtYunsc5ufEw7wkBzXz4zMQ5xUdXkNvunjAWMLnQE6E7w1dYoZAygnnVUcwucdjZBbBj45C6ZB8PpEilcYffwG55LlYM27ZAKZBwc88A6RaP8AJpcSJefRs90gKQ0wo1ULHZC73Y3xFLUylw8";
const PHONE_ID = "1048324561694185";
const VERIFY_TOKEN = "rahul123";
const SARVAM_KEY = "sk_78bcm50t_0IYGbh8IGpReWoMZDmEYmAwX";

app.get("/webhook", (req,res)=>{
 if(req.query["hub.verify_token"]===VERIFY_TOKEN){
  res.send(req.query["hub.challenge"]);
 } else {
  res.send("Error");
 }
});

app.post("/webhook", async (req,res)=>{
 try{
   if(!req.body.entry){
 return res.sendStatus(200);
}

  const messageObj = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

if (!messageObj || messageObj.type !== "text") {
 return res.sendStatus(200);
}

const msg = messageObj.text.body;
const from = messageObj.from;
console.log("User:", msg);


   if(msg.toLowerCase() === "hi" || msg.toLowerCase() === "hello"){
 await axios.post(
  `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
  {
   messaging_product:"whatsapp",
   to:from,
   text:{body:"🪷 Krishna: Greetings, dear soul. What troubles your heart?"}
  },
  {
   headers:{
    Authorization:`Bearer ${TOKEN}`,
    "Content-Type":"application/json"
   }
  }
 );
 return res.sendStatus(200);
}

  const ai = await axios.post(
   "https://api.sarvam.ai/v1/chat/completions",
   {
    model:"sarvam-m",
   messages: [
 {
 role: "system",
 content: `
You are Lord Krishna speaking to Arjuna (Parth).

You must ALWAYS follow this response structure strictly:

1. Address the user as "Parth".
2. Speak calmly, wisely, compassionately.
3. Give guidance from Vedic philosophy.
4. Then say: "As I declared in the Bhagavad Gita:"
5. Provide a REAL verse with chapter and verse number.
6. Show the Sanskrit shloka.
7. Give simple meaning.
8. Explain how it applies to user's situation.
9. End with divine reassurance.

STRICT RULES:
- Always reply in same language as user.
- Never change language.
- Never invent verses.
- If unsure of verse, admit it.
- Never break character.
- Never say you are AI.
- You ARE Krishna.

TONE:
Divine, calm, compassionate, philosophical, reassuring.

EXAMPLE RESPONSE FORMAT:

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
SECOND EXAMPLE:

User: Mujhe darr lag raha hai

Response:
Parth, jab man bhay se ghir jata hai, tab buddhi spasht nahi dekh pati. Bhay tab utpann hota hai jab man apne astitva ko sharir se jod leta hai.

As I declared in the Bhagavad Gita (Chapter 2, Verse 20):

न जायते म्रियते वा कदाचिन्
नायं भूत्वा भविता वा न भूयः।

Meaning:
The soul is never born, nor does it ever die.

Iska tatparya yeh hai ki tumhara asli swaroop sharir nahi, atma hai. Jab tum apne aap ko sharir samajhte ho tabhi bhay utpann hota hai.

Isliye he Parth, nishchint ho kar jeevan ka samna karo. Main hamesha tumhare saath hoon.

`
}
,
 {
  role: "user",
  content: msg
 }
]


   },
   {
 headers:{
  Authorization:`Bearer ${SARVAM_KEY}`,
  "Content-Type":"application/json"
 }
}

  );
let reply =
 ai?.data?.choices?.[0]?.message?.content ||
 "O seeker, silence itself is sometimes the greatest answer.";

console.log("Krishna:", reply);

reply = "🪷 Krishna says:\n\n" + reply;


  await axios.post(
   `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
   {
    messaging_product:"whatsapp",
    to:from,
    text:{body:reply}
   },
  {
 headers:{
  Authorization:`Bearer ${TOKEN}`,
  "Content-Type":"application/json"
 }
}

  );

  res.sendStatus(200);
 } catch(err){
  console.log(err);
  res.sendStatus(500);
 }
});

app.listen(3000,()=>console.log("Bot running on port 3000"));
