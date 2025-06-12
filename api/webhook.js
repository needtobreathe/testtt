const axios = require("axios");

// Vercel serverless function handler
module.exports = async (req, res) => {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Facebook webhook doğrulama (GET request)
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "sizin_token";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK DOĞRULANDI");
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
    return;
  }

  // Facebook'tan gelen yorumları işleme (POST request)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === "page") {
        // Her entry için işlem yap
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            const event = entry.changes[0];
            
            if (event.field === "feed" && event.value && event.value.item === "comment") {
              const commentText = event.value.message;
              const commenterId = event.value.from ? event.value.from.id : "Bilinmeyen";
              
              console.log(`Yeni yorum: "${commentText}" kullanici: ${commenterId}`);
              
              // Discord webhook URL'si - Environment variable'dan al
              const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1377251013395742730/_F3itUGe0uVeoG7C9hGGr0p-vNev_4PJdFaAjeep7V0h-3E4OvoBWCP1qsai-PF92tC8";
              
              // Discord'a mesaj gönderme
              try {
                await axios.post(discordWebhookUrl, {
                  content: `🔔 **Yeni Facebook Yorumu**\n\n📝 **Yorum:** "${commentText}"\n👤 **Kullanıcı ID:** ${commenterId}\n⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`
                });
                console.log("Mesaj Discord'a gönderildi");
              } catch (error) {
                console.error("Discord'a mesaj gönderilirken hata oluştu:", error.message);
              }
            }
          }
        }
        res.status(200).json({ status: "EVENT_RECEIVED" });
      } else {
        res.status(404).json({ error: "Not Found" });
      }
    } catch (error) {
      console.error("Webhook işleme hatası:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }

  // Desteklenmeyen method
  res.status(405).json({ error: "Method Not Allowed" });
};
