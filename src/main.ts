import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './style.css';
import { createInterface } from './ui/interface';
import { motionPreference } from './config';
import { createFeatures } from './features';

const ui = createInterface();
const features = createFeatures(ui.root, message => ui.toast(message));

async function boot() {
  try {
    const { createExperience } = await import('./scene/experience');
    const experience = await createExperience(document.querySelector<HTMLElement>('#scene')!, () => { features.ready(false); ui.fallback(); ui.toast('The graphics connection was interrupted. Reload to return to the shrine.'); }, ui.progress);
    features.attachScene(active => experience.setFocus(active));
    const sequences = experience.sequences;
    sequences.onIntroComplete = () => { ui.ready(); features.ready(true); };
    sequences.onBlessingComplete = () => { ui.blessing(false); features.ready(true); features.record('blessing'); ui.showBlessing(); };
    ui.loaded();
    if (sequences.introDone) { ui.ready(); features.ready(true); }
    document.querySelector('#skip-intro')!.addEventListener('click', () => sequences.skipIntro());
    document.querySelector('#replay')!.addEventListener('click', () => {
      if (sequences.blessingActive) return;
      features.ready(false);
      sequences.elapsed = 0; sequences.introDone = false; ui.root.classList.remove('is-ready'); ui.root.classList.add('is-intro'); ui.buttons.forEach(b => b.disabled = true);
      if (sequences.reduced) ui.toast('Reduced motion is enabled. The shrine will appear without camera movement.');
    });
    ui.buttons[0].addEventListener('click', () => { experience.lightDiya(); features.record('light'); ui.buttons[0].dataset.complete = 'true'; ui.buttons[0].disabled = true; ui.buttons[0].querySelector('strong')!.textContent = 'Your diya is lit'; ui.buttons[0].querySelector('small')!.textContent = 'A little light, a little hope'; ui.toast('May this light illuminate your path.'); });
    let flowerCount = 0;
    ui.buttons[1].addEventListener('click', () => { experience.offerFlower(); features.record('flower'); flowerCount++; ui.toast(flowerCount === 1 ? 'An offering of gratitude, from your heart.' : 'Another flower. Another moment of gratitude.'); });
    ui.buttons[2].addEventListener('click', () => { if (sequences.bless()) { features.ready(false); ui.blessing(true); } });
    const changeMotion = (event: MediaQueryListEvent) => { sequences.reduced = event.matches; if (event.matches) sequences.skipIntro(); };
    motionPreference.addEventListener('change', changeMotion);
    window.addEventListener('pagehide', event => { if (!event.persisted) { features.dispose(); experience.dispose(); motionPreference.removeEventListener('change', changeMotion); } });
  } catch (error) { console.error('Unable to initialize the shrine.', error); ui.fallback(); }
}
void boot();
