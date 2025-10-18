# 🚀 Deployment Guide - BNPB Chat Widget

Panduan lengkap untuk deploy BNPB Chat Widget ke production.

## 📋 Pre-requisites

- [ ] Node.js v20.19+ atau v22.12+
- [ ] npm atau yarn
- [ ] Git
- [ ] Access ke CDN atau hosting (CloudFlare, AWS S3, dll)

## 🏗️ Build untuk Production

### 1. Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan konfigurasi production
nano .env
```

**Example .env:**
```env
VITE_APP_API_URL=https://api.bnpb.go.id
VITE_APP_NAME=BNPB Chat Widget
VITE_APP_VERSION=1.0.0
VITE_APP_DEMO=chat-widget
VITE_BASE_CONFIG=production
# VITE_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

Output akan ada di folder `dist/`:
- `chat-widget.iife.js` - Main widget file (semua CSS sudah ter-inject)

### 4. Test Build Locally

```bash
# Serve build hasil
npx serve .

# Buka http://localhost:3000/test-widget.html
```

## 📦 Deployment Options

### Option 1: CloudFlare CDN (Recommended)

#### Setup CloudFlare Pages

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login ke CloudFlare
wrangler login

# 3. Create new project
wrangler pages create bnpb-chat-widget

# 4. Deploy
wrangler pages deploy dist
```

#### Usage dari CDN:

```html
<script src="https://bnpb-chat-widget.pages.dev/chat-widget.iife.js"></script>
<script>
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id'
  });
</script>
```

### Option 2: AWS S3 + CloudFront

#### Setup S3 Bucket

```bash
# 1. Create S3 bucket
aws s3 mb s3://bnpb-chat-widget

# 2. Enable static website hosting
aws s3 website s3://bnpb-chat-widget \
  --index-document index.html

# 3. Upload files
aws s3 sync dist/ s3://bnpb-chat-widget/ \
  --acl public-read \
  --cache-control "max-age=31536000"

# 4. Setup CloudFront distribution (optional tapi recommended)
```

#### Usage:

```html
<script src="https://d1234567890.cloudfront.net/chat-widget.iife.js"></script>
```

### Option 3: jsDelivr (GitHub Releases)

#### Steps:

1. **Create GitHub Release:**

```bash
# Tag version
git tag v1.0.0
git push origin v1.0.0

# Create release di GitHub dengan dist/chat-widget.iife.js
```

2. **Usage via jsDelivr:**

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/gh/bnpb/chat-widget@latest/dist/chat-widget.iife.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/gh/bnpb/chat-widget@1.0.0/dist/chat-widget.iife.js"></script>
```

### Option 4: Self-hosted (Nginx/Apache)

#### Nginx Configuration:

```nginx
server {
    listen 80;
    server_name widget.bnpb.go.id;

    root /var/www/chat-widget;
    index index.html;

    # CORS headers untuk allow embedding
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept";

    # Cache control
    location ~* \.(js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript;
    gzip_min_length 1000;
}
```

#### Deploy:

```bash
# Copy files ke server
scp -r dist/* user@server:/var/www/chat-widget/

# Restart nginx
ssh user@server 'sudo systemctl restart nginx'
```

## 🔐 Security Best Practices

### 1. Content Security Policy (CSP)

Website yang embed widget perlu CSP yang mengizinkan:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.example.com; 
               style-src 'self' 'unsafe-inline'; 
               connect-src https://api.bnpb.go.id;">
```

### 2. Subresource Integrity (SRI)

Generate SRI hash untuk file JS:

```bash
# Generate SRI hash
cat dist/chat-widget.iife.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Usage dengan SRI:

```html
<script 
  src="https://cdn.example.com/chat-widget.iife.js"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous">
</script>
```

### 3. Rate Limiting

Setup rate limiting di CDN atau API gateway untuk mencegah abuse.

## 📊 Monitoring & Analytics

### 1. Sentry Integration

Widget sudah support Sentry untuk error tracking. Set di `.env`:

```env
VITE_APP_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 2. Usage Analytics

Track widget usage dengan custom events:

```javascript
// Di website yang embed widget
window.initChatWidget({
  apiUrl: 'https://api.bnpb.go.id'
}).then(() => {
  // Track successful init
  gtag('event', 'widget_loaded', {
    'event_category': 'chat_widget',
    'event_label': 'v1.0.0'
  });
});
```

## 🔄 Versioning Strategy

### Semantic Versioning

- **Major (1.x.x)**: Breaking changes
- **Minor (x.1.x)**: New features, backward compatible
- **Patch (x.x.1)**: Bug fixes

### Release Process

```bash
# 1. Update version di package.json
npm version patch  # atau minor, major

# 2. Build
npm run build

# 3. Tag & push
git push origin main --tags

# 4. Create GitHub release

# 5. Deploy ke CDN
```

## 🧪 Testing Checklist

Before deploying to production:

- [ ] Build berhasil tanpa error
- [ ] Test di `test-widget.html` berfungsi
- [ ] Test di different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test di mobile devices
- [ ] Test embedding di website berbeda framework:
  - [ ] Plain HTML
  - [ ] WordPress
  - [ ] React App
  - [ ] Vue App
  - [ ] Angular App
- [ ] Test konflik CSS (embed di website dengan Tailwind/Bootstrap)
- [ ] Test performance (load time < 5s)
- [ ] Test dengan slow 3G network
- [ ] Verify Sentry error tracking works
- [ ] Test API connectivity
- [ ] Test multi-language support (ID/EN)
- [ ] Test theme switching (light/dark)

## 📝 Integration Documentation

Buat documentation untuk users yang akan embed widget:

### Quick Start Guide:

```markdown
# BNPB Chat Widget - Integration Guide

## Quick Start (< 5 minutes)

Add this code before closing `</body>` tag:

\`\`\`html
<script src="https://cdn.bnpb.go.id/chat-widget.iife.js"></script>
<script>
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id'
  });
</script>
\`\`\`

That's it! Widget akan muncul di pojok kanan bawah.

## Advanced Configuration

\`\`\`javascript
window.initChatWidget({
  apiUrl: 'https://api.bnpb.go.id',
  language: 'id',  // 'id' or 'en'
  theme: 'light',  // 'light' or 'dark'
  containerId: 'custom-chat-widget'
});
\`\`\`

## Support

Email: support@bnpb.go.id
\`\`\`

## 🚨 Rollback Plan

Jika ada issue di production:

### Quick Rollback:

```bash
# 1. Point CDN ke previous version
# Contoh di CloudFlare:
wrangler pages deployment list
wrangler pages deployment rollback <DEPLOYMENT_ID>

# 2. Or update CDN URL ke previous tag
# From: /chat-widget@1.0.1/dist/chat-widget.iife.js
# To:   /chat-widget@1.0.0/dist/chat-widget.iife.js
```

## 📞 Post-Deployment

- [ ] Update documentation dengan CDN URL baru
- [ ] Notify stakeholders
- [ ] Monitor error rates di Sentry
- [ ] Monitor API usage
- [ ] Collect user feedback
- [ ] Setup alerts untuk downtime

## 🎯 Performance Targets

- **Load Time**: < 3 seconds (Fast 3G)
- **First Paint**: < 1 second
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 1 MB gzipped
- **Lighthouse Score**: > 90

## 📈 Success Metrics

Track these metrics:

- Widget load success rate
- Average load time
- API response time
- Error rate
- Daily active users
- Chat sessions initiated
- User satisfaction score

---

**Built with ❤️ by BNPB Team**
