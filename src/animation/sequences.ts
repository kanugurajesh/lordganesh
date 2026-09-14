import { MathUtils } from 'three';
import { config } from '../config';

export const smoothstep = (value: number) => { const x = MathUtils.clamp(value, 0, 1); return x * x * (3 - 2 * x); };

export class Sequences {
  elapsed = 0;
  introDone = false;
  blessingStart = -100;
  blessingActive = false;
  onIntroComplete = () => {};
  onBlessingComplete = () => {};
  constructor(public reduced: boolean) {}
  skipIntro() { this.elapsed = config.introDuration; }
  bless() { if (this.blessingActive || !this.introDone) return false; this.blessingStart = this.elapsed; this.blessingActive = true; return true; }
  update(delta: number) {
    this.elapsed += delta;
    const intro = this.reduced ? 1 : smoothstep((this.elapsed - 1.1) / (config.introDuration - 1.1));
    if (intro >= 1 && !this.introDone) { this.introDone = true; this.onIntroComplete(); }
    const blessingProgress = this.blessingActive ? MathUtils.clamp((this.elapsed - this.blessingStart) / config.blessingDuration, 0, 1) : 0;
    const blessing = this.blessingActive ? Math.sin(blessingProgress * Math.PI) : 0;
    if (this.blessingActive && blessingProgress >= 1) { this.blessingActive = false; this.onBlessingComplete(); }
    return { intro, blessing, blessingProgress };
  }
}
