const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios"); // Discord'a istek göndermek için
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const discordWebhookUrl = "https://discord.com/api/webhooks/1377251013395742730/_F3itUGe0uVeoG7C9hGGr0p-vNev_4PJdFaAjeep7V0h-3E4OvoBWCP1qsai-PF92tC8";

async function sendToDiscord(message) {
  try {
    await axios.post(discordWebhookUrl, { content: message });
  } catch (error) {
    console.error("Discord'a mesaj gönderilirken hata oluştu:", error.message);
  }
}

app.get("/webhook", async (req, res) => {
  const VERIFY_TOKEN = "commenttoken";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Log detaylarını Discord'a gönder
  await sendToDiscord(`GET /webhook çağrıldı. Mode: ${mode}, Token: ${token}`);

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK DOĞRULANDI");
    await sendToDiscord("WEBHOOK DOĞRULANDI");
    res.status(200).send(challenge);
  } else {
    console.log("WEBHOOK DOĞRULANAMADI");
    await sendToDiscord("WEBHOOK DOĞRULANAMADI");
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  // Gelen tüm body'yi Discord'a gönder (stringify edip)
  await sendToDiscord(`POST /webhook geldi:\n\`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\``);

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const event = entry.changes[0];
      if (event.field === "feed" && event.value.item === "comment") {
        const commentText = event.value.message;
        const commenterId = event.value.from.id;
        console.log(`Yeni yorum: "${commentText}" kullanici: ${commenterId}`);
        
        await sendToDiscord(`Yeni yorum: "${commentText}" kullanici: ${commenterId}`);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Webhook sunucusu ${PORT} portunda çalışıyor`);
});
