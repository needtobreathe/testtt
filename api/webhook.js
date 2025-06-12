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

    console.log(`Verification attempt - Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Facebook webhook doğrulandı");
      res.status(200).send(challenge);
    } else {
      console.log("❌ Facebook webhook doğrulanamadı - Token eşleşmedi");
      res.status(403).send("Forbidden");
    }
    return;
  }

  // Facebook page events (POST request)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      
      // Gelen veriyi logla (debug için)
      console.log("📦 Facebook'tan gelen veri:", JSON.stringify(body, null, 2));

      // Sayfa olayları
      if (body.object === "page") {
        for (const entry of body.entry) {
          console.log("🔍 Entry işleniyor:", JSON.stringify(entry, null, 2));
          
          // Changes array kontrolü
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              console.log("🔄 Change işleniyor:", JSON.stringify(change, null, 2));
              
              // Feed değişiklikleri ve yorumlar
              if (change.field === "feed" && change.value) {
                const value = change.value;
                
                // Yorum kontrolü - farklı formatlar
                if (value.item === "comment" || value.verb === "add") {
                  console.log("💬 Yorum tespit edildi!");
                  
                  const commentText = value.message || value.comment_text || "Yorum metni yok";
                  const commenterName = value.from?.name || value.sender_name || "Bilinmeyen";
                  const commenterId = value.from?.id || value.sender_id || "Bilinmeyen";
                  const postId = value.post_id || value.parent_id || "Bilinmeyen";
                  
                  // Discord mesajı
                  const discordMessage = `🔔 **Yeni Facebook Yorumu**\n\n` +
                    `👤 **Kullanıcı:** ${commenterName}\n` +
                    `💬 **Yorum:** "${commentText}"\n` +
                    `🆔 **ID:** ${commenterId}\n` +
                    `📄 **Post:** ${postId}\n` +
                    `⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`;
                  
                  await sendToDiscord(discordMessage);
                }
              }
            }
          }
          
          // Messaging events (alternatif format)
          if (entry.messaging) {
            for (const message of entry.messaging) {
              console.log("💌 Messaging event:", JSON.stringify(message, null, 2));
              
              if (message.message) {
                const text = message.message.text || "Mesaj metni yok";
                const senderId = message.sender?.id || "Bilinmeyen";
                
                const discordMessage = `📨 **Yeni Mesaj**\n\n` +
                  `💬 **İçerik:** "${text}"\n` +
                  `👤 **Gönderen:** ${senderId}\n` +
                  `⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`;
                
                await sendToDiscord(discordMessage);
              }
            }
          }
        }
        
        res.status(200).json({ status: "EVENT_RECEIVED" });
      } else {
        console.log("ℹ️ Sayfa olayı değil:", body.object);
        res.status(200).json({ status: "NOT_PAGE_EVENT" });
      }
    } catch (error) {
      console.error("❌ Webhook işleme hatası:", error);
      console.error("❌ Stack trace:", error.stack);
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }

  // Desteklenmeyen HTTP method
  res.status(405).json({ error: "Method Not Allowed" });
};
