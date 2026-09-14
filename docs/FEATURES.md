# Features and content decisions

The shrine remains the main experience. The secondary “Your moment” dialog adds reflection, an optional guided pause, cultural context and a tangible card to keep.

## Privacy and behavior

- No account, backend, analytics or tracking was added.
- Intention text is limited to 180 characters and inserted with `textContent` / form values, never interpreted as HTML.
- The default intention exists only in memory. Device persistence is a visible, unchecked opt-in using `ganesh.private-intention.v1` in localStorage.
- Storage errors preserve a current-visit copy and show accurate feedback. A clear action attempts to remove the saved key.
- Card export runs locally, contains the general blessing by default, and includes an intention only after a separate explicit choice.
- No Web Share, messaging or social-post API is called. Downloading saves a PNG; sharing is left to the visitor.
- Timers count active running time; pause/resume, completion and early exit are distinct states. Backgrounding pauses the minute. The user decides when to resume.
- Native dialog behavior provides keyboard focus containment and Escape dismissal. The focused shrine also supports Escape to leave.
- Reduced-motion preferences remove the focus camera transition and keep the timer's guidance usable without a breathing animation.

## Cultural sources

Copy was intentionally kept modest and specific, avoiding claims that a digital action replaces a family's religious practice.

- [Smithsonian — Seated Ganesha](https://asia.si.edu/education/educator-resources/encountering-religion-in-asian-art/explore-by-object/object/seated-ganesha/): new beginnings, the removal of obstacles, and the association with sweets.
- [Smithsonian — Gods, Companions, and Devotees](https://asia.si.edu/whats-on/exhibitions/gods-companions-and-devotees/): the lotus as a symbol of purity and the sweets as a familiar attribute of Ganesha.
- [Hindu American Foundation — Ganesha Chaturthi](https://www.hinduamerican.org/blog/ganesha-chaturthi-the-day-to-celebrate-ganeshas-birth): the festival's celebration of Ganesha's birth and its family and communal observance.

The reflection prompts are original app copy, not scripture, mantras or medical advice.
