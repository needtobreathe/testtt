# Facebook to Discord Webhook

Bu proje Facebook sayfa yorumlarını Discord kanalına otomatik olarak gönderen bir webhook uygulamasıdır.

## Vercel'e Deployment

### 1. Projeyi GitHub'a yükleyin
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/kullanici-adi/repo-adi.git
git push -u origin main
```

### 2. Vercel'de deployment
1. [Vercel.com](https://vercel.com)'a gidin
2. GitHub hesabınızla giriş yapın
3. "New Project" butonuna tıklayın
4. Repository'nizi seçin
5. "Deploy" butonuna tıklayın

### 3. Environment Variables'ları ayarlayın
Vercel dashboard'da projenizin Settings > Environment Variables bölümüne gidin ve şu değişkenleri ekleyin:

- `VERIFY_TOKEN`: Facebook webhook doğrulama token'ı
- `DISCORD_WEBHOOK_URL`: Discord webhook URL'niz

### 4. Facebook Webhook'u yapılandırın
Facebook Developer Console'da webhook URL'nizi şu şekilde ayarlayın:
```
https://your-vercel-domain.vercel.app/webhook
```

## Local Development

1. Dependencies'leri yükleyin:
```bash
npm install
```

2. Environment variables'ları ayarlayın:
```bash
cp .env.example .env.local
# .env.local dosyasını kendi değerlerinizle düzenleyin
```

3. Development server'ı başlatın:
```bash
npm run dev
```

## API Endpoints

- `GET /webhook` - Facebook webhook doğrulama
- `POST /webhook` - Facebook yorumlarını alma ve Discord'a gönderme

## Özellikler

- ✅ Facebook sayfa yorumlarını dinler
- ✅ Discord'a otomatik bildirim gönderir
- ✅ Vercel serverless functions ile optimize edilmiş
- ✅ Environment variables ile güvenli yapılandırma
- ✅ Error handling ve logging
