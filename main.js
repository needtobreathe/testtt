const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios"); // Discord'a istek göndermek için
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Facebook webhook doğrulama endpoint'i
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "sizin_token";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK DOĞRULANDI");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Facebook'tan gelen yorumları işleme
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.changes[0];
      if (event.field === "feed" && event.value.item === "comment") {
        const commentText = event.value.message;
        const commenterId = event.value.from.id;
        console.log(`Yeni yorum: "${commentText}" kullanici: ${commenterId}`);
        
        // Discord webhook URL'si
        const discordWebhookUrl = "https://discord.com/api/webhooks/1377251013395742730/_F3itUGe0uVeoG7C9hGGr0p-vNev_4PJdFaAjeep7V0h-3E4OvoBWCP1qsai-PF92tC8";
        
        // Discord'a mesaj gönderme
        axios.post(discordWebhookUrl, {
          content: `Yeni yorum: "${commentText}" kullanici: ${commenterId}`
        })
        .then(() => {
          console.log("Mesaj Discord'a gönderildi");
        })
        .catch((error) => {
          console.error("Discord'a mesaj gönderilirken hata oluştu:", error);
        });
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
