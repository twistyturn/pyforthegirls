// =============================================================================
// practice.js
//
// the cousin's "tegan's old python practice" folder. opens from a desktop icon
// styled as a folder labeled "python_practice". inside: a list of .py files,
// each one a dated practice file tegan wrote while learning.
//
// each file is fetched from /python_practice/ on first open and cached.
// the modal renders as a Notepad-style window (sidebar = file list,
// main = selected file content with embedded runners).
//
// each exercise has:
//   - prompt text (rendered from the file's comment lines)
//   - optional preamble code (data declarations from the file)
//   - an editable code box (initially empty) + Run button + output area
//   - a "show answer" toggle revealing the answer code + commentary
//   - a "got it" checkbox persisted to localStorage
//
// gating: same as study_notes — unlocked once the player completes ch1.
// individual files are gated by the player's furthest-completed chapter via
// the chapter_unlocked field on each file entry.
// =============================================================================

(function() {
  'use strict';

  const PROGRESS_KEY = 'pyforthegirls_caseboard_progress';
  const GOTIT_KEY = 'pyforthegirls_practice_gotit';

  // INDEX: filename, when it unlocks, what concept it teaches.
  // actual content lives in /python_practice/<filename> and is fetched on open.
  const FILES = [
    { filename: '01_print_and_strings.py',           chapter_unlocked: 1, title: 'print and strings',         date: 'feb 14 2004' },
    { filename: '02_variables.py',                   chapter_unlocked: 1, title: 'variables',                 date: 'feb 24 2004' },
    { filename: '03_fstrings.py',                    chapter_unlocked: 1, title: 'f-strings',                 date: 'mar 3 2004' },
    { filename: '04_input_and_casting.py',           chapter_unlocked: 1, title: 'input and casting',         date: 'mar 12 2004' },
    { filename: '05_loops_and_bags.py',              chapter_unlocked: 2, title: 'loops and bags',            date: 'apr 6 2004' },
    { filename: '06_chained_access.py',              chapter_unlocked: 3, title: 'chained access',            date: 'may 11 2004' },
    { filename: '07_filters_and_comprehensions.py',  chapter_unlocked: 3, title: 'filters & comprehensions',  date: 'jun 2 2004' },
    { filename: '08_def_and_return.py',              chapter_unlocked: 4, title: 'def and return',            date: 'jun 24 2004' },
    { filename: '09_logic_operators.py',             chapter_unlocked: 2, title: 'logic operators',           date: 'jun 4 2004' },
    { filename: '10_string_methods.py',              chapter_unlocked: 3, title: 'string methods',            date: 'jun 18 2004' },
    { filename: '11_slicing.py',                     chapter_unlocked: 3, title: 'slicing',                   date: 'jun 27 2004' },
    { filename: '12_imports_and_files.py',           chapter_unlocked: 5, title: 'imports and files',         date: 'jul 8 2004' },
    { filename: '13_dict_as_lookup.py',              chapter_unlocked: 5, title: 'dict as lookup',            date: 'jul 18 2004' },
    { filename: '14_regex_basics.py',                chapter_unlocked: 6, title: 'regex basics',              date: 'jul 26 2004' },
    { filename: '15_numbers_and_dates.py',           chapter_unlocked: 7, title: 'numbers and dates',         date: 'jul 30 2004' },
    { filename: '16_try_except_and_scope.py',        chapter_unlocked: 7, title: 'try/except and scope',      date: 'aug 2 2004' }
  ];

  const fileCache = {};
  let modalInjected = false;
  let cssInjected = false;
  let currentFile = null;

  // ===========================================================================
  // PROGRESS
  // ===========================================================================
  function progress() {
    try { return parseInt(localStorage.getItem(PROGRESS_KEY) || '0', 10); }
    catch (e) { return 0; }
  }
  function isUnlocked() { return progress() >= 1; }
  function unlockedFiles() {
    const max = progress();
    return FILES.filter(f => f.chapter_unlocked <= max);
  }
  function loadGotIt() {
    try { return JSON.parse(localStorage.getItem(GOTIT_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveGotIt(map) {
    try { localStorage.setItem(GOTIT_KEY, JSON.stringify(map)); }
    catch (e) {}
  }

  // ===========================================================================
  // CSS, parsing, rendering, modal — appended below
  // ===========================================================================

  // ===========================================================================
  // CSS — Notepad cosplay. gray titlebar, white body, monospace.
  // ===========================================================================
  const CSS = `
.pr-overlay {
  position: fixed; inset: 0; z-index: 510;
  background: rgba(20, 8, 36, 0.78);
  display: none;
  align-items: stretch; justify-content: center;
  padding: 16px;
  overflow: auto;
}
.pr-overlay.pr-open { display: flex; }
.pr-shell {
  width: 100%; max-width: 980px;
  background: #ece9d8;
  border: 1px solid #404040;
  box-shadow: 2px 2px 0 #1a0628, 4px 4px 12px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  font-family: Tahoma, Verdana, sans-serif;
  color: #000;
}
.pr-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #0058e6 0%, #1c75e0 8%, #0049b8 100%);
  color: #fff;
  padding: 3px 4px 3px 6px;
  font-family: Tahoma, sans-serif;
  font-size: 11px; font-weight: bold;
  border-bottom: 1px solid #1a0628;
}
.pr-titlebar-icon {
  display: inline-block; width: 14px; height: 14px;
  margin-right: 4px;
  background: #fff; border: 1px solid #444;
  position: relative; vertical-align: middle;
}
.pr-titlebar-icon::before {
  content: ''; position: absolute; inset: 2px;
  background: repeating-linear-gradient(180deg, #444 0 1px, transparent 1px 3px);
}
.pr-titlebar-buttons { display: flex; gap: 2px; }
.pr-titlebar-btn {
  width: 16px; height: 14px;
  background: #d4d0c8;
  border: 1px solid #fff;
  border-right-color: #404040;
  border-bottom-color: #404040;
  color: #000;
  font-family: Marlett, 'Webdings', sans-serif;
  font-size: 9px;
  text-align: center; line-height: 10px;
  cursor: pointer;
}
.pr-titlebar-btn:hover { background: #e8e4d8; }
.pr-titlebar-btn.pr-close:hover { background: #e81123; color: #fff; }
.pr-menubar {
  display: flex; gap: 0;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  padding: 2px 4px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
}
.pr-menubar-item { padding: 2px 8px; cursor: default; user-select: none; }
.pr-menubar-item:hover { background: #316ac5; color: #fff; }
.pr-body {
  display: flex;
  background: #ece9d8;
  min-height: 520px;
  max-height: calc(100vh - 120px);
}
.pr-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #aca899;
  padding: 8px 0;
  overflow-y: auto;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
}
.pr-sidebar-header {
  padding: 4px 10px;
  font-weight: bold;
  color: #555;
  border-bottom: 1px solid #d4d0c8;
  margin-bottom: 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pr-file-row {
  padding: 4px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #000;
  border-left: 3px solid transparent;
}
.pr-file-row:hover { background: #f0eedf; }
.pr-file-row.pr-active { background: #d8eaff; border-left-color: #316ac5; }
.pr-file-icon { font-size: 14px; }
.pr-file-name { font-family: 'Courier New', monospace; font-size: 11px; }
.pr-file-meta { font-size: 10px; color: #707070; margin-left: 22px; }
.pr-file-row .pr-gotit-dot {
  margin-left: auto;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: transparent;
}
.pr-file-row.pr-has-progress .pr-gotit-dot { background: #4a9d3a; }
.pr-page {
  flex: 1;
  background: #fff;
  border: 1px solid #aca899;
  margin: 8px;
  padding: 16px 24px;
  overflow-y: auto;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #000;
}
.pr-empty {
  color: #888; text-align: center; padding: 60px 20px;
  font-family: Tahoma, sans-serif;
}
.pr-file-header {
  white-space: pre-wrap;
  color: #008000;
  margin-bottom: 18px;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 13px;
}
.pr-exercise {
  border: 1px solid #c8c4b4;
  background: #fafaf6;
  margin: 18px 0;
  padding: 12px 14px;
}
.pr-ex-title {
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 13px;
  font-weight: bold;
  background: #316ac5;
  color: #fff;
  padding: 4px 10px;
  margin: -12px -14px 12px;
}
.pr-ex-prompt {
  white-space: pre-wrap;
  color: #008000;
  margin-bottom: 10px;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
}
.pr-ex-preamble {
  background: #f0f0e8;
  border: 1px dashed #aca899;
  padding: 6px 8px;
  margin: 8px 0;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
  color: #000;
  white-space: pre;
  overflow-x: auto;
}
.pr-ex-preamble-label {
  display: block;
  font-family: Tahoma, sans-serif;
  font-size: 10px;
  color: #707070;
  margin-bottom: 2px;
  font-style: italic;
}
.pr-runner-label {
  display: block;
  font-family: Tahoma, sans-serif;
  font-size: 10px;
  color: #707070;
  margin: 8px 0 2px;
  font-style: italic;
}
.pr-runner {
  width: 100%;
  min-height: 100px;
  background: #fff;
  border: 1px solid #7f9db9;
  padding: 6px 8px;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
  color: #000;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}
.pr-runner:focus { border-color: #316ac5; }
.pr-controls {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
  flex-wrap: wrap;
}
.pr-btn {
  background: linear-gradient(180deg, #f6f6f6, #d6d3c4);
  border: 1px solid #707070;
  border-top-color: #fff;
  border-left-color: #fff;
  padding: 3px 12px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
  cursor: pointer;
}
.pr-btn:hover { background: linear-gradient(180deg, #fffbe6, #e8e4d8); }
.pr-btn:active { border-color: #404040; border-top-color: #707070; border-left-color: #707070; }
.pr-gotit {
  display: inline-flex; align-items: center; gap: 4px;
  margin-left: auto;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #404040;
  cursor: pointer;
  user-select: none;
}
.pr-output {
  margin-top: 8px;
  background: #1a0628;
  color: #c8ff66;
  border: 1px solid #404040;
  padding: 6px 8px;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  min-height: 24px;
  display: none;
}
.pr-output.pr-shown { display: block; }
.pr-output.pr-error { color: #ff6b8a; }
.pr-answer {
  margin-top: 10px;
  display: none;
  border-top: 1px dashed #aca899;
  padding-top: 8px;
}
.pr-answer.pr-shown { display: block; }
.pr-answer-code {
  background: #f0f0e8;
  border: 1px solid #c8c4b4;
  padding: 6px 8px;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
  color: #000;
  white-space: pre;
  overflow-x: auto;
  margin: 4px 0;
}
.pr-answer-commentary {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 12px;
  font-style: italic;
  color: #555;
  white-space: pre-wrap;
  padding: 4px 8px;
  border-left: 3px solid #d4d0c8;
  margin: 6px 0;
}
.pr-file-footer {
  white-space: pre-wrap;
  color: #008000;
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid #d4d0c8;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 12px;
}
.pr-statusbar {
  background: #ece9d8;
  border-top: 1px solid #aca899;
  padding: 2px 8px;
  font-family: Tahoma, sans-serif;
  font-size: 10px;
  color: #404040;
  display: flex; gap: 12px;
}
@media (max-width: 700px) {
  .pr-body { flex-direction: column; max-height: none; }
  .pr-sidebar { width: 100%; max-height: 200px; }
  .pr-page { margin: 4px; padding: 12px; }
}
`;

  function injectCSS() {
    if (cssInjected) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    cssInjected = true;
  }

  // ===========================================================================
  // PARSER — split a raw .py file into header / exercises / footer.
  // exercise markers:  # ---- exercise N: TITLE ----
  // answer markers:    # ---- ANSWER ... ----
  // footer separator:  the LAST `# ====...` block (after last exercise)
  // ===========================================================================
  function parseFile(raw) {
    const lines = raw.split('\n');
    const exerciseRe = /^#\s*-{2,}\s*exercise\s+(\d+)\s*:?\s*(.*?)\s*-{2,}\s*$/i;
    const answerRe = /^#\s*-{2,}\s*ANSWER\b.*?-{2,}\s*$/;
    const sepRe = /^#\s*=={3,}/;

    let header = [];
    let footer = [];
    let exercises = [];
    let current = null;
    let inAnswer = false;
    let mode = 'header';

    for (const line of lines) {
      const exMatch = line.match(exerciseRe);
      if (exMatch) {
        if (current) exercises.push(current);
        current = {
          num: exMatch[1],
          title: exMatch[2] || '',
          promptLines: [],
          preambleLines: [],
          answerCodeLines: [],
          answerCommentary: ''
        };
        inAnswer = false;
        mode = 'exercise';
        continue;
      }
      if (mode === 'exercise' && answerRe.test(line)) {
        inAnswer = true;
        continue;
      }
      // detect FOOTER separator: a `# ===` line while inside an answer block
      if (inAnswer && sepRe.test(line)) {
        if (current) exercises.push(current);
        current = null;
        mode = 'footer';
        footer.push(line);
        continue;
      }

      if (mode === 'header') {
        header.push(line);
      } else if (mode === 'exercise' && !inAnswer) {
        if (line.startsWith('#') || line.trim() === '') {
          current.promptLines.push(line);
        } else {
          current.preambleLines.push(line);
        }
      } else if (mode === 'exercise' && inAnswer) {
        // strip leading `# ` (or just `#`); blank-comment is `#`
        let stripped;
        if (line === '#') stripped = '';
        else if (line.startsWith('# ')) stripped = line.slice(2);
        else if (line.startsWith('#')) stripped = line.slice(1);
        else stripped = line; // shouldn't happen but be safe

        if (stripped.startsWith('//')) {
          // tegan commentary line
          const commentary = stripped.replace(/^\/\/\s?/, '');
          current.answerCommentary += (current.answerCommentary ? '\n' : '') + commentary;
        } else if (stripped === '' && current.answerCommentary) {
          // blank line inside commentary → preserve as blank
          current.answerCommentary += '\n';
        } else {
          // code line
          current.answerCodeLines.push(stripped);
        }
      } else if (mode === 'footer') {
        footer.push(line);
      }
    }
    if (current) exercises.push(current);

    return { header, exercises, footer };
  }

  // strip trailing blank lines from a string array
  function trimTrailingBlanks(arr) {
    const out = arr.slice();
    while (out.length && out[out.length - 1].trim() === '') out.pop();
    return out;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ===========================================================================
  // RENDERER
  // ===========================================================================
  function renderFile(filename, raw) {
    const parsed = parseFile(raw);
    const page = document.getElementById('pr-page');
    if (!page) return;

    const headerText = trimTrailingBlanks(parsed.header).join('\n');
    let html = '<div class="pr-file-header">' + escapeHtml(headerText) + '</div>';

    parsed.exercises.forEach((ex, idx) => {
      const exId = filename + '::' + ex.num;
      const promptText = trimTrailingBlanks(ex.promptLines).join('\n');
      const preambleCode = trimTrailingBlanks(ex.preambleLines).join('\n');
      const answerCode = trimTrailingBlanks(ex.answerCodeLines).join('\n');
      const gotIt = !!loadGotIt()[exId];

      html += '<div class="pr-exercise" data-ex-id="' + escapeHtml(exId) + '">';
      html += '<div class="pr-ex-title">exercise ' + escapeHtml(ex.num) + (ex.title ? ': ' + escapeHtml(ex.title) : '') + '</div>';
      if (promptText.trim()) {
        html += '<div class="pr-ex-prompt">' + escapeHtml(promptText) + '</div>';
      }
      if (preambleCode.trim()) {
        html += '<span class="pr-ex-preamble-label">// this code is loaded for you before yours runs:</span>';
        html += '<pre class="pr-ex-preamble">' + escapeHtml(preambleCode) + '</pre>';
      }
      html += '<span class="pr-runner-label">// your code:</span>';
      html += '<textarea class="pr-runner" data-ex-id="' + escapeHtml(exId) + '" spellcheck="false" autocomplete="off"></textarea>';
      html += '<div class="pr-controls">';
      html += '<button class="pr-btn pr-run">▶ Run</button>';
      if (answerCode.trim()) {
        html += '<button class="pr-btn pr-toggle-answer">show answer</button>';
      }
      html += '<label class="pr-gotit"><input type="checkbox" class="pr-gotit-cb"' + (gotIt ? ' checked' : '') + '> got it</label>';
      html += '</div>';
      html += '<div class="pr-output"></div>';
      if (answerCode.trim()) {
        html += '<div class="pr-answer">';
        html += '<div class="pr-answer-code">' + escapeHtml(answerCode) + '</div>';
        if (ex.answerCommentary && ex.answerCommentary.trim()) {
          html += '<div class="pr-answer-commentary">' + escapeHtml(ex.answerCommentary.trim()) + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    });

    const footerText = trimTrailingBlanks(parsed.footer).join('\n');
    if (footerText.trim()) {
      html += '<div class="pr-file-footer">' + escapeHtml(footerText) + '</div>';
    }

    page.innerHTML = html;

    // wire up exercise interactions
    page.querySelectorAll('.pr-exercise').forEach(exEl => {
      const exId = exEl.getAttribute('data-ex-id');
      const ex = parsed.exercises.find(e => filename + '::' + e.num === exId);
      const ta = exEl.querySelector('.pr-runner');
      const out = exEl.querySelector('.pr-output');
      const ans = exEl.querySelector('.pr-answer');
      const runBtn = exEl.querySelector('.pr-run');
      const ansBtn = exEl.querySelector('.pr-toggle-answer');
      const gotItCb = exEl.querySelector('.pr-gotit-cb');

      runBtn.addEventListener('click', () => runExercise(ex, ta, out, runBtn));
      if (ansBtn) {
        ansBtn.addEventListener('click', () => {
          ans.classList.toggle('pr-shown');
          ansBtn.textContent = ans.classList.contains('pr-shown') ? 'hide answer' : 'show answer';
        });
      }
      gotItCb.addEventListener('change', () => {
        const map = loadGotIt();
        if (gotItCb.checked) map[exId] = true;
        else delete map[exId];
        saveGotIt(map);
        updateSidebarProgress();
      });
    });

    updateSidebarProgress();
  }

  // ---- COMMON-MISTAKE PATTERNS ----
  // matched against the user's code (NOT the preamble) when something
  // goes wrong. each pattern: a regex that signals a specific mistake
  // shape, plus a tip the player can read in the cousin's voice.
  // these fire as a friendly hint underneath the raw pyodide output —
  // they don't replace it.
  const COMMON_MISTAKES = [
    {
      // misplaced quotes/parens in string concatenation:
      //   print("Maedhros )+("and ")+("Fingon" )+("are ")
      // the player wraps each chunk in parens but ends up putting the
      // closing quote in the wrong place; the first string runs all
      // the way to the next quote, then "and " sits as bare identifier.
      pattern: /print\s*\(\s*"[^"]*\)\s*\+\s*\(/,
      tip: "it looks like you're putting parentheses around each piece of the concatenation, like <code>print(\"Maedhros )+(\"and \")+(\"Fingon\" )</code>. python reads <code>\"</code> as the start of a string and runs until the next <code>\"</code> — so <code>)+(\"</code> ends up <em>inside</em> that first string instead of joining anything. you don't need the inner parens. just glue the strings together with <code>+</code>: <code>print(\"Maedhros\" + \" and \" + \"Fingon\")</code> — or store names in variables first and concat the variables."
    }
  ];

  function findCommonMistakeTips(userCode) {
    const tips = [];
    for (const m of COMMON_MISTAKES) {
      if (m.pattern.test(userCode)) tips.push(m.tip);
    }
    return tips;
  }

  function appendMistakeTips(out, userCode) {
    const tips = findCommonMistakeTips(userCode);
    if (!tips.length) return;
    const wrap = document.createElement('div');
    wrap.style.marginTop = '8px';
    wrap.style.padding = '8px 10px';
    wrap.style.background = '#fffbe6';
    wrap.style.border = '1px solid #d4c890';
    wrap.style.fontFamily = "'Tahoma', sans-serif";
    wrap.style.fontSize = '11px';
    wrap.style.color = '#3a2820';
    wrap.style.whiteSpace = 'normal';
    wrap.innerHTML = '<strong>hint:</strong> ' + tips.join('<br><br><strong>hint:</strong> ');
    out.appendChild(wrap);
  }

  async function runExercise(ex, ta, out, btn) {
    if (typeof window.runPython !== 'function') {
      out.classList.add('pr-shown');
      out.classList.add('pr-error');
      out.textContent = '(python runner unavailable on this page — open from a chapter)';
      return;
    }
    const userCode = ta.value;
    const preamble = trimTrailingBlanks(ex.preambleLines).join('\n');
    const fullCode = preamble ? preamble + '\n' + userCode : userCode;

    out.classList.add('pr-shown');
    out.classList.remove('pr-error');
    out.textContent = '(running...)';
    btn.disabled = true;
    try {
      const result = await window.runPython(fullCode);
      if (result.ok) {
        out.textContent = result.output || '(no output — did you forget print()?)';
        appendMistakeTips(out, userCode);
      } else {
        out.classList.add('pr-error');
        out.textContent = (result.output || '') + (result.error ? '\n' + result.error : '');
        appendMistakeTips(out, userCode);
      }
    } catch (e) {
      out.classList.add('pr-error');
      out.textContent = String(e);
      appendMistakeTips(out, userCode);
    } finally {
      btn.disabled = false;
    }
  }

  function updateSidebarProgress() {
    const map = loadGotIt();
    const counts = {};
    Object.keys(map).forEach(k => {
      const fn = k.split('::')[0];
      counts[fn] = (counts[fn] || 0) + 1;
    });
    document.querySelectorAll('.pr-file-row').forEach(row => {
      const fn = row.getAttribute('data-filename');
      if (counts[fn]) row.classList.add('pr-has-progress');
      else row.classList.remove('pr-has-progress');
    });
  }

  // ===========================================================================
  // MODAL — sidebar of files + main content area
  // ===========================================================================
  function injectModal() {
    if (modalInjected) return;
    const overlay = document.createElement('div');
    overlay.id = 'pr-overlay';
    overlay.className = 'pr-overlay';
    overlay.innerHTML =
      '<div class="pr-shell" role="dialog" aria-label="python_practice">' +
        '<div class="pr-titlebar">' +
          '<span><span class="pr-titlebar-icon"></span><span id="pr-title">python_practice</span></span>' +
          '<div class="pr-titlebar-buttons">' +
            '<span class="pr-titlebar-btn" title="Minimize">0</span>' +
            '<span class="pr-titlebar-btn" title="Maximize">1</span>' +
            '<span class="pr-titlebar-btn pr-close" id="pr-close" title="Close">r</span>' +
          '</div>' +
        '</div>' +
        '<div class="pr-menubar">' +
          '<span class="pr-menubar-item"><u>F</u>ile</span>' +
          '<span class="pr-menubar-item"><u>E</u>dit</span>' +
          '<span class="pr-menubar-item"><u>F</u>ormat</span>' +
          '<span class="pr-menubar-item"><u>V</u>iew</span>' +
          '<span class="pr-menubar-item"><u>H</u>elp</span>' +
        '</div>' +
        '<div class="pr-body">' +
          '<div class="pr-sidebar" id="pr-sidebar"></div>' +
          '<div class="pr-page" id="pr-page" tabindex="0" aria-label="practice file"></div>' +
        '</div>' +
        '<div class="pr-statusbar">' +
          '<span id="pr-status-file">no file open</span>' +
          '<span style="margin-left:auto;">Ln 1, Col 1</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('pr-close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('pr-open')) close();
    });

    modalInjected = true;
  }

  function renderFileList() {
    const sb = document.getElementById('pr-sidebar');
    if (!sb) return;
    const list = unlockedFiles();
    let html = '<div class="pr-sidebar-header">python_practice</div>';
    list.forEach(f => {
      const active = (f.filename === currentFile) ? ' pr-active' : '';
      html += '<div class="pr-file-row' + active + '" data-filename="' + escapeHtml(f.filename) + '">' +
        '<span class="pr-file-icon">📄</span>' +
        '<span class="pr-file-name">' + escapeHtml(f.filename) + '</span>' +
        '<span class="pr-gotit-dot" title="has progress"></span>' +
      '</div>';
      html += '<div class="pr-file-meta">' + escapeHtml(f.date) + ' — ' + escapeHtml(f.title) + '</div>';
    });
    if (!list.length) {
      html += '<div class="pr-empty">no files unlocked yet.<br>finish a chapter to unlock practice files.</div>';
    }
    sb.innerHTML = html;
    sb.querySelectorAll('.pr-file-row').forEach(row => {
      row.addEventListener('click', () => {
        const fn = row.getAttribute('data-filename');
        loadFile(fn);
      });
    });
    updateSidebarProgress();
  }

  async function loadFile(filename) {
    currentFile = filename;
    const titleEl = document.getElementById('pr-title');
    const statusEl = document.getElementById('pr-status-file');
    const page = document.getElementById('pr-page');
    if (titleEl) titleEl.textContent = filename + ' — python_practice';
    if (statusEl) statusEl.textContent = filename;

    document.querySelectorAll('.pr-file-row').forEach(r => {
      r.classList.toggle('pr-active', r.getAttribute('data-filename') === filename);
    });

    if (fileCache[filename]) {
      renderFile(filename, fileCache[filename]);
      return;
    }
    if (page) page.innerHTML = '<div class="pr-empty">loading ' + escapeHtml(filename) + '...</div>';
    try {
      const resp = await fetch('python_practice/' + filename, { cache: 'no-cache' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const text = await resp.text();
      fileCache[filename] = text;
      renderFile(filename, text);
    } catch (e) {
      if (page) {
        page.innerHTML = '<div class="pr-empty">' +
          'couldn\'t load ' + escapeHtml(filename) + ': ' + escapeHtml(String(e)) +
          '<br><br>(if you opened this from a local file:// URL, browsers block fetch — try serving via a local server.)' +
          '</div>';
      }
    }
  }


  // ===========================================================================
  // PUBLIC API
  // ===========================================================================
  function open() {
    try {
      injectCSS();
      injectModal();
      renderFileList();
      const list = unlockedFiles();
      if (list.length && !currentFile) loadFile(list[0].filename);
      const overlay = document.getElementById('pr-overlay');
      if (overlay) overlay.classList.add('pr-open');
      else throw new Error('pr-overlay element not found after injectModal');
    } catch (e) {
      console.error('[PythonPractice] open failed:', e);
      alert('python_practice failed to open: ' + (e && e.message ? e.message : e) +
            '\n\n(check the browser console for details. screenshot it and send to claude.)');
    }
  }
  function close() {
    const o = document.getElementById('pr-overlay');
    if (o) o.classList.remove('pr-open');
  }
  function refreshIcon() {
    const el = document.getElementById('icon-practice');
    if (!el) return;
    el.style.display = isUnlocked() ? '' : 'none';
    // belt-and-suspenders: also bind click here in case the inline onclick
    // got stripped or evaluated when window.PythonPractice was not yet set.
    if (!el.dataset.prBound) {
      el.dataset.prBound = '1';
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      });
    }
  }

  window.PythonPractice = { open, close, refreshIcon, isUnlocked, progress };
  console.log('[PythonPractice] loaded. files:', FILES.length, 'unlocked:', unlockedFiles().length, 'progress:', progress());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshIcon);
  } else {
    refreshIcon();
  }
})();
