// =============================================================================
// sounds.js
//
// the cousin's 2004 desktop has chimes — AIM dings, mail alerts, sign-on/off
// blips, the welcome riff. all sound logic centralizes here.
//
// public API:
//   Sounds.play(name)              fire-and-forget
//   Sounds.playOnce(name, key)     dedupes within the current page session
//   Sounds.playOnceEver(name, key) dedupes across the whole game (localStorage)
//   Sounds.isEnabled() / setEnabled(bool) / toggle()
//   Sounds.installToggle()         drops the speaker button into #taskbar
//   Sounds.showSoundChoiceIfNeeded() shows the one-time intro overlay (ch1 only)
//
// also exposes window.playSound(name) as a shorthand the chapters can call.
//
// localStorage keys:
//   pyforthegirls_sound_enabled  'on' | 'off' (default off — muted)
//   pyforthegirls_sound_choice   'yes' | 'no' (has the player been asked)
//   pyforthegirls_sound_once     JSON map of one-shot keys already fired
//
// graceful degradation: missing files, autoplay blocks, or storage failures
// never throw or log. silence beats crashing.
// =============================================================================

(function() {
  'use strict';

  const ENABLED_KEY = 'pyforthegirls_sound_enabled';
  const CHOICE_KEY  = 'pyforthegirls_sound_choice';
  const ONCE_KEY    = 'pyforthegirls_sound_once';

  const SOUND_DIR = 'sounds/';
  const VOLUME    = 0.65;

  const audioCache    = Object.create(null);
  const sessionPlayed = Object.create(null);

  // ---------------------------------------------------------------------------
  // STORAGE HELPERS
  // ---------------------------------------------------------------------------
  function readChoice() {
    try { return localStorage.getItem(CHOICE_KEY); } catch (e) { return null; }
  }
  function writeChoice(v) {
    try { localStorage.setItem(CHOICE_KEY, v); } catch (e) {}
  }
  function readEnabled() {
    try { return localStorage.getItem(ENABLED_KEY) === 'on'; } catch (e) { return false; }
  }
  function writeEnabled(v) {
    try { localStorage.setItem(ENABLED_KEY, v ? 'on' : 'off'); } catch (e) {}
  }
  function readOnceSet() {
    try {
      const raw = localStorage.getItem(ONCE_KEY);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { return {}; }
  }
  function writeOnceSet(set) {
    try { localStorage.setItem(ONCE_KEY, JSON.stringify(set)); } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // PLAYBACK
  // ---------------------------------------------------------------------------
  function preload(name) {
    if (audioCache[name]) return audioCache[name];
    try {
      const a = new Audio(SOUND_DIR + name + '.wav');
      a.preload = 'auto';
      audioCache[name] = a;
      return a;
    } catch (e) {
      return null;
    }
  }

  function play(name) {
    if (!name) return;
    if (!readEnabled()) return;
    try {
      const base = audioCache[name] || preload(name);
      if (!base) return;
      // clone so overlapping plays don't truncate each other
      const clip = base.cloneNode();
      clip.volume = VOLUME;
      const p = clip.play();
      if (p && typeof p.catch === 'function') p.catch(function() { /* autoplay blocked or file missing — silent */ });
    } catch (e) { /* silent */ }
  }

  function playOnce(name, key) {
    if (!key) { play(name); return; }
    if (sessionPlayed[key]) return;
    sessionPlayed[key] = true;
    play(name);
  }

  function playOnceEver(name, key) {
    if (!key) { play(name); return; }
    const set = readOnceSet();
    if (set[key]) return;
    set[key] = true;
    writeOnceSet(set);
    play(name);
  }

  // ---------------------------------------------------------------------------
  // STYLES — taskbar toggle + sound-choice modal
  // ---------------------------------------------------------------------------
  const CSS = `
.sound-toggle {
  display: inline-flex; align-items: center; justify-content: center;
  height: 18px; min-width: 26px;
  margin: 0 6px;
  padding: 0 6px;
  background: #d4d0c8;
  border: 1px solid #fff;
  border-right-color: #404040;
  border-bottom-color: #404040;
  color: #1a0628;
  font-family: 'Tahoma', sans-serif;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  user-select: none;
}
.sound-toggle:hover { background: #e8e4d8; }
.sound-toggle:active {
  border-color: #404040 #fff #fff #404040;
}

.sound-choice-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(20, 8, 36, 0.92);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  font-family: Tahoma, Verdana, sans-serif;
}
.sound-choice-card {
  width: 100%; max-width: 420px;
  background: #ece9d8;
  border: 2px solid #1a0628;
  box-shadow: 4px 4px 0 #ff66cc, 8px 8px 18px rgba(0,0,0,0.7);
  color: #1a0628;
}
.sound-choice-titlebar {
  background: linear-gradient(90deg, #ff66cc, #c8ff66);
  color: #1a0628;
  padding: 5px 10px;
  font-family: 'Silkscreen', 'Tahoma', monospace;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #1a0628;
}
.sound-choice-body {
  padding: 18px 20px 20px;
  font-size: 14px;
  line-height: 1.5;
}
.sound-choice-body p { margin: 0 0 12px; }
.sound-choice-body p.sound-choice-sub {
  font-size: 12px; color: #555;
  margin: 0 0 14px;
}
.sound-choice-buttons {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
  margin-top: 14px;
}
.sound-choice-btn {
  font-family: 'Silkscreen', 'Tahoma', monospace;
  font-size: 11px;
  padding: 9px 18px;
  border: 1px solid #1a0628;
  cursor: pointer;
  letter-spacing: 0.5px;
}
.sound-choice-btn.yes { background: #c8ff66; color: #1a0628; }
.sound-choice-btn.no  { background: #ece9d8; color: #1a0628; }
.sound-choice-btn:hover { filter: brightness(0.95); }
.sound-choice-btn:active { filter: brightness(0.88); }
`;

  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------------------------
  // TASKBAR TOGGLE
  // ---------------------------------------------------------------------------
  let toggleEl = null;

  function updateToggleLabel() {
    if (!toggleEl) return;
    const on = readEnabled();
    toggleEl.textContent = on ? '🔊' : '🔇';
    toggleEl.title = on ? 'sound on — click to mute' : 'sound off — click to unmute';
    toggleEl.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function toggle() {
    writeEnabled(!readEnabled());
    // a click is also an implicit choice — don't pester them with the modal again
    if (!readChoice()) writeChoice(readEnabled() ? 'yes' : 'no');
    updateToggleLabel();
  }

  function installToggle() {
    injectCSS();
    const taskbar = document.getElementById('taskbar');
    if (!taskbar) return;
    if (toggleEl && toggleEl.parentNode === taskbar) {
      updateToggleLabel();
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sound-toggle';
    btn.id = 'soundToggle';
    btn.addEventListener('click', toggle);
    // place it just before the clock (top-right corner of the taskbar, near the time)
    const clock = document.getElementById('taskbarTime');
    if (clock && clock.parentNode === taskbar) {
      taskbar.insertBefore(btn, clock);
    } else {
      taskbar.appendChild(btn);
    }
    toggleEl = btn;
    updateToggleLabel();
  }

  // ---------------------------------------------------------------------------
  // SOUND-CHOICE INTRO OVERLAY (ch1 only)
  // ---------------------------------------------------------------------------
  function showSoundChoiceIfNeeded() {
    injectCSS();
    if (readChoice()) return;
    if (document.getElementById('soundChoiceOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'sound-choice-overlay';
    overlay.id = 'soundChoiceOverlay';
    overlay.innerHTML =
      '<div class="sound-choice-card">' +
        '<div class="sound-choice-titlebar">★ pyforthegirls :: audio ★</div>' +
        '<div class="sound-choice-body">' +
          '<p>this game has sound — AIM chimes, mail dings, the whole 2004 desktop.</p>' +
          '<p class="sound-choice-sub">would you like to enable it? you can toggle anytime from the taskbar.</p>' +
          '<div class="sound-choice-buttons">' +
            '<button type="button" class="sound-choice-btn yes" id="soundChoiceYes">▸ yes, sounds on</button>' +
            '<button type="button" class="sound-choice-btn no"  id="soundChoiceNo">no thanks</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('soundChoiceYes').addEventListener('click', function() {
      writeChoice('yes');
      writeEnabled(true);
      overlay.remove();
      updateToggleLabel();
    });
    document.getElementById('soundChoiceNo').addEventListener('click', function() {
      writeChoice('no');
      writeEnabled(false);
      overlay.remove();
      updateToggleLabel();
    });
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  const Sounds = {
    play: play,
    playOnce: playOnce,
    playOnceEver: playOnceEver,
    isEnabled: readEnabled,
    setEnabled: function(v) { writeEnabled(!!v); updateToggleLabel(); },
    toggle: toggle,
    installToggle: installToggle,
    showSoundChoiceIfNeeded: showSoundChoiceIfNeeded
  };

  window.Sounds    = Sounds;
  window.playSound = play;

  function isChapterOne() {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      return /chapterone(\.html?)?$/.test(path);
    } catch (e) { return false; }
  }

  function autoBoot() {
    installToggle();
    if (isChapterOne()) showSoundChoiceIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})();
