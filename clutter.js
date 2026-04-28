// =============================================================================
// clutter.js
//
// tegan's desktop clutter. loose files and folders that the player can click
// and read. all content is tegan's, written before aug 14 2004. no plot
// gates, no progression — just texture.
//
// shipped alongside an authoritative on-disk mirror in `desktop/`. the on-disk
// version is for repo browsers; this file is what the game actually renders.
// if you edit one, edit the other.
// =============================================================================

(function() {
  'use strict';

  // ===========================================================================
  // CSS
  // ===========================================================================
  const CSS = `
/* Icon-grid layout is governed by per-chapter CSS — desktop frame redesign
   pins it as a vertical left rail. We intentionally don't override it here. */
.icon-grid .desktop-icon { width: 80px; flex-shrink: 0; }

.cl-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(10, 2, 24, 0.72);
  display: none;
  align-items: flex-start; justify-content: center;
  padding: 32px 16px;
  overflow: auto;
}
.cl-overlay.cl-open { display: flex; }
.cl-stack {
  position: relative;
  width: 100%; max-width: 720px;
  display: flex; flex-direction: column; gap: 12px;
}

/* shared window chrome */
.cl-win {
  background: #f0f0ff;
  color: #1a0628;
  border: 2px solid #1a0628;
  box-shadow: 4px 4px 0 #1a0628, 0 0 24px rgba(255, 102, 196, 0.35);
  font-family: 'VT323', 'Courier New', monospace;
}
.cl-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 8px;
  font-family: 'Silkscreen', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  color: #fff;
  text-shadow: 1px 1px 0 #1a0628;
  border-bottom: 2px solid #1a0628;
  user-select: none;
}
.cl-tb-buttons { display: flex; gap: 4px; }
.cl-tb-btn {
  width: 16px; height: 14px;
  background: #f0f0ff; color: #1a0628;
  border: 1px solid #1a0628;
  font-family: 'Silkscreen', monospace; font-size: 8px;
  line-height: 12px; text-align: center;
  cursor: pointer;
}
.cl-statusbar {
  border-top: 1px solid #888;
  background: #d8d8d8;
  font-family: 'Silkscreen', monospace;
  font-size: 9px;
  color: #1a0628;
  padding: 3px 8px;
  display: flex; justify-content: space-between;
  letter-spacing: 1px;
}

/* notepad (.txt) */
.cl-win-notepad .cl-titlebar {
  background: linear-gradient(180deg, #4a90e2, #2a5fa0);
}
.cl-notepad-body {
  background: #fff;
  padding: 12px 14px;
  font-family: 'Courier New', 'VT323', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #1a0628;
  white-space: pre-wrap;
  min-height: 200px;
}

/* word 2003 (.doc) */
.cl-win-word .cl-titlebar {
  background: linear-gradient(180deg, #5b8cce, #36589f);
}
.cl-word-shell {
  background: #ece9d8;
  padding: 14px 18px;
}
.cl-word-page {
  background: #fff;
  padding: 28px 36px;
  border: 1px solid #b8b8b8;
  box-shadow: 1px 1px 4px rgba(0,0,0,0.18);
  font-family: 'Times New Roman', Times, serif;
  font-size: 15px;
  line-height: 1.45;
  color: #1a0628;
  white-space: pre-wrap;
  min-height: 240px;
}

/* outlook express draft (.doc emails) */
.cl-win-email .cl-titlebar {
  background: linear-gradient(180deg, #7a9ad6, #4a6fa5);
}
.cl-email-headers {
  background: #ece9d8;
  border-bottom: 1px solid #888;
  padding: 6px 10px;
  font-family: 'Tahoma', 'VT323', monospace;
  font-size: 12px;
  color: #1a0628;
}
.cl-email-headers div { padding: 2px 0; }
.cl-email-headers .cl-eh-label {
  display: inline-block; width: 64px;
  font-weight: bold; color: #36589f;
}
.cl-email-body {
  background: #fff;
  padding: 14px 16px;
  font-family: 'Tahoma', 'VT323', monospace;
  font-size: 13px;
  line-height: 1.45;
  color: #1a0628;
  white-space: pre-wrap;
  min-height: 180px;
}

/* folder window */
.cl-win-folder .cl-titlebar {
  background: linear-gradient(180deg, #c8a8e8, #8a6abf);
}
.cl-folder-toolbar {
  background: #ece9d8;
  padding: 4px 8px;
  border-bottom: 1px solid #b8b8b8;
  font-family: 'Tahoma', 'VT323', monospace;
  font-size: 11px;
  color: #1a0628;
}
.cl-folder-grid {
  background: #fff;
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 14px;
  min-height: 160px;
}
.cl-folder-icon {
  text-align: center;
  cursor: pointer;
  padding: 6px 4px;
  font-family: 'Tahoma', 'VT323', monospace;
  font-size: 11px;
  color: #1a0628;
  word-break: break-word;
  border: 1px dotted transparent;
}
.cl-folder-icon:hover {
  background: rgba(102, 153, 255, 0.18);
  border-color: rgba(102, 153, 255, 0.4);
}
.cl-folder-icon-img {
  font-size: 28px;
  margin-bottom: 4px;
  filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.2));
}
`;

  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    cssInjected = true;
  }

  // ===========================================================================
  // DATA — file content. mirrors `desktop/` on disk.
  // ===========================================================================
  // (FILES, FOLDERS, DESKTOP_ITEMS appended below)

  const FILES = {};
  const FOLDERS = {};
  const DESKTOP_ITEMS = [];

  // ===========================================================================
  // OVERLAY + WINDOW STACK
  // ===========================================================================
  let overlay = null;
  let windowStack = [];

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'cl-overlay';
    overlay.innerHTML = '<div class="cl-stack" id="cl-stack"></div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeAll();
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  function pushWindow(node) {
    ensureOverlay();
    document.getElementById('cl-stack').appendChild(node);
    overlay.classList.add('cl-open');
    windowStack.push(node);
  }

  function closeTop() {
    if (!windowStack.length) return;
    const top = windowStack.pop();
    if (top && top.parentNode) top.parentNode.removeChild(top);
    if (!windowStack.length && overlay) overlay.classList.remove('cl-open');
  }

  function closeAll() {
    while (windowStack.length) {
      const w = windowStack.pop();
      if (w && w.parentNode) w.parentNode.removeChild(w);
    }
    if (overlay) overlay.classList.remove('cl-open');
  }

  // ===========================================================================
  // WINDOW BUILDERS
  // ===========================================================================
  function makeTitlebar(label, opts) {
    opts = opts || {};
    const bar = document.createElement('div');
    bar.className = 'cl-titlebar';
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    bar.appendChild(labelEl);
    const btns = document.createElement('span');
    btns.className = 'cl-tb-buttons';
    if (!opts.hideMinMax) {
      const min = document.createElement('span'); min.className = 'cl-tb-btn'; min.textContent = '_'; btns.appendChild(min);
      const max = document.createElement('span'); max.className = 'cl-tb-btn'; max.textContent = '□'; btns.appendChild(max);
    }
    const close = document.createElement('span');
    close.className = 'cl-tb-btn';
    close.textContent = '×';
    close.addEventListener('click', closeTop);
    btns.appendChild(close);
    bar.appendChild(btns);
    return bar;
  }

  function buildNotepad(name, file) {
    const win = document.createElement('div');
    win.className = 'cl-win cl-win-notepad';
    win.appendChild(makeTitlebar(name + ' - Notepad'));
    const body = document.createElement('div');
    body.className = 'cl-notepad-body';
    body.textContent = file.content;
    win.appendChild(body);
    return win;
  }

  function buildWord(name, file) {
    const win = document.createElement('div');
    win.className = 'cl-win cl-win-word';
    win.appendChild(makeTitlebar(name + ' - Microsoft Word'));
    const shell = document.createElement('div');
    shell.className = 'cl-word-shell';
    const page = document.createElement('div');
    page.className = 'cl-word-page';
    page.textContent = file.content;
    shell.appendChild(page);
    win.appendChild(shell);
    return win;
  }

  function buildImage(name, file) {
    const win = document.createElement('div');
    win.className = 'cl-win cl-win-image';
    win.appendChild(makeTitlebar(name + ' - Image Viewer'));
    const body = document.createElement('div');
    body.className = 'cl-image-body';
    body.style.background = '#3a3a3a';
    body.style.padding = '12px';
    body.style.maxHeight = '70vh';
    body.style.overflow = 'auto';
    body.style.textAlign = 'center';
    // file.content is a string of inline SVG markup. It's a static asset
    // we ship in the bundle, so innerHTML is fine here (no user input).
    body.innerHTML = file.content;
    // Make the SVG scale to the window width.
    const svg = body.querySelector('svg');
    if (svg) {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
    }
    win.appendChild(body);
    return win;
  }

  function buildEmail(name, file) {
    const win = document.createElement('div');
    win.className = 'cl-win cl-win-email';
    win.appendChild(makeTitlebar(name + ' - Outlook Express'));
    const c = file.content;
    const headers = document.createElement('div');
    headers.className = 'cl-email-headers';
    function row(label, value) {
      const d = document.createElement('div');
      const l = document.createElement('span');
      l.className = 'cl-eh-label';
      l.textContent = label + ':';
      d.appendChild(l);
      d.appendChild(document.createTextNode(' ' + value));
      return d;
    }
    headers.appendChild(row('To', c.to));
    headers.appendChild(row('From', c.from));
    headers.appendChild(row('Subject', c.subject));
    headers.appendChild(row('Date', c.date));
    win.appendChild(headers);
    const body = document.createElement('div');
    body.className = 'cl-email-body';
    body.textContent = c.body;
    win.appendChild(body);
    const status = document.createElement('div');
    status.className = 'cl-statusbar';
    const left = document.createElement('span');
    left.textContent = '✉ Saved to Drafts';
    const right = document.createElement('span');
    right.textContent = 'Offline';
    status.appendChild(left);
    status.appendChild(right);
    win.appendChild(status);
    return win;
  }

  function buildFolder(name, folder) {
    const win = document.createElement('div');
    win.className = 'cl-win cl-win-folder';
    win.appendChild(makeTitlebar(name));
    const tb = document.createElement('div');
    tb.className = 'cl-folder-toolbar';
    tb.textContent = 'File  Edit  View  Favorites  Tools  Help';
    win.appendChild(tb);
    const grid = document.createElement('div');
    grid.className = 'cl-folder-grid';
    folder.items.forEach(function(itemName) {
      const it = document.createElement('div');
      it.className = 'cl-folder-icon';
      const img = document.createElement('div');
      img.className = 'cl-folder-icon-img';
      img.textContent = iconFor(itemName);
      it.appendChild(img);
      it.appendChild(document.createTextNode(itemName));
      it.addEventListener('click', function() { openFile(itemName); });
      grid.appendChild(it);
    });
    win.appendChild(grid);
    const status = document.createElement('div');
    status.className = 'cl-statusbar';
    const left = document.createElement('span');
    left.textContent = folder.items.length + ' object(s)';
    const right = document.createElement('span');
    right.textContent = 'My Computer';
    status.appendChild(left);
    status.appendChild(right);
    win.appendChild(status);
    return win;
  }

  // ===========================================================================
  // OPEN HANDLERS
  // ===========================================================================
  function openFile(name) {
    const f = FILES[name];
    if (!f) return;
    let node;
    if (f.type === 'txt')           node = buildNotepad(name, f);
    else if (f.type === 'word')     node = buildWord(name, f);
    else if (f.type === 'email')    node = buildEmail(name, f);
    else if (f.type === 'image')    node = buildImage(name, f);
    else return;
    pushWindow(node);
  }

  function openFolder(name) {
    const f = FOLDERS[name];
    if (!f) return;
    pushWindow(buildFolder(name + '/', f));
  }

  // ===========================================================================
  // ICON HELPERS
  // ===========================================================================
  function iconFor(name) {
    const f = FILES[name];
    if (!f) return '📄';
    if (f.type === 'txt') return '📝';
    if (f.type === 'email') return '✉️';
    if (f.type === 'word') return '📄';
    if (f.type === 'image') return '🖼️';
    return '📄';
  }

  function buildDesktopIcon(item) {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    const img = document.createElement('div');
    img.className = 'desktop-icon-img';
    if (item.folder) {
      img.textContent = '📁';
      el.appendChild(img);
      el.appendChild(document.createTextNode(item.folder + '/'));
      el.addEventListener('click', function() { openFolder(item.folder); });
    } else {
      img.textContent = iconFor(item);
      el.appendChild(img);
      el.appendChild(document.createTextNode(item));
      el.addEventListener('click', function() { openFile(item); });
    }
    return el;
  }

  function mountIcons() {
    const grid = document.querySelector('.icon-grid');
    if (!grid) return;
    DESKTOP_ITEMS.forEach(function(item) {
      grid.appendChild(buildDesktopIcon(item));
    });
  }

  // ===========================================================================
  // INIT
  // ===========================================================================
  function init() {
    injectCSS();
    mountIcons();
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && windowStack.length) closeTop();
  });

  window.Clutter = {
    open: openFile,
    openFolder: openFolder,
    closeAll: closeAll,
    FILES: FILES,
    FOLDERS: FOLDERS
  };

  // auto-init deferred to the end of the IIFE so FILES/FOLDERS/DESKTOP_ITEMS
  // populate first.

  // ===========================================================================
  // FILE CONTENT — populated below. mirrors `desktop/` on disk.
  // ===========================================================================

  // ---- loose .txt files ----

  FILES['birthday wishlist.txt'] = {
    type: 'txt',
    content: `- mp3 player (PLEASE. iPod mini if u r feeling generous. silver.)
- the new ATU shirt (medium not small)
- gift card to chapters????
- the lord of the rings extended editions box set (tell dad)
- a real bra. the underwire kind. (mom only.)
- new headphones. the over-ear kind not the buds.
- "the perks of being a wallflower"
- moleskine notebook, unlined.
- gel pens. the muji ones if u can find them.
- camp pinecrest counsellor sweatshirt (ASK MARCIA TO ORDER ONE)

DO NOT WANT:
- another devotional book grandma
- horse calendar (i was 11 when i liked horses)
- "anne of green gables"-themed anything
- a curling iron
`
  };

  FILES['songs to download.txt'] = {
    type: 'txt',
    content: `SONGS TO DOWNLOAD!!!!!

- avril lavigne - my happy ending (real version not the live one)
- avril lavigne - nobody's home
- michelle branch - all you wanted (THE GOOD ONE)
- michelle branch - everywhere
- dashboard - hands down
- dashboard - vindicated
- jimmy eat world - the middle
- jimmy eat world - 23
- the postal service - such great heights
- the postal service - the district sleeps alone tonight (THIS ONE)
- death cab - title and registration
- modest mouse - float on
- franz ferdinand - take me out
- the killers - mr. brightside
- the killers - somebody told me
- gwen stefani - what you waiting for
- hilary duff - come clean (DON'T JUDGE ME)
- maroon 5 - she will be loved
- snow patrol - run
- snow patrol - chocolate
- coldplay - the scientist (mom's car song)

NEED:
- something off the garden state soundtrack????
- the song from the OC episode where seth and summer
- "such great heights" but the IRON & WINE version
`
  };

  FILES['SUMMER PACKING LIST 2004.txt'] = {
    type: 'txt',
    content: `PINECREST PACKING — DO NOT FORGET LIKE LAST YEAR

clothes:
- shorts x4
- t-shirts x6
- one nice top (counsellor dinner)
- swimsuit x2 (THE BLUE ONE not the ugly red one mom wants me to wear)
- hoodie
- rain jacket (it WILL rain don't be stupid)
- socks. SO MANY SOCKS.
- underwear
- hiking boots
- flip flops for the showers
- pajamas (the ones with the constellations)

stuff:
- bug spray. THE GOOD KIND
- sunscreen
- toothbrush/toothpaste/etc.
- towel x2 (one shower one beach)
- flashlight + extra batteries
- discman + cd wallet (REMEMBER THE CDs)
- extra batteries for discman
- books (new ursula k leguin.)
- journal + pens
- camera + film

stuff for cabin:
- glow in the dark stars
- birthday cards (zoe turns 12 july 23, owen turns 10 aug 9)
- trail mix to share (NOT THE PEANUT KIND)
- band-aids

DO NOT FORGET:
- meds
- inhaler (just in case)
`
  };

  FILES['AIM buddy list.txt'] = {
    type: 'txt',
    content: `SCHOOL
- jenna_g89
- mattie_r
- caitlin.macd
- spencer_hockey06
- becca_b

CAMP
- wren_h ♡♡♡
- briar_v
- marcia_pinecrest
- sarah_c_camp
- camille.j.89
- hattie_w_xo

INTERNET
- glorfindel_lives ♡
- arwen_evenstar_19
- shire_baggins_42
- mithrandir_grey
- minas_tirith_777

FAMILY (UGH)
- aunt_lydia_71
- mom (DO NOT IM)
- dad (will not respond anyway)
`
  };

  FILES['summer reading list.txt'] = {
    type: 'txt',
    content: `SUMMER 2004 — books to actually finish this time

CARRY-OVERS FROM 2003 (failed):
- "the dispossessed" - le guin (got 80 pages in)
- "the master and margarita"
- "the secret history"
- "geek love" - katherine dunn

NEW:
- "the left hand of darkness" - le guin (REREAD before essay)
- "the perks of being a wallflower" (jenna lent it. give back!!)
- "fingersmith" - sarah waters (??? jenna's mom's??)
- something by ursula hegi
- "the time traveler's wife" (mom's)

REREADS:
- "a wizard of earthsea"
- "the blue castle" - lm montgomery
- "alanna: the first adventure" - tamora pierce
- "a wrinkle in time"

CABIN READS:
- "the giver" (reading aloud to the 11-year-olds again)
- "bridge to terabithia" (cry warning)
- "tuck everlasting"
- "the hero and the crown" (for the older girls?? maybe??)

MAYBE??:
- "go ask alice"
- something by anne carson (sarah recommended)
- "rubyfruit jungle" (saw it at the used bookstore. ???)
- "oranges are not the only fruit" (ALSO at the used bookstore. ?????)
- "the bell jar"
- "orlando" - virginia woolf
`
  };

  FILES['new cabin name ideas.txt'] = {
    type: 'txt',
    content: `2005 CABIN NAMES — pitching to marcia

CURRENT CABINS:
- pinewood (boys — tyler/brendan/jon next year if they all come back)
- hemlock (mine!! still!! see below!!)
- birchwood (hattie's)
- spruce
- cedar
- juniper

NEW IDEAS for the new cabins (2 more next year):
- tamarack ✓ love this
- sumac (??? sounds bad. like stomach)
- fireweed (alberta wildflower! perfect)
- bearberry (cute. small kids would like.)
- aspen ✓ obvious but good
- willow ✓
- larch (sounds made up but it's real)
- saskatoon (the BERRY not the city. marcia will say no.)

ASK MARCIA:
- can we rename hemlock?? it's literally poison.
  no kid wants to be in poison cabin.
- proposing: hemlock → fireweed
- or hemlock → aspen
- i was 14 when i first told her. i'm 17 now. some of those campers
  ARE 14. they're going to ask the same question i did. she's going
  to give them the same answer. it's still a stupid name.
`
  };

  FILES['july 2004 schedule.txt'] = {
    type: 'txt',
    content: `JULY SCHEDULE - PINEWOOD CABIN

WEEK 1 (june 28 - july 4)
mon: orientation. cabin setup. parent goodbyes (BRACE).
tue: swim test all campers. archery 2-4.
wed: hike to lookout. campfire.
thu: archery 2-4. evening: counsellor meeting 9pm.
fri: free swim. arts and crafts 2-4.
sat: parent visiting day (UGH). bbq.
sun: rest day. chapel optional. letters home.

WEEK 2 (july 5 - july 11)
mon: archery 9-11. swim 2-4.
tue: canoe trip (full day) - PACK LUNCH
wed: rest morning. games afternoon.
thu: archery 9-11. campfire skits!!!
fri: swim 9-11. craft 2-4.
sat: TALENT SHOW. (help kids prep wed-fri)
sun: rest day. letters home.

WEEK 3 (july 12 - july 18)
mon: ropes course (with hemlock cabin)
tue: swim 9-11. archery 2-4.
wed: nature hike. bug ID.
thu: campfire. ghost stories (NOT TOO SCARY for the 8s)
fri: free day. movie night??
sat: parent visiting (again. ugh.)
sun: rest day. letters home.

WEEK 4 (july 19 - july 25)
mon: archery 9-11. craft 2-4.
tue: canoe trip (half day) - little kids stay back
wed: swim. games.
thu: PINECREST OLYMPICS (all camp)
fri: PINECREST OLYMPICS (all camp)
sat: closing ceremony. parents arrive 4pm.
sun: pickup day. CRY. clean cabin. flop.
`
  };

  // ---- school/ .doc files ----

  FILES['english 30-1 essay - DRAFT 2.doc'] = {
    type: 'word',
    content: `The Colour of Memory: An Analysis of "Beloved" by Toni Morrison
Ms. Tremblay - English 30-1 - due october 22

In "Beloved," Toni Morrison uses colour as a recurring motif to
represent the protagonist Sethe's fractured relationship with her
own memories. The novel is set after the American Civil War, but
Sethe's mind exists in a kind of perpetual present where the
trauma of slavery is not "in the past" but actively shaping every
moment of her life.

Morrison writes that Sethe's eyes are "two open wells" — empty
but full at the same time. This contradiction is central to the
novel's argument that memory is not a record of what happened but
an active force in the present.

[this is good. keep going.]

The figure of Beloved herself is described in vivid, almost
unbearable colour — her skin "new" and "smooth as a baby's,"
her appetite for sweetness an echo of the daughter Sethe lost.
But the rest of the novel exists in a palette of muted greens,
greys, and "the colour of bruise."

[ms tremblay said i can do my final on whatever book i want
if i can defend it. should i do "the left hand of darkness"???
or is that too genre. ASK.]

Sethe's final reckoning with Beloved at the end of the novel
is, I will argue, not an exorcism but an integration — a
recognition that
`
  };

  FILES['math 30-3 hw.doc'] = {
    type: 'word',
    content: `Math 30-3 Homework — Mr. Albrecht — due monday

Section 4.2: Compound Interest

1. If $500 is invested at 5% interest compounded annually,
   what is the value after 3 years?

   A = P(1+r)^t
   A = 500(1.05)^3
   A = 500(1.157625)
   A = $578.81

2. If $1200 is invested at 6% compounded annually for 5 years —

[i hate this]
[i HATE this]
[summer school is a CRIME against teenagers]
[why does anyone care how much $500 is worth in three years]
[i'll be 20 in three years. i won't have $500.]

[mr albrecht said if i don't pass this unit i can't graduate
on time which is fine i guess. dad will lose his mind though.]

3.
`
  };

  FILES['chem 20 lab partners list.doc'] = {
    type: 'word',
    content: `Chem 20 — Lab Partner Preferences (per Mr. Wong)

YES PLEASE:
- jenna g (we already work well together)
- becca (smart and won't make me do everything)
- caitlin

OKAY I GUESS:
- mattie (nice but slow)
- spencer (hockey schedule = unreliable)

ABSOLUTELY NOT:
- evan k (set fire to the bunsen burner LAST year)
- the new kid whose name i haven't learned
- josh m (we dated for two weeks in grade ten. NO.)

[DO NOT GIVE THIS LIST TO MR WONG. write a "polite" version.]
`
  };

  FILES['socials 30 take-home test.doc'] = {
    type: 'word',
    content: `Social Studies 30-1 Take-Home Exam
Mr. Burnett, Period 4
Due: friday june 11

PART 1: Multiple Choice (You will answer all)

1. The primary cause of the Cold War was:
   a) Economic competition
   b) Ideological differences between the US and USSR
   c) Disagreements at the Yalta Conference
   d) All of the above

   ANSWER: d

2. The Truman Doctrine was significant because it:
   a) Established the policy of containment
   b) Funded the rebuilding of Europe
   c) Created NATO
   d) Ended the war in Korea

   ANSWER: a

[i'm just gonna do all of these b. who cares.]
[oh wait that doesn't work for the essay part.]

PART 2: Short Answer (3 questions, 200 words each)

3. Explain the significance of the Cuban Missile Crisis in the
   context of nuclear deterrence theory.

   The Cuban Missile Crisis of 1962 was significant because

[is mr burnett actually going to read these or just check that
they're 200 words]
[200 words. okay. 200 words about the cuban missile crisis.]
[i will literally pay someone to do this for me]
`
  };

  FILES['bio 20 notes.doc'] = {
    type: 'word',
    content: `Biology 20 - Mr. Henderson - Unit 4: Genetics

DEFINITIONS:
- gene: a sequence of DNA that codes for a trait
- allele: variant of a gene
- genotype: the genetic makeup (e.g. Bb)
- phenotype: the observable trait (e.g. brown eyes)
- homozygous: two of the same allele (BB or bb)
- heterozygous: two different alleles (Bb)
- dominant: allele expressed when present (B)
- recessive: allele expressed only when homozygous (bb)

MENDEL'S LAWS:
1. Law of Segregation: each parent passes one allele to offspring
2. Law of Independent Assortment: alleles for different traits
   are inherited independently of one another

PUNNETT SQUARES:
   |  B  |  b
B  | BB  | Bb
b  | Bb  | bb

ratio: 1 BB : 2 Bb : 1 bb (1:2:1)
phenotype: 3 dominant : 1 recessive (3:1)

TEST CROSS: cross unknown with homozygous recessive (bb) to
determine genotype of unknown organism.

SEX-LINKED INHERITANCE:
- carried on X chromosome
- more common in males (XY) - only one X
- examples: colour blindness, hemophilia
`
  };

  // ---- camp 2004/ .doc ----

  FILES['MASS EMAIL TO PARENTS - week 3.doc'] = {
    type: 'email',
    content: {
      to: 'Wren Halloway <wren.halloway@camppinecrest.ca>',
      from: 'Tegan Ashby <tegan.ashby@camppinecrest.ca>',
      subject: 'hemlock parent update week 3 — for you to send tomorrow',
      date: 'Thu, 15 Jul 2004 22:14:00 -0600',
      body: `Wren,

Here's the draft!!!! Marcia wanted these out by Friday morning.
You can edit anything, obviously. i tried to match how you
wrote the week 2 one. Sign it from yourself when you send.

— T

----- BEGIN DRAFT -----

Dear Hemlock Cabin Families,

Hello from Camp Pinecrest! We've had a wonderful week three
at camp, and I wanted to share some highlights with you all.

This week, the girls completed the high ropes course alongside
Birchwood cabin, and I am so proud of every single one of them.
Special shout-out to Maddie, who was nervous at the start but
made it across the entire course, and to Ellie, who encouraged
her teammates the whole way through.

We had our annual Talent Show on Saturday, and Hemlock put on
an incredible group dance number to "Hey Ya!" by Outkast. Ask
your daughters to show you the choreography when they get home.
They worked very hard on it!

Coming up this week: nature hike with bug identification (we'll
provide journals to anyone who needs one), ghost story night
(don't worry, age-appropriate!), and we begin preparing for
Pinecrest Olympics, the highlight of the summer.

Reminder: parent visiting day is this coming Saturday, July 17,
from 12-4 PM. Lunch will be served at 1 PM in the main lodge.
Please RSVP to the camp office if you haven't already.

If you have any questions or concerns, please don't hesitate
to contact me through the camp office.

Warmly,
Wren Halloway
Hemlock Cabin Senior Counsellor
Camp Pinecrest 2004

----- END DRAFT -----`
    }
  };

  FILES['pinecrest_map.svg'] = {
    type: 'image',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" font-family="Georgia, serif">
  <rect width="800" height="600" fill="#f4ead5"/>
  <g stroke="#d4c8a8" stroke-width="0.5" opacity="0.4">
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="200" x2="800" y2="200"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="0" y1="400" x2="800" y2="400"/>
    <line x1="0" y1="500" x2="800" y2="500"/>
  </g>
  <text x="400" y="40" text-anchor="middle" font-size="22" fill="#3a2820" font-style="italic">Camp Pinecrest</text>
  <text x="400" y="60" text-anchor="middle" font-size="12" fill="#6a5848">Whitecourt, Alberta &middot; est. 1962</text>
  <ellipse cx="600" cy="180" rx="160" ry="90" fill="#a8c8d8" stroke="#4a6a7a" stroke-width="2"/>
  <text x="600" y="180" text-anchor="middle" font-size="16" fill="#2a4a5a" font-style="italic">Lake Pinecrest</text>
  <g stroke="#4a6a7a" stroke-width="1" fill="none" opacity="0.5">
    <path d="M 510 170 Q 520 165 530 170"/>
    <path d="M 560 200 Q 570 195 580 200"/>
    <path d="M 620 160 Q 630 155 640 160"/>
    <path d="M 660 200 Q 670 195 680 200"/>
  </g>
  <rect x="470" y="240" width="40" height="30" fill="#8b6a4a" stroke="#3a2820" stroke-width="1.5"/>
  <text x="490" y="290" text-anchor="middle" font-size="11" fill="#3a2820">boathouse</text>
  <line x1="510" y1="255" x2="540" y2="220" stroke="#3a2820" stroke-width="2"/>
  <rect x="340" y="270" width="120" height="70" fill="#c8a878" stroke="#3a2820" stroke-width="2"/>
  <polygon points="340,270 460,270 400,250" fill="#8b6a4a" stroke="#3a2820" stroke-width="1.5"/>
  <text x="400" y="310" text-anchor="middle" font-size="13" fill="#3a2820" font-weight="bold">Main Lodge</text>
  <text x="400" y="325" text-anchor="middle" font-size="10" fill="#3a2820">mess hall &middot; office</text>
  <rect x="100" y="280" width="60" height="40" fill="#d8b888" stroke="#3a2820" stroke-width="1.5"/>
  <polygon points="100,280 160,280 130,265" fill="#8b6a4a" stroke="#3a2820" stroke-width="1"/>
  <text x="130" y="305" text-anchor="middle" font-size="11" fill="#3a2820">Pinewood</text>
  <text x="130" y="335" text-anchor="middle" font-size="9" fill="#6a5848" font-style="italic">boys</text>
  <rect x="180" y="380" width="60" height="40" fill="#d8b888" stroke="#3a2820" stroke-width="1.5"/>
  <polygon points="180,380 240,380 210,365" fill="#8b6a4a" stroke="#3a2820" stroke-width="1"/>
  <text x="210" y="405" text-anchor="middle" font-size="11" fill="#3a2820">Hemlock</text>
  <rect x="290" y="420" width="60" height="40" fill="#d8b888" stroke="#3a2820" stroke-width="1.5"/>
  <polygon points="290,420 350,420 320,405" fill="#8b6a4a" stroke="#3a2820" stroke-width="1"/>
  <text x="320" y="445" text-anchor="middle" font-size="11" fill="#3a2820">Birchwood</text>
  <rect x="410" y="420" width="60" height="40" fill="#d8b888" stroke="#3a2820" stroke-width="1.5"/>
  <polygon points="410,420 470,420 440,405" fill="#8b6a4a" stroke="#3a2820" stroke-width="1"/>
  <text x="440" y="445" text-anchor="middle" font-size="11" fill="#3a2820">Spruce</text>
  <rect x="520" y="380" width="60" height="40" fill="#d8b888" stroke="#3a2820" stroke-width="1.5"/>
  <polygon points="520,380 580,380 550,365" fill="#8b6a4a" stroke="#3a2820" stroke-width="1"/>
  <text x="550" y="405" text-anchor="middle" font-size="11" fill="#3a2820">Cedar</text>
  <rect x="660" y="320" width="60" height="40" fill="#d8b888" stroke="#3a2820" stroke-width="1.5"/>
  <polygon points="660,320 720,320 690,305" fill="#8b6a4a" stroke="#3a2820" stroke-width="1"/>
  <text x="690" y="345" text-anchor="middle" font-size="11" fill="#3a2820">Juniper</text>
  <rect x="500" y="100" width="50" height="35" fill="#e8d8c8" stroke="#3a2820" stroke-width="1.5"/>
  <text x="525" y="122" text-anchor="middle" font-size="10" fill="#3a2820">Infirmary</text>
  <text x="525" y="150" text-anchor="middle" font-size="9" fill="#a04848" font-style="italic">+</text>
  <circle cx="400" cy="510" r="30" fill="#c8a878" stroke="#3a2820" stroke-width="1.5"/>
  <text x="400" y="513" text-anchor="middle" font-size="10" fill="#3a2820">Fire Pit</text>
  <rect x="80" y="460" width="60" height="30" fill="none" stroke="#3a2820" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="110" y="480" text-anchor="middle" font-size="10" fill="#3a2820">Archery</text>
  <g stroke="#6a5848" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity="0.7">
    <path d="M 460 290 Q 470 280 490 270"/>
    <path d="M 400 340 L 400 480"/>
    <path d="M 340 300 L 160 300"/>
    <path d="M 350 335 L 240 390"/>
    <path d="M 380 340 L 320 420"/>
    <path d="M 420 340 L 440 420"/>
    <path d="M 460 325 L 520 390"/>
    <path d="M 460 290 L 660 330"/>
    <path d="M 420 270 L 510 135"/>
    <path d="M 140 470 L 320 440"/>
  </g>
  <g transform="translate(60, 80)">
    <circle r="20" fill="none" stroke="#3a2820" stroke-width="1"/>
    <polygon points="0,-18 -4,0 0,18 4,0" fill="#3a2820"/>
    <text y="-25" text-anchor="middle" font-size="10" fill="#3a2820" font-weight="bold">N</text>
  </g>
  <g fill="#4a6a3a" opacity="0.5">
    <circle cx="50" cy="200" r="8"/>
    <circle cx="65" cy="220" r="6"/>
    <circle cx="730" cy="450" r="8"/>
    <circle cx="750" cy="500" r="7"/>
    <circle cx="700" cy="500" r="6"/>
    <circle cx="40" cy="400" r="7"/>
    <circle cx="60" cy="430" r="6"/>
  </g>
  <text x="210" y="370" text-anchor="middle" font-size="11" fill="#a04848" font-family="cursive" font-style="italic">&#9733; me &#9733;</text>
</svg>`
  };

  FILES['song_list_2004.txt'] = {
    type: 'txt',
    content: `PINECREST 2004 — APPROVED & PROHIBITED SONGS
Maintained by: Briar W. (last updated July 8 2004)

CHAPEL / MORNING (no bops, please)
- "Lean on Me" — Bill Withers ✓
- "Stand By Me" — Ben E. King ✓
- "Bridge Over Troubled Water" — Simon & Garfunkel ✓
- "Country Roads" — John Denver ✓ (the campers love this one)
- "Circle of Life" — Lion King ✓ (yes, fine)

CABIN TIME / ACTIVITIES (anything radio-clean)
- "Complicated" — Avril Lavigne ✓
- "A Thousand Miles" — Vanessa Carlton ✓
- "Underneath It All" — No Doubt ✓ (clean version only)
- "1, 2 Step" — Ciara ✓
- "Since U Been Gone" — Kelly Clarkson ✓
- "Toxic" — Britney Spears ✓ (counsellor's discretion; the song is fine, the dancing is what gets out of hand)
- "Mr. Brightside" — The Killers ✓
- "Dragostea Din Tei" — O-Zone ✓ (the numa numa song. the campers will not stop)

TALENT SHOW ONLY (too suggestive for general rotation)
- "Hey Ya!" — Outkast ✓ talent show
- "Yeah!" — Usher ✓ talent show, group choreo only
- "Hollaback Girl" — Gwen Stefani ✓ talent show — and ONLY if they edit the b-word

PROHIBITED — DO NOT PLAY OVER CAMP SPEAKERS
- anything by Eminem (asked and answered, Tyler)
- "My Humps" — Black Eyed Peas
- "Get Low" — Lil Jon
- "Milkshake" — Kelis
- "Dirty" — Christina Aguilera

NOTES FROM COUNSELLORS:
> Tyler keeps requesting Eminem. The answer remains no.
  — Briar
> can we add "Such Great Heights" by The Postal Service to chapel?
  the campers would love it. it's about the sky. it counts.
  — Tegan A.
> approved. add it to chapel. — Briar
> can we add "Hide and Seek" by Imogen Heap?
  — Tegan A.
> ?? — Briar
> trust me — Tegan A.
> ok — Briar

PARENT'S DAY PLAYLIST: ASK MARCIA. she's particular.
`
  };

  FILES['olympics_2004_planning.txt'] = {
    type: 'txt',
    content: `PINECREST OLYMPICS 2004 — PLANNING DOC
Lead organizer: Wren Halloway
Co-organizer: Briar Whelan
Date: Saturday Aug 7 (week 5)

TEAMS (assigned by cabin pairings):
  TEAM RED: Pinewood + Spruce
    captains: Tyler Hughes, Olivia M.
  TEAM BLUE: Hemlock + Birchwood
    captains: Wren Halloway, Hattie Whitlock
  TEAM GREEN: Cedar + Juniper
    captains: Marcia Deveraux (subbing), Henry Pham

EVENTS:
  09:00 — opening ceremony (mess hall)
  09:30 — relay race (track)
  10:30 — canoe race (lake — boathouse start)
  11:30 — archery contest (range)
  12:30 — lunch
  13:30 — talent showcase (mess hall)
  14:30 — capture the flag (north field)
  16:00 — egg-and-spoon, sack race, three-legged race (south field)
  17:30 — dinner
  19:00 — closing ceremony, awards (fire pit)

SCORING:
  1st place: 5 points
  2nd place: 3 points
  3rd place: 1 point
  participation: 1 point per team member who tries

SUPPLY LIST (Briar handling):
  - 18 eggs (extras for breakage)
  - burlap sacks (12)
  - rope for three-legged
  - colored bandanas — red blue green, 30 each
  - first aid kit doubled at every event
  - sunscreen station

NOTES FROM WREN:
- T-shirts ordered from Edmonton, arriving Aug 4. Confirm with Marcia.
- Tegan, you're handling the relay race timing. Use the stopwatches
  from the gym closet. Check they all work BEFORE the morning of.
- Henry running point on canoe race safety. Two lifeguards minimum
  on the dock at all times.
- Camille will MC the talent showcase.
- I'll do opening + closing. Don't volunteer me for anything else,
  Briar. I have enough.

ASK MARCIA:
- can we have prizes? she said no last year. asking again.
- can the kitchen do team-color frosting on cupcakes for closing?
  helen will say yes if asked nicely.

(handwritten in margin, blue pen — Tegan's:
"team blue is going to win. wren is so competitive about this.
she practiced the canoe race in june.")
`
  };

  FILES['ghost_story_draft.txt'] = {
    type: 'txt',
    content: `ghost story for friday night — DRAFT 3

age range: 8-12. nothing too scary. marcia will fire me if a kid
has a nightmare.

CONCEPT: a girl gets lost on the trail near her cabin. she follows
what she thinks is the path back. it's actually being shown to her by
a ghost. the ghost is helpful, she's leading the girl home. but
the girl realizes at the end the ghost was her grandmother who
died last year and never met her.

NO. too sad. parents will write letters.

CONCEPT 2: there's a cabin on a hill nobody talks about. the door
is always open. the campers dare each other to go in. one girl does.
inside the cabin is empty except for a journal on the table. she
reads it. it's her own handwriting. it's diary entries she hasn't
written yet.

WAIT. that's a good one but it's actually scary. for me. let me
think about why.

i think i write things i'm scared of having written, sometimes.
i think if i opened a notebook and saw entries from a future me i
would be relieved because at least i'd know i was still here to
write them. but i don't know if any kid feels that way and it's not
their job to.

CONCEPT 3 (probably this one): the lake has a story. a girl swam
out too far and got tired and the water held her up. she's still
there, but she's nice. she helps swimmers who get scared. when
you're too far from the dock and you feel something brush your leg,
that's her. she's reminding you to turn around.

ending: the kids will ask if it's true. you say "i don't know. but
swim with a buddy."

that's the move. it's a ghost story but the lesson is buddy system.
marcia will love it.
`
  };

  // ---- drafts/ unsent emails ----

  FILES['email to mom (unsent).doc'] = {
    type: 'email',
    content: {
      to: 'lisa.ashby@telus.net',
      from: 'tegan_a87@hotmail.com',
      subject: 'hi',
      date: 'july 28 2004 11:47 PM',
      body: `hey mom

i wanted to tell you something but i don't know how to say it
and i keep starting over so i'm just going to write it and then
maybe send it tomorrow.

i don't want to go to U of A in september. i know that's where
you went and dad went and grandma went but i don't think it's
where i want to go.

i've been thinking a lot this summer and
`
    }
  };

  FILES['email to wren (unsent).doc'] = {
    type: 'email',
    content: {
      to: 'wren.halloway@hotmail.com',
      from: 'tegan_a87@hotmail.com',
      subject: '(no subject)',
      date: 'august 8 2004 2:13 AM',
      body: `i
`
    }
  };

  FILES['email to camille (unsent).doc'] = {
    type: 'email',
    content: {
      to: 'camille.mccleod@shaw.ca',
      from: 'tegan_a87@hotmail.com',
      subject: 'are you okay',
      date: 'july 5 2004 10:32 PM',
      body: `hi camille,

it's tegan from pinewood. i know something went down a couple
nights ago. i wanted to write back sooner.

actually i don't know what i wanted to say. i wanted to say
i'm sorry if it scared you. i wanted to say wren is. she is

i don't know.

are you okay though? if you ever want to talk
`
    }
  };

  // ===========================================================================
  // FOLDERS + DESKTOP LAYOUT
  // ===========================================================================

  FOLDERS['school'] = {
    items: [
      'english 30-1 essay - DRAFT 2.doc',
      'math 30-3 hw.doc',
      'chem 20 lab partners list.doc',
      'socials 30 take-home test.doc',
      'bio 20 notes.doc'
    ]
  };

  FOLDERS['camp 2004'] = {
    items: [
      'MASS EMAIL TO PARENTS - week 3.doc',
      'pinecrest_map.svg',
      'song_list_2004.txt',
      'olympics_2004_planning.txt'
    ]
  };

  FOLDERS['drafts'] = {
    items: [
      'email to mom (unsent).doc',
      'email to wren (unsent).doc',
      'email to camille (unsent).doc'
    ]
  };

  // order: most-active stuff first (camp/AIM/schedule), then trailing flavour,
  // then folders. messy desktop, not alphabetical.
  DESKTOP_ITEMS.push(
    'AIM buddy list.txt',
    'july 2004 schedule.txt',
    'songs to download.txt',
    'summer reading list.txt',
    'new cabin name ideas.txt',
    'ghost_story_draft.txt',
    'SUMMER PACKING LIST 2004.txt',
    'birthday wishlist.txt',
    { folder: 'drafts' },
    { folder: 'camp 2004' },
    { folder: 'school' }
  );

  // ===========================================================================
  // AUTO-INIT (after data populates)
  // ===========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
