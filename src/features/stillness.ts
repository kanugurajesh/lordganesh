export class StillnessTimer {
  elapsed = 0;
  running = false;
  private previous = 0;
  private interval?: ReturnType<typeof setInterval>;
  constructor(private update: (seconds: number, complete: boolean) => void) {}
  start() {
    this.stop(); this.elapsed = 0; this.running = true; this.previous = performance.now();
    this.interval = setInterval(() => this.tick(), 100); this.update(0, false);
  }
  private tick() {
    const now = performance.now();
    if (this.running) {
      this.elapsed = Math.min(60, this.elapsed + (now - this.previous) / 1000);
      if (this.elapsed >= 60) { this.stop(); this.update(60, true); return; }
      this.update(this.elapsed, false);
    }
    this.previous = now;
  }
  pause() { if (this.running) this.tick(); this.running = false; }
  resume() { if (this.elapsed < 60) { this.previous = performance.now(); this.running = true; } }
  stop() { this.running = false; clearInterval(this.interval); }
}
