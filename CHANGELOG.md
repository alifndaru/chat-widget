# Changelog

All notable changes to BNPB Chat Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-18

### 🎉 Initial Release

#### Added
- ✅ **Widget Core Features**
  - Floating chat button di pojok kanan bawah
  - Conversation list management
  - Real-time messaging dengan API backend
  - Auto session management dengan visitor tracking
  - Browser fingerprinting untuk identifikasi user

- ✅ **Build & Distribution**
  - IIFE format untuk easy embedding via `<script>` tag
  - CSS auto-injection (tidak perlu load file CSS terpisah)
  - Single file output: `chat-widget.iife.js`
  - Minified & optimized for production
  - Gzipped size: ~2.9 MB

- ✅ **API & Configuration**
  - Global `window.initChatWidget(config)` untuk initialization
  - Configurable API URL
  - Multi-language support (Indonesian & English)
  - Theme support (light & dark mode)
  - Custom container ID support

- ✅ **Developer Experience**
  - TypeScript support dengan full type definitions
  - `window.getWidgetInfo()` untuk debugging
  - `window.destroyChatWidget()` untuk cleanup
  - Comprehensive error handling & logging
  - Auto-prevention of multiple instances

- ✅ **Styling & UI**
  - Tailwind CSS dengan prefix `tw-` untuk CSS isolation
  - Responsive design (desktop & mobile)
  - Element Plus UI components
  - KeenThemes icons (duotone, outline, solid)
  - Smooth animations & transitions

- ✅ **Services & State Management**
  - Pinia untuk state management
  - Axios untuk HTTP requests
  - Vue I18n untuk internationalization
  - Sentry integration untuk error tracking
  - Local storage untuk session persistence

- ✅ **Testing & Documentation**
  - `test-widget.html` untuk local testing
  - Comprehensive README.md
  - Integration guide (`WIDGET_INTEGRATION.md`)
  - Deployment guide (`DEPLOYMENT.md`)
  - API documentation

#### Technical Details
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Package Manager**: npm
- **CSS Framework**: Tailwind CSS 4
- **UI Library**: Element Plus 2
- **State Management**: Pinia 3
- **HTTP Client**: Axios
- **i18n**: Vue I18n 11

#### Removed
- ❌ Vue Router dependency (tidak diperlukan untuk widget)
- ❌ Separate CSS file (sudah ter-inject ke JS)

#### Fixed
- 🐛 Fixed build errors dari missing dependencies
- 🐛 Fixed TypeScript compilation errors
- 🐛 Fixed CSS injection untuk single-file bundle
- 🐛 Fixed import paths untuk components

### Configuration Example

```javascript
window.initChatWidget({
  apiUrl: 'https://api.bnpb.go.id',
  language: 'id',
  theme: 'light',
  containerId: 'chat-widget'
});
```

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Known Limitations
- Single widget instance per page (by design)
- Requires modern browser dengan ES6+ support
- Minimum Node.js v20.19+ untuk build (warning pada v20.15.1)

---

## [Unreleased]

### Planned Features
- [ ] Support for multiple widget instances
- [ ] Widget customization (colors, position, size)
- [ ] File upload support di chat
- [ ] Emoji picker
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Push notifications
- [ ] Audio notifications
- [ ] Chat history export
- [ ] Admin panel integration

### Under Consideration
- [ ] WebSocket support untuk real-time updates
- [ ] Video chat support
- [ ] Screen sharing
- [ ] Bot integration
- [ ] Analytics dashboard
- [ ] A/B testing support

---

**Note**: Untuk detail lengkap tentang setiap release, lihat [GitHub Releases](https://github.com/bnpb/chat-widget/releases).
