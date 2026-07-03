/**
 * Mantém a tela acesa enquanto o jogo rola (Screen Wake Lock API).
 * Retorna uma função de cleanup para usar direto num useEffect.
 * Em navegadores sem suporte, vira um no-op silencioso.
 */
export function acquireWakeLock(): () => void {
  let sentinel: WakeLockSentinel | null = null;
  let released = false;

  const request = async () => {
    try {
      if (!released && 'wakeLock' in navigator && document.visibilityState === 'visible') {
        sentinel = await navigator.wakeLock.request('screen');
      }
    } catch {
      // sem suporte ou economia de bateria ativa — o jogo segue normalmente
    }
  };

  // O lock é solto pelo sistema quando o app vai para segundo plano; retomamos ao voltar.
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void request();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  void request();

  return () => {
    released = true;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    void sentinel?.release().catch(() => {});
  };
}
