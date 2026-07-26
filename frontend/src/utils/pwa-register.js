import { registerSW } from 'virtual:pwa-register';

export const initPWA = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('Konten baru telah tersedia. Perbarui sekarang?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('Aplikasi Kinderfun siap digunakan secara offline.');
    },
  });
};
