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
        const fromSelf = (who === 'tegan_a87');
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
  const DIARY_ENTRIES = [
    {
      filename: '2004-06-14.txt',
      date: 'june 14, 2004 :: 10:48 PM',
      preview: 'first day at camp. cabin assignment.',
      body: 'first day. cabin assignment came down: hemlock with three other JCs. one of them is wren halloway, nineteen, blonde, taller than me, the kind of laugh that makes a room turn its head.\n\ni am not going to think about her. i am here to work. that is the entire plan.\n\nthe plan is already in trouble.'
    },
    {
      filename: '2004-07-03.txt',
      date: 'july 3, 2004 :: 11:51 PM',
      preview: 'boathouse. swoon.',
      body: 'wren found me at the boathouse after dinner. nobody else around. she said something stupid about the lake. i said something stupid back. we sat on the dock for an hour with our feet in the water and i could not have told you a single thing she actually said because i was working so hard to look casual.\n\nshe leaned over once to fix the strap on my sandal. i think i stopped breathing.\n\nher name is wren halloway her name is wren halloway her name is wren halloway.'
    },
    {
      filename: '2004-07-15.txt',
      date: 'july 15, 2004 :: 1:14 AM',
      preview: 'something happened. nothing happened. both true.',
      body: 'i can\'t sleep. cabin is full of breathing. i\'m typing this with the laptop on my knees in the bathroom because the screen is too bright in the bunk room.\n\nwhat happened: nothing happened. we were on the dock again. she was telling me about her ex-boyfriend (which: SURE jan). i was being normal. she stopped mid-sentence and just LOOKED at me for like ten seconds. i looked back. neither of us said anything. then she got up and walked back to her cabin without finishing the sentence.\n\nwhat does that MEAN. what was that. what was she going to say.\n\ni am going to be unwell about this for months.'
    },
    {
      filename: '2004-08-02.txt',
      date: 'august 2, 2004 :: 3:14 AM',
      preview: 'after the bonfire. bathroom. couldn\'t sleep.',
      body: 'i did something last night and i don\'t know how to undo it.\n\nthe whole cabin is asleep. i\'m in the bathroom again. i keep replaying it. the way her face changed. the way mine probably did.\n\ni wish you could try/except on real life. you can\'t. it doesn\'t work like that.\n\ni love her. i think i\'ve loved her since the dock. i don\'t know what to do with that information.'
    },
    {
      filename: '2004-08-13.txt',
      date: 'august 13, 2004 :: 11:18 PM',
      preview: 'meeting her at the boathouse at 11. one more time.',
      body: 'she asked me to meet her at the boathouse tonight at 11. she said she wanted to talk. i said okay.\n\nthis is probably stupid. glorfindel told me not to go alone. i\'m going anyway because if i don\'t i will spend the rest of my life wondering.\n\nher name is wren halloway. i am writing it for the last time. one way or another, after tonight, i am done writing it.'
    }
  ];

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
