const axios = require("axios");

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/your-webhook-url";

async function sendToDiscord(message) {
  try {
    await axios.post(discordWebhookUrl, { content: message });
  } catch (error) {
    console.error("Discord'a mesaj gönderilirken hata oluştu:", error.message);
  }
}

module.exports = async (req, res) => {
  // CORS ayarları burada...

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "commenttoken";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("GET isteği geldi:");
    console.log({ mode, token, challenge });

    await sendToDiscord(`GET isteği geldi. Mode: ${mode}, Token: ${token}`);

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      await sendToDiscord("WEBHOOK DOĞRULANDI");
      res.status(200).send(challenge);
    } else {
      await sendToDiscord("WEBHOOK DOĞRULANAMADI");
      res.status(403).send("Forbidden");
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      console.log("POST isteği geldi:");
      console.log(JSON.stringify(body, null, 2));

      await sendToDiscord(`POST isteği geldi:\n\`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\``);

      if (body.object === "page") {
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            const event = entry.changes[0];

            if (event.field === "feed" && event.value && event.value.item === "comment") {
              const commentText = event.value.message;
              const commenterId = event.value.from ? event.value.from.id : "Bilinmeyen";

              await sendToDiscord(`🔔 **Yeni Facebook Yorumu**\n\n📝 **Yorum:** "${commentText}"\n👤 **Kullanıcı ID:** ${commenterId}\n⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`);
            }
          }
        }
        res.status(200).json({ status: "EVENT_RECEIVED" });
      } else {
        res.status(404).json({ error: "Not Found" });
      }
    } catch (error) {
      console.error("Webhook işleme hatası:", error);
      await sendToDiscord(`Webhook işleme hatası: ${error.message}`);
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
};
