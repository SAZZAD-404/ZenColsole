export default function manifest() {
  return {
    name: 'ZenConsole - AI Infrastructure Management',
    short_name: 'ZenConsole',
    description: 'Premium platform for managing AI providers. Unified endpoint, secure key management, real-time monitoring, and effortless scaling.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1318',
    theme_color: '#0B7C8F',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
