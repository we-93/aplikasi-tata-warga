import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tatawarga.app',
  appName: 'Tata Warga',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // Ganti URL ini dengan domain VPS CyberPanel Anda nanti
    // Contoh: url: 'https://tatawarga.yourdomain.com'
    url: 'http://10.0.2.2:3000', 
    cleartext: true
  }
};

export default config;
