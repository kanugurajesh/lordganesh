const icons = {
  diya: '<path d="M4 14h16c-1 8-15 8-16 0Z"/><path d="M12 3c5 6 4 9 0 9-4-1-4-4 0-9Z"/><path d="M7 22h10"/>',
  flower: '<path d="M12 12C3 12 4 4 8 5c-1-6 9-6 8 0 5-2 7 6 0 7 6 5-2 11-4 4-3 7-10 1-4-4Z"/><circle cx="12" cy="10" r="2"/><path d="M12 17v6"/>',
  blessing: '<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z"/><path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6Z"/>',
  replay: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
};
const icon = (name: keyof typeof icons) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

export function createInterface() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <main class="experience is-loading" id="experience">
      <div id="scene" role="img" aria-label="An interactive golden sculpture of Lord Ganesha in a softly lit mandap. Drag to look around."></div>
      <div class="scene-shade" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>
      <header class="masthead">
        <a class="wordmark" href="./" aria-label="Ganesh, return to the beginning"><span class="brand-symbol" aria-hidden="true">ॐ</span><span>GANESH<span class="wordmark-sub">A CELEBRATION OF NEW BEGINNINGS</span></span></a>
        <div class="header-right"><span class="festival-tag"><i></i> GANESH CHATURTHI</span><button class="moment-nav" id="open-moment" data-open-moment>Your moment <span>✧</span></button><button id="focus-view" class="focus-button" aria-label="Focus on the shrine" aria-pressed="false" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="3"/></svg></button></div>
      </header>
      <section class="intro-copy" aria-labelledby="title">
        <div class="eyebrow"><span></span> A MOMENT OF DEVOTION</div>
        <h1 id="title">Ganesh<span class="title-period">.</span></h1>
        <p class="subtitle">The Remover<br>of Obstacles</p>
        <div class="copy-rule"></div>
        <p class="description">Every new beginning starts with a blessing.<br>Pause. Breathe. Let the light find you.</p>
        <div class="sanskrit" lang="sa">वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ</div>
        <p class="mantra-translation">A presence as radiant as a million suns.</p>
        <button class="moment-invitation" data-open-moment><span class="invitation-spark">✧</span> Make a little space for yourself <span>→</span></button>
      </section>
      <div class="shrine-label"><span class="label-line"></span><span>श्री गणेशाय नमः</span><span class="label-line"></span></div>
      <div class="explore-hint"><span>↔</span> DRAG GENTLY TO EXPLORE</div>
      <section class="ritual-panel" aria-label="Devotional interactions">
        <div class="ritual-heading"><span class="tiny-diamond">✦</span><span>A SMALL RITUAL. AN INFINITE POSSIBILITY.</span><span class="tiny-diamond">✦</span></div>
        <div class="rituals">
          <button class="ritual" id="light-diya" disabled><span class="ritual-icon">${icon('diya')}</span><span class="ritual-copy"><strong>Light a diya</strong><small>Let your hope glow</small></span><span class="ritual-arrow">${icon('arrow')}</span></button>
          <button class="ritual" id="offer-flower" disabled><span class="ritual-icon">${icon('flower')}</span><span class="ritual-copy"><strong>Offer a flower</strong><small>A little gratitude</small></span><span class="ritual-arrow">${icon('arrow')}</span></button>
          <button class="ritual blessing-button" id="seek-blessings" disabled><span class="ritual-icon">${icon('blessing')}</span><span class="ritual-copy"><strong>Seek blessings</strong><small>Open your heart</small></span><span class="ritual-arrow">${icon('arrow')}</span></button>
        </div>
      </section>
      <footer><a class="model-credit" href="${import.meta.env.BASE_URL}licenses/ganesha.html" target="_blank" rel="noopener">SCULPTURE BY VIJAY SAINI ↗</a><button id="replay" aria-label="Replay the opening">${icon('replay')} REPLAY THE MOMENT</button><span class="footer-right">LIGHT · GRATITUDE · NEW BEGINNINGS</span></footer>
      <div class="loading-screen" aria-label="Preparing the shrine"><div class="loading-diya">${icon('diya')}</div><p>A little light.<br><em>A new beginning.</em></p><span class="loading-line"></span><small id="loading-label">PREPARING YOUR MOMENT</small></div>
      <div class="intro-caption"><span>From a little light,</span><em>infinite beginnings.</em></div><button id="skip-intro">SKIP INTRO ${icon('arrow')}</button>
      <div class="toast" role="status" aria-live="polite"></div>
      <dialog class="blessing-dialog" aria-labelledby="blessing-title"><form method="dialog"><div class="blessing-mark">ॐ</div><p class="eyebrow">CARRY THIS LIGHT WITH YOU</p><h2 id="blessing-title">May Lord Ganesha remove<br>every obstacle from your path.</h2><div class="blessing-rule">✦</div><p class="festival-wish">Happy Ganesh Chaturthi</p><p class="blessing-sanskrit" lang="sa">गणपति बप्पा मोरया</p><button class="return-button">Return to the shrine ${icon('arrow')}</button><button type="button" id="keep-blessing" class="keep-blessing">Save a blessing card ↓</button></form></dialog>
      <div class="fallback" hidden><span>ॐ</span><h2>A moment of stillness.</h2><p>The interactive shrine needs WebGL.<br>You can still take this blessing with you.</p><blockquote>May Lord Ganesha remove every obstacle from your path.</blockquote><p>Happy Ganesh Chaturthi</p></div>
    </main>`;
  const root = document.querySelector<HTMLElement>('#experience')!;
  const buttons = ['light-diya', 'offer-flower', 'seek-blessings'].map(id => document.getElementById(id) as HTMLButtonElement);
  let toastTimer: ReturnType<typeof setTimeout>;
  return {
    root, buttons,
    progress(message: string) { document.querySelector<HTMLElement>('#loading-label')!.textContent = message; },
    loaded() { root.classList.remove('is-loading'); root.classList.add('is-intro'); },
    ready() { root.classList.remove('is-intro'); root.classList.add('is-ready'); buttons.forEach(b => b.disabled = b.dataset.complete === 'true'); },
    toast(message: string) { const toast = document.querySelector<HTMLElement>('.toast')!; toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3300); },
    blessing(active: boolean) { root.classList.toggle('is-blessing', active); buttons.forEach(b => b.disabled = active || b.dataset.complete === 'true'); },
    showBlessing() { const dialog = document.querySelector<HTMLDialogElement>('.blessing-dialog')!; if (!dialog.open) dialog.showModal(); },
    fallback() { root.classList.remove('is-loading', 'is-intro'); root.classList.add('has-fallback'); document.querySelector<HTMLElement>('.fallback')!.hidden = false; },
  };
}
