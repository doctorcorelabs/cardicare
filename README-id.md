# CardiCare - Beat-by-Beat Heart Health

Aplikasi web informasi kesehatan jantung dengan fitur chat AI yang membantu pengguna memahami Acute Coronary Syndrome (ACS) dan analisis EKG.

## Fitur

- Informasi komprehensif tentang ACS 
- Chatbot AI untuk bantuan pengguna
- Interpreter EKG dengan upload gambar
- Kalkulator risiko penyakit jantung
- Daftar interaksi obat-obatan

## Teknologi

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui
- Backend: Cloudflare Workers
- AI: Google Gemini API

## Struktur Proyek

- `src/` - Kode frontend React
- `cloudflare-worker/` - API backend untuk chatbot
- `drug-interaction-worker/` - API untuk interaksi obat

## Cara Memulai

### Pengembangan Local

1. Install dependencies:
```bash
npm install
```

2. Jalankan server development:
```bash
npm run dev
```

3. Jalankan Cloudflare Worker secara local:
```bash
cd cloudflare-worker
npm install
npm run dev
```

### Deployment

Ada dua opsi deployment:

#### 1. Menggunakan Cloudflare Workers.dev (Disarankan)

Gunakan script yang telah disediakan:
```bash
./deploy-to-workers-dev.ps1
```

Ini akan men-deploy backend ke workers.dev dan build frontend.

Untuk detail lengkap, lihat [Panduan Deployment Worker](./WORKER_DEPLOYMENT.md)

#### 2. Menggunakan Domain Kustom

Jika Anda memiliki domain yang dikonfigurasi di Cloudflare, lihat [DEPLOYMENT.md](./DEPLOYMENT.md)

## Troubleshooting

### Chatbot Tidak Berfungsi

1. Periksa status API dengan mengunjungi `https://<worker-name>.<account>.workers.dev/ping`
2. Periksa apakah GEMINI_API_KEY telah diatur di Cloudflare Worker:
   ```bash
   cd cloudflare-worker
   npx wrangler secret put GEMINI_API_KEY
   ```
3. Pastikan URL API di `.env.production` atau `vite.config.ts` sudah benar

### Error Domain Kustom

Jika mendapatkan error seperti:
```
X [ERROR] Could not find zone for `api.cardicare.daivanlabs.site`
```

Gunakan pendekatan workers.dev seperti dijelaskan di [WORKER_DEPLOYMENT.md](./WORKER_DEPLOYMENT.md)

## Lisensi

MIT
