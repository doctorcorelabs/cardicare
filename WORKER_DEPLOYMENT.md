# Panduan Deployment CardiCare

## Konfigurasi Cloudflare Worker

Proyek ini menggunakan Cloudflare Workers sebagai backend API. Deployment dilakukan dengan cara berikut:

### Deployment dengan Workers.dev (Disarankan)

Metode ini menggunakan subdomain `.workers.dev` dari Cloudflare yang tidak memerlukan konfigurasi domain kustom.

1. Login ke akun Cloudflare Anda:
```bash
npx wrangler login
```

2. Deploy worker:
```bash
cd cloudflare-worker
npm run deploy
```

3. Worker akan tersedia di URL: `https://<worker-name>.<account-name>.workers.dev`
   Misalnya: `https://heart-health-ai-assistant.daivanlabs.workers.dev`

4. Pastikan URL API dalam `.env.production` dan `vite.config.ts` sesuai dengan URL worker Anda.

### Deployment dengan Domain Kustom (Opsional)

Jika Anda ingin menggunakan domain kustom:

1. Daftarkan domain Anda di Cloudflare.
2. Di dashboard Cloudflare, pastikan domain dikonfigurasi sebagai "Proxied".
3. Edit `wrangler.toml` dan aktifkan custom domain:
```toml
routes = [
  { pattern = "api.yourdomain.com", custom_domain = true }
]
```

4. Update `.env.production` dan `vite.config.ts` dengan domain kustom Anda.

## Mangatasi Masalah Umum

### Error "Could not find zone for domain"

Jika Anda mendapatkan error:
```
X [ERROR] Could not find zone for `api.yourdomain.com`. Make sure the domain is set up to be proxied by Cloudflare.
```

Solusi:
1. Pastikan domain terdaftar di Cloudflare.
2. Pastikan DNS sudah dikonfigurasi dengan benar.
3. Gunakan pendekatan Workers.dev sementara.

### API Tidak Dapat Diakses

Jika API tidak dapat diakses setelah deployment:
1. Periksa status worker di dashboard Cloudflare
2. Tes endpoint `/ping` untuk memeriksa ketersediaan
3. Periksa log deployment untuk error

## Deployment Frontend

1. Build aplikasi frontend:
```bash
npm run build
```

2. Upload folder `dist` ke hosting Anda (GitHub Pages, Netlify, Vercel, dll).

## Pemantauan dan Troubleshooting

1. Pantau penggunaan worker di dashboard Cloudflare
2. Gunakan endpoint `/ping` untuk health check
3. Jika terjadi masalah, periksa log wrangler:
```bash
npx wrangler tail
```
