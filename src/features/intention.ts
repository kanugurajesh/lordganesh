const KEY = 'ganesh.private-intention.v1';

export class IntentionStore {
  value = '';
  remembered = false;
  constructor() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) { this.value = saved.slice(0, 180); this.remembered = true; }
    } catch { /* Private browsing may disable storage. In-memory use still works. */ }
  }
  save(value: string, remember: boolean) {
    this.value = value.trim().slice(0, 180);
    this.remembered = false;
    try {
      localStorage.removeItem(KEY);
      if (remember && this.value) { localStorage.setItem(KEY, this.value); this.remembered = true; }
    } catch { return false; }
    return true;
  }
  clear() { return this.save('', false); }
}
