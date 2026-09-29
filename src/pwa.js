export async function registerPWA() {
  if (!('serviceWorker' in navigator) || !document.querySelector('meta[name="bunnydoom-version"]')) return null;
  try {
    const manifest = document.querySelector('link[rel="manifest"]');
    const root = new URL('.', manifest ? manifest.href : location.href);
    return await navigator.serviceWorker.register(new URL('sw.js', root), { scope: root.pathname, updateViaCache: 'none' });
  } catch (error) {
    console.warn('Offline installation unavailable:', error.message);
    return null;
  }
}
