import { IntentionStore } from './intention';
import { StillnessTimer } from './stillness';
import { prompts } from './content';
import { hubView, intentionView, guideView, cardView } from './views';
import './style.css';

type View = 'hub' | 'intention' | 'guide' | 'card';
type Ritual = 'light' | 'flower' | 'blessing';

export function createFeatures(root: HTMLElement, toast: (message: string) => void) {
  const store = new IntentionStore(), visits = new Set<Ritual>();
  let focusScene = (_active: boolean) => {}, ready = false, focused = false, minuteActive = false;
  let currentView: View = 'hub';
  root.insertAdjacentHTML('beforeend', `
    <dialog class="feature-dialog" aria-labelledby="feature-title"><div class="feature-topbar"><button class="feature-back" aria-label="Back to your moment">← <span>YOUR MOMENT</span></button><button class="feature-close" aria-label="Close your moment">×</button></div><div class="feature-content"></div></dialog>
    <section class="stillness-panel" hidden aria-label="One quiet minute"><div class="minute-ring" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28"/><circle class="minute-progress" cx="32" cy="32" r="28"/></svg><span class="minute-seconds">60</span></div><div class="minute-copy"><span class="feature-kicker">ONE QUIET MINUTE</span><h2 id="minute-title">Arrive</h2><p id="minute-prompt" aria-live="polite">Let your shoulders settle. Breathe naturally.</p></div><button id="pause-minute">Pause</button><button id="end-minute">End moment</button></section>
    <div class="focus-return" hidden><span>TAKE A CLOSER LOOK · DRAG TO EXPLORE</span><button id="exit-focus">← Return to the shrine</button></div>`);
  const dialog = root.querySelector<HTMLDialogElement>('.feature-dialog')!;
  const content = dialog.querySelector<HTMLElement>('.feature-content')!;
  const minutePanel = root.querySelector<HTMLElement>('.stillness-panel')!;
  const pauseButton = root.querySelector<HTMLButtonElement>('#pause-minute')!;
  const endButton = root.querySelector<HTMLButtonElement>('#end-minute')!;
  const returnPanel = root.querySelector<HTMLElement>('.focus-return')!;
  const focusButton = document.querySelector<HTMLButtonElement>('#focus-view')!;

  function setFocus(active: boolean) {
    focused = active; root.classList.toggle('is-focus', active); focusButton.setAttribute('aria-pressed', String(active));
    focusButton.setAttribute('aria-label', active ? 'Exit focus view' : 'Focus on the shrine');
    returnPanel.hidden = !active || minuteActive; focusScene(active);
  }
  function updateVisit() { visits.forEach(ritual => { const el = content.querySelector<HTMLElement>(`[data-visit="${ritual}"]`); if (el) { el.classList.add('complete'); el.textContent = '✓ ' + ({ light: 'Light', flower: 'Gratitude', blessing: 'Blessing' }[ritual]); } }); }
  function show(view: View = 'hub') {
    currentView = view;
    const templates = { hub: hubView, intention: intentionView, guide: guideView, card: cardView };
    content.innerHTML = templates[view]();
    dialog.querySelector<HTMLButtonElement>('.feature-back')!.hidden = view === 'hub';
    dialog.classList.toggle('card-view', view === 'card');
    content.querySelectorAll<HTMLButtonElement>('[data-start-minute], [data-focus-shrine]').forEach(b => b.disabled = !ready);
    if (view === 'hub') {
      updateVisit();
      if (store.value) { const saved = content.querySelector<HTMLElement>('.saved-intention')!; saved.hidden = false; saved.querySelector('p')!.textContent = store.value; }
    }
    if (view === 'intention') {
      const input = content.querySelector<HTMLTextAreaElement>('#intention-text')!, check = content.querySelector<HTMLInputElement>('#remember-intention')!;
      input.value = store.value; check.checked = store.remembered;
      const count = () => { content.querySelector('#intention-count')!.textContent = `${input.value.length} / 180`; };
      input.addEventListener('input', count); count();
      content.querySelector('#intention-form')!.addEventListener('submit', event => {
        event.preventDefault();
        if (!input.value.trim()) { input.setCustomValidity('Write a little intention, or use Clear intention.'); input.reportValidity(); input.addEventListener('input', () => input.setCustomValidity(''), { once: true }); return; }
        const persisted = store.save(input.value, check.checked);
        show('hub'); toast(!persisted && check.checked ? 'Kept for this visit. This browser could not save it for later.' : store.remembered ? 'Your intention is saved on this device.' : 'Your intention is kept for this visit.');
      });
      content.querySelector('#clear-intention')!.addEventListener('click', () => { const cleared = store.clear(); input.value = ''; check.checked = false; count(); toast(cleared ? 'Your intention has been cleared.' : 'Cleared for this visit. Browser storage could not be accessed.'); });
    }
    if (view === 'card') {
      const check = content.querySelector<HTMLInputElement>('#include-intention')!, preview = content.querySelector<HTMLElement>('.card-intention')!;
      content.querySelector<HTMLElement>('.include-intention')!.hidden = !store.value;
      check.addEventListener('change', () => { preview.hidden = !check.checked; preview.textContent = check.checked ? store.value : ''; });
      content.querySelector('#download-card')!.addEventListener('click', async () => {
        const button = content.querySelector<HTMLButtonElement>('#download-card')!, status = content.querySelector<HTMLElement>('#card-status')!;
        button.disabled = true; status.textContent = 'Preparing your card…';
        try { const { downloadBlessingCard } = await import('./blessing-card'); await downloadBlessingCard(check.checked ? store.value : undefined); status.textContent = 'Your card is ready. Check your downloads.'; }
        catch { status.textContent = 'The card could not be saved. Please try again.'; }
        finally { button.disabled = false; }
      });
    }
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    // Make navigation between dialog pages clear to keyboard and screen-reader users.
    const heading = content.querySelector<HTMLElement>('h2')!; heading.tabIndex = -1; heading.focus({ preventScroll: true });
  }
  let previousPrompt = -1;
  const timer = new StillnessTimer((seconds, complete) => {
    const index = Math.min(3, Math.floor(seconds / 15));
    root.querySelector('.minute-seconds')!.textContent = complete ? '✓' : String(Math.ceil(60 - seconds));
    (root.querySelector('.minute-progress') as SVGCircleElement).style.strokeDashoffset = String(176 * (1 - seconds / 60));
    if (index !== previousPrompt || complete) {
      previousPrompt = index; root.querySelector('#minute-title')!.textContent = complete ? 'Carry this calm with you.' : prompts[index].title;
      root.querySelector('#minute-prompt')!.textContent = complete ? 'One small pause. A little more space for your next step.' : prompts[index].text;
    }
    if (complete) { pauseButton.hidden = true; endButton.textContent = 'Return to the shrine'; minutePanel.classList.add('minute-complete'); }
  });
  function startMinute() {
    if (!ready) return;
    dialog.close(); minuteActive = true; setFocus(true); minutePanel.hidden = false; minutePanel.classList.remove('minute-complete');
    pauseButton.hidden = false; pauseButton.textContent = 'Pause'; endButton.textContent = 'End moment'; previousPrompt = -1; timer.start(); pauseButton.focus();
  }
  function endMinute() { timer.stop(); minuteActive = false; minutePanel.hidden = true; setFocus(false); document.querySelector<HTMLButtonElement>('#open-moment')!.focus(); }
  dialog.addEventListener('click', event => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button'); if (!target) return;
    if (target.dataset.view) show(target.dataset.view as View);
    if (target.hasAttribute('data-start-minute')) startMinute();
    if (target.hasAttribute('data-focus-shrine')) { dialog.close(); setFocus(true); root.querySelector<HTMLButtonElement>('#exit-focus')!.focus(); }
  });
  dialog.querySelector('.feature-close')!.addEventListener('click', () => dialog.close());
  dialog.querySelector('.feature-back')!.addEventListener('click', () => show('hub'));
  document.querySelectorAll('[data-open-moment]').forEach(button => button.addEventListener('click', () => show('hub')));
  document.querySelector('#keep-blessing')!.addEventListener('click', () => { document.querySelector<HTMLDialogElement>('.blessing-dialog')!.close(); show('card'); });
  focusButton.addEventListener('click', () => { if (minuteActive) endMinute(); else if (ready) setFocus(!focused); });
  root.querySelector('#exit-focus')!.addEventListener('click', () => { setFocus(false); focusButton.focus(); });
  pauseButton.addEventListener('click', () => {
    if (timer.running) { timer.pause(); pauseButton.textContent = 'Resume'; root.querySelector('#minute-prompt')!.textContent = 'Paused. Stay as long as you like.'; }
    else { timer.resume(); pauseButton.textContent = 'Pause'; previousPrompt = -1; }
  });
  endButton.addEventListener('click', endMinute);
  const visibility = () => { if (document.hidden && minuteActive && timer.running) { timer.pause(); pauseButton.textContent = 'Resume'; root.querySelector('#minute-prompt')!.textContent = 'Paused while you were away. Continue whenever you are ready.'; } };
  document.addEventListener('visibilitychange', visibility);
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !dialog.open && focused) { if (minuteActive) endMinute(); else setFocus(false); } };
  document.addEventListener('keydown', escape);
  return {
    attachScene(callback: (active: boolean) => void) { focusScene = callback; },
    ready(value: boolean) { ready = value; focusButton.disabled = !value; if (!value && focused) { if (minuteActive) endMinute(); else setFocus(false); } if (dialog.open) content.querySelectorAll<HTMLButtonElement>('[data-start-minute], [data-focus-shrine]').forEach(b => b.disabled = !value); },
    record(ritual: Ritual) { visits.add(ritual); if (dialog.open && currentView === 'hub') updateVisit(); },
    dispose() { timer.stop(); document.removeEventListener('visibilitychange', visibility); document.removeEventListener('keydown', escape); },
  };
}
