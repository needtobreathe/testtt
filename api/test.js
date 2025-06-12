const axios = require("axios");

module.exports = async (req, res) => {
  try {
    // Discord webhook URL
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1377251013395742730/_F3itUGe0uVeoG7C9hGGr0p-vNev_4PJdFaAjeep7V0h-3E4OvoBWCP1qsai-PF92tC8";
    
    // Test mesajı gönder
    const testMessage = `🧪 **Test Mesajı**\n\n` +
      `✅ Webhook çalışıyor!\n` +
      `🔗 Vercel deployment başarılı\n` +
      `📡 Discord bağlantısı aktif\n` +
      `⏰ Test zamanı: ${new Date().toLocaleString('tr-TR')}`;
    
    await axios.post(discordWebhookUrl, {
      content: testMessage
    });
    
    res.status(200).json({
      success: true,
      message: "Test mesajı Discord'a gönderildi!",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Test hatası:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
