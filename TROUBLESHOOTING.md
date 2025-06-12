# Facebook Webhook Sorun Giderme Rehberi

## 🚨 Facebook'tan Bildirim Alamama Probleminin Çözümü

### 1. Webhook URL'nizi Test Edin
Önce webhook'unuzun çalışıp çalışmadığını test edin:
```
GET: https://your-domain.vercel.app/test
```
Bu Discord'a test mesajı gönderir.

### 2. Facebook Developer Console Kontrolleri

#### A) Webhook Verification
- URL: `https://your-domain.vercel.app/webhook`
- Verify Token: `commenttoken`
- Bu GET isteği 200 döndürmeli

#### B) Webhook Fields (Önemli!)
Facebook App Settings > Webhooks bölümünde **mutlaka** şu alanları seçin:
- ✅ `feed` (sayfa gönderileri ve yorumlar için)
- ✅ `conversations` (mesajlar için)
- ✅ `comments` (yorumlar için)

#### C) Sayfaya Subscription
Webhook'u oluşturduktan sonra **mutlaka** sayfanıza subscribe edin:
1. Webhooks sayfasında "Add subscription" 
2. Page'i seçin
3. İlgili events'i seçin (feed, comments)

### 3. Sayfa Permissions
Facebook sayfanızda:
- Page Management Permission
- Page Content Management
- Page Messaging (eğer mesajları da istiyorsanız)

### 4. App Review (Önemli!)
Bazı webhook events için Facebook App Review gerekebilir:
- `pages_messaging` - Mesajlar için
- `page_events` - Sayfa etkinlikleri için

### 5. Debug URL'leri

#### Test Webhook'u:
```
https://your-domain.vercel.app/test
```

#### Manual Comment Test:
Sayfanıza gerçek yorum yapın ve Vercel logs'ları kontrol edin.

#### Facebook Graph API Test:
```
https://developers.facebook.com/tools/debug/
```

### 6. Vercel Logs Kontrolü
Vercel Dashboard > Functions > View Function Logs
- Gelen istekleri görebilir
- Hata mesajlarını takip edebilirsiniz

### 7. Yaygın Sorunlar ve Çözümleri

#### Problem: Webhook verification başarısız
**Çözüm:** Token eşleşmediği için. `.env` dosyasında `VERIFY_TOKEN=commenttoken` olmalı.

#### Problem: Events gelmiyor
**Çözüm:** 
- Webhook fields doğru seçilmemiş
- Page subscription yapılmamış
- App permissions yetersiz

#### Problem: 404 hatası
**Çözüm:**
- URL yanlış: `https://domain.vercel.app/webhook` olmalı
- Vercel deployment hatası

### 8. Elle Test
1. Facebook sayfanıza bir gönderi yapın
2. O gönderiye yorum yazın
3. Vercel logs'larında activity olup olmadığını kontrol edin
4. Discord'ta mesaj gelip gelmediğini kontrol edin

### 9. Debug Modunda Çalıştırma
Kodda debug loglar açık, Facebook'tan gelen tüm veriyi görebilirsiniz:
```
console.log("📦 Facebook'tan gelen veri:", JSON.stringify(body, null, 2));
```

Bu Vercel function logs'ında görünecek.
