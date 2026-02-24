/* ── device detection ── */
  function detectDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTouchNarrow = window.innerWidth <= 820;
    const isMobile = isMobileUA || isTouchNarrow;
    document.body.classList.toggle('is-mobile', isMobile);
    document.body.classList.toggle('is-desktop', !isMobile);
    return isMobile;
  }

  detectDevice();
  window.addEventListener('resize', detectDevice);