/* Floating WhatsApp button, shown on every page. Update the link below if
   the channel/group ever changes — nothing else needs to change. */
window.WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbDjFSlB4hdZkyE6DH3L";

(function(){
  "use strict";

  var style = document.createElement('style');
  style.textContent =
    '.wa-fab{position:fixed;bottom:26px;left:26px;width:52px;height:52px;border-radius:50%;' +
    'background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;' +
    'box-shadow:0 10px 26px -8px rgba(15,23,42,.5);z-index:150;transition:transform .25s;}' +
    '.wa-fab:hover{transform:translateY(-4px) scale(1.06);}' +
    '.wa-fab svg{width:28px;height:28px;}' +
    '.wa-ring{position:absolute;inset:0;border-radius:50%;background:#25D366;opacity:.55;' +
    'animation:wa-pulse 2.2s ease-out infinite;}' +
    '@keyframes wa-pulse{0%{transform:scale(1);opacity:.55;}100%{transform:scale(1.7);opacity:0;}}' +
    '.wa-inline{display:inline-flex;align-items:center;gap:8px;color:#1f9c4d;font-weight:700;cursor:pointer;}' +
    '.wa-inline svg{width:18px;height:18px;flex-shrink:0;}' +
    '@media(prefers-reduced-motion:reduce){.wa-ring{animation:none;}}';
  document.head.appendChild(style);

  var iconSvg = '<svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M16.001 3C9.11 3 3.5 8.61 3.5 15.5c0 2.43.7 4.7 1.92 6.63L3.5 29l7.06-1.85a12.4 12.4 0 0 0 5.44 1.26h.01c6.89 0 12.5-5.61 12.5-12.5S22.9 3 16.001 3zm0 22.7c-1.83 0-3.6-.49-5.16-1.42l-.37-.22-3.94 1.03 1.05-3.84-.24-.4a10.2 10.2 0 0 1-1.57-5.35c0-5.65 4.6-10.25 10.24-10.25 2.74 0 5.31 1.07 7.24 3 1.93 1.94 3 4.51 3 7.25 0 5.65-4.6 10.2-10.25 10.2zm5.6-7.65c-.31-.15-1.81-.89-2.09-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.65-2.07-.18-.3-.02-.46.13-.61.15-.15.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.24-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.81.38-.28.3-1.08 1.05-1.08 2.57s1.11 2.98 1.26 3.19c.15.2 2.11 3.22 5.11 4.39 3 1.16 3 .78 3.54.73.54-.05 1.81-.74 2.06-1.46.26-.71.26-1.32.18-1.46-.08-.13-.28-.2-.59-.36z"/></svg>';

  function build(){
    var wrap = document.createElement('a');
    wrap.className = 'wa-fab';
    wrap.href = window.WHATSAPP_LINK;
    wrap.target = '_blank';
    wrap.rel = 'noopener';
    wrap.title = 'Chat with us on WhatsApp';
    wrap.setAttribute('aria-label', 'Chat with us on WhatsApp');
    wrap.innerHTML = '<span class="wa-ring"></span>' + iconSvg;
    document.body.appendChild(wrap);
  }

  window.whatsappIconSVG = iconSvg;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
