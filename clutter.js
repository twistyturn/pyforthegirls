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
.icon-grid {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  grid-template-columns: unset !important;
  align-items: flex-start !important;
  gap: 14px !important;
  max-width: 880px;
}
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
- pinewood (mine!)
- hemlock
- birchwood
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
- (she will say no. she has said no for 3 years.)
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
    type: 'word',
    content: `Dear Pinewood Cabin Families,

Hello from Camp Pinecrest! We've had a wonderful week three at
camp, and I wanted to share some highlights with you all.

This week, the girls completed the high ropes course alongside
Hemlock cabin, and I am so proud of every single one of them.
Special shout-out to Maddie, who was nervous at the start but
made it across the entire course, and to Ellie, who encouraged
her teammates the whole way through.

We had our annual Talent Show on Saturday, and Pinewood put on
an incredible group dance number to "Hey Ya!" by Outkast. Ask
your daughters to show you the choreography when they get home —
they worked very hard on it!

Coming up this week: nature hike with bug identification (please
remind your campers to bring their journals if they have them),
ghost story night (don't worry, age-appropriate!), and we begin
preparing for Pinecrest Olympics, the highlight of the summer.

Reminder: parent visiting day is this coming Saturday, July 17,
from 12-4 PM. Lunch will be served at 1 PM in the main lodge.
Please RSVP to the camp office if you haven't already.

If you have any questions or concerns, please don't hesitate to
contact me through the camp office.

Warmly,
Tegan Ashby
Pinewood Cabin Counsellor
Camp Pinecrest 2004
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
      'MASS EMAIL TO PARENTS - week 3.doc'
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
