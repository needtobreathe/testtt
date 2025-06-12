# Facebook Sayfa Yorumları → Discord Bildirimi

Facebook sayfanıza gelen yorumları otomatik olarak Discord kanalına gönderen webhook sistemi.

## 🚀 Vercel'e Deploy

### 1. Projeyi GitHub'a yükleyin
```bash
git add .
git commit -m "Facebook to Discord webhook"
git push
```

### 2. Vercel'de deployment
1. [Vercel.com](https://vercel.com)'a gidin
2. GitHub ile giriş yapın
3. Repository'nizi import edin
4. Deploy butonuna tıklayın

### 3. Environment Variables (Zorunlu)
Vercel dashboard → Settings → Environment Variables:

```
VERIFY_TOKEN=commenttoken
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### 4. Facebook Developer Console ayarları
1. Meta for Developers'a gidin
2. Uygulamanızda Webhooks bölümüne gidin
3. Page subscription'ı etkinleştirin
4. Webhook URL: `https://your-project.vercel.app/webhook`
5. Verify Token: `commenttoken` (environment variable ile aynı)
6. Subscription Fields: `feed` seçin

## 🔧 Test Etmek İçin

**Webhook verification:**
```
https://your-project.vercel.app/webhook?hub.mode=subscribe&hub.verify_token=commenttoken&hub.challenge=test
```

Bu `test` döndürmelidir.

## 📝 Özellikler

- ✅ Sadece Facebook sayfa yorumlarını dinler
- ✅ Discord'a güzel formatlanmış bildirim gönderir
- ✅ Kullanıcı adı, yorum metni ve zaman bilgisi
- ✅ Hata yönetimi ve logging
- ✅ Vercel serverless functions ile otomatik ölçeklendirme
