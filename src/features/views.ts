import { guide } from './content';

export const hubView = () => `
  <p class="feature-kicker">A LITTLE TIME FOR YOURSELF</p><h2 id="feature-title">Make this moment yours.</h2>
  <p class="feature-lead">A place to pause, reflect, and begin again.</p>
  <div class="visit-state" aria-label="Your visit"><span data-visit="light">○ Light</span><span data-visit="flower">○ Gratitude</span><span data-visit="blessing">○ Blessing</span></div>
  <div class="feature-grid">
    <button data-view="intention" class="feature-tile"><span class="tile-symbol">✧</span><strong>Set an intention</strong><small>What would you like to make space for?</small><span class="tile-link">A PRIVATE REFLECTION ↗</span></button>
    <button data-start-minute class="feature-tile"><span class="tile-symbol">◷</span><strong>One quiet minute</strong><small>Rest your attention on the light.</small><span class="tile-link">A GUIDED PAUSE · 60 SEC ↗</span></button>
    <button data-view="guide" class="feature-tile"><span class="tile-symbol">❋</span><strong>Discover the shrine</strong><small>The stories behind what you see.</small><span class="tile-link">MEANING & TRADITION ↗</span></button>
    <button data-view="card" class="feature-tile"><span class="tile-symbol">↗</span><strong>Keep a blessing</strong><small>A little encouragement to carry with you.</small><span class="tile-link">SAVE A BEAUTIFUL CARD ↗</span></button>
  </div><div class="saved-intention" hidden><span>YOUR INTENTION</span><p></p><button data-view="intention">Revisit your intention →</button></div>`;

export const intentionView = () => `
  <p class="feature-kicker">A PRIVATE REFLECTION</p><h2 id="feature-title">What is your next beginning?</h2>
  <p class="feature-lead">Name something you hope to welcome, or one small step you want to take.</p>
  <form id="intention-form"><label class="field-label" for="intention-text">Your intention</label><textarea id="intention-text" maxlength="180" rows="4" placeholder="I want to make space for…" aria-describedby="intention-privacy intention-count"></textarea>
  <div class="input-meta"><span id="intention-privacy">Private to this browser. Never sent anywhere.</span><span id="intention-count">0 / 180</span></div>
  <label class="check-label"><input id="remember-intention" type="checkbox"> Remember on this device</label>
  <p class="field-help">Leave this unchecked to keep it only until you reload or close this page.</p>
  <div class="feature-actions"><button type="submit" class="feature-primary">Keep my intention <span>→</span></button><button type="button" id="clear-intention" class="feature-text">Clear intention</button></div></form>`;

export const guideView = () => `
  <p class="feature-kicker">MEANING & TRADITION</p><h2 id="feature-title">There is a story in every detail.</h2>
  <p class="feature-lead">A short introduction to the presence at the heart of this shrine.</p>
  <div class="guide-entries">${guide.map(item => `<article><span>${item.symbol}</span><div><h3>${item.title}</h3><p>${item.text}</p></div></article>`).join('')}</div>
  <div class="guide-note">This digital space invites reflection; it is not a prescribed pūjā. Follow the traditions meaningful to you and your family.</div>
  <div class="guide-sources">READ FURTHER <a href="https://asia.si.edu/education/educator-resources/encountering-religion-in-asian-art/explore-by-object/object/seated-ganesha/" target="_blank" rel="noopener noreferrer">Smithsonian ↗</a><a href="https://www.hinduamerican.org/blog/ganesha-chaturthi-the-day-to-celebrate-ganeshas-birth" target="_blank" rel="noopener noreferrer">Hindu American Foundation ↗</a></div>
  <button class="feature-primary" data-focus-shrine>Look closer at the shrine <span>→</span></button>`;

export const cardView = () => `
  <p class="feature-kicker">CARRY THIS LIGHT WITH YOU</p><h2 id="feature-title">A blessing to keep.</h2>
  <p class="feature-lead">Save a portrait card for yourself, or share it in your own time.</p>
  <div class="card-preview"><span class="card-star">✧</span><span class="card-eyebrow">A LITTLE LIGHT. A NEW BEGINNING.</span><p>May Lord Ganesha remove<br>every obstacle<br>from your path.</p><i></i><strong>Happy Ganesh Chaturthi</strong><small class="card-intention" hidden></small></div>
  <label class="check-label include-intention" hidden><input id="include-intention" type="checkbox"> Include my private intention on the card</label>
  <div class="feature-actions"><button class="feature-primary" id="download-card">Download blessing <span>↓</span></button><span class="download-detail">PNG · 1200 × 1500<br>No account needed</span></div>
  <p class="field-help" id="card-status" role="status"></p>`;
