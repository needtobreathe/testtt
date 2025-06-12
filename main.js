const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios"); // Discord'a istek göndermek için
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const discordWebhookUrl = "https://discord.com/api/webhooks/1377251013395742730/_F3itUGe0uVeoG7C9hGGr0p-vNev_4PJdFaAjeep7V0h-3E4OvoBWCP1qsai-PF92tC8";

async function sendToDiscord(message) {
  try {
    // Mesaj 2000 karakterden uzunsa kısalt
    const truncatedMessage = message.length > 1900 ? message.substring(0, 1900) + '...' : message;
    
    await axios.post(discordWebhookUrl, { 
      content: truncatedMessage,
      username: "Facebook Bot",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/733/733547.png"
    });
    console.log("✅ Discord mesajı gönderildi");
  } catch (error) {
    console.error("❌ Discord'a mesaj gönderilirken hata oluştu:", error.message);
  }
}

app.get("/webhook", async (req, res) => {
  const VERIFY_TOKEN = "commenttoken";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(`Facebook webhook doğrulama - Mode: ${mode}, Token: ${token}`);
  
  // Debug için Discord'a gönder (opsiyonel)
  await sendToDiscord(`🔍 GET /webhook - Mode: ${mode}, Token: ${token ? 'var' : 'yok'}`);

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK DOĞRULANDI");
    await sendToDiscord("✅ Facebook webhook başarıyla doğrulandı!");
    res.status(200).send(challenge);
  } else {
    console.log("❌ WEBHOOK DOĞRULANAMADI");
    await sendToDiscord(`❌ Webhook doğrulanamadı - Beklenen: ${VERIFY_TOKEN}, Gelen: ${token}`);
    res.status(403).send("Forbidden");
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Debug: Gelen veriyi Discord'a gönder
    await sendToDiscord(`📦 POST /webhook geldi:\n\`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\``);

    if (body.object === "page") {
      // Her entry için işlem yap
      for (const entry of body.entry) {
        // Changes array kontrolü
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            // Feed değişiklikleri kontrolü
            if (change.field === "feed" && change.value) {
              const value = change.value;
              
              // Yorum kontrolü - Facebook farklı formatlar kullanabilir
              if (value.item === "comment" || value.verb === "add") {
                const commentText = value.message || value.comment_text || "Yorum metni bulunamadı";
                const commenterName = value.from?.name || "Bilinmeyen kullanıcı";
                const commenterId = value.from?.id || "Bilinmeyen ID";
                const postId = value.post_id || value.parent_id || "Bilinmeyen post";
                
                console.log(`✅ Yeni yorum tespit edildi: "${commentText}" - ${commenterName}`);
                
                // Discord'a güzel formatlı mesaj gönder
                const discordMessage = `🔔 **Yeni Facebook Yorumu**\n\n` +
                  `👤 **Kullanıcı:** ${commenterName}\n` +
                  `💬 **Yorum:** "${commentText}"\n` +
                  `🆔 **Kullanıcı ID:** ${commenterId}\n` +
                  `📄 **Post ID:** ${postId}\n` +
                  `⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`;
                
                await sendToDiscord(discordMessage);
              }
              // Diğer feed eventleri için log
              else {
                console.log(`ℹ️ Feed eventi: ${value.item || value.verb || 'bilinmeyen'}`);
                await sendToDiscord(`ℹ️ Feed eventi tespit edildi: ${value.item || value.verb || 'bilinmeyen'}`);
              }
            }
            // Diğer field türleri için log
            else {
              console.log(`ℹ️ Field: ${change.field}`);
              await sendToDiscord(`ℹ️ Webhook field: ${change.field}`);
            }
          }
        }
        
        // Messaging events (direkt mesajlar için)
        if (entry.messaging) {
          for (const message of entry.messaging) {
            if (message.message && message.message.text) {
              const text = message.message.text;
              const senderId = message.sender?.id || "Bilinmeyen";
              
              const discordMessage = `📨 **Yeni Mesaj**\n\n` +
                `💬 **İçerik:** "${text}"\n` +
                `👤 **Gönderen ID:** ${senderId}\n` +
                `⏰ **Zaman:** ${new Date().toLocaleString('tr-TR')}`;
              
              await sendToDiscord(discordMessage);
            }
          }
        }
      }
      
      res.status(200).json({ status: "EVENT_RECEIVED" });
    } else {
      console.log(`ℹ️ Sayfa eventi değil: ${body.object}`);
      await sendToDiscord(`ℹ️ Sayfa eventi değil: ${body.object}`);
      res.status(200).json({ status: "NOT_PAGE_EVENT" });
    }
  } catch (error) {
    console.error("❌ Webhook işleme hatası:", error);
    await sendToDiscord(`❌ Webhook hatası: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook sunucusu ${PORT} portunda çalışıyor`);
});
