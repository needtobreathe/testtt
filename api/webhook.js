const axios = require("axios");

// Discord webhook URL - Environment variable'dan alınır
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1377251013395742730/_F3itUGe0uVeoG7C9hGGr0p-vNev_4PJdFaAjeep7V0h-3E4OvoBWCP1qsai-PF92tC8";

// Discord'a mesaj gönderme fonksiyonu
async function sendToDiscord(message) {
  try {
    await axios.post(discordWebhookUrl, { content: message });
    console.log("Discord mesajı gönderildi");
  } catch (error) {
    console.error("Discord'a mesaj gönderilirken hata:", error.message);
  }
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Facebook webhook verification (GET request)
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "commenttoken";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Facebook webhook doğrulandı");
      res.status(200).send(challenge);
    } else {
      console.log("❌ Facebook webhook doğrulanamadı");
      res.status(403).send("Forbidden");
    }
    return;
  }

  // Facebook page events (POST request)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Sadece sayfa olaylarını işle
      if (body.object === "page") {
        for (const entry of body.entry) {
          // Değişiklikleri kontrol et
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              // Sadece feed değişikliklerini ve yorumları işle
              if (change.field === "feed" && change.value && change.value.item === "comment") {
                const comment = change.value;
                
                // Yorum bilgilerini al
                const commentText = comment.message || "Yorum metni bulunamadı";
                const commenterName = comment.from?.name || "Bilinmeyen kullanıcı";
                const commenterId = comment.from?.id || "Bilinmeyen ID";
                const postId = comment.post_id || "Bilinmeyen post";
                
                console.log(`📝 Yeni yorum: ${commentText} - ${commenterName}`);
                
                // Discord'a gönderilecek mesaj
                const discordMessage = `🔔 **Yeni Facebook Sayfa Yorumu**\n\n` +
                  `👤 **Kullanıcı:** ${commenterName}\n` +
                  `💬 **Yorum:** "${commentText}"\n` +
                  `🆔 **Kullanıcı ID:** ${commenterId}\n` +
                  `📄 **Post ID:** ${postId}\n` +
                  `⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`;
                
                // Discord'a mesaj gönder
                await sendToDiscord(discordMessage);
              }
            }
          }
        }
        
        res.status(200).json({ status: "EVENT_RECEIVED" });
      } else {
        res.status(200).json({ status: "NOT_PAGE_EVENT" });
      }
    } catch (error) {
      console.error("❌ Webhook işleme hatası:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }

  // Desteklenmeyen HTTP method
  res.status(405).json({ error: "Method Not Allowed" });
};
