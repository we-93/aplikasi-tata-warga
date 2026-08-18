import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tatawarga.app',
  appName: 'Tata Warga',
  webDir: 'out',
  server: {
    url: 'https://tatawarga.web.id',
    cleartext: false
  }
};

export default config;
