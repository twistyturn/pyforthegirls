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
.cb-marg.cb-marg-crossed {
  text-decoration: line-through;
  text-decoration-thickness: 3px;
  text-decoration-color: #1a0628;
  opacity: 0.55;
}
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
      el.className = 'cb-marg cb-size-' + size + ' cb-color-' + color + (m.crossed ? ' cb-marg-crossed' : '');
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
    const snap = getSnapshot(currentView);
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
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 1
      }
    ],
    strings: [],
    marginalia: []
  };

  // ---------------------------------------------------------------------------
  // ch2 — wren grows from placeholder; password and tyler placeholder pinned.
  // First red string. First marker scrawl.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[2] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan, 17\n(still missing)',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 2
      },
      {
        id: 'wren',
        text: 'WREN HALLOWAY\ncounsellor. 19.\ntegan’s "friend"\nSUSPICIOUS',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 2
      },
      {
        id: 'camille',
        text: 'camille?\nsaw something at boathouse?\nwho is this',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 1
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'thin',
        label: 'something HAPPENED',
        chapter_added: 2
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // ch3 — SMS log surfaces. last text "h", glorfindel screen name, briar.
  // wren conviction grows. camille fills in. first big diagonal scrawl.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[3] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'wren',
        text: 'WREN\n"we were just at the cabin"\nliar\nliar\nliar\nRED FLAGS',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'camille',
        text: 'Camille (camille.j.89)\nfriend?\nat pinewood cabin\nsaw something at boathouse??',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'last_text_h',
        text: 'last text "h"\n11:46 pm\nwho is h????',
        pos: { x: 42, y: 15 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'h_question',
        text: 'H = ???',
        pos: { x: 60, y: 15 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'glorfindel',
        text: 'G♡ glorfindel_lives\nher ONLY texts go here\nwho ARE you',
        pos: { x: 88, y: 45 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'briar',
        text: 'Briar Vance\nsenior counsellor\nwas up all night\ntalking to wren???',
        pos: { x: 64, y: 85 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'thick',
        label: 'something HAPPENED',
        chapter_added: 2
      },
      {
        from: 'wren', to: 'briar',
        color: 'red', thickness: 'thin',
        chapter_added: 3
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      },
      {
        text: 'SHE LEFT IT 3X',
        pos: { x: 25, y: 7 }, angle: -8,
        color: 'red', size: 'big',
        chapter_added: 3
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // ch4 — Hattie introduces and clears in the same chapter. Melissa surfaces.
  // Wren conviction grows (Melissa link). Soft scrawl: tegan AND melissa???
  // ---------------------------------------------------------------------------
  SNAPSHOTS[4] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'wren',
        text: 'WREN\n"we were just at the cabin"\nliar liar liar\nRED FLAGS\ndid something to melissa in 2003\nWHO ELSE??',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 4
      },
      {
        id: 'camille',
        text: 'Camille (camille.j.89)\nfriend?\nat pinewood cabin\nsaw something at boathouse??',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'last_text_h',
        text: 'last text "h"\n11:46 pm\nwho is h????',
        pos: { x: 42, y: 15 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'h_question',
        text: 'H = ???',
        pos: { x: 60, y: 15 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'glorfindel',
        text: 'G♡ glorfindel_lives\nher ONLY texts go here\nwho ARE you',
        pos: { x: 88, y: 45 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'briar',
        text: 'Briar Vance\nsenior counsellor\nwas up all night\ntalking to wren???',
        pos: { x: 64, y: 85 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'hattie',
        text: 'HATTIE\n↑ checked\n↑ sister hit by car aug 14\n↑ marcia drove her to whitecourt\n↑ left aug 16\n↑ CLEARED\nnot the H',
        pos: { x: 14, y: 22 },
        color: 'white', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'melissa',
        text: 'MELISSA KLASSEN\nwhy is no one talking about her\npulled out of camp 2003\nsomething HAPPENED to her',
        pos: { x: 14, y: 86 },
        color: 'yellow', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'thick',
        label: 'something HAPPENED',
        chapter_added: 2
      },
      {
        from: 'wren', to: 'briar',
        color: 'red', thickness: 'thin',
        chapter_added: 3
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      },
      {
        text: 'SHE LEFT IT 3X',
        pos: { x: 25, y: 7 }, angle: -8,
        color: 'red', size: 'big',
        chapter_added: 3
      },
      {
        text: 'tegan AND melissa???',
        pos: { x: 60, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 4
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // ch5 — H = HANNAH. tegan was leaving. pink string different from red ones.
  // last_text_h and h_question consolidated into hannah_main.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[5] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan\nWAS LEAVING\nhad a plan\nhad a RIDE',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 5
      },
      {
        id: 'wren',
        text: 'WREN\n"we were just at the cabin"\nliar liar liar\nRED FLAGS\ndid something to melissa in 2003\nWHO ELSE??\nshe found out??',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 5
      },
      {
        id: 'camille',
        text: 'Camille (camille.j.89)\nfriend?\nat pinewood cabin\nsaw something at boathouse??',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'glorfindel',
        text: 'G♡ glorfindel_lives\nher ONLY texts go here\nwho ARE you',
        pos: { x: 88, y: 45 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'briar',
        text: 'Briar Vance\nsenior counsellor\nwas up all night\ntalking to wren???',
        pos: { x: 64, y: 85 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'hattie',
        text: 'HATTIE\n↑ checked\n↑ sister hit by car aug 14\n↑ marcia drove her to whitecourt\n↑ left aug 16\n↑ CLEARED\nnot the H',
        pos: { x: 14, y: 22 },
        color: 'white', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'melissa',
        text: 'MELISSA KLASSEN\nwhy is no one talking about her\npulled out of camp 2003\nsomething HAPPENED to her',
        pos: { x: 14, y: 86 },
        color: 'yellow', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'hannah_main',
        text: 'H = HANNAH\n19. halifax. nova scotia.\nglorfindel_lives = HANNAH\nTEGAN WAS GOING TO HER',
        pos: { x: 50, y: 13 },
        color: 'pink', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      },
      {
        id: 'escape',
        text: 'the escape\nride at boathouse\n11 pm aug 14',
        pos: { x: 30, y: 60 },
        color: 'blue', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'thick',
        label: 'something HAPPENED',
        chapter_added: 2
      },
      {
        from: 'wren', to: 'briar',
        color: 'red', thickness: 'thin',
        chapter_added: 3
      },
      {
        from: 'tegan_main', to: 'hannah_main',
        color: 'pink', thickness: 'thin',
        chapter_added: 5
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      },
      {
        text: 'SHE LEFT IT 3X',
        pos: { x: 25, y: 7 }, angle: -8,
        color: 'red', size: 'big',
        chapter_added: 3
      },
      {
        text: 'tegan AND melissa???',
        pos: { x: 60, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 4
      },
      {
        text: 'SHE NEVER MADE IT TO THE RIDE',
        pos: { x: 50, y: 52 }, angle: -16,
        color: 'red', size: 'big',
        chapter_added: 5
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // ch6 — peak conviction. Wren card grows BIG. WHAT HAPPENED IN THAT BOATHOUSE
  // scrawl. triple red string. character-based, not yet forensic.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[6] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan\nWAS LEAVING\nhad a plan\nhad a RIDE',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 5
      },
      {
        id: 'wren',
        text: 'WREN\n"we were just at the cabin" — liar\nRED FLAGS\ndid things to melissa 2003\ndid things to tegan 2004\nemotional control. lying. silence on aug 14\nemail to tegan: "remind camille what happened to melissa"\nSHE’S LYING ABOUT SOMETHING',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 6
      },
      {
        id: 'camille',
        text: 'Camille (camille.j.89)\nfriend?\nat pinewood cabin\nsaw something at boathouse??',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'glorfindel',
        text: 'G♡ glorfindel_lives\nher ONLY texts go here\nwho ARE you',
        pos: { x: 88, y: 45 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'briar',
        text: 'Briar Vance\nsenior counsellor\nwas up all night\ntalking to wren???',
        pos: { x: 64, y: 85 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'hattie',
        text: 'HATTIE\n↑ checked\n↑ sister hit by car aug 14\n↑ marcia drove her to whitecourt\n↑ left aug 16\n↑ CLEARED\nnot the H',
        pos: { x: 14, y: 22 },
        color: 'white', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'melissa',
        text: 'MELISSA KLASSEN\nwhy is no one talking about her\npulled out of camp 2003\nsomething HAPPENED to her',
        pos: { x: 14, y: 86 },
        color: 'yellow', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'hannah_main',
        text: 'H = HANNAH\n19. halifax. nova scotia.\nglorfindel_lives = HANNAH\nTEGAN WAS GOING TO HER',
        pos: { x: 50, y: 13 },
        color: 'pink', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      },
      {
        id: 'escape',
        text: 'the escape\nride at boathouse\n11 pm aug 14',
        pos: { x: 30, y: 60 },
        color: 'blue', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      },
      {
        id: 'hannah_boathouse',
        text: 'HANNAH\nwas waiting at the boathouse\nnever knew',
        pos: { x: 88, y: 85 },
        color: 'pink', style: 'clean',
        chapter_added: 6, chapter_modified: 6
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'triple',
        label: 'something HAPPENED',
        chapter_added: 2
      },
      {
        from: 'wren', to: 'briar',
        color: 'red', thickness: 'thin',
        chapter_added: 3
      },
      {
        from: 'tegan_main', to: 'hannah_main',
        color: 'pink', thickness: 'thin',
        chapter_added: 5
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      },
      {
        text: 'SHE LEFT IT 3X',
        pos: { x: 25, y: 7 }, angle: -8,
        color: 'red', size: 'big',
        chapter_added: 3
      },
      {
        text: 'tegan AND melissa???',
        pos: { x: 60, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 4
      },
      {
        text: 'SHE NEVER MADE IT TO THE RIDE',
        pos: { x: 50, y: 52 }, angle: -16,
        color: 'red', size: 'big',
        chapter_added: 5
      },
      {
        text: 'WHAT HAPPENED IN THAT BOATHOUSE',
        pos: { x: 70, y: 22 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 6
      },
      {
        text: 'SHE FOUND OUT TEGAN WAS LEAVING',
        pos: { x: 70, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 6
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // ch7 — the crossout. wren card heavily scribbled. tyler hughes pinned.
  // sgt. d. hughes pinned. red string loosens. THERES NOWHERE TO TAKE THIS.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[7] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan\nWAS LEAVING\nhad a plan\nhad a RIDE',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 5
      },
      {
        id: 'wren',
        text: 'WREN\n"we were just at the cabin" — liar\nRED FLAGS\ndid things to melissa 2003\ndid things to tegan 2004\nemotional control. lying. silence on aug 14\nemail to tegan: "remind camille what happened to melissa"\nSHE’S LYING ABOUT SOMETHING\n[x]WHAT HAPPENED IN THAT BOATHOUSE[/x] [a]no??[/a]\n• still a piece of shit\n• but not THIS',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'scribbled',
        chapter_added: 1, chapter_modified: 7
      },
      {
        id: 'camille',
        text: 'Camille (camille.j.89)\nfriend?\nat pinewood cabin\nsaw something at boathouse??',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 3
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'glorfindel',
        text: 'G♡ glorfindel_lives\nher ONLY texts go here\nwho ARE you',
        pos: { x: 88, y: 45 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'briar',
        text: 'Briar Vance\nsenior counsellor\nwas up all night\ntalking to wren???',
        pos: { x: 64, y: 85 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'hattie',
        text: 'HATTIE\n↑ checked\n↑ sister hit by car aug 14\n↑ marcia drove her to whitecourt\n↑ left aug 16\n↑ CLEARED\nnot the H',
        pos: { x: 14, y: 22 },
        color: 'white', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'melissa',
        text: 'MELISSA KLASSEN\nwhy is no one talking about her\npulled out of camp 2003\nsomething HAPPENED to her',
        pos: { x: 14, y: 86 },
        color: 'yellow', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'hannah_main',
        text: 'H = HANNAH\n19. halifax. nova scotia.\nglorfindel_lives = HANNAH\nTEGAN WAS GOING TO HER',
        pos: { x: 50, y: 13 },
        color: 'pink', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      },
      {
        id: 'escape',
        text: 'the escape\nride at boathouse\n11 pm aug 14',
        pos: { x: 30, y: 60 },
        color: 'blue', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      },
      {
        id: 'hannah_boathouse',
        text: 'HANNAH\nwas waiting at the boathouse\nnever knew',
        pos: { x: 88, y: 85 },
        color: 'pink', style: 'clean',
        chapter_added: 6, chapter_modified: 6
      },
      {
        id: 'tyler',
        text: 'TYLER HUGHES\n17. pinewood JC.\nborn 1986\nSCRATCHES on his hands aug 15 morning\n"fell on the trail"\n↑ LIAR\nten hour gap\nnobody asked',
        pos: { x: 60, y: 32 },
        color: 'white', style: 'clean',
        chapter_added: 7, chapter_modified: 7
      },
      {
        id: 'sgt_hughes',
        text: 'sgt. d. hughes\nrcmp whitecourt\nTYLER’S DAD\nTHE SAME DETACHMENT',
        pos: { x: 45, y: 92 },
        color: 'white', style: 'clean',
        chapter_added: 7, chapter_modified: 7
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'loose',
        label: '?',
        chapter_added: 2
      },
      {
        from: 'wren', to: 'briar',
        color: 'red', thickness: 'thin',
        chapter_added: 3
      },
      {
        from: 'tegan_main', to: 'hannah_main',
        color: 'pink', thickness: 'thin',
        chapter_added: 5
      },
      {
        from: 'tyler', to: 'tegan_main',
        color: 'red', thickness: 'thick',
        chapter_added: 7
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      },
      {
        text: 'SHE LEFT IT 3X',
        pos: { x: 25, y: 7 }, angle: -8,
        color: 'red', size: 'big',
        chapter_added: 3
      },
      {
        text: 'tegan AND melissa???',
        pos: { x: 60, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 4
      },
      {
        text: 'SHE NEVER MADE IT TO THE RIDE',
        pos: { x: 50, y: 52 }, angle: -16,
        color: 'red', size: 'big',
        chapter_added: 5
      },
      {
        text: 'SHE FOUND OUT TEGAN WAS LEAVING',
        pos: { x: 70, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 6, crossed: true
      },
      {
        text: 'THERES NOWHERE TO TAKE THIS',
        pos: { x: 50, y: 97 }, angle: -3,
        color: 'red', size: 'big',
        chapter_added: 7
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // ch8 — final state. softer wren. full tyler picture. redacted ride driver.
  // hannah grown. camille grown. melissa: leave her alone. WE HAVE UNTIL LATE
  // JUNE.
  // ---------------------------------------------------------------------------
  SNAPSHOTS[8] = {
    cards: [
      {
        id: 'tegan_main',
        text: 'tegan\naug 14 2004\nunder the boathouse pilings',
        pos: { x: 50, y: 45 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 8
      },
      {
        id: 'wren',
        text: 'WREN\n• monster\n• not THIS monster\n• WET when she got back to cabin 11:35\n• engineered meds report on camille\n• done',
        pos: { x: 78, y: 22 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 8
      },
      {
        id: 'camille',
        text: 'Camille\nwas right about wren\nwas wrong about wren\ntold the police that morning\nnobody listened to a kid\nnot until something happens\ntell me if u find her',
        pos: { x: 30, y: 74 },
        color: 'yellow', style: 'clean',
        chapter_added: 1, chapter_modified: 8
      },
      {
        id: 'password',
        text: 'password worked\nbirchwoodcounsellor1985\nshe SET THIS UP',
        pos: { x: 80, y: 68 },
        color: 'blue', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'tyler_placeholder',
        text: 'tyler?\na "boy" tegan kissed wren\nin front of?\nwho',
        pos: { x: 14, y: 54 },
        color: 'yellow', style: 'clean',
        chapter_added: 2, chapter_modified: 2
      },
      {
        id: 'glorfindel',
        text: 'G♡ glorfindel_lives\nher ONLY texts go here\nwho ARE you',
        pos: { x: 88, y: 45 },
        color: 'pink', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'briar',
        text: 'Briar Vance\nsenior counsellor\nwas up all night\ntalking to wren???',
        pos: { x: 64, y: 85 },
        color: 'yellow', style: 'clean',
        chapter_added: 3, chapter_modified: 3
      },
      {
        id: 'hattie',
        text: 'HATTIE\n↑ checked\n↑ sister hit by car aug 14\n↑ marcia drove her to whitecourt\n↑ left aug 16\n↑ CLEARED\nnot the H',
        pos: { x: 14, y: 22 },
        color: 'white', style: 'clean',
        chapter_added: 4, chapter_modified: 4
      },
      {
        id: 'melissa',
        text: 'Melissa\ndoing okay\ndoing the work\nleave her alone',
        pos: { x: 14, y: 86 },
        color: 'yellow', style: 'clean',
        chapter_added: 4, chapter_modified: 8
      },
      {
        id: 'hannah_main',
        text: 'HANNAH\nher name. her plan.\ngrew up swimming in halifax harbour\ncan be there in late june',
        pos: { x: 50, y: 13 },
        color: 'pink', style: 'clean',
        chapter_added: 5, chapter_modified: 8
      },
      {
        id: 'escape',
        text: 'the escape\nride at boathouse\n11 pm aug 14',
        pos: { x: 30, y: 60 },
        color: 'blue', style: 'clean',
        chapter_added: 5, chapter_modified: 5
      },
      {
        id: 'hannah_boathouse',
        text: 'HANNAH\nwas waiting at the boathouse\nnever knew',
        pos: { x: 88, y: 85 },
        color: 'pink', style: 'clean',
        chapter_added: 6, chapter_modified: 6
      },
      {
        id: 'tyler',
        text: 'TYLER\nfollowed her to the boathouse\nwaited for wren to leave\nhockey jersey\nhe never wore it again',
        pos: { x: 60, y: 32 },
        color: 'white', style: 'clean',
        chapter_added: 7, chapter_modified: 8
      },
      {
        id: 'sgt_hughes',
        text: 'sgt. d. hughes (his dad)\nsame detachment',
        pos: { x: 45, y: 92 },
        color: 'white', style: 'clean',
        chapter_added: 7, chapter_modified: 8
      },
      {
        id: 'ride_driver',
        text: '[r]_______________[/r]\n[name unknown — hannah won’t say]\nthe ride driver\nwaited at the boathouse 12-2 AM\nheard nothing',
        pos: { x: 78, y: 95 },
        color: 'redacted', style: 'clean',
        chapter_added: 8, chapter_modified: 8
      }
    ],
    strings: [
      {
        from: 'wren', to: 'tegan_main',
        color: 'red', thickness: 'loose',
        label: '?',
        chapter_added: 2
      },
      {
        from: 'wren', to: 'briar',
        color: 'red', thickness: 'thin',
        chapter_added: 3
      },
      {
        from: 'tegan_main', to: 'hannah_main',
        color: 'pink', thickness: 'thin',
        chapter_added: 5
      },
      {
        from: 'tyler', to: 'tegan_main',
        color: 'red', thickness: 'thick',
        chapter_added: 7
      },
      {
        from: 'sgt_hughes', to: 'tyler',
        color: 'red', thickness: 'thin',
        chapter_added: 8
      }
    ],
    marginalia: [
      {
        text: 'she was leaving???',
        pos: { x: 52, y: 60 }, angle: -14,
        color: 'red', size: 'medium',
        chapter_added: 2
      },
      {
        text: 'SHE LEFT IT 3X',
        pos: { x: 25, y: 7 }, angle: -8,
        color: 'red', size: 'big',
        chapter_added: 3
      },
      {
        text: 'tegan AND melissa???',
        pos: { x: 60, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 4
      },
      {
        text: 'SHE NEVER MADE IT TO THE RIDE',
        pos: { x: 50, y: 52 }, angle: -16,
        color: 'red', size: 'big',
        chapter_added: 5
      },
      {
        text: 'SHE FOUND OUT TEGAN WAS LEAVING',
        pos: { x: 70, y: 38 }, angle: -10,
        color: 'red', size: 'medium',
        chapter_added: 6, crossed: true
      },
      {
        text: 'THERES NOWHERE TO TAKE THIS',
        pos: { x: 50, y: 97 }, angle: -3,
        color: 'red', size: 'big',
        chapter_added: 7, crossed: true
      },
      {
        text: 'WE HAVE UNTIL LATE JUNE',
        pos: { x: 50, y: 92 }, angle: 4,
        color: 'red', size: 'big',
        chapter_added: 8
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // persistence
  //   localStorage[STORAGE_KEY] holds a {1: snapshot, 2: snapshot, ...} cache
  //   so older snapshots survive even if SNAPSHOTS shape changes in code.
  //   localStorage[PROGRESS_KEY] holds the highest chapter the player has
  //   completed (its wrap reached).
  // ---------------------------------------------------------------------------
  function readCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function writeCache(cache) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch (e) {}
  }

  function getSnapshot(n) {
    const cache = readCache();
    if (cache[n]) return cache[n];
    return SNAPSHOTS[n];
  }

  // override placeholder used by renderBoard
  function _resolveSnapshot() { return getSnapshot(currentView); }

  // public API attached to window.Caseboard
  const Caseboard = {
    SNAPSHOTS,

    recordWrap: function(chapter) {
      chapter = parseInt(chapter, 10);
      if (!chapter || chapter < 1 || chapter > 8) return;
      try {
        const current = parseInt(localStorage.getItem(PROGRESS_KEY) || '0', 10);
        if (chapter > current) localStorage.setItem(PROGRESS_KEY, String(chapter));
      } catch (e) {}
      const cache = readCache();
      for (let i = 1; i <= chapter; i++) {
        if (SNAPSHOTS[i]) cache[i] = SNAPSHOTS[i];
      }
      writeCache(cache);
      Caseboard.refreshIcon();
    },

    open: function() {
      injectCSS();
      injectModal();
      highestUnlocked = Math.max(1, Caseboard.progress());
      // default to the latest unlocked snapshot every time the board opens —
      // the player expects the most recent state, not the oldest.
      currentView = highestUnlocked;
      renderScrubber();
      renderBoard();
      document.getElementById('cb-overlay').classList.add('cb-open');
    },

    close: function() {
      const el = document.getElementById('cb-overlay');
      if (el) el.classList.remove('cb-open');
    },

    scrubTo: function(chapter) {
      chapter = parseInt(chapter, 10);
      if (!chapter || chapter < 1 || chapter > 8) return;
      if (chapter > highestUnlocked) return;
      currentView = chapter;
      renderScrubber();
      renderBoard();
    },

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
    },

    refreshIcon: function() {
      const el = document.getElementById('icon-caseboard');
      if (!el) return;
      el.style.display = Caseboard.isUnlocked() ? '' : 'none';
    }
  };

  // make renderBoard read through cache
  const _originalRenderBoard = renderBoard;
  renderBoard = function() {
    const board = document.getElementById('cb-board');
    if (!board) return;
    const snap = getSnapshot(currentView);
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
  };

  // auto-init: refresh icon visibility on load if the page has one
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { Caseboard.refreshIcon(); });
  } else {
    Caseboard.refreshIcon();
  }

  window.Caseboard = Caseboard;
})();
