# 📖 BNPB Chat Widget - Quick Reference

## 🚀 Quick Start (Copy & Paste)

```html
<script src="https://cdn.bnpb.go.id/chat-widget.iife.js"></script>
<script>
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id'
  });
</script>
```

---

## 📋 API Reference

### `window.initChatWidget(config)`

Initialize dan mount widget.

**Parameters:**
```typescript
{
  apiUrl?: string;      // Backend API URL (required)
  language?: 'id'|'en'; // Widget language (default: 'id')
  theme?: 'light'|'dark'; // Color theme (default: 'light')
  containerId?: string; // Custom container ID (default: 'chat-widget')
  autoOpen?: boolean;   // Auto open chat (default: false)
}
```

**Returns:** `Promise<VueApp>`

**Example:**
```javascript
window.initChatWidget({
  apiUrl: 'https://api.bnpb.go.id',
  language: 'id',
  theme: 'light'
}).then(app => {
  console.log('Widget ready!', app);
});
```

---

### `window.destroyChatWidget()`

Destroy widget instance dan cleanup.

**Example:**
```javascript
window.destroyChatWidget();
```

---

### `window.getWidgetInfo()`

Get widget information.

**Returns:**
```typescript
{
  name: string;         // "BNPB Chat Widget"
  version: string;      // "1.0.0"
  isInitialized: boolean; // true/false
  containerId: string | null; // container ID or null
}
```

**Example:**
```javascript
const info = window.getWidgetInfo();
console.log(info.version); // "1.0.0"
```

---

## 🎨 Styling

Widget menggunakan Tailwind dengan prefix `tw-` untuk menghindari konflik CSS.

### Custom Container

```html
<!-- Default -->
<div id="chat-widget"></div>

<!-- Custom -->
<div id="my-custom-chat"></div>
<script>
  window.initChatWidget({
    apiUrl: '...',
    containerId: 'my-custom-chat'
  });
</script>
```

---

## 🌍 Multi-Language

```javascript
// Bahasa Indonesia
window.initChatWidget({ language: 'id' });

// English
window.initChatWidget({ language: 'en' });
```

---

## 🎨 Theming

```javascript
// Light theme
window.initChatWidget({ theme: 'light' });

// Dark theme
window.initChatWidget({ theme: 'dark' });
```

---

## 🔧 Advanced Examples

### Conditional Loading

```javascript
if (userIsLoggedIn) {
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id'
  });
}
```

### Delayed Loading

```javascript
setTimeout(() => {
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id'
  });
}, 3000); // Load after 3 seconds
```

### Event-triggered Loading

```javascript
document.getElementById('chat-button').addEventListener('click', () => {
  window.initChatWidget({
    apiUrl: 'https://api.bnpb.go.id',
    autoOpen: true
  });
});
```

### Error Handling

```javascript
window.initChatWidget({
  apiUrl: 'https://api.bnpb.go.id'
})
.then(app => {
  console.log('✅ Widget loaded');
})
.catch(error => {
  console.error('❌ Widget failed:', error);
  // Show fallback UI
  showFallbackContactForm();
});
```

---

## 🧪 Testing

```javascript
// Check if widget is loaded
if (window.initChatWidget) {
  console.log('Widget script loaded ✅');
  
  // Get info without initializing
  const info = window.getWidgetInfo();
  console.log('Initialized:', info.isInitialized);
}
```

---

## 🐛 Debugging

### Enable Verbose Logging

```javascript
// Widget automatically logs to console
// Check browser console for messages like:
// ✅ BNPB Chat Widget initialized successfully
//    API URL: https://api.bnpb.go.id
//    Language: id
//    Theme: light
```

### Check Widget Status

```javascript
const info = window.getWidgetInfo();
if (info.isInitialized) {
  console.log('Widget is running on', info.containerId);
} else {
  console.log('Widget not initialized');
}
```

---

## ⚠️ Common Issues

### Widget tidak muncul

1. Check console untuk errors
2. Pastikan script tag di akhir `<body>`
3. Verify API URL benar
4. Check network tab untuk failed requests

### CSS conflicts

Widget sudah isolated dengan prefix `tw-`, tapi jika ada conflict:

```css
/* Force widget styles */
#chat-widget * {
  all: revert;
}
```

### Multiple instances warning

Widget hanya support 1 instance. Kalau init ulang, instance lama otomatis di-destroy.

---

## 📦 Bundle Info

- **Format:** IIFE (Immediately Invoked Function Expression)
- **Size:** 7.7 MB uncompressed, 2.9 MB gzipped
- **Dependencies:** All bundled (Vue, Element Plus, Axios, etc.)
- **CSS:** Auto-injected (no separate CSS file needed)

---

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

**Minimum Requirements:**
- ES6+ support
- Modern browser (2020+)

---

## 📞 Support

- **Documentation:** See README.md
- **Issues:** GitHub Issues
- **Email:** support@bnpb.go.id

---

## 📄 License

Copyright © 2025 BNPB

---

**Version:** 1.0.0  
**Last Updated:** October 18, 2025
