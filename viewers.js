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
  // who: 'tegan' | 'self' (for whichever side is tegan in this log) | 'other' | 'system'
  const AIM_LOGS = {
    'camille_summer04.txt': {
      buddy: 'camille.j.89',
      title: 'AIM with camille.j.89',
      blurb: 'cousin from edmonton. summer ’04. background lurker.',
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
        ['system', null, '** session closed :: 22:41 **']
      ]
    },
    'glorfindel_lives.txt': {
      buddy: 'glorfindel_lives',
      title: 'AIM with glorfindel_lives',
      blurb: 'LJ friend. talked tolkien fic mostly. only outside witness on aug 14.',
      messages: [
        ['system', null, '** session opened :: jul 26 2004 :: 23:08 **'],
        ['23:08', 'tegan_a87', 'have you read the silmarillion fic where Maedhros and Fingon both survive'],
        ['23:09', 'glorfindel_lives', 'ofc i wrote half the rec list'],
        ['23:09', 'tegan_a87', 'i have a question for you'],
        ['23:10', 'glorfindel_lives', '?'],
        ['23:10', 'tegan_a87', 'if you knew you were about to do something stupid would you tell anyone first'],
        ['23:11', 'glorfindel_lives', 'depends on the kind of stupid'],
        ['23:11', 'tegan_a87', 'the kind where you\'re going to feel it for the rest of your life'],
        ['23:12', 'glorfindel_lives', 'tegan'],
        ['23:12', 'glorfindel_lives', 'are you ok'],
        ['23:13', 'tegan_a87', 'yeah. just thinking. nvm.'],
        ['system', null, '** session closed :: 23:45 **']
      ]
    },
    'wren_h_briar_v.txt': {
      buddy: 'wren_h ↔ briar_v',
      title: 'AIM :: wren_h ↔ briar_v (recovered fragments)',
      blurb: 'recovered from her cache during chapter 3. NOT one of tegan\'s logs — these are wren and briar covering for each other on aug 14.',
      selfHandle: 'wren_h',
      messages: [
        ['system', null, '** fragments — not in chronological order — recovered aug 17 **'],
        ['21:30', 'wren_h', 'covering for me tonight right? i\'m in the cabin. you saw me in the cabin.'],
        ['21:33', 'briar_v', 'yeah. obviously. i was with you.'],
        ['22:48', 'wren_h', 'if anyone asks, we were both at the cabin all night.'],
        ['23:51', 'wren_h', 'cabin. cabin. say it like you believe it.'],
        ['00:12', 'briar_v', 'wren what did you do'],
        ['system', null, '** more fragments unlocked in chapter 3 **']
      ]
    }
  };

  function viewAimIndex() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\AIM_archives\\');
    setStatus(Object.keys(AIM_LOGS).length + ' file(s)');
    const rows = Object.keys(AIM_LOGS).map(fn => {
      const log = AIM_LOGS[fn];
      return '<div class="vw-explorer-list-row" onclick="Viewers.pushView(\'aim-log\', \'' + fn + '\')">' +
               '<span>💬</span>' +
               '<span style="font-family:\'Courier New\',monospace;">' + escapeHtml(fn) + '</span>' +
               '<span>' + log.messages.length + ' lines</span>' +
               '<span>Text Doc</span>' +
               '<span>' + escapeHtml(log.buddy) + '</span>' +
             '</div>';
    }).join('');
    const html =
      '<div class="vw-explorer-list-row vw-explorer-list-header">' +
        '<span></span><span>Name</span><span>Size</span><span>Type</span><span>Buddy</span>' +
      '</div>' + rows;
    return { title: 'AIM_archives', chromeClass: 'vw-chrome-explorer', html: html };
  }

  function viewAimLog(filename) {
    const log = AIM_LOGS[filename];
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

  // ---- pinecrest_summer/ (the unzipped archive) ----
  function viewPinecrest() {
    setPath('C:\\Documents and Settings\\tegan\\Desktop\\pinecrest_summer\\');
    setStatus('5 object(s)');
    const html =
      '<div class="vw-explorer-grid">' +
        explorerItem('💬', 'AIM_archives', "Viewers.pushView('aim')") +
        explorerItem('📱', 'SMS_dumps', "Viewers.pushView('sms')") +
        explorerItem('📔', 'diary', "Viewers.pushView('diary')") +
        explorerItem('📂', 'staff_2003.txt', "alert('roster of pinecrest counsellors, summer 2003. extracted in chapter 4.')") +
        explorerItem('📂', 'staff_2004.txt', "alert('roster of pinecrest counsellors, summer 2004. extracted in chapter 4.')") +
      '</div>' +
      '<div style="margin-top:16px; padding:8px; background:#fffbe6; border:1px solid #d4d0c8; font-family:Tahoma,sans-serif; font-size:11px; color:#666;">' +
        '<em>extracted from pinecrest_summer.zip on chapter 2. password: birchwoodcounsellor1985.</em>' +
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
