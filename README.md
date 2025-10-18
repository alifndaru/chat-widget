# 💬 BNPB Chat Widget

Widget chat interaktif untuk website BNPB yang dapat di-embed di website mana pun menggunakan simple `<script>` tag.

## ✨ Features

- 🚀 **Easy Integration** - Embed dengan single `<script>` tag
- 📦 **Zero Dependencies** - Semua dependency sudah ter-bundle
- 🎨 **Isolated Styles** - CSS dengan prefix `tw-` untuk menghindari konflik
- 🌐 **Multi-language** - Support Bahasa Indonesia & English
- 📱 **Responsive** - Bekerja di desktop & mobile
- ⚡ **Lightweight** - Optimized & minified build
- 🔧 **Configurable** - Custom API URL & settings

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Integration di Website

#### Option 1: CDN (Recommended)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>My Website Content</h1>

  <!-- Load widget -->
  <script src="https://cdn.example.com/chat-widget.iife.js"></script>
  <script>
    // Initialize widget
    window.initChatWidget({
      apiUrl: 'https://api.bnpb.go.id'
    });
  </script>
</body>
</html>
```

#### Option 2: Self-hosted

```html
<script src="/path/to/dist/chat-widget.iife.js"></script>
<script>
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id'
  });
</script>
```

## ⚙️ Configuration

```typescript
window.initChatWidget({
  apiUrl: 'https://api.bnpb.go.id',  // API endpoint (required)
  containerId: 'chat-widget',         // Container ID (optional)
  theme: 'light',                     // Theme: 'light' | 'dark' (optional)
  language: 'id',                     // Language: 'id' | 'en' (optional)
  autoOpen: false                     // Auto open chat (optional)
});
```

## 🧪 Testing

Test widget dengan file `test-widget.html`:

```bash
# Build the widget
npm run build

# Serve locally untuk testing
npx serve .

# Buka http://localhost:3000/test-widget.html
```

## 🏗️ Project Structure

```
chat-widget/
├── src/
│   ├── components/     # Vue components
│   ├── composables/    # Vue composables
│   ├── core/           # Core services & helpers
│   ├── stores/         # Pinia stores
│   ├── types/          # TypeScript types
│   └── main.ts         # Entry point
├── dist/               # Build output
│   ├── chat-widget.iife.js   # Main bundle
│   └── chat-widget.css       # Styles (auto-injected)
└── test-widget.html    # Test page
```

## 🔧 API Methods

### `window.initChatWidget(config?)`

Initialize widget dengan optional configuration.

**Returns:** `Promise<App>` - Vue app instance

**Example:**
```javascript
const app = await window.initChatWidget({
  apiUrl: 'https://api.example.com'
});
```

### `window.destroyChatWidget()`

Destroy widget instance dan cleanup.

**Example:**
```javascript
window.destroyChatWidget();
```

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Pinia** - State management
- **Element Plus** - UI components
- **Tailwind CSS** - Utility-first CSS (with `tw-` prefix)
- **Vue I18n** - Internationalization
- **Axios** - HTTP client

## 📝 Development Notes

### CSS Isolation

Widget menggunakan Tailwind dengan prefix `tw-` untuk menghindari konflik CSS dengan website host:

```vue
<div class="tw-flex tw-items-center tw-justify-between">
  <!-- Content -->
</div>
```

### Router

Widget menggunakan Vue Router dengan hash mode untuk menghindari konflik dengan routing website host.

### Build Configuration

Build menggunakan format IIFE (Immediately Invoked Function Expression) yang optimal untuk widget:

```typescript
// vite.config.ts
build: {
  lib: {
    entry: './src/main.ts',
    name: 'BNPBChatWidget',
    formats: ['iife']
  }
}
```

## 🐛 Troubleshooting

### Widget tidak muncul

1. Pastikan script sudah ter-load dengan benar (check browser console)
2. Pastikan `initChatWidget()` dipanggil setelah script load
3. Check API URL sudah benar

### CSS conflict

Widget sudah menggunakan prefix `tw-` untuk Tailwind. Jika masih ada conflict, check browser DevTools untuk debug.

### Multiple instances

Widget secara default hanya support 1 instance per page. Jika `initChatWidget()` dipanggil lagi, instance lama akan di-destroy otomatis.

## 📄 License

Copyright © 2025 BNPB

## 👥 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@bnpb.go.id or create an issue in this repository.

---

**Built with ❤️ by BNPB Team**
