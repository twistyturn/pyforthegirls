// =============================================================================
// caseboard.js
//
// the cousin's panic notebook. a corkboard the player can open from any
// chapter once chapter 1's wrap has been reached. cards are pinned, crossed
// out, annotated; strings connect them; marker scrawls go diagonally across.
//
// data shape:
//   SNAPSHOTS[N] = { cards: [...], strings: [...], marginalia: [...] }
// where N is the chapter whose end-state this snapshot represents (1..8).
//
// each card: { id, text, pos: {x,y}, color, style, chapter_added, chapter_modified, strikethrough? }
// each string: { from, to, color, thickness, label?, chapter_added }
// each marginalia: { text, pos, angle, color, size, chapter_added }
//
// the chapter file declares window.CASEBOARD_CHAPTER = N before this script
// loads, then calls Caseboard.recordWrap(N) when its wrap beat is rendered.
// =============================================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'pyforthegirls_caseboard';
  const PROGRESS_KEY = 'pyforthegirls_caseboard_progress';

  // ===========================================================================
  // CSS injection
  // ===========================================================================
  const CSS = `
.cb-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(10, 2, 24, 0.88);
  display: none;
  align-items: stretch; justify-content: center;
  padding: 16px;
  overflow: auto;
}
.cb-overlay.cb-open { display: flex; }
.cb-shell {
  width: 100%; max-width: 1100px;
  background: #2d0a3d;
  border: 2px solid #ff66c4;
  box-shadow: 0 0 32px rgba(255, 102, 196, 0.5), 4px 4px 0 #1a0628;
  display: flex; flex-direction: column;
  font-family: 'VT323', 'Courier New', monospace;
  color: #f0f0ff;
}
.cb-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(90deg, #ff66c4, #c8a8e8);
  color: #fff;
  padding: 4px 8px;
  font-family: 'Silkscreen', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 2px solid #1a0628;
  text-shadow: 1px 1px 0 #1a0628;
}
.cb-close {
  width: 18px; height: 16px;
  background: #f0f0ff; color: #1a0628;
  border: 1px solid #1a0628;
  font-family: 'Silkscreen', monospace; font-size: 9px;
  line-height: 14px; text-align: center;
  cursor: pointer;
}
.cb-scrubber {
  background: #1a0628;
  border-bottom: 1px solid #ff66c4;
  padding: 8px 12px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-family: 'Silkscreen', monospace; font-size: 10px;
  color: #c8a8e8;
}
.cb-scrubber-label { color: #66ffff; letter-spacing: 1px; }
.cb-scrub-btn {
  background: #2d0a3d;
  color: #c8a8e8;
  border: 1px solid #c8a8e8;
  padding: 3px 8px;
  font-family: 'Silkscreen', monospace; font-size: 10px;
  cursor: pointer;
  text-transform: uppercase;
}
.cb-scrub-btn:hover { background: #3d1a4d; color: #fff; }
.cb-scrub-btn.cb-active {
  background: #ff66c4; color: #1a0628; border-color: #1a0628;
  font-weight: bold;
}
.cb-scrub-btn:disabled {
  opacity: 0.3; cursor: not-allowed;
}
.cb-board {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 540px;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.18), transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.22), transparent 60%),
    repeating-radial-gradient(circle at 12% 18%, #8b5a2b 0, #8b5a2b 1.5px, #6f4519 1.5px, #6f4519 3px),
    #8b5a2b;
  background-blend-mode: multiply, multiply, normal, normal;
  overflow: hidden;
  border-top: 2px solid #1a0628;
}
.cb-svg-strings {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 5;
}
.cb-card {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--cb-rot, -2deg));
  width: 180px;
  padding: 12px 12px 10px 12px;
  font-family: 'Special Elite', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.35;
  color: #1a0628;
  background: #fff8d6;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: 2px 3px 6px rgba(0,0,0,0.45), inset 0 0 12px rgba(0,0,0,0.04);
  white-space: pre-line;
  z-index: 10;
  cursor: default;
}
.cb-card.cb-color-yellow { background: #fff8d6; }
.cb-card.cb-color-blue   { background: #d6ecff; }
.cb-card.cb-color-pink   { background: #ffd6e8; }
.cb-card.cb-color-white  { background: #f4f1e6; }
.cb-card.cb-color-redacted {
  background: #f4f1e6;
  font-family: 'Special Elite', 'Courier New', monospace;
}
.cb-card .cb-pin {
  position: absolute;
  top: -7px; left: 50%;
  width: 14px; height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff99cc 0%, #ff66c4 50%, #99003d 100%);
  box-shadow: 1px 2px 2px rgba(0,0,0,0.5);
}
.cb-card .cb-strike {
  text-decoration: line-through;
  text-decoration-color: #c0002a;
  text-decoration-thickness: 2px;
  color: #5a0010;
}
.cb-card .cb-ann {
  display: inline-block;
  color: #0050a0;
  font-family: 'Nanum Pen Script', cursive;
  font-size: 14px;
  margin: 0 2px;
}
.cb-card .cb-redact {
  display: inline-block;
  background: #1a0628;
  color: transparent;
  padding: 0 6px;
  margin: 0 1px;
  border-radius: 1px;
  user-select: none;
}
.cb-card.cb-style-scrawled {
  font-family: 'Nanum Pen Script', cursive;
  font-size: 16px;
  line-height: 1.2;
}
.cb-card.cb-style-scribbled {
  position: relative;
}
.cb-card.cb-style-scribbled::after {
  content: '';
  position: absolute; inset: 6px;
  background:
    repeating-linear-gradient(12deg, transparent 0 6px, rgba(192,0,42,0.35) 6px 8px),
    repeating-linear-gradient(-18deg, transparent 0 11px, rgba(192,0,42,0.25) 11px 13px);
  pointer-events: none;
  mix-blend-mode: multiply;
}
.cb-card.cb-age-old {
  filter: sepia(0.18) brightness(0.96);
}
.cb-card.cb-age-older {
  filter: sepia(0.32) brightness(0.92);
}
.cb-card.cb-age-oldest {
  filter: sepia(0.45) brightness(0.88) contrast(1.05);
}
.cb-marg {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--cb-rot, -6deg));
  font-family: 'Nanum Pen Script', cursive;
  color: #c0002a;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 20;
  pointer-events: none;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.15);
  white-space: nowrap;
}
.cb-marg.cb-size-small  { font-size: 18px; }
.cb-marg.cb-size-medium { font-size: 26px; }
.cb-marg.cb-size-big    { font-size: 38px; }
.cb-marg.cb-color-red   { color: #c0002a; }
.cb-marg.cb-color-black { color: #1a0628; }
.cb-marg.cb-color-blue  { color: #003a8c; }
.cb-empty {
  display: flex; align-items: center; justify-content: center;
  height: 100%;
  color: #c8a8e8;
  font-family: 'Silkscreen', monospace; font-size: 12px;
  letter-spacing: 2px;
  text-align: center;
}
@media (max-width: 720px) {
  .cb-card { width: 140px; font-size: 11px; padding: 9px; }
  .cb-marg.cb-size-big { font-size: 26px; }
  .cb-marg.cb-size-medium { font-size: 18px; }
  .cb-marg.cb-size-small { font-size: 14px; }
  .cb-board { aspect-ratio: 3 / 4; min-height: 700px; }
}
`;

  function injectCSS() {
    if (document.getElementById('cb-styles')) return;
    const style = document.createElement('style');
    style.id = 'cb-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ===========================================================================
  // modal scaffold + scrubber
  // ===========================================================================
  function injectModal() {
    if (document.getElementById('cb-overlay')) return;
    const div = document.createElement('div');
    div.id = 'cb-overlay';
    div.className = 'cb-overlay';
    div.innerHTML = `
      <div class="cb-shell" role="dialog" aria-modal="true" aria-label="caseboard">
        <div class="cb-titlebar">
          <span>caseboard.psd :: tegan</span>
          <span class="cb-close" id="cb-close-btn" title="close">x</span>
        </div>
        <div class="cb-scrubber" id="cb-scrubber">
          <span class="cb-scrubber-label" id="cb-scrub-label">showing: end of chapter 1</span>
          <span style="flex: 1;"></span>
          <span style="color:#c8a8e8; letter-spacing:1px;">jump to:</span>
          <span id="cb-scrub-buttons"></span>
        </div>
        <div class="cb-board" id="cb-board"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById('cb-close-btn').addEventListener('click', Caseboard.close);
    div.addEventListener('click', function(e) {
      if (e.target === div) Caseboard.close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && div.classList.contains('cb-open')) Caseboard.close();
    });
  }

  // module-internal state
  let currentView = 1;        // chapter snapshot currently displayed
  let highestUnlocked = 1;    // highest chapter the player can scrub to

  function renderScrubber() {
    const btns = document.getElementById('cb-scrub-buttons');
    const label = document.getElementById('cb-scrub-label');
    if (!btns || !label) return;
    label.textContent = 'showing: end of chapter ' + currentView;
    btns.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const b = document.createElement('button');
      b.className = 'cb-scrub-btn' + (i === currentView ? ' cb-active' : '');
      b.textContent = 'ch' + i;
      if (i > highestUnlocked) {
        b.disabled = true;
        b.title = 'not yet';
      } else {
        b.addEventListener('click', function() { Caseboard.scrubTo(i); });
      }
      btns.appendChild(b);
    }
  }

  // ---------------------------------------------------------------------------
  // text marker parser
  //   [x]...[/x]  ->  strikethrough
  //   [a]...[/a]  ->  annotation in marker (different colour, scrawled)
  //   [r]...[/r]  ->  redacted (black sharpie bar)
  //   newlines    ->  <br>
  // ---------------------------------------------------------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function parseCardText(text) {
    const SENTINEL = {
      x_open:  '\x00X\x00', x_close:  '\x00/X\x00',
      a_open:  '\x00A\x00', a_close:  '\x00/A\x00',
      r_open:  '\x00R\x00', r_close:  '\x00/R\x00'
    };
    let s = String(text || '');
    s = s.replace(/\[x\]/g, SENTINEL.x_open).replace(/\[\/x\]/g, SENTINEL.x_close);
    s = s.replace(/\[a\]/g, SENTINEL.a_open).replace(/\[\/a\]/g, SENTINEL.a_close);
    s = s.replace(/\[r\]/g, SENTINEL.r_open).replace(/\[\/r\]/g, SENTINEL.r_close);
    s = escapeHtml(s);
    s = s.split(SENTINEL.x_open).join('<s class="cb-strike">').split(SENTINEL.x_close).join('</s>');
    s = s.split(SENTINEL.a_open).join('<span class="cb-ann">').split(SENTINEL.a_close).join('</span>');
    s = s.split(SENTINEL.r_open).join('<span class="cb-redact">').split(SENTINEL.r_close).join('</span>');
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  // deterministic tiny rotation from card id, so cards don't jump on re-render
  function cardTilt(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    const range = 6; // degrees
    const v = ((Math.abs(h) % (range * 200)) / 100) - range; // -range..+range
    return v.toFixed(2) + 'deg';
  }

  function ageClass(chapter_added, viewing) {
    const diff = (viewing | 0) - (chapter_added | 0);
    if (diff <= 1) return '';
    if (diff <= 3) return ' cb-age-old';
    if (diff <= 5) return ' cb-age-older';
    return ' cb-age-oldest';
  }

  function renderCard(card, viewing) {
    const el = document.createElement('div');
    const color = card.color || 'yellow';
    const style = card.style || 'clean';
    el.className = 'cb-card cb-color-' + color + ' cb-style-' + style + ageClass(card.chapter_added, viewing);
    el.style.left = (card.pos.x | 0) + '%';
    el.style.top = (card.pos.y | 0) + '%';
    el.style.setProperty('--cb-rot', cardTilt(card.id));
    el.dataset.id = card.id;
    el.innerHTML = '<span class="cb-pin"></span>' + parseCardText(card.text);
    return el;
  }

  // ---------------------------------------------------------------------------
  // strings (SVG)
  //   colour: 'red' | 'pink'
  //   thickness: 'thin' | 'thick' | 'triple' | 'loose'
  //   loose strings render dashed and slack — for connections the cousin
  //   has questioned but not removed
  // ---------------------------------------------------------------------------
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function renderStrings(board, snap) {
    const strings = snap.strings || [];
    if (!strings.length) return;
    const positions = {};
    (snap.cards || []).forEach(function(c) { positions[c.id] = c.pos; });

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'cb-svg-strings');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    board.appendChild(svg);

    strings.forEach(function(s) {
      const a = positions[s.from];
      const b = positions[s.to];
      if (!a || !b) return;
      drawString(svg, a, b, s, board);
    });
  }

  function drawString(svg, a, b, str, board) {
    const color = str.color === 'pink' ? '#ff8fcd' : '#c0002a';
    const thickness = str.thickness || 'thin';
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = -dy / dist;
    const py = dx / dist;
    const sag = thickness === 'loose' ? 5 : 2;
    const cx = mx + px * sag;
    const cy = my + py * sag;
    const d = 'M ' + a.x + ' ' + a.y + ' Q ' + cx + ' ' + cy + ' ' + b.x + ' ' + b.y;

    function makePath(extraOff, opacity, dash) {
      const p = document.createElementNS(SVG_NS, 'path');
      const cx2 = mx + px * (sag + extraOff);
      const cy2 = my + py * (sag + extraOff);
      p.setAttribute('d', 'M ' + a.x + ' ' + a.y + ' Q ' + cx2 + ' ' + cy2 + ' ' + b.x + ' ' + b.y);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', thickness === 'loose' ? '#8b0e2e' : color);
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      let sw = 2;
      if (thickness === 'thick') sw = 4;
      else if (thickness === 'triple') sw = 3;
      else if (thickness === 'loose') sw = 1.5;
      p.setAttribute('stroke-width', String(sw));
      if (opacity != null) p.setAttribute('opacity', String(opacity));
      if (dash) {
        p.setAttribute('stroke-dasharray', dash);
        p.setAttribute('pathLength', '100');
      }
      return p;
    }

    if (thickness === 'triple') {
      svg.appendChild(makePath(-1.6, 0.85));
      svg.appendChild(makePath(0, 1));
      svg.appendChild(makePath(1.6, 0.85));
    } else if (thickness === 'loose') {
      svg.appendChild(makePath(0, 0.55, '3 2'));
    } else {
      svg.appendChild(makePath(0, 1));
    }

    // optional label on the string, rendered as DOM (so it picks up real fonts)
    if (str.label) {
      const lab = document.createElement('div');
      lab.style.position = 'absolute';
      lab.style.left = mx + '%';
      lab.style.top = (my + sag * 1.4) + '%';
      lab.style.transform = 'translate(-50%, -50%) rotate(' + ((Math.atan2(dy, dx) * 180 / Math.PI) | 0) + 'deg)';
      lab.style.fontFamily = "'Nanum Pen Script', cursive";
      lab.style.fontSize = '14px';
      lab.style.color = thickness === 'loose' ? '#8b0e2e' : color;
      lab.style.pointerEvents = 'none';
      lab.style.whiteSpace = 'nowrap';
      lab.style.zIndex = '6';
      lab.style.textShadow = '1px 1px 0 rgba(255,248,214,0.7)';
      lab.textContent = str.label;
      board.appendChild(lab);
    }
  }

  // ---------------------------------------------------------------------------
  // marginalia — the diagonal marker scrawls across the board
  // ---------------------------------------------------------------------------
  function renderMarginalia(board, snap) {
    (snap.marginalia || []).forEach(function(m) {
      const el = document.createElement('div');
      const size = m.size || 'medium';
      const color = m.color || 'red';
      el.className = 'cb-marg cb-size-' + size + ' cb-color-' + color;
      el.style.left = (m.pos.x | 0) + '%';
      el.style.top = (m.pos.y | 0) + '%';
      el.style.setProperty('--cb-rot', (m.angle == null ? -6 : m.angle) + 'deg');
      el.textContent = m.text;
      board.appendChild(el);
    });
  }

  function renderBoard() {
    const board = document.getElementById('cb-board');
    if (!board) return;
    const snap = SNAPSHOTS[currentView];
    if (!snap) {
      board.innerHTML = '<div class="cb-empty">no snapshot yet for ch' + currentView + '</div>';
      return;
    }
    board.innerHTML = '';
    renderStrings(board, snap);
    (snap.cards || []).forEach(function(c) {
      board.appendChild(renderCard(c, currentView));
    });
    renderMarginalia(board, snap);
  }

  Caseboard.open = function() {
    injectCSS();
    injectModal();
    highestUnlocked = Math.max(1, Caseboard.progress());
    if (currentView > highestUnlocked) currentView = highestUnlocked;
    renderScrubber();
    renderBoard();
    document.getElementById('cb-overlay').classList.add('cb-open');
  };

  Caseboard.close = function() {
    const el = document.getElementById('cb-overlay');
    if (el) el.classList.remove('cb-open');
  };

  Caseboard.scrubTo = function(chapter) {
    chapter = parseInt(chapter, 10);
    if (!chapter || chapter < 1 || chapter > 8) return;
    if (chapter > highestUnlocked) return;
    currentView = chapter;
    renderScrubber();
    renderBoard();
  };

  // ===========================================================================
  // SNAPSHOTS
  //   Each key is the chapter whose end-state this represents (1..8). Cards
  //   carry stable ids so that growth, crossouts, and string attachments
  //   continue to refer to the same card across chapters.
  // ===========================================================================
  const SNAPSHOTS = {};

  // ---------------------------------------------------------------------------
  // ch1 — sparse and stunned. password decoded; camille's name surfaced.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[1] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan\n17\nMISSING aug 14 2004',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 1
      },
      {
        id: 'wren',
        text: 'wren halloway?\n(decoded from her keyword)\nwho is this',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 1
      },
      {
        id: 'camille',
        text: 'camille?\nsaw something at boathouse?\nwho is this',
        pos: { x: 28, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 1
      }
    ],
    strings: [],
    marginalia: []
  };

  // public API attached to window.Caseboard
  const Caseboard = {
    SNAPSHOTS,
    recordWrap: function(_chapter) { /* TODO */ },
    open: function() { /* TODO */ },
    close: function() { /* TODO */ },
    scrubTo: function(_chapter) { /* TODO */ },
    isUnlocked: function() {
      try {
        const n = parseInt(localStorage.getItem(PROGRESS_KEY) || '0', 10);
        return n >= 1;
      } catch (e) { return false; }
    },
    progress: function() {
      try {
        return parseInt(localStorage.getItem(PROGRESS_KEY) || '0', 10);
      } catch (e) { return 0; }
    }
  };

  window.Caseboard = Caseboard;
})();
