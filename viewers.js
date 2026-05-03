// =============================================================================
// viewers.js
//
// opens content for the previously-decorative desktop icons:
//   - My Computer            -> windows-style drive list
//   - pinecrest_summer/      -> file-explorer-style folder browser (the
//                               unzipped archive with AIM_archives, SMS_dumps,
//                               diary, etc. inside)
//   - python.exe             -> fake Python 2.4 REPL splash with prompt
//   - AIM_archives/          -> AIM-styled chat-log viewer with file index
//   - SMS_dumps/             -> phone-screen view of the night-of texts
//   - diary/                 -> notebook-paper diary entry browser
//
// gating: each icon's onclick is wired in the chapter HTML; the JS never
// chooses what to show based on game state. these are diegetic set-dressing
// the player can now actually open.
// =============================================================================

(function() {
  'use strict';

  let cssInjected = false;
  let modalInjected = false;
  // --- VIEW STACK ---
  // back/forward navigation — when a folder opens a file, we push the file
  // onto this stack so the back button restores the folder.
  const viewStack = [];

  // --- CHAPTER DETECTION ---
  // viewers.js is shared across all chapter HTML files. content like the
  // AIM archive index needs to gate by chapter so logs that haven't been
  // diegetically recovered yet don't show up in the file list. filename
  // is the source of truth — no globals to set per chapter.
  function currentChapter() {
    const path = (typeof window !== 'undefined' && window.location && window.location.pathname || '').toLowerCase();
    if (path.indexOf('chaptereight') !== -1) return 8;
    if (path.indexOf('chapterseven') !== -1) return 7;
    if (path.indexOf('chaptersix')   !== -1) return 6;
    if (path.indexOf('chapterfive')  !== -1) return 5;
    if (path.indexOf('chapterfour')  !== -1) return 4;
    if (path.indexOf('chapterthree') !== -1) return 3;
    if (path.indexOf('chaptertwo')   !== -1) return 2;
    if (path.indexOf('chapterone')   !== -1) return 1;
    return 99; // index page or unknown context — show everything
  }

  // ===========================================================================
  // CSS — shared modal + Windows 2000 chrome. each viewer body switches
  // its own .vw-chrome-* class to opt into a period-correct skin.
  // ===========================================================================
  const CSS = `
.vw-overlay {
  position: fixed; inset: 0; z-index: 520;
  background: rgba(20, 8, 36, 0.78);
  display: none;
  align-items: stretch; justify-content: center;
  padding: 16px;
  overflow: auto;
  font-family: Tahoma, Verdana, sans-serif;
}
.vw-overlay.vw-open { display: flex; }
.vw-shell {
  width: 100%; max-width: 880px;
  background: #ece9d8;
  border: 1px solid #404040;
  box-shadow: 2px 2px 0 #1a0628, 4px 4px 12px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  color: #000;
  align-self: flex-start;
  margin: auto;
}
.vw-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #0058e6 0%, #1c75e0 8%, #0049b8 100%);
  color: #fff;
  padding: 3px 4px 3px 6px;
  font-family: Tahoma, sans-serif;
  font-size: 11px; font-weight: bold;
  border-bottom: 1px solid #1a0628;
}
.vw-titlebar-icon {
  display: inline-block; width: 14px; height: 14px;
  margin-right: 4px; vertical-align: middle;
  background: #fff; border: 1px solid #444;
}
.vw-titlebar-buttons { display: flex; gap: 2px; }
.vw-titlebar-btn {
  width: 16px; height: 14px;
  background: #d4d0c8;
  border: 1px solid #fff;
  border-right-color: #404040;
  border-bottom-color: #404040;
  color: #000;
  font-family: Tahoma, sans-serif;
  font-size: 10px; line-height: 10px;
  text-align: center;
  cursor: pointer;
}
.vw-titlebar-btn:hover { background: #e8e4d8; }
.vw-titlebar-btn.vw-close:hover { background: #e81123; color: #fff; }
.vw-menubar {
  display: flex; gap: 0;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  padding: 2px 4px;
  font-size: 11px;
}
.vw-menubar-item { padding: 2px 8px; user-select: none; cursor: default; }
.vw-menubar-item:hover { background: #316ac5; color: #fff; }
.vw-toolbar {
  display: flex; align-items: center; gap: 6px;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  padding: 4px 6px;
  font-size: 11px;
}
.vw-tb-btn {
  background: linear-gradient(180deg, #f6f6f6, #d6d3c4);
  border: 1px solid #707070;
  border-top-color: #fff;
  border-left-color: #fff;
  padding: 3px 10px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  cursor: pointer;
  color: #000;
}
.vw-tb-btn:hover { background: linear-gradient(180deg, #fffbe6, #e8e4d8); }
.vw-tb-btn:active { border-color: #404040; border-top-color: #707070; border-left-color: #707070; }
.vw-tb-btn:disabled { color: #888; cursor: default; }
.vw-tb-spacer { flex: 1; }
.vw-tb-path {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  background: #fff;
  border: 1px solid #7f9db9;
  padding: 2px 6px;
  flex: 1;
  color: #000;
  white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.vw-window {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  min-height: 320px;
}
.vw-statusbar {
  background: #ece9d8;
  border-top: 1px solid #aca899;
  padding: 2px 8px;
  font-size: 10px;
  color: #404040;
  display: flex; gap: 12px;
}

/* ====== chrome: Windows Explorer (folders, My Computer) ====== */
.vw-chrome-explorer { padding: 8px 12px; }
.vw-explorer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
}
.vw-explorer-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  padding: 8px 4px;
  cursor: pointer;
  text-align: center;
  border-radius: 1px;
  user-select: none;
}
.vw-explorer-item:hover { background: #d8eaff; }
.vw-explorer-item .vw-ei-icon {
  font-size: 36px; line-height: 40px;
}
.vw-explorer-item .vw-ei-label {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
  word-break: break-word;
  max-width: 96px;
}
.vw-explorer-list-row {
  display: grid;
  grid-template-columns: 28px 1fr 100px 80px 100px;
  align-items: center;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  border-bottom: 1px dotted #d4d0c8;
}
.vw-explorer-list-row:hover { background: #d8eaff; }
.vw-explorer-list-header {
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  font-weight: bold;
  cursor: default;
}
.vw-explorer-list-header:hover { background: #ece9d8; }
.vw-mycomputer-section {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #555;
  padding: 6px 4px 4px;
  border-bottom: 1px solid #d4d0c8;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ====== chrome: AIM (chat log) ====== */
.vw-chrome-aim { background: #f6f5e1; padding: 0; }
.vw-aim-header {
  background: linear-gradient(180deg, #f7d558 0%, #e0a020 100%);
  border-bottom: 2px solid #b07000;
  padding: 6px 8px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #3a2200;
  display: flex; align-items: center; gap: 8px;
}
.vw-aim-header strong { font-size: 12px; }
.vw-aim-buddyicon {
  width: 32px; height: 32px;
  background: #fff;
  border: 1px solid #b07000;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.vw-aim-body {
  padding: 8px 12px;
  font-family: Tahoma, Geneva, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #000;
  background: #fffef0;
}
.vw-aim-msg { margin: 2px 0; word-wrap: break-word; }
.vw-aim-from-self .vw-aim-name { color: #cc0000; font-weight: bold; }
.vw-aim-from-other .vw-aim-name { color: #0000cc; font-weight: bold; }
.vw-aim-system {
  color: #666;
  font-style: italic;
  font-size: 11px;
  text-align: center;
  padding: 4px 0;
}
.vw-aim-timestamp { color: #888; font-size: 10px; }

/* ====== chrome: SMS (phone) ====== */
.vw-chrome-sms { background: #1a0628; padding: 24px 8px 8px; display: flex; justify-content: center; }
.vw-phone {
  width: 280px;
  background: #c0c4b0;
  border: 4px solid #2a2a2a;
  border-radius: 22px;
  padding: 16px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  position: relative;
}
.vw-phone-screen {
  background: #b8c290;
  border: 2px inset #555;
  padding: 8px 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  line-height: 1.4;
  color: #1a2a08;
  max-height: 480px;
  overflow-y: auto;
}
.vw-phone-header {
  text-align: center;
  font-family: Tahoma, sans-serif;
  font-size: 9px;
  color: #1a2a08;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #1a2a08;
  padding-bottom: 4px;
  margin-bottom: 6px;
}
.vw-sms-msg {
  margin: 6px 0;
  padding: 4px 6px;
  border: 1px solid #6b7848;
  background: rgba(255, 255, 255, 0.18);
}
.vw-sms-from { font-size: 10px; color: #4a5530; margin-bottom: 2px; }
.vw-sms-from-self { color: #1a4408; font-weight: bold; }
.vw-sms-content { font-size: 12px; color: #1a2a08; }
.vw-phone-footer {
  text-align: center;
  font-family: Tahoma, sans-serif;
  font-size: 8px;
  color: #1a2a08;
  margin-top: 6px;
  letter-spacing: 1px;
}
.vw-phone-grille {
  width: 60px; height: 4px;
  background: #2a2a2a;
  border-radius: 2px;
  margin: 0 auto 8px;
}

/* ====== chrome: diary (notebook paper) ====== */
.vw-chrome-diary {
  background: #fff8f0;
  background-image: repeating-linear-gradient(180deg, transparent 0, transparent 23px, #ffd6e8 23px, #ffd6e8 24px);
  padding: 28px 24px 28px 56px;
  font-family: 'Nanum Pen Script', 'Special Elite', cursive;
  font-size: 19px;
  line-height: 24px;
  color: #2d0a3d;
  position: relative;
}
.vw-chrome-diary::before {
  content: '';
  position: absolute;
  left: 36px; top: 0; bottom: 0;
  border-left: 1px solid #ff99cc;
}
.vw-diary-entry { margin-bottom: 32px; }
.vw-diary-meta {
  font-family: 'Silkscreen', monospace;
  font-size: 9px;
  color: #999;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.vw-diary-body { white-space: pre-wrap; }

/* ====== chrome: Outlook Express (2004 staff email archive) ====== */
.vw-chrome-outlook { background: #ece9d8; padding: 0; font-family: Tahoma, sans-serif; }
.vw-oe-folder-bar {
  background: linear-gradient(180deg, #316ac5 0%, #1a4ab0 100%);
  color: #fff;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: bold;
  border-bottom: 1px solid #1a4ab0;
}
.vw-oe-list { background: #fff; max-height: 56vh; overflow-y: auto; }
.vw-oe-row {
  display: grid;
  grid-template-columns: 180px 1fr 110px;
  gap: 0;
  padding: 4px 8px;
  font-size: 11px;
  color: #1a1a1a;
  border-bottom: 1px solid #e6e3d4;
  cursor: pointer;
}
.vw-oe-row:hover:not(.vw-oe-header) { background: #d3deef; }
.vw-oe-row.vw-oe-header {
  background: #ece9d8;
  font-weight: bold;
  cursor: default;
  border-bottom: 1px solid #888;
  padding: 4px 8px;
}
.vw-oe-cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vw-oe-cell-from { color: #1a1a1a; }
.vw-oe-cell-subject { color: #1a1a1a; }
.vw-oe-cell-date { color: #555; font-family: 'Courier New', monospace; font-size: 10px; text-align: right; padding-right: 4px; }
.vw-oe-statusbar {
  background: #ece9d8;
  border-top: 1px solid #888;
  padding: 6px 10px;
  font-size: 10px;
  color: #555;
  font-style: italic;
}
.vw-oe-msg-headers {
  background: #ece9d8;
  padding: 8px 12px;
  border-bottom: 1px solid #888;
  font-size: 12px;
  color: #1a1a1a;
}
.vw-oe-hdr { margin-bottom: 2px; }
.vw-oe-hdr-label { color: #555; font-weight: bold; display: inline-block; min-width: 64px; }
.vw-oe-msg-body {
  background: #fff;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.5;
  color: #1a1a1a;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 200px;
}

/* ====== chrome: python REPL ====== */
.vw-chrome-repl {
  background: #000;
  color: #d8d8d8;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.45;
  padding: 12px 14px;
  white-space: pre-wrap;
  min-height: 360px;
}
.vw-repl-prompt { color: #d8d8d8; }
.vw-repl-input {
  background: transparent;
  border: none;
  color: #d8d8d8;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  outline: none;
  width: calc(100% - 40px);
}
.vw-repl-line { white-space: pre-wrap; }
.vw-repl-out { color: #f1c8d8; }
.vw-repl-err { color: #ff8080; }

/* ====== mobile ====== */
@media (max-width: 700px) {
  .vw-window { max-height: calc(100vh - 160px); }
  .vw-shell { max-width: 100%; }
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
  // MODAL
  // ===========================================================================
  function injectModal() {
    if (modalInjected) return;
    const overlay = document.createElement('div');
    overlay.id = 'vw-overlay';
    overlay.className = 'vw-overlay';
    overlay.innerHTML =
      '<div class="vw-shell" role="dialog" aria-modal="true">' +
        '<div class="vw-titlebar">' +
          '<span><span class="vw-titlebar-icon"></span><span id="vw-title">window</span></span>' +
          '<div class="vw-titlebar-buttons">' +
            '<span class="vw-titlebar-btn" title="Minimize">_</span>' +
            '<span class="vw-titlebar-btn" title="Maximize">□</span>' +
            '<span class="vw-titlebar-btn vw-close" id="vw-close" title="Close">×</span>' +
          '</div>' +
        '</div>' +
        '<div class="vw-menubar">' +
          '<span class="vw-menubar-item"><u>F</u>ile</span>' +
          '<span class="vw-menubar-item"><u>E</u>dit</span>' +
          '<span class="vw-menubar-item"><u>V</u>iew</span>' +
          '<span class="vw-menubar-item"><u>H</u>elp</span>' +
        '</div>' +
        '<div class="vw-toolbar">' +
          '<button class="vw-tb-btn" id="vw-back" title="Back">◂ Back</button>' +
          '<span class="vw-tb-spacer"></span>' +
          '<span class="vw-tb-path" id="vw-path">C:\\</span>' +
        '</div>' +
        '<div class="vw-window vw-chrome-default" id="vw-window"></div>' +
        '<div class="vw-statusbar">' +
          '<span id="vw-status">ready</span>' +
          '<span style="margin-left:auto;">tegan_a87</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('vw-close').addEventListener('click', close);
    document.getElementById('vw-back').addEventListener('click', back);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('vw-open')) close();
    });
    modalInjected = true;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function setPath(p) {
    const el = document.getElementById('vw-path');
    if (el) el.textContent = p;
  }
  function setStatus(s) {
    const el = document.getElementById('vw-status');
    if (el) el.textContent = s;
  }

  // ===========================================================================
  // VIEWERS — each one returns { title, html, chromeClass, afterMount? }
  // ===========================================================================
  function renderView(type, arg) {
    switch (type) {
      case 'mycomputer':       return viewMyComputer();
      case 'pinecrest':        return viewPinecrest();
      case 'python':           return viewPythonRepl();
      case 'aim':              return viewAimIndex();
      case 'aim-log':          return viewAimLog(arg);
      case 'sms':              return viewSmsDumpsIndex();
      case 'sms-log':          return viewSmsLog(arg);
      case 'diary':            return viewDiaryIndex();
      case 'diary-entry':      return viewDiaryEntry(arg);
      case 'email':            return viewEmailIndex();
      case 'email-msg':        return viewEmailMessage(arg);
      default:
        return { title: 'unknown', chromeClass: 'vw-chrome-explorer',
                 html: '<div style="padding:40px; text-align:center; font-size:11px; color:#888;">unknown view: ' + escapeHtml(type) + '</div>' };
    }
  }

  function explorerItem(icon, label, onclickAttr) {
    return '<div class="vw-explorer-item" onclick="' + onclickAttr + '">' +
             '<div class="vw-ei-icon">' + icon + '</div>' +
             '<div class="vw-ei-label">' + escapeHtml(label) + '</div>' +
           '</div>';
  }

  // ---- My Computer ----
  function viewMyComputer() {
    setPath('My Computer');
    setStatus('5 object(s)');
    const drives =
      '<div class="vw-mycomputer-section">Hard disk drives</div>' +
      '<div class="vw-explorer-grid">' +
        explorerItem('🗄️', 'Local Disk (C:)', "alert('C:\\\\ — primary drive. mostly windows files. tegan kept her stuff in My Documents.')") +
      '</div>' +
      '<div class="vw-mycomputer-section">Devices with removable storage</div>' +
      '<div class="vw-explorer-grid">' +
        explorerItem('💾', '3½ Floppy (A:)', "alert('A:\\\\ — empty. you tried.')") +
        explorerItem('💿', 'CD Drive (D:)', "alert('D:\\\\ — disc inserted: \\'mix CD july04\\' (handwritten). mostly tegan & sara, mcr, and one bright eyes track repeated three times.')") +
      '</div>' +
      '<div class="vw-mycomputer-section">Other</div>' +
      '<div class="vw-explorer-grid">' +
        explorerItem('🌐', 'Network Neighborhood', "alert('Network Neighborhood — no other computers found. she was offline most of the summer.')") +
        explorerItem('🗑️', 'Recycle Bin (empty)', "alert('Recycle Bin — empty. she emptied it the morning of aug 14, 2004. according to the timestamp.')") +
      '</div>';
    return { title: 'My Computer', chromeClass: 'vw-chrome-explorer', html: drives };
  }

  // ---- AIM_archives/ ----
  // each entry's `messages` is an array of [timestamp, who, text].
  // who: 'tegan_a87' (or whatever string is in selfHandle) | another handle | 'system'
  // chapter: minimum chapter at which this log appears in the index. lets the
  // viewer only surface logs that have been diegetically recovered by then.
  const AIM_LOGS = {
    'camille_summer04.txt': {
      chapter: 2, // first opened in ch2's aim_log_1 beat
      buddy: 'camille.j.89',
      title: 'AIM with camille.j.89',
      blurb: 'fellow JC at hemlock cabin. tegan\'s only confidant at camp.',
      messages: [
        ['system', null, '** session opened :: jul 12 2004 :: 22:14 **'],
        ['22:14', 'camille.j.89', 'okayyyy so what was the password'],
        ['22:14', 'tegan_a87', 'birchwoodcounsellor1985'],
        ['22:15', 'camille.j.89', 'lol that\'s SO her'],
        ['22:15', 'tegan_a87', 'right? she set this up for me'],
        ['22:16', 'camille.j.89', 'who is the wren person you keep mentioning'],
        ['22:16', 'tegan_a87', 'a counsellor. nineteen.'],
        ['22:17', 'camille.j.89', 'TEG'],
        ['22:17', 'tegan_a87', 'i didn\'t say anything'],
        ['22:17', 'camille.j.89', 'you didn\'t HAVE to'],
        ['system', null, '** session closed :: 22:41 **'],
        ['system', null, '** session opened :: jul 9 2004 :: 23:23 **'],
        ['23:23', 'camille.j.89', 'hey are you ok'],
        ['23:23', 'camille.j.89', 'like genuinely'],
        ['23:24', 'camille.j.89', 'i saw you guys yesterday at the boathouse'],
        ['23:24', 'camille.j.89', 'i wasn\'t snooping i was getting my sweatshirt :/'],
        ['23:24', 'camille.j.89', 'but i saw'],
        ['23:25', 'tegan_a87', 'don\'t tell anyone'],
        ['23:25', 'camille.j.89', 'tegan oh my god no'],
        ['23:25', 'camille.j.89', 'i would never'],
        ['23:25', 'camille.j.89', 'i would NEVER'],
        ['23:26', 'camille.j.89', 'please don\'t be scared of me'],
        ['23:26', 'camille.j.89', 'i sat with it for a sec last night not gonna lie'],
        ['23:26', 'camille.j.89', 'only bc i didn\'t want to say the wrong thing about it'],
        ['23:27', 'camille.j.89', 'but i don\'t have a problem with'],
        ['23:27', 'camille.j.89', 'any of it'],
        ['23:27', 'camille.j.89', 'i hope you know that'],
        ['23:27', 'camille.j.89', 'i\'m just worried :('],
        ['23:28', 'camille.j.89', 'is this something you can even tell anybody at home'],
        ['23:28', 'camille.j.89', 'like that has to be SO heavy to be carrying alone'],
        ['23:29', 'camille.j.89', 'and isn\'t she your senior counsellor'],
        ['23:29', 'camille.j.89', 'that\'s the part that\'s getting me'],
        ['23:30', 'camille.j.89', 'are you ok'],
        ['23:31', 'tegan_a87', 'i\'m fine'],
        ['23:31', 'tegan_a87', 'please please please don\'t say anything'],
        ['23:31', 'tegan_a87', 'she\'ll know it was you'],
        ['23:32', 'camille.j.89', 'she\'ll know what was me'],
        ['23:32', 'camille.j.89', 'tegan'],
        ['23:32', 'camille.j.89', 'tegan are you SAFE :((('],
        ['system', null, '** user tegan_a87 has gone idle **'],
        ['system', null, '** session opened :: aug 1 2004 :: 01:47 **'],
        ['01:47', 'camille.j.89', 'about the bonfire'],
        ['01:47', 'camille.j.89', 'i saw what you did'],
        ['01:48', 'camille.j.89', 'i know it looked like a joke for tyler'],
        ['01:48', 'camille.j.89', 'but tegan'],
        ['01:48', 'camille.j.89', 'it wasn\'t a joke right'],
        ['01:49', 'camille.j.89', 'i\'m not going to say anything'],
        ['01:49', 'camille.j.89', 'i would never'],
        ['01:49', 'camille.j.89', 'i just want you to know that someone saw you'],
        ['01:50', 'camille.j.89', 'and it\'s okay'],
        ['01:51', 'tegan_a87', 'stop messaging me'],
        ['01:51', 'tegan_a87', 'please'],
        ['01:51', 'tegan_a87', 'i can\'t'],
        ['system', null, '** user tegan_a87 has gone idle **']
      ]
    },
    'wren_h_briar_v.txt': {
      chapter: 3, // recovered from her cache during ch3's fragment_board beat
      buddy: 'wren_h → briar_v',
      title: 'AIM :: wren_h → briar_v (recovered fragments)',
      blurb: 'NOT one of tegan\'s logs. recovered from her cache aug 17. only wren\'s outgoing side survived — briar\'s replies aren\'t here.',
      selfHandle: 'wren_h',
      messages: [
        ['system', null, '** recovered fragments :: wren_h outgoing only :: aug 14 2004 **'],
        ['21:30', 'wren_h', 'covering for me tonight right? i\'m in the cabin. you saw me in the cabin.'],
        ['22:42', 'wren_h', 'if anyone asks: i was in my cabin all night. you were in yours. study session if they push.'],
        ['00:08', 'wren_h', 'thanks. you\'re a real one.'],
        ['07:22', 'wren_h', 'i was in the cabin all night. you saw me. right?'],
        ['system', null, '** end of recovered fragments **']
      ]
    },
    'glorfindel_lives.txt': {
      chapter: 6, // ch6's player_browses_august archive beat surfaces this log
      buddy: 'glorfindel_lives',
      title: 'AIM with glorfindel_lives',
      blurb: 'LJ / silmarillion friend in halifax. 14 months of late-night chats — fic, music, movies, school, the slow plan to leave. only outside witness on aug 14.',
      messages: [
        ["system", null, "** session opened :: jun 15 2003 :: 21:33 **"],
        ["21:33", "glorfindel_lives", "are you the tegan from the silmarillion thread"],
        ["21:34", "tegan_a87", "yeah why"],
        ["21:34", "glorfindel_lives", "the one who said feanor was right about the silmarils"],
        ["21:35", "tegan_a87", "i did NOT say he was RIGHT i said he was MORALLY CONSISTENT"],
        ["21:35", "glorfindel_lives", "ok glorfindel-balrog-slayer signing on"],
        ["21:36", "tegan_a87", "lol your screenname is literally a deep cut"],
        ["21:36", "tegan_a87", "most people pick legolas"],
        ["21:37", "glorfindel_lives", "most people are wrong about a lot of things"],
        ["system", null, "** session opened :: jun 22 2003 :: 22:14 **"],
        ["22:14", "glorfindel_lives", "ok so i finished the silmarillion AGAIN. fifth time"],
        ["22:14", "tegan_a87", "oh god which part are you crying about this time"],
        ["22:15", "glorfindel_lives", "beren and luthien obviously"],
        ["22:15", "tegan_a87", "predictable. correct. but predictable"],
        ["22:16", "glorfindel_lives", "what would you cry about"],
        ["22:16", "tegan_a87", "maeglin actually. nobody cries about maeglin enough"],
        ["22:17", "glorfindel_lives", "maeglin is a TRAITOR"],
        ["22:17", "tegan_a87", "ok and? was he supposed to be FINE? his mother died his uncle hated him he was in love with his cousin he never had a chance"],
        ["22:18", "glorfindel_lives", "i feel like this is a tegan-coded read"],
        ["22:18", "tegan_a87", "shut up"],
        ["system", null, "** session opened :: jun 29 2003 :: 00:18 **"],
        ["00:18", "tegan_a87", "ok unrelated. do you actually like school"],
        ["00:18", "glorfindel_lives", "i tolerated it. dropped out of dal sophomore year. taking a break"],
        ["00:19", "tegan_a87", "wait you're not in school?"],
        ["00:19", "glorfindel_lives", "nope. working at the bookstore. saving money. figuring it out"],
        ["00:20", "tegan_a87", "my mom would literally die. like full clutching pearls death"],
        ["00:20", "glorfindel_lives", "my mom did die a little. she's getting over it"],
        ["system", null, "** session opened :: jul 8 2003 :: 23:14 **"],
        ["23:14", "tegan_a87", "i'm at camp now btw. didn't tell you"],
        ["23:14", "glorfindel_lives", "oh!! where"],
        ["23:15", "tegan_a87", "place called pinecrest. alberta. the woods"],
        ["23:15", "tegan_a87", "i'm a junior counsellor. it's my first year"],
        ["23:16", "glorfindel_lives", "that sounds like the start of a horror movie"],
        ["23:16", "tegan_a87", "it's literally just a lake and some buildings"],
        ["system", null, "** session opened :: jul 22 2003 :: 23:14 **"],
        ["23:14", "tegan_a87", "capture the flag tonight was rigged"],
        ["23:14", "tegan_a87", "tyler's group had like three more people than ours"],
        ["23:15", "tegan_a87", "also their flag was hidden somewhere we couldn't even reach without going through pinewood and pinewood is BOY CABIN"],
        ["23:15", "tegan_a87", "so basically we lost on a technicality"],
        ["23:16", "glorfindel_lives", "that's so unfair"],
        ["23:16", "tegan_a87", "anyway briar made me apologize to tyler for \"being a sore loser\" which i was NOT i was being a fair loser"],
        ["system", null, "** session opened :: aug 2 2003 :: 23:48 **"],
        ["23:48", "tegan_a87", "there's this counsellor wren halloway. she's 18. she has GREEN EYES"],
        ["23:48", "glorfindel_lives", "oh god"],
        ["23:49", "tegan_a87", "i KNOW. it's fine. i'm being normal about it"],
        ["23:49", "glorfindel_lives", "are you though"],
        ["23:50", "tegan_a87", "no"],
        ["system", null, "** session opened :: aug 19 2003 :: 22:08 **"],
        ["22:08", "tegan_a87", "home from camp. it's so quiet here"],
        ["22:09", "glorfindel_lives", "you survived"],
        ["22:09", "tegan_a87", "barely. i forgot how much i hate my room"],
        ["22:10", "tegan_a87", "also i made a livejournal"],
        ["22:10", "glorfindel_lives", "NO YOU DIDN'T"],
        ["22:11", "tegan_a87", "i did. i'm tegan_a87. add me"],
        ["22:11", "glorfindel_lives", "oh i ALREADY have one. i'm glorfindel_h. been on there since 2002"],
        ["22:12", "tegan_a87", "of COURSE you have. probably a sandman icon"],
        ["22:12", "glorfindel_lives", "how DARE you read me like that"],
        ["system", null, "** session opened :: sep 4 2003 :: 19:41 **"],
        ["19:41", "tegan_a87", "school started. french immersion is killing me"],
        ["19:42", "glorfindel_lives", "french immersion in alberta is wild btw. like why"],
        ["19:42", "tegan_a87", "my mom thought it would \"open doors\""],
        ["19:43", "tegan_a87", "the doors it opens are french doors. into more french"],
        ["system", null, "** session opened :: sep 19 2003 :: 22:01 **"],
        ["22:01", "glorfindel_lives", "have you watched alias yet i keep telling you"],
        ["22:02", "tegan_a87", "i don't have time for new shows i have ROTK in 12 weeks"],
        ["22:02", "glorfindel_lives", "you can do both"],
        ["22:03", "tegan_a87", "i CANNOT do both. i'm rewatching fellowship for the seventh time"],
        ["22:03", "glorfindel_lives", "i love you so much"],
        ["system", null, "** session opened :: sep 25 2003 :: 21:12 **"],
        ["21:12", "tegan_a87", "the strokes is it album of the decade y/n"],
        ["21:12", "glorfindel_lives", "it's MID. is this just"],
        ["21:13", "tegan_a87", "it's not even my favorite of theirs. room on fire is BETTER"],
        ["21:13", "glorfindel_lives", "i'm not arguing strokes with you it's like 11pm here"],
        ["system", null, "** session opened :: oct 11 2003 :: 20:22 **"],
        ["20:22", "glorfindel_lives", "have you done two towers extended yet"],
        ["20:23", "tegan_a87", "THREE TIMES. helms deep is even longer this time"],
        ["20:23", "glorfindel_lives", "peak cinema"],
        ["system", null, "** session opened :: oct 25 2003 :: 23:19 **"],
        ["23:19", "glorfindel_lives", "halloween costume help. i have like nothing"],
        ["23:19", "tegan_a87", "go as eowyn. you have the brown hair already. find a sword"],
        ["23:20", "glorfindel_lives", "i don't OWN a sword"],
        ["23:20", "tegan_a87", "buy one. it's an investment"],
        ["system", null, "** session opened :: oct 30 2003 :: 23:51 **"],
        ["23:51", "tegan_a87", "my dad called. wants me for thanksgiving in edmonton. obviously"],
        ["23:51", "glorfindel_lives", "do you want to go?"],
        ["23:52", "tegan_a87", "not really. but his apartment has cable and ours doesn't so"],
        ["23:52", "glorfindel_lives", "cable thanksgiving"],
        ["23:53", "tegan_a87", "he'll order food and ask me about school for like 20 min and then we'll watch tv. it's fine"],
        ["system", null, "** session opened :: nov 2 2003 :: 22:18 **"],
        ["22:18", "tegan_a87", "i had a bad week"],
        ["22:18", "tegan_a87", "like. bad bad"],
        ["22:19", "glorfindel_lives", "do you want to talk about it"],
        ["22:19", "tegan_a87", "not really. just wanted you to know"],
        ["22:20", "glorfindel_lives", "ok i'm here. always"],
        ["system", null, "** session opened :: nov 15 2003 :: 21:33 **"],
        ["21:33", "glorfindel_lives", "ok i finally got rotk premiere tickets"],
        ["21:33", "glorfindel_lives", "dec 17. midnight showing in halifax"],
        ["21:34", "tegan_a87", "i'm going to dec 17. midnight in EDMONTON. an hour from here"],
        ["21:34", "tegan_a87", "my mom is driving me"],
        ["21:34", "glorfindel_lives", "WAIT we'll be watching it at the SAME TIME"],
        ["21:35", "tegan_a87", "oh my god you're right"],
        ["21:35", "tegan_a87", "90 minutes earlier in alberta though"],
        ["21:36", "glorfindel_lives", "WHATEVER. simultaneous in spirit"],
        ["system", null, "** session opened :: nov 22 2003 :: 22:48 **"],
        ["22:48", "tegan_a87", "i made a quiz on quizilla. what type of LOTR death are you"],
        ["22:48", "glorfindel_lives", "post the link"],
        ["22:49", "tegan_a87", "i got boromir'd which feels embarrassingly accurate"],
        ["22:49", "glorfindel_lives", "i got faramir of course because i AM faramir"],
        ["system", null, "** session opened :: dec 19 2003 :: 01:14 **"],
        ["01:14", "tegan_a87", "my mom asked if i had any \"real friends\" again"],
        ["01:14", "tegan_a87", "i didn't say you. she'd be worse about you than about no friends"],
        ["01:15", "glorfindel_lives", "i'm her worst nightmare. older. across the country. on the internet"],
        ["01:15", "tegan_a87", "ya basically"],
        ["01:16", "glorfindel_lives", "ok BUT i mean what about real-real friends. don't you have like"],
        ["01:16", "tegan_a87", "madeline and rachel. yeah. i can hang out with them. it's fine"],
        ["01:17", "tegan_a87", "but it's like. they're nice. but i can't talk about anything that matters"],
        ["01:17", "glorfindel_lives", "yeah"],
        ["system", null, "** session opened :: dec 25 2003 :: 23:42 **"],
        ["23:42", "tegan_a87", "merry christmas i hate it here"],
        ["23:42", "glorfindel_lives", "merry christmas i'm working tomorrow. boxing day at the bookstore is hell"],
        ["23:43", "tegan_a87", "where do you work again i forgot"],
        ["23:43", "glorfindel_lives", "[REDACTED]. independent shop. owner lets me read on shift"],
        ["23:44", "tegan_a87", "god that sounds nice"],
        ["23:44", "glorfindel_lives", "it is. i make like nothing but i get to be alone for hours"],
        ["system", null, "** session opened :: jan 8 2004 :: 23:51 **"],
        ["23:51", "tegan_a87", "rotk extended is finally announced. december"],
        ["23:52", "glorfindel_lives", "i'm going to cry already"],
        ["system", null, "** session opened :: jan 22 2004 :: 22:14 **"],
        ["22:14", "glorfindel_lives", "ok i started the wheel of time"],
        ["22:14", "tegan_a87", "NO"],
        ["22:15", "glorfindel_lives", "i had to. people kept saying it was the next thing"],
        ["22:15", "tegan_a87", "hannah it's THIRTEEN BOOKS"],
        ["22:16", "glorfindel_lives", "i KNOW. i'm 200 pages into book one and i already want to fight rand"],
        ["22:16", "tegan_a87", "rand is the WORST one"],
        ["22:17", "glorfindel_lives", "that's so encouraging thank you"],
        ["system", null, "** session opened :: jan 30 2004 :: 23:51 **"],
        ["23:51", "tegan_a87", "do you ever just lie awake hating your bedroom"],
        ["23:51", "glorfindel_lives", "all the time"],
        ["23:52", "tegan_a87", "good. that's the only correct answer"],
        ["system", null, "** session opened :: feb 4 2004 :: 23:18 **"],
        ["23:18", "tegan_a87", "my mom is making me audition for a community theatre thing in edmonton"],
        ["23:18", "tegan_a87", "she thinks i need a \"social outlet\""],
        ["23:19", "glorfindel_lives", "what's the play"],
        ["23:19", "tegan_a87", "oklahoma"],
        ["23:19", "glorfindel_lives", "NO"],
        ["23:20", "tegan_a87", "YES"],
        ["23:20", "glorfindel_lives", "tegan you cannot be in oklahoma"],
        ["23:21", "tegan_a87", "i'm going to bomb the audition on purpose"],
        ["system", null, "** session opened :: feb 14 2004 :: 22:05 **"],
        ["22:05", "tegan_a87", "valentine's day in french immersion is uniquely horrible"],
        ["22:06", "tegan_a87", "they made us write valentine's notes. en français"],
        ["22:06", "tegan_a87", "i wrote one to my mom. lying"],
        ["system", null, "** session opened :: feb 22 2004 :: 23:44 **"],
        ["23:44", "tegan_a87", "have you ever thought about just. leaving"],
        ["23:45", "glorfindel_lives", "like leaving where"],
        ["23:45", "tegan_a87", "anywhere. just. not being where you are"],
        ["23:46", "glorfindel_lives", "i think about it sometimes yeah"],
        ["23:46", "tegan_a87", "i think about it constantly"],
        ["system", null, "** session opened :: feb 25 2004 :: 22:33 **"],
        ["22:33", "tegan_a87", "i bought outkast. speakerboxxx. on cd. with my own money"],
        ["22:33", "glorfindel_lives", "the love below is BETTER actually"],
        ["22:34", "tegan_a87", "i like both. don't make me choose"],
        ["system", null, "** session opened :: mar 6 2004 :: 22:30 **"],
        ["22:30", "glorfindel_lives", "did you see lost in translation finally"],
        ["22:30", "tegan_a87", "YES. obsessed. that hotel"],
        ["22:31", "glorfindel_lives", "bill murray's face"],
        ["22:31", "tegan_a87", "the karaoke scene like literally PERFECT"],
        ["22:32", "tegan_a87", "also i want to be lonely in a foreign hotel so badly"],
        ["22:32", "glorfindel_lives", "tegan"],
        ["22:33", "tegan_a87", "WHAT it's a vibe"],
        ["system", null, "** session opened :: mar 15 2004 :: 00:32 **"],
        ["00:32", "tegan_a87", "i can't be here when i graduate. i can't go to the local college. i can't stay"],
        ["00:33", "glorfindel_lives", "where would you go"],
        ["00:33", "tegan_a87", "anywhere. east. somewhere big"],
        ["00:34", "glorfindel_lives", "you have like a year and a half of high school left"],
        ["00:34", "tegan_a87", "i know"],
        ["00:35", "tegan_a87", "i don't think i can do a year and a half"],
        ["system", null, "** session opened :: mar 24 2004 :: 23:04 **"],
        ["23:04", "glorfindel_lives", "did you watch the OC tonight"],
        ["23:04", "tegan_a87", "we don't get fox where i live??"],
        ["23:05", "glorfindel_lives", "i forgot you live in like an oil town. RIP"],
        ["23:05", "tegan_a87", "i download it on kazaa the next day. my mom would kill me if she knew"],
        ["system", null, "** session opened :: apr 2 2004 :: 22:11 **"],
        ["22:11", "tegan_a87", "i've been thinking"],
        ["22:11", "tegan_a87", "i don't have to wait for graduation"],
        ["22:12", "glorfindel_lives", "tegan"],
        ["22:12", "tegan_a87", "i know i know. but hear me out"],
        ["22:13", "tegan_a87", "i'd be 18 in january. that's only five months after camp ends"],
        ["22:13", "tegan_a87", "if i could just disappear for five months"],
        ["system", null, "** session opened :: apr 18 2004 :: 23:02 **"],
        ["23:02", "glorfindel_lives", "i saw eternal sunshine yesterday"],
        ["23:02", "glorfindel_lives", "tegan"],
        ["23:03", "glorfindel_lives", "it broke me"],
        ["23:03", "tegan_a87", "i'm going next weekend my mom is driving me to edmonton bc it's not playing here"],
        ["23:04", "glorfindel_lives", "text me when you've seen it"],
        ["23:04", "tegan_a87", "will do. is it sad-sad or melancholy-sad"],
        ["23:05", "glorfindel_lives", "it's BOTH. it's a new category"],
        ["system", null, "** session opened :: apr 25 2004 :: 23:48 **"],
        ["23:48", "tegan_a87", "just saw mean girls. you have to see it"],
        ["23:48", "glorfindel_lives", "is it actually good or are you in your tina fey era"],
        ["23:49", "tegan_a87", "BOTH"],
        ["system", null, "** session opened :: may 1 2004 :: 22:48 **"],
        ["22:48", "tegan_a87", "ok i saw it. drove home in silence. mom thought i was mad at her"],
        ["22:48", "glorfindel_lives", "were you"],
        ["22:49", "tegan_a87", "no but i couldn't explain why i wasn't talking"],
        ["22:49", "tegan_a87", "clementine's hair"],
        ["22:50", "glorfindel_lives", "SARAH POLLEY'S whole performance"],
        ["22:50", "tegan_a87", "i want to dye my hair blue"],
        ["22:51", "glorfindel_lives", "do not dye your hair blue at camp"],
        ["22:51", "tegan_a87", "ugh ok fine. after camp"],
        ["system", null, "** session opened :: may 8 2004 :: 00:14 **"],
        ["00:14", "tegan_a87", "my mom keeps asking when i'm going to \"have friends here\""],
        ["00:14", "tegan_a87", "as if the friends i have don't count because they're online"],
        ["system", null, "** session opened :: may 22 2004 :: 00:14 **"],
        ["00:14", "glorfindel_lives", "ok i'm done with the OC for the season. cohen brothers carried that show"],
        ["00:15", "tegan_a87", "i'm waiting for the finale to download. don't spoil"],
        ["system", null, "** session opened :: jun 4 2004 :: 21:33 **"],
        ["21:33", "tegan_a87", "i talked to my doctor today about how i've been feeling"],
        ["21:34", "tegan_a87", "she put me on something. low dose"],
        ["21:34", "glorfindel_lives", "tegan that's good"],
        ["21:34", "tegan_a87", "i don't know yet. supposed to take a few weeks"],
        ["21:35", "glorfindel_lives", "i'm proud of you for asking"],
        ["21:35", "tegan_a87", "it's not a big deal"],
        ["21:36", "glorfindel_lives", "it is though"],
        ["system", null, "** session opened :: jun 12 2004 :: 00:08 **"],
        ["00:08", "tegan_a87", "ok i'm doing it"],
        ["00:08", "glorfindel_lives", "you are doing what"],
        ["00:09", "tegan_a87", "i'm leaving. after camp. i'm just going"],
        ["00:09", "glorfindel_lives", "oh my god"],
        ["00:10", "tegan_a87", "i need your help. i need someone who knows"],
        ["00:10", "glorfindel_lives", "i'm in. obviously i'm in"],
        ["system", null, "** session opened :: jun 15 2004 :: 23:14 **"],
        ["23:14", "tegan_a87", "school's done for the year btw. i forgot to tell you"],
        ["23:14", "glorfindel_lives", "oh!! how did finals go"],
        ["23:15", "tegan_a87", "84 french. 91 english. 88 history. 76 chem"],
        ["23:15", "glorfindel_lives", "tegan that's amazing"],
        ["23:16", "tegan_a87", "it's normal. my mom said \"good. now do better in chem\""],
        ["23:16", "glorfindel_lives", "oh my god she did NOT"],
        ["23:17", "tegan_a87", "she literally did"],
        ["system", null, "** session opened :: jun 18 2004 :: 23:42 **"],
        ["23:42", "glorfindel_lives", "i talked to [REDACTED] today"],
        ["23:42", "glorfindel_lives", "she has a place. cheap. she'll let you stay until you figure out a job"],
        ["23:43", "tegan_a87", "oh my god really"],
        ["23:43", "glorfindel_lives", "yeah. she's been through it. she gets it"],
        ["system", null, "** session opened :: jun 22 2004 :: 22:18 **"],
        ["22:18", "glorfindel_lives", "ok unrelated but my coworker quit so i'm closing every saturday now"],
        ["22:18", "tegan_a87", "rip your weekends"],
        ["22:19", "glorfindel_lives", "i'm getting more shifts which means more money for [REDACTED]"],
        ["22:19", "tegan_a87", "hannah"],
        ["22:20", "glorfindel_lives", "don't"],
        ["22:20", "tegan_a87", "you can't pay for me"],
        ["22:21", "glorfindel_lives", "i can do whatever i want with my paychecks. shut up"],
        ["system", null, "** session opened :: jun 25 2004 :: 22:14 **"],
        ["22:14", "tegan_a87", "camp starts in two weeks. i'm packing tonight"],
        ["22:14", "tegan_a87", "i'm packing TWO bags. one i bring back. one i leave with"],
        ["22:15", "glorfindel_lives", "where are you going to keep the leaving bag"],
        ["22:15", "tegan_a87", "under the dock. there's a storage box that's been broken since 2002. nobody checks it"],
        ["system", null, "** session opened :: jun 28 2004 :: 00:11 **"],
        ["00:11", "tegan_a87", "i went through everything in my room today"],
        ["00:11", "tegan_a87", "trying to figure out what i'd actually miss if i never came back for it"],
        ["00:12", "glorfindel_lives", "what's on the list"],
        ["00:12", "tegan_a87", "my journal. my fellowship dvd. the bracelet my dad gave me when i was 9. one specific sweater"],
        ["00:13", "glorfindel_lives", "bring all of it"],
        ["00:13", "tegan_a87", "the leaving bag is small. i can fit some"],
        ["system", null, "** session opened :: jul 4 2004 :: 22:48 **"],
        ["22:48", "tegan_a87", "i'm at camp. i made it through orientation"],
        ["22:49", "tegan_a87", "wren is here. she's a cabin counsellor this year not a JC"],
        ["22:49", "glorfindel_lives", "oh. wren wren? from last summer?"],
        ["22:50", "tegan_a87", "yeah. wren. wren halloway"],
        ["22:50", "tegan_a87", "she looked at me at lunch and i forgot how to use my hands"],
        ["system", null, "** session opened :: jul 8 2004 :: 22:33 **"],
        ["22:33", "tegan_a87", "the new JCs are mostly fine"],
        ["22:33", "tegan_a87", "there's this girl hattie who's like 17 and SO earnest. she made everyone matching cabin signs"],
        ["22:34", "glorfindel_lives", "that's adorable"],
        ["22:34", "tegan_a87", "it IS. i feel bad that i find her exhausting"],
        ["22:35", "glorfindel_lives", "you find everyone exhausting"],
        ["22:35", "tegan_a87", "that's not TRUE i don't find you exhausting"],
        ["22:36", "glorfindel_lives", "counter: you can mute me"],
        ["system", null, "** session opened :: jul 11 2004 :: 23:03 **"],
        ["23:03", "glorfindel_lives", "[REDACTED] said she can pick you up at the boathouse. she has a [REDACTED] her cousin lent her"],
        ["23:04", "tegan_a87", "oh my god"],
        ["23:04", "glorfindel_lives", "she's good. i know her from the [REDACTED] message board. she's been planning trips like this for years"],
        ["23:05", "tegan_a87", "i'll never be able to thank her"],
        ["23:05", "glorfindel_lives", "she doesn't want to be thanked. she wants you to be safe"],
        ["system", null, "** session opened :: jul 15 2004 :: 23:48 **"],
        ["23:48", "tegan_a87", "it rained all day today. the campers were CHAOS"],
        ["23:48", "tegan_a87", "we did indoor activities. i taught them how to french braid hair"],
        ["23:49", "glorfindel_lives", "oh god you can french braid?"],
        ["23:49", "tegan_a87", "my mom is OBSESSED with hair. mandatory skill"],
        ["23:50", "glorfindel_lives", "i can like. ponytail. that's my range"],
        ["23:50", "tegan_a87", "you have like 5 inches of hair what do you need to know"],
        ["23:51", "glorfindel_lives", "FAIR"],
        ["system", null, "** session opened :: jul 19 2004 :: 21:48 **"],
        ["21:48", "tegan_a87", "ok so today's drama"],
        ["21:49", "tegan_a87", "briar made everyone do a TRUST FALL"],
        ["21:49", "tegan_a87", "at staff orientation. for trust building. between counsellors"],
        ["21:50", "glorfindel_lives", "lmaoooo"],
        ["21:50", "tegan_a87", "i fell into wren's arms which was great"],
        ["21:51", "tegan_a87", "also fell into a bunch of other people's arms which was less great"],
        ["21:51", "tegan_a87", "anyway tyler is back as a JC. apparently this is his second summer"],
        ["21:52", "glorfindel_lives", "oh that name's familiar"],
        ["21:52", "tegan_a87", "he was at camp last year. did capture the flag. won unfairly. you wouldn't remember"],
        ["21:53", "tegan_a87", "he asked me if i remembered him. i said vaguely"],
        ["21:54", "tegan_a87", "which is a lie i remember EVERYONE from last summer i'm a freak"],
        ["system", null, "** session opened :: jul 25 2004 :: 22:48 **"],
        ["22:48", "tegan_a87", "how does the safe house thing work"],
        ["22:49", "glorfindel_lives", "you go in, you say [REDACTED] sent you, you get the room. she charges nothing. she'll feed you. you stay as long as you need"],
        ["22:49", "tegan_a87", "and after"],
        ["22:50", "glorfindel_lives", "after we figure out what after means. one step at a time"],
        ["system", null, "** session opened :: jul 28 2004 :: 00:18 **"],
        ["00:18", "tegan_a87", "camille gave me a friendship bracelet today"],
        ["00:18", "tegan_a87", "like just walked up at lunch and tied it on my wrist and walked away"],
        ["00:19", "glorfindel_lives", "oh that's cute"],
        ["00:19", "tegan_a87", "i'm going to cry. i'm leaving in like 2 weeks"],
        ["00:20", "glorfindel_lives", "tegan"],
        ["00:20", "tegan_a87", "i KNOW. i KNOW. don't say it"],
        ["system", null, "** session opened :: jul 31 2004 :: 23:33 **"],
        ["23:33", "glorfindel_lives", "it's so weird that we've been doing this for over a year now"],
        ["23:33", "tegan_a87", "i know"],
        ["23:34", "tegan_a87", "you've been through more of my actual life than anyone else"],
        ["system", null, "** session opened :: aug 1 2004 :: 23:11 **"],
        ["23:11", "tegan_a87", "wren kissed me"],
        ["23:11", "tegan_a87", "wren KISSED me"],
        ["23:11", "glorfindel_lives", "WHAT"],
        ["23:12", "tegan_a87", "at the boathouse. after lights out. she said she's been thinking about me since last summer"],
        ["23:13", "tegan_a87", "i know. i KNOW. she's 19. she's a counsellor. i'm a JC. it's bad"],
        ["23:14", "tegan_a87", "i don't care"],
        ["system", null, "** session opened :: aug 2 2004 :: 23:55 **"],
        ["23:55", "tegan_a87", "i can't sleep"],
        ["23:55", "glorfindel_lives", "are you ok"],
        ["23:56", "tegan_a87", "i'm great actually. that's the problem. i can't sleep because i'm thinking about her"],
        ["23:56", "glorfindel_lives", "oh"],
        ["23:57", "tegan_a87", "i've never been HAPPY-insomniac before"],
        ["23:57", "glorfindel_lives", "i love this for you"],
        ["system", null, "** session opened :: aug 4 2004 :: 00:42 **"],
        ["00:42", "glorfindel_lives", "are you still leaving after camp"],
        ["00:42", "tegan_a87", "yes"],
        ["00:42", "tegan_a87", "yes. i have to. nothing about wren changes that"],
        ["00:43", "tegan_a87", "probably it makes it worse actually. i can't be a girl who has a secret with a 19 year old at camp pinecrest forever"],
        ["system", null, "** session opened :: aug 5 2004 :: 23:22 **"],
        ["23:22", "tegan_a87", "my mom emailed marcia today asking how i'm \"adjusting\""],
        ["23:22", "tegan_a87", "my MOTHER is checking up on me with the camp director"],
        ["23:23", "glorfindel_lives", "how do you know"],
        ["23:23", "tegan_a87", "marcia mentioned it casually like \"your mom says hi\" with this LOOK"],
        ["23:24", "tegan_a87", "she KNOWS. she has to know. she has to suspect SOMETHING"],
        ["23:24", "glorfindel_lives", "tegan it's probably nothing"],
        ["23:25", "tegan_a87", "it is NEVER nothing with my mom"],
        ["system", null, "** session opened :: aug 6 2004 :: 23:18 **"],
        ["23:18", "tegan_a87", "bonfire tonight"],
        ["23:18", "tegan_a87", "i kissed wren in front of everyone"],
        ["23:19", "glorfindel_lives", "WHAT"],
        ["23:19", "tegan_a87", "ok hear me out. there's this boy who keeps doing the thing where he sits next to me. so i had this idea"],
        ["23:20", "tegan_a87", "i told wren to play along. then at the bonfire i grabbed her face and kissed her like full on. for like five seconds"],
        ["23:20", "tegan_a87", "everyone laughed. the boy laughed. like haha look at the girls being silly"],
        ["23:21", "glorfindel_lives", "tegan"],
        ["23:21", "tegan_a87", "i KNOW. i got to actually kiss her. in front of everyone. and have it not count"],
        ["23:22", "tegan_a87", "it was the best thing"],
        ["23:22", "glorfindel_lives", "was she into it"],
        ["23:23", "tegan_a87", "i mean she kissed me back"],
        ["23:23", "tegan_a87", "she didn't really talk to me after though. i'll see her tomorrow"],
        ["system", null, "** session opened :: aug 7 2004 :: 23:48 **"],
        ["23:48", "tegan_a87", "she barely looked at me today"],
        ["23:48", "glorfindel_lives", "yeah"],
        ["23:49", "tegan_a87", "i'm going to find her tonight after lights out"],
        ["23:49", "glorfindel_lives", "be careful"],
        ["23:50", "tegan_a87", "i'm always careful"],
        ["23:50", "glorfindel_lives", "lol you are NEVER careful"],
        ["system", null, "** session opened :: aug 8 2004 :: 00:33 **"],
        ["00:33", "tegan_a87", "ok we talked. she was hurt. she said she felt like a prop"],
        ["00:33", "tegan_a87", "i told her she wasn't. that i wanted to kiss her so badly i invented an excuse"],
        ["00:34", "glorfindel_lives", "did she believe you"],
        ["00:34", "tegan_a87", "i think so. eventually. she stayed"],
        ["23:15", "tegan_a87", "i have $640 saved"],
        ["23:15", "tegan_a87", "it's not a lot but it's a lot for me"],
        ["23:16", "glorfindel_lives", "it's enough for the first month. [REDACTED] won't take rent"],
        ["23:16", "tegan_a87", "i'm going to insist"],
        ["23:17", "glorfindel_lives", "she'll insist back. you'll lose"],
        ["system", null, "** session opened :: aug 9 2004 :: 22:18 **"],
        ["22:18", "tegan_a87", "i had to swap dish duty with tyler tonight because hattie's cabin had a thing"],
        ["22:19", "tegan_a87", "he was being weirdly nice about it"],
        ["22:19", "tegan_a87", "like talking to me the whole time"],
        ["22:20", "tegan_a87", "like sir i just want to wash these plates and leave"],
        ["22:20", "glorfindel_lives", "lmao"],
        ["22:21", "tegan_a87", "anyway briar wants me to do the morning swim shift tomorrow which is at SIX AM"],
        ["22:21", "tegan_a87", "i'd rather die"],
        ["system", null, "** session opened :: aug 10 2004 :: 23:42 **"],
        ["23:42", "tegan_a87", "wren said she loves me"],
        ["23:42", "tegan_a87", "i didn't say it back"],
        ["23:43", "glorfindel_lives", "oh"],
        ["23:43", "tegan_a87", "i couldn't. i'm leaving in four days. it would have been the worst thing i could say to her"],
        ["23:44", "glorfindel_lives", "did you say anything"],
        ["23:44", "tegan_a87", "i kissed her. that's all i could do"],
        ["system", null, "** session opened :: aug 11 2004 :: 23:18 **"],
        ["23:18", "tegan_a87", "she keeps trying to make plans for after camp"],
        ["23:19", "tegan_a87", "she's like \"we'll figure out how to see each other in the school year. i can drive up sometimes\""],
        ["23:19", "glorfindel_lives", "tegan"],
        ["23:20", "tegan_a87", "i KNOW. i'm letting her plan it. i can't tell her i won't be there"],
        ["23:20", "tegan_a87", "she'll know in like four days. she'll find out the same way everyone else does"],
        ["23:21", "glorfindel_lives", "she's going to be devastated"],
        ["23:21", "tegan_a87", "i know"],
        ["23:22", "tegan_a87", "i think about it constantly. it's the only part i don't know how to feel about"],
        ["system", null, "** session opened :: aug 12 2004 :: 23:54 **"],
        ["23:54", "tegan_a87", "two days to go"],
        ["23:54", "tegan_a87", "[REDACTED] confirmed for the 14th. 11 PM at the boathouse"],
        ["23:55", "glorfindel_lives", "i'll be at the rendezvous. i'll be there the whole time"],
        ["23:56", "tegan_a87", "how long do you wait if i don't show up"],
        ["23:56", "glorfindel_lives", "i'm not leaving until you're there"],
        ["23:57", "tegan_a87", "hannah you can't sit in [REDACTED] for 14 hours"],
        ["23:57", "glorfindel_lives", "watch me"],
        ["system", null, "** session opened :: aug 13 2004 :: 22:30 **"],
        ["22:30", "tegan_a87", "i wrote the letter today. encrypted it. hid it"],
        ["22:30", "glorfindel_lives", "who's it for"],
        ["22:31", "tegan_a87", "anyone who cares enough to crack it. mostly i think nobody will"],
        ["22:31", "glorfindel_lives", "someone will"],
        ["22:32", "tegan_a87", "i hope so"],
        ["22:32", "tegan_a87", "i used your screenname as the key. felt right"],
        ["22:33", "glorfindel_lives", "oh"],
        ["22:33", "glorfindel_lives", "tegan"],
        ["22:34", "tegan_a87", "don't get weird about it"],
        ["22:34", "glorfindel_lives", "i'm not getting weird i'm just. you used my screenname"],
        ["22:35", "tegan_a87", "it's a balrog slayer. it's protective"],
        ["system", null, "** session opened :: aug 14 2004 :: 09:47 **"],
        ["09:47", "tegan_a87", "see you on the other side"],
        ["system", null, "** session closed **"]
      ]
    }
  };

  function viewAimIndex() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\AIM_archives\\');
    const ch = currentChapter();
    const visible = Object.keys(AIM_LOGS).filter(fn => (AIM_LOGS[fn].chapter || 0) <= ch);
    setStatus(visible.length + ' file(s)');
    const rows = visible.map(fn => {
      const log = AIM_LOGS[fn];
      return '<div class="vw-explorer-list-row" onclick="Viewers.pushView(\'aim-log\', \'' + fn + '\')">' +
               '<span>💬</span>' +
               '<span style="font-family:\'Courier New\',monospace;">' + escapeHtml(fn) + '</span>' +
               '<span>' + log.messages.length + ' lines</span>' +
               '<span>Text Doc</span>' +
               '<span>' + escapeHtml(log.buddy) + '</span>' +
             '</div>';
    }).join('');
    const emptyNote = visible.length === 0
      ? '<div style="padding:40px;text-align:center;color:#888;font-family:\'Courier New\',monospace;">this folder is empty.</div>'
      : '';
    const html =
      '<div class="vw-explorer-list-row vw-explorer-list-header">' +
        '<span></span><span>Name</span><span>Size</span><span>Type</span><span>Buddy</span>' +
      '</div>' + rows + emptyNote;
    return { title: 'AIM_archives', chromeClass: 'vw-chrome-explorer', html: html };
  }

  function viewAimLog(filename) {
    const log = AIM_LOGS[filename];
    // refuse to open logs that haven't been recovered yet, even if someone
    // crafts a Viewers.pushView('aim-log', '<filename>') call directly.
    if (log && (log.chapter || 0) > currentChapter()) {
      return { title: 'not found', chromeClass: 'vw-chrome-explorer', html: '<div style="padding:40px;">log not found.</div>' };
    }
    if (!log) return { title: 'not found', chromeClass: 'vw-chrome-explorer', html: '<div style="padding:40px;">log not found.</div>' };
    setPath('AIM_archives\\' + filename);
    setStatus(log.blurb);
    let body = '';
    log.messages.forEach(([time, who, text]) => {
      if (who === null || who === 'system') {
        body += '<div class="vw-aim-system">' + escapeHtml(text) + '</div>';
      } else {
        const selfHandle = log.selfHandle || 'tegan_a87';
        const fromSelf = (who === selfHandle);
        const cls = fromSelf ? 'vw-aim-msg vw-aim-from-self' : 'vw-aim-msg vw-aim-from-other';
        body += '<div class="' + cls + '">' +
                  '<span class="vw-aim-timestamp">[' + escapeHtml(time) + '] </span>' +
                  '<span class="vw-aim-name">' + escapeHtml(who) + ':</span> ' +
                  escapeHtml(text) +
                '</div>';
      }
    });
    const html =
      '<div class="vw-aim-header">' +
        '<div class="vw-aim-buddyicon">😊</div>' +
        '<div><strong>' + escapeHtml(log.buddy) + '</strong><br>' +
          '<span style="font-size:10px;">Idle for 4 minutes</span></div>' +
      '</div>' +
      '<div class="vw-aim-body">' + body + '</div>';
    return { title: log.title, chromeClass: 'vw-chrome-aim', html: html };
  }

  // ---- SMS_dumps/ ----
  // the night-of texts from chapter 3. tegan's phone BCC'd outgoing SMS to
  // her hotmail, which is how the cousin recovered them.
  const SMS_LOGS = {
    '2004-08-14.txt': {
      title: 'SMS_dumps/2004-08-14.txt',
      contact: 'glorfindel_lives',
      blurb: 'aug 13 → 14, 2004. only contact: glorfindel_lives. last 10 outgoing texts before the line went cold.',
      messages: [
        ['21:48', 'tegan_a87', 'wren\'s asking weird questions about briar today'],
        ['22:15', 'tegan_a87', 'wren wants me to meet her at the boathouse at 11. i think i\'m gonna do it :/'],
        ['22:30', 'glorfindel_lives', 'tegan don\'t go alone please'],
        ['23:28', 'tegan_a87', 'ok done. just me and the lake now.'],
        ['23:31', 'tegan_a87', 'she\'s not here yet'],
        ['23:40', 'tegan_a87', 'she\'s STILL not here'],
        ['23:44', 'tegan_a87', 'wait. someone\'s coming up the path. it\'s not her.'],
        ['23:46', 'tegan_a87', 'h']
      ]
    }
  };

  function viewSmsDumpsIndex() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\SMS_dumps\\');
    setStatus(Object.keys(SMS_LOGS).length + ' file(s)');
    const rows = Object.keys(SMS_LOGS).map(fn => {
      const log = SMS_LOGS[fn];
      return '<div class="vw-explorer-list-row" onclick="Viewers.pushView(\'sms-log\', \'' + fn + '\')">' +
               '<span>📱</span>' +
               '<span style="font-family:\'Courier New\',monospace;">' + escapeHtml(fn) + '</span>' +
               '<span>' + log.messages.length + ' msgs</span>' +
               '<span>SMS Log</span>' +
               '<span>' + escapeHtml(log.contact) + '</span>' +
             '</div>';
    }).join('');
    const html =
      '<div class="vw-explorer-list-row vw-explorer-list-header">' +
        '<span></span><span>Name</span><span>Size</span><span>Type</span><span>Contact</span>' +
      '</div>' + rows +
      '<div style="margin-top:14px; padding:8px; background:#fffbe6; border:1px solid #d4d0c8; font-family:Tahoma,sans-serif; font-size:11px; color:#666;">' +
        '<em>tegan had her phone BCC every outgoing SMS to her hotmail. that\'s how these survived. the phone itself was never recovered.</em>' +
      '</div>';
    return { title: 'SMS_dumps', chromeClass: 'vw-chrome-explorer', html: html };
  }

  function viewSmsLog(filename) {
    const log = SMS_LOGS[filename];
    if (!log) return { title: 'not found', chromeClass: 'vw-chrome-explorer', html: '<div style="padding:40px;">log not found.</div>' };
    setPath('SMS_dumps\\' + filename);
    setStatus(log.blurb);
    let msgsHtml = '';
    log.messages.forEach(([time, from, text]) => {
      const fromSelf = (from === 'tegan_a87');
      msgsHtml += '<div class="vw-sms-msg">' +
                    '<div class="vw-sms-from ' + (fromSelf ? 'vw-sms-from-self' : '') + '">' +
                      escapeHtml(time) + ' — ' + escapeHtml(from) +
                    '</div>' +
                    '<div class="vw-sms-content">' + escapeHtml(text) + '</div>' +
                  '</div>';
    });
    const html =
      '<div class="vw-phone">' +
        '<div class="vw-phone-grille"></div>' +
        '<div class="vw-phone-screen">' +
          '<div class="vw-phone-header">📶 NOKIA 3310 — INBOX</div>' +
          '<div class="vw-phone-header" style="border:none; margin-bottom:8px; font-size:8px; letter-spacing:2px;">' +
            escapeHtml(filename) +
          '</div>' +
          msgsHtml +
          '<div class="vw-phone-footer">— end of log —</div>' +
        '</div>' +
        '<div style="text-align:center; margin-top:8px; font-family:Tahoma,sans-serif; font-size:9px; color:#fff; letter-spacing:2px;">▼ ▲ ◂ ▸ ●</div>' +
      '</div>';
    return { title: log.title, chromeClass: 'vw-chrome-sms', html: html };
  }

  // ---- diary/ ----
  // these are the same entries the player encounters as `type: 'diary'`
  // beats in chapter 1 — the desktop folder is just an archive of those
  // files. order = chronological. file numbers are tegan's own (not
  // sequential — she renamed them as she went) and match the chapter
  // beats verbatim.
  const DIARY_ENTRIES = DIARY_ENTRIES_INIT();
  function DIARY_ENTRIES_INIT() { return [
    {
      filename: '01_first_day.txt',
      date: 'last modified: june 21, 2004 — 10:42 pm',
      preview: 'day one. cabin assignment.',
      body: `june 21

day one. counsellors all got here yesterday for orientation. campers tomorrow.
mom cried at the bus stop again. i was the one who begged to come back.
my cabin (hemlock) has 8 girls in it, ages 11–13. i'm a junior counsellor so
i have a senior co-counsellor. they pair us up with someone who's done this before.
mine is wren halloway. she's 19. she's been here for four summers. she's
the senior counsellor for hemlock, which means she runs the cabin and i
assist. seniors get their own quarters in the back so it's basically
just me with the campers, with wren in and out all day for checks
and meals and lights-out.
her hair is the colour of wet pinecones and she has a tattoo on her ribs that
i'm not supposed to have seen. i saw it.
this is going to be a long six weeks :/`
    },
    {
      filename: '02_why_im_typing.txt',
      date: 'last modified: june 22, 2004 — 11:14 pm',
      preview: 'why the laptop. mom found the paper journal.',
      body: `june 22

hi future me. hopefully when you read this you're someone interesting
and not just an older version of someone who spent the summer of '04
losing her mind at a kids camp on kettle lake. don't publish this.
seriously don't.

so today during free swim i pulled out the laptop on the dock and
laila looked at me like i had a third eye opening. "who brings a
LAPTOP to camp." i don't know laila, the same number of girls who
bring hair straighteners and you brought TWO. also literally the same
girls. wren has hers stashed in her senior quarters and camille has one
and so does briar i think. nobody at this camp who matters cares.

it's also for python which i am ACTUALLY going to learn this summer.
i made some kind of deal with myself in march and i don't exactly
remember the terms but they were real to me at the time.

other reason. mom found my journal at spring break. the paper one.
she SAID she "wasn't reading" but she knew which page to ask about.
so it's typed now and password-protected and lives on a machine
that locks when i close the lid. fourteen text files in a folder
called diary that anyone clicking around will assume is homework
or song lyrics. nobody at this camp is bored enough to actually
open them.

hopefully this means when i'm AT CAMP nobody AT HOME can snoop and
when i'm AT HOME nobody at camp will somehow have followed me there.
which now that i type it sounds paranoid lol. but. you know.

going to bed. wren did cabin checks early tonight. she came back
through hemlock twice instead of once. i don't know what that means.`
    },
    {
      filename: '03_wren.txt',
      date: 'last modified: june 26, 2004 — 1:14 am',
      preview: 'she caught me looking.',
      body: `june 26

wren caught me looking. tonight, after lights-out, walking back from the lake.
she didn't say anything. she just smiled, slow, like she'd been waiting for it.
"come find me at the boathouse tomorrow," she said. "after dinner. before flag."
i said okay like a complete idiot.
she's 19. i'm 17. it's not a big deal. it's a tiny deal. it's nothing.
i can't sleep.`
    },
    {
      filename: '10_idk.txt',
      date: 'last modified: july 3, 2004 — 2:30 am',
      preview: 'something is happening i don\'t have words for yet.',
      body: `july 3

something is happening that i don't have words for yet. i'm going to
try.

i went to the boathouse with her tonight. she had a flashlight and she
brought a blanket and we sat against the wall by the door and i swear
to god the whole world went quiet. afterwards we walked back through
the trees and i could hear myself breathing for the first time in
maybe my whole life.

she has a tattoo on her ribs of a swallow. she got it when she was 17
in vancouver, illegal!!! she has another one on her hipbone i haven't
asked about yet because the way she covers it when she changes is its
own kind of question.

she laughs at things i didn't know were funny. she plays tegan and sara
on her cd player in the boathouse, low, and the first time the music
came on i made a face and she said "what" and i said "my name is tegan,
han-" and i stopped because i'd almost said something i can't say,
and she looked at me a long time and didn't push.

she asked me about my mom tonight. how strict, what kind of strict,
whether mom checks the phone bills, whether i'd told anyone at school.
i told her everything. i wanted to. she listened the way camille sits
with crying campers. she just LISTENS. that made me want
to tell her more.

she's nineteen. she's out! she's been out since she was fifteen which
is a thing i can't even imagine. she has a sister in vancouver who
sends her zines. she's read the same books i have but she read them
to feel less alone. i read them to feel more alone. i hadn't put that
together before tonight.

i don't know how to write this without sounding like i lost my mind.
i think i lost my mind. i think it's been gone since june 26 and i'm
only now noticing. she chose me. SHE chose ME. she's the kind of girl
who could choose anyone and she walked over to MY cabin and looked at
my hands when i was tying my shoe and asked if i wanted to come find
her tomorrow and i did and now i can't see anything else.

i should be scared. i'm not scared. i'm so far past scared.`
    },
    {
      filename: '09_camille.txt',
      date: 'last modified: july 12, 2004 — 11:38 pm',
      preview: 'camille noticing things. punishing her for being kind.',
      body: `july 12

camille has hemlock. i passed her cabin on the way back from the office
this morning. one of her campers was sitting on the front step crying
about something. camille was sitting on the step next to her, NOT
hugging her. she just stayed there, like she knew the kid wasn't ready for hugs yet.
they sat there for ten minutes. i watched from the path. eventually
the kid leaned into her. camille just kept sitting.

it made me want to cry.

i can't be friends with camille. i can't sit next to her at staff meals.
i can't let her ask me questions. she's the kind of person who would
notice if i wasn't okay and i can't be noticed right now. so i smile
at her at flag and i go sit with hattie's table.

i feel like i'm punishing her for being kind. i can hear how that sounds.
i don't have a better plan.`
    },
    {
      filename: '07_boathouse.txt',
      date: 'last modified: july 15, 2004 — 1:22 am',
      preview: 'she said good girl. she kissed me.',
      body: `july 15

the boathouse smells like algae and sun-warm wood. it sits out over the
water on old pilings, and the floor creaks when she walks. she had a
flashlight, like always. tonight was different though. she said it like
she meant it this time:
"i could get fired for this. you know that, right?"
i said i knew.
she said: "but it's worse for you than it is for me. tegan, look at me.
your mom doesn't know about you. does she."
i didn't answer. i didn't have to.
she said: "so we're going to be careful. for you. ok?"
i said ok.
she said good girl.
she kissed me.
later, walking back, she said: "you can't tell anyone. not your camp
friends. not whoever it is you write to at night. nobody."
i said i wouldn't. i'm not even sure i breathed.

she's exhilarating.`
    },
    {
      filename: '12_she_knows.txt',
      date: 'last modified: july 22, 2004 — 11:55 pm',
      preview: 'told wren camille saw us. she said i love you twice.',
      body: `july 22

i finally told wren what camille saw three weeks ago. i'd been holding onto it
since right after our first night at the boathouse. camille AIMed me the next day
asking if i was okay. i lied. i told wren camille's "issues" were nothing.
i didn't know how to say that someone had seen us without it sounding like
a betrayal of camille.
but tonight wren cornered me about why i'd been weird and it just came out.
i told her camille saw us on july 8. camille had been kind about it.
i'd been carrying it alone for three weeks.
wren went so still she stopped breathing.
then she said okay. then she said i'll handle it. then she said
"if camille tells anyone, it'll be your fault, you know that right?
you should have been more careful. i told you to be careful."
she said i love you twice tonight. she'd never said it before.
both times right after she said something that made me want to cry.
i think this is what people mean when they say someone has you.

i didn't have to tell her about camille tonight. i could have lied for
another month. i'm typing this and i can hear how it sounds. i wanted
to see what she'd do, and now i've seen.`
    },
    {
      filename: '13_what_did_i_do.txt',
      date: 'last modified: august 1, 2004 — 4:08 am',
      preview: 'i kissed her at the bonfire in front of tyler. she wouldn\'t look at me after.',
      body: `august 1
i can't sleep. i'm typing this in the bathroom with the laptop on
my knees because the screen is too bright in the cabin.

session-one closing bonfire was tonight. wren had a beer she
opened before things even started. i had two sips off hers and
brendan passed me one of his and i had like a third of it before
hattie gave me a look and i put it down. i was not drunk. that
matters because i can't blame this on being drunk.

wren said something to me at dinner like "tyler is so obvious
it's almost cute" and i laughed because i didn't know what else
to do. he was sitting two rows behind us at the bonfire and i
could feel him watching the back of her head. and maybe it's
stupid of me and i'm sure it was but i had this IDEA, right,
and i just couldn't not?

so i leaned over to her and i said "play along ok" and she said
"play along with what" and i said "just trust me" and i put my
hand on her face and i kissed her. like really kissed her. for
like five seconds. with tyler and all the other boys watching.

i pulled back and laughed like it was a joke and said "happy
session one" or something stupid like that and the boys LOST
IT. tyler made a sound like he'd been hit. brendan said "OH MY
GOD" and jon was just staring with his whole face open. i did
this thing where i waved my hand like haha that was crazy.
wren was very still next to me. she said "okay" really quiet,
just to me, like a question almost. then louder for the boys
she said "tegan that was MEAN" in this fake-scolding voice and
the boys laughed and tyler said "do it again" and wren said
"absolutely not" and that was it.

and i. i felt POWERFUL. for like ten seconds i felt like the
coolest girl alive. i did the thing. i made all the boys lose
their minds. i kissed a girl in front of people and made it
look fun and easy and like nothing.

then we walked back to cabin and wren wouldn't look at me.

i tried to take her hand on the path and she pulled it back
and said "not here." which okay fine, fair, but she's never
said it like THAT before. and at the cabin door she didn't
say good night to me. she said good night to hattie who was
behind us and then she went into her quarters and shut the door.

i KNOW what i did. i don't need her to tell me. i made what we
have into a joke for the boys. i took the thing she's been
SO careful about and i put it on display all madonna and
britney style and called it nothing so the boys would think i
was cool. she has been protecting me all summer. et cetera et
cetera i KNOW.

i thought it was brave. when i was leaning over to her i thought
i was being brave. i thought "this is the only way i can do
this in public. this is the loophole. nobody will know it's
real because i'll make it look like a joke and we'll BOTH be
safe." but it WASN'T and this SUCKS.

i don't know if i can fix this. i don't know if she'll talk to
me tomorrow. i'm so scared she's going to be different now.
i'm so scared i broke it.

i don't even know who to tell.

i think i'm going to throw up. i think i did something really
bad and i can't take it back.`
    },
    {
      filename: '14_LAST.txt',
      date: 'last modified: aug 14, 2004 — 9:31 pm',
      preview: 'told her i was leaving. she said meet me at the boathouse. her name is wren halloway her name is wren halloway her name is wren halloway.',
      body: `august 14

we never actually talked about the bonfire. she came back the next
morning like nothing happened. i tried to bring it up twice and she
shut it down both times. she's been a little sharper with me since.
i feel awful.

i told her tonight that part of me wanted to go home early.
she went so quiet. then she said "meet me at the boathouse tonight.
we'll talk it out. just you and me. don't tell anyone you're coming."

i'm going. i don't have a choice. i can't say no to her without
making her suspicious, and i need her to not be suspicious tonight
of all nights.

i'm hiding this file in the diary folder before i go.

if you're reading this, i need you to know where i was.
her name is wren halloway
her name is wren halloway
her name is wren halloway`
    }
  ]; }

  function viewDiaryIndex() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\diary\\');
    setStatus(DIARY_ENTRIES.length + ' file(s)');
    const rows = DIARY_ENTRIES.map(e => {
      return '<div class="vw-explorer-list-row" onclick="Viewers.pushView(\'diary-entry\', \'' + e.filename + '\')">' +
               '<span>📔</span>' +
               '<span style="font-family:\'Courier New\',monospace;">' + escapeHtml(e.filename) + '</span>' +
               '<span>' + e.body.length + ' B</span>' +
               '<span>Diary</span>' +
               '<span style="font-style:italic; color:#555;">' + escapeHtml(e.preview) + '</span>' +
             '</div>';
    }).join('');
    const html =
      '<div class="vw-explorer-list-row vw-explorer-list-header">' +
        '<span></span><span>Name</span><span>Size</span><span>Type</span><span>Note</span>' +
      '</div>' + rows;
    return { title: 'diary', chromeClass: 'vw-chrome-explorer', html: html };
  }

  function viewDiaryEntry(filename) {
    const e = DIARY_ENTRIES.find(x => x.filename === filename);
    if (!e) return { title: 'not found', chromeClass: 'vw-chrome-explorer', html: '<div style="padding:40px;">entry not found.</div>' };
    setPath('diary\\' + filename);
    setStatus(e.preview);
    const html =
      '<div class="vw-diary-entry">' +
        '<div class="vw-diary-meta">' + escapeHtml(e.date) + '</div>' +
        '<div class="vw-diary-body">' + escapeHtml(e.body) + '</div>' +
      '</div>';
    return { title: filename, chromeClass: 'vw-chrome-diary', html: html };
  }

  // ---- Outlook Express :: 2004 staff email archive ----
  // Reads window.EMAIL_CORPUS (loaded by email_corpus.js). Gated to ch7+ at the
  // call site (the desktop icon only appears once the player has diegetically
  // recovered the archive). The viewer mirrors classic OE chrome — a list pane
  // (top) summarising sender/subject/date, plus per-message reading via
  // pushView('email-msg', idx).
  function emailCorpusOrEmpty() {
    return (typeof window !== 'undefined' && Array.isArray(window.EMAIL_CORPUS))
      ? window.EMAIL_CORPUS : [];
  }
  function shortDate(rfcDate) {
    // 'Sun, 15 Aug 2004 09:14:22 -0600' → 'Aug 15 09:14'
    const m = (rfcDate || '').match(/\d{2} (\w{3}) (\d{4}) (\d{2}):(\d{2})/);
    if (!m) return rfcDate || '';
    return m[1] + ' ' + m[3] + ':' + m[4];
  }
  function shortFrom(fromHdr) {
    // 'Briar Vance <briar.vance@camppinecrest.ca>' → 'Briar Vance'
    const m = (fromHdr || '').match(/^([^<]+?)\s*</);
    return m ? m[1] : (fromHdr || '');
  }
  function viewEmailIndex() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\inbox\\');
    const corpus = emailCorpusOrEmpty();
    setStatus(corpus.length + ' message(s)');
    if (corpus.length === 0) {
      return { title: 'Inbox', chromeClass: 'vw-chrome-outlook',
        html: '<div style="padding:40px;text-align:center;color:#888;font-family:Tahoma,sans-serif;">inbox is empty. (the 2004 staff archive isn\'t loaded.)</div>' };
    }
    // sort by date ascending — earliest emails first, matches a real inbox view
    const indexed = corpus.map((e, i) => ({ e: e, i: i, ts: Date.parse(e.date) || 0 }));
    indexed.sort((a, b) => a.ts - b.ts);
    const rows = indexed.map(rec => {
      const e = rec.e;
      return '<div class="vw-oe-row" onclick="Viewers.pushView(\'email-msg\', ' + rec.i + ')">' +
               '<span class="vw-oe-cell vw-oe-cell-from">' + escapeHtml(shortFrom(e.from)) + '</span>' +
               '<span class="vw-oe-cell vw-oe-cell-subject">' + escapeHtml(e.subject || '(no subject)') + '</span>' +
               '<span class="vw-oe-cell vw-oe-cell-date">' + escapeHtml(shortDate(e.date)) + '</span>' +
             '</div>';
    }).join('');
    const html =
      '<div class="vw-oe-folder-bar">📥 Inbox &nbsp;·&nbsp; ' + corpus.length + ' messages</div>' +
      '<div class="vw-oe-row vw-oe-header">' +
        '<span class="vw-oe-cell vw-oe-cell-from">From</span>' +
        '<span class="vw-oe-cell vw-oe-cell-subject">Subject</span>' +
        '<span class="vw-oe-cell vw-oe-cell-date">Received</span>' +
      '</div>' +
      '<div class="vw-oe-list">' + rows + '</div>' +
      '<div class="vw-oe-statusbar">' +
        'tegan was on the camp staff mailing list. this archive came from the camp\'s public web directory. ' +
        'every staff message from january to august 2004.' +
      '</div>';
    return { title: 'Inbox - Outlook Express', chromeClass: 'vw-chrome-outlook', html: html };
  }
  function viewEmailMessage(idx) {
    const corpus = emailCorpusOrEmpty();
    const i = parseInt(idx, 10);
    const e = corpus[i];
    if (!e) return { title: 'not found', chromeClass: 'vw-chrome-outlook', html: '<div style="padding:40px;">message not found.</div>' };
    setPath('inbox\\msg-' + i);
    setStatus(e.subject || '(no subject)');
    const bodyHtml = escapeHtml(e.body || '').replace(/\n/g, '<br>');
    const html =
      '<div class="vw-oe-msg-headers">' +
        '<div class="vw-oe-hdr"><span class="vw-oe-hdr-label">From:</span> ' + escapeHtml(e.from || '') + '</div>' +
        '<div class="vw-oe-hdr"><span class="vw-oe-hdr-label">To:</span> ' + escapeHtml(e.to || '') + '</div>' +
        '<div class="vw-oe-hdr"><span class="vw-oe-hdr-label">Date:</span> ' + escapeHtml(e.date || '') + '</div>' +
        '<div class="vw-oe-hdr"><span class="vw-oe-hdr-label">Subject:</span> ' + escapeHtml(e.subject || '') + '</div>' +
      '</div>' +
      '<div class="vw-oe-msg-body">' + bodyHtml + '</div>';
    return { title: e.subject || '(no subject)', chromeClass: 'vw-chrome-outlook', html: html };
  }

  // ---- pinecrest_summer/ (the unzipped archive) ----
  function viewPinecrest() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\');
    const ch = currentChapter();
    // Outlook only appears once the player has diegetically pulled the camp
    // staff email archive from camppinecrest.ca/staff in ch7.
    const showOutlook = ch >= 7 && Array.isArray(window.EMAIL_CORPUS);
    const itemCount = 5 + (showOutlook ? 1 : 0);
    setStatus(itemCount + ' object(s)');
    const html =
      '<div class="vw-explorer-grid">' +
        explorerItem('💬', 'AIM_archives', "Viewers.pushView('aim')") +
        explorerItem('📱', 'SMS_dumps', "Viewers.pushView('sms')") +
        explorerItem('📔', 'diary', "Viewers.pushView('diary')") +
        (showOutlook ? explorerItem('📧', 'inbox (Outlook)', "Viewers.pushView('email')") : '') +
        explorerItem('📂', 'staff_2003.txt', "alert('roster of pinecrest counsellors, summer 2003. extracted in chapter 4.')") +
        explorerItem('📂', 'staff_2004.txt', "alert('roster of pinecrest counsellors, summer 2004. extracted in chapter 4.')") +
      '</div>' +
      '<div style="margin-top:16px; padding:8px; background:#fffbe6; border:1px solid #d4d0c8; font-family:Tahoma,sans-serif; font-size:11px; color:#666;">' +
        '<em>extracted from pinecrest_summer.zip on chapter 2. password: birchwoodcounsellor1985.' +
        (showOutlook ? ' inbox archive added in chapter 7 from the camp\'s public web directory.' : '') +
        '</em>' +
      '</div>';
    return { title: 'pinecrest_summer', chromeClass: 'vw-chrome-explorer', html: html };
  }

  // ---- python.exe ----
  function viewPythonRepl() {
    setPath('C:\\Python24\\python.exe');
    setStatus('interactive interpreter — read-only demo');
    const html =
      'Python 2.4.1 (#65, Mar 30 2005, 09:34:54) [MSC v.1310 32 bit (Intel)] on win32\n' +
      'Type "help", "copyright", "credits" or "license" for more information.\n' +
      '<span class="vw-repl-prompt">>>> </span>print "hello"\n' +
      '<span class="vw-repl-out">hello</span>\n' +
      '<span class="vw-repl-prompt">>>> </span>name = "tegan"\n' +
      '<span class="vw-repl-prompt">>>> </span>print name\n' +
      '<span class="vw-repl-out">tegan</span>\n' +
      '<span class="vw-repl-prompt">>>> </span>2 + 2\n' +
      '<span class="vw-repl-out">4</span>\n' +
      '<span class="vw-repl-prompt">>>> </span>import this\n' +
      '<span class="vw-repl-out">The Zen of Python, by Tim Peters\n\n' +
      'Beautiful is better than ugly.\nExplicit is better than implicit.\nSimple is better than complex.\n' +
      '...</span>\n' +
      '<span class="vw-repl-prompt">>>> </span><span class="vw-repl-err"># note from the cousin: this is a transcript. tegan saved\n' +
      '# her favourite REPL session as a screenshot once. i found\n' +
      '# it in the camp 2004/ folder. the "real" interpreter is\n' +
      '# the one running her chapter scripts.</span>\n' +
      '<span class="vw-repl-prompt">>>> </span><span class="vw-repl-input-cursor">_</span>';
    return { title: 'C:\\Python24\\python.exe', chromeClass: 'vw-chrome-repl', html: html };
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================
  function open(viewType, arg) {
    try {
      injectCSS();
      injectModal();
      viewStack.length = 0;
      pushView(viewType, arg);
      const overlay = document.getElementById('vw-overlay');
      if (overlay) overlay.classList.add('vw-open');
    } catch (e) {
      console.error('[Viewers] open failed:', e);
      alert('viewer failed to open: ' + (e && e.message ? e.message : e));
    }
  }

  function close() {
    const o = document.getElementById('vw-overlay');
    if (o) o.classList.remove('vw-open');
  }

  function pushView(type, arg) {
    viewStack.push({ type, arg });
    renderCurrent();
  }

  function back() {
    if (viewStack.length > 1) {
      viewStack.pop();
      renderCurrent();
    } else {
      close();
    }
  }

  function renderCurrent() {
    const v = viewStack[viewStack.length - 1];
    if (!v) return;
    const win = document.getElementById('vw-window');
    const title = document.getElementById('vw-title');
    if (!win || !title) return;
    const r = renderView(v.type, v.arg);
    title.textContent = r.title || v.type;
    win.className = 'vw-window ' + (r.chromeClass || 'vw-chrome-default');
    win.innerHTML = r.html || '';
    win.scrollTop = 0;
    // post-render hook: viewers can attach handlers after innerHTML is set
    if (typeof r.afterMount === 'function') r.afterMount(win);
  }

  window.Viewers = { open, close, back, pushView };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {});
  }
})();
