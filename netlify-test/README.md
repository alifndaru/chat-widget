# BNPB Chat Widget - Netlify Test Page

## ⚠️ PENTING: Ngrok Free Tier Tidak Bisa Digunakan

### Masalah
Ngrok free tier **TIDAK BISA** digunakan untuk testing widget karena:
- Ngrok mengembalikan halaman HTML warning, bukan file JavaScript
- Browser menolak dengan error: `Refused to execute script because its MIME type ('text/html') is not executable`
- **Tidak ada solusi workaround** untuk ini di Ngrok free tier

### ✅ Solusi yang Benar

#### Option 1: Ngrok Paid Tier (Recommended untuk Testing)
```bash
# Upgrade ke Ngrok paid tier
# - Tidak ada warning page
# - Static domain name
# - Works perfectly dengan widget loading
# - Harga: ~$8/bulan
```

#### Option 2: Deploy ke Production (Recommended)
```bash
# Deploy Docker container ke server real
# 1. VPS (DigitalOcean, AWS, GCP, dll)
# 2. Setup domain & SSL
# 3. Widget akan bekerja sempurna
```

#### Option 3: Alternative Tunneling Tools

**LocalTunnel** (Free, no warning page):
```bash
npm install -g localtunnel
lt --port 6184
# Returns: https://random-name.loca.lt
```

**Serveo** (Free, SSH-based):
```bash
ssh -R 80:localhost:6184 serveo.net
# Returns: https://random.serveo.net
```

**Cloudflare Tunnel** (Free, production-grade):
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:6184
```

#### Option 4: Test di Localhost (Untuk Development)
```bash
# 1. Start Docker
make docker-up

# 2. Open test page di browser
# - Double click index.html
# - Atau serve dengan: python3 -m http.server 8080

# 3. Use URL: http://localhost:6184/chat-widget.iife.js
# 4. Click "Load Widget"
```

## 📦 Deploy Test Page ke Netlify

### Method 1: Drag & Drop (Paling Mudah)
1. Buka [app.netlify.com](https://app.netlify.com)
2. Login atau signup
3. Drag folder `netlify-test` ke Netlify drop zone
4. Done! Test page akan live di `https://your-site.netlify.app`

### Method 2: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd netlify-test
netlify deploy --prod
```

### Method 3: Git Integration
```bash
# 1. Create new repo hanya untuk test page
cd netlify-test
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# 2. Di Netlify dashboard
# - New site from Git
# - Connect repository
# - Deploy!
```

## 🧪 Testing Workflow

### Local Testing (Works Perfect!)
```bash
# Terminal 1: Start Docker
make docker-up

# Terminal 2: Serve test page
cd netlify-test
python3 -m http.server 8080

# Browser:
# 1. Open http://localhost:8080
# 2. Widget URL: http://localhost:6184/chat-widget.iife.js
# 3. Click "Load Widget"
# ✅ Works!
```

### Production Testing (Recommended)
```bash
# 1. Deploy Docker to production server
# 2. Setup domain: https://widget.yourdomain.com
# 3. Deploy test page to Netlify
# 4. In test page, use: https://widget.yourdomain.com/chat-widget.iife.js
# ✅ Works perfectly!
```

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build production image
docker build -t bnpb-chat-widget .

# Run on server
docker run -d \
  --name bnpb-chat-widget \
  --restart unless-stopped \
  -p 80:80 \
  bnpb-chat-widget

# Setup reverse proxy (nginx/caddy) untuk HTTPS
```

### Client Integration
```html
<!-- Di website client -->
<script src="https://widget.yourdomain.com/chat-widget.iife.js"></script>
<script>
  window.initChatWidget({
    apiUrl: 'https://dkms.bnpb.go.id/ai/api/cms-backend/api/v1',
    language: 'id',
    theme: 'light'
  }).then(() => {
    console.log('✅ BNPB Chat Widget loaded!');
  });
</script>
```

## 📊 Checklist Production

- [ ] Docker deployed to production server
- [ ] Domain setup & DNS configured
- [ ] SSL/HTTPS enabled (Let's Encrypt)
- [ ] CORS headers configured correctly
- [ ] Widget tested on multiple browsers
- [ ] Performance monitoring setup
- [ ] Error tracking configured (Sentry)
- [ ] Documentation provided to client
- [ ] Integration guide sent

## 🔧 Troubleshooting

### Error: MIME type 'text/html' is not executable
**Penyebab:** Ngrok free tier atau server mengembalikan HTML instead of JavaScript

**Solusi:**
- ✅ Gunakan Ngrok paid tier
- ✅ Deploy ke production
- ✅ Gunakan alternative tunneling tool
- ✅ Test di localhost

### Error: CORS blocking request
**Penyebab:** Server tidak mengirim CORS headers

**Solusi:**
```nginx
# nginx.conf sudah configured dengan:
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
```

### Widget tidak muncul
**Debug steps:**
1. Check browser console untuk errors
2. Verify widget URL accessible (curl test)
3. Check network tab untuk HTTP status
4. Verify initChatWidget() dipanggil setelah script load

## 📚 Resources

- [Ngrok Pricing](https://ngrok.com/pricing)
- [LocalTunnel](https://localtunnel.github.io/www/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Netlify Deploy Guide](https://docs.netlify.com/site-deploys/create-deploys/)

## ℹ️ Summary

**Widget sudah production-ready!** ✅

Yang perlu dilakukan:
1. **Untuk testing:** Gunakan localhost atau alternative tunneling tool (bukan Ngrok free)
2. **Untuk production:** Deploy Docker ke server real dengan domain proper
3. **Client integration:** Gunakan `<script src="https://your-domain.com/chat-widget.iife.js"></script>`

Widget ini sudah mengikuti best practices:
- ✅ Single file output dengan CSS embedded
- ✅ CORS configured
- ✅ Error handling proper
- ✅ TypeScript definitions
- ✅ Instance management
- ✅ Lightweight (no unnecessary dependencies)
