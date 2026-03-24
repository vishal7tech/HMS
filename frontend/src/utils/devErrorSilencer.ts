// Dev-only silencer for noisy browser extension promise errors
// Filters the common Chrome extension message channel warning
if (typeof window !== 'undefined') {
  const isExtensionNoise = (reason: unknown) => {
    const msg = String((reason as any)?.message ?? reason ?? '');
    return msg.includes('A listener indicated an asynchronous response') &&
           msg.includes('message channel closed');
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionNoise(event.reason)) {
      event.preventDefault();
      // Optionally log once for visibility
      console.debug('[silenced] extension message channel warning');
    }
  });
}

