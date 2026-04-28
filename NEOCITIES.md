# Putting pyforthegirls on Neocities

Hi! This file is the only thing you need to read to get the game live on Neocities. No terminal, no command line, no build tools. You drag files into a webpage and it works.

If you get stuck on any step, the troubleshooting section at the bottom probably covers it.

---

## What you're uploading

The repository now contains exactly eleven files plus one folder that need to go to Neocities:

- `index.html` — the landing page (the player sees this first)
- `chapterone.html`
- `chaptertwo.html`
- `chapterthree.html`
- `chapterfour.html`
- `chapterfive.html`
- `chaptersix.html`
- `chapterseven.html`
- `chaptereight.html`
- `caseboard.js` — the corkboard module shared by every chapter
- `clutter.js` — the desktop-clutter module (Tegan's loose files and folders), shared by every chapter
- `cursors/` — the custom-cursor folder (Y2K Windows pixel arrow + hourglass for the OS layer, kawaii set reserved for in-game personal sites). Upload the whole folder so its inner structure (`cursors/default/`, `cursors/kawaii/`) is preserved.

That's it. Nothing else. If you skip `caseboard.js` the chapter pages still work, but the caseboard icon won't open anything. If you skip `clutter.js` the chapter pages still work, but the desktop will be missing all the loose files and folders (birthday wishlist, AIM buddy list, drafts/, school/, etc.). If you skip `cursors/`, the game still works, but you'll see your browser's normal cursor instead of the Y2K pixel arrow.

### Files you must NOT upload

- `CANON` — this is the writing-room spoiler bible. It names the killer. **Do not put this on the public internet.**
- `NEOCITIES.md` — this file you're reading. Not needed on the site.
- The `desktop/` folder — these are the on-disk source-of-truth copies of the files Tegan has on her laptop. The game reads them from inside `clutter.js` (which is a self-contained mirror), so this folder is for repo-browsing texture only. Don't upload it.
- The `.git` folder if you see one — Neocities won't show it to you in the web uploader, but if you're using something like a bulk-upload tool, skip it.

When in doubt: the only files that should end up on your Neocities account are the nine `.html` files plus `caseboard.js` and `clutter.js`.

---

## Step 1 — Make a Neocities account

1. Go to https://neocities.org/.
2. Click **Sign up** in the top right.
3. Pick a sitename. This becomes your URL: `https://YOURSITENAME.neocities.org/`. You can change the *display* name later but not this one easily, so pick something you're okay with.
4. Confirm your email.

The free tier is fine. It gives you 1 GB of storage, which is roughly a thousand times more than this game needs.

## Step 2 — Get the files onto your computer

If you've been editing in GitHub directly, you'll need them locally:

1. Go to your repo on GitHub.
2. Click the green **Code** button.
3. Click **Download ZIP**.
4. Unzip it somewhere obvious (your Desktop is fine).
5. Open the unzipped folder. You should see the nine `.html` files, `caseboard.js`, `clutter.js`, plus `CANON`, `NEOCITIES.md`, and a `desktop/` folder. Ignore the last three.

## Step 3 — Upload to Neocities

1. Log into Neocities. You'll land on your dashboard.
2. Click **Edit Site** (or **Manage Site Files**, depending on the layout).
3. You'll see a file list. There's already an `index.html` Neocities made for you. **Delete it.** (Click it, then the trash icon. You're going to replace it with your own.)
4. Click **Upload** (often a button at the top of the file list, sometimes it's drag-and-drop directly into the page).
5. Select all nine `.html` files plus `caseboard.js` and `clutter.js` and upload them.
6. Create a folder called `cursors` (Neocities has a "new folder" button in the file manager), open it, then create `default` and `kawaii` subfolders inside it. Upload `arrow.cur` and `wait.cur` into `cursors/default/`, and the kawaii `.cur` / `.ani` files into `cursors/kawaii/`. The path layout has to match what's in the repo or the cursors won't load.
7. Wait for the green checkmarks.

That's the whole upload. The site is now live.

## Step 4 — Test it

1. Go to `https://YOURSITENAME.neocities.org/` in a fresh browser tab.
2. You should see the pink **pyforthegirls** landing page.
3. Type a name, click **save**, then click the **chapter 1** card.
4. Chapter 1 should load. Pyodide takes 5–15 seconds the first time (it's downloading the Python interpreter into your browser). After that it's instant.
5. Play through one beat. When you finish a chapter, the **continue to chapter N+1** button should take you to the next chapter *without* asking for your name again. That's the fix.
6. From chapter 4 (or wherever), click your browser's back button until you get to the landing page. The chapter cards should now show "in progress :: N ✿" for chapters you've started.

If all of that works, you're done.

---

## What was changed and why (so you understand what's running)

You don't need to read this section to ship. It's here so a future-you knows what was touched.

1. **File names got `.html` extensions.** Web servers (including Neocities) need them.
2. **A shared username store.** Every chapter now reads/writes one key called `pyforthegirls_user` in your browser's local storage *in addition to* its own per-chapter save. So as long as one chapter has the name, all the others find it. That's why you don't get re-prompted.
3. **Auto-skip the intro screen if the name is already known.** Previously each chapter only auto-skipped if you'd already made progress *in that chapter*. Now any name from any chapter (or from the landing page) is enough.
4. **A "continue to chapter N+1" button** on every chapter-complete window, chapters 1–7. Chapter 8 is the end.
5. **A new `index.html` landing page** that asks for a name once and shows all eight chapters as a grid with progress badges.

The chapter content itself is untouched. Same beats, same Python lessons, same story.

---

## Updating the site later

If you change a chapter file:

1. Edit the file locally (or in GitHub).
2. In Neocities **Edit Site**, find the file.
3. Click it to open, paste in the new contents, **save**.

Or just re-upload the file (Neocities asks "overwrite?" — say yes).

Saves are stored in *the player's browser*, not on Neocities. If you change beat content, players who've already played that beat won't replay it (their save thinks they're done). That's normally fine. If you want to force everyone to restart, you can bump the save key inside the chapter's JavaScript (search for `SAVE_KEY = 'pyforthegirls_save_ch3_v1'` and change `_v1` to `_v2`) — but only do this if the change is significant enough that mid-play state is broken.

---

## Troubleshooting

**The page is blank / shows a 404.**
The file probably doesn't have `.html` on the end. Check Neocities' file list. If you see `chapterone` instead of `chapterone.html`, rename it (click it, there's usually a rename option) or delete and re-upload.

**The landing page works but clicking a chapter shows 404.**
Chapter file isn't there, or is named differently. The landing page expects exactly `chapterone.html`, `chaptertwo.html`, …, `chaptereight.html` — all lowercase, no spaces.

**The desktop clutter (loose files, folders) isn't showing up.**
`clutter.js` didn't get uploaded, or it's named differently. Check Neocities' file list — you should see `clutter.js` next to `caseboard.js`. If it's missing, re-upload it.

**Chapter loads but Python doesn't run / "loading…" forever.**
Pyodide is slow on slow connections. Give it 30 seconds the first time. If it never loads, check your browser console (F12 → Console) for an error. Most likely cause: an ad blocker or strict tracking-protection extension is blocking `cdn.jsdelivr.net`. Whitelist the site or test in a private window with extensions disabled.

**The name still gets re-asked between chapters.**
Make sure you uploaded the *new* `.html` files, not an older copy. Old files don't have the shared-name code. In Neocities, click on `chapterone.html`, scroll the source for `SHARED_USER_KEY` — if you see it, the new file is there.

**Player wants to restart from scratch.**
On the landing page there's a "clear all saved progress" button. Or they can clear their browser's site data for `YOURSITENAME.neocities.org`.

**I want a custom domain (e.g. `pyforthegirls.com`).**
Neocities supports this on the paid tier (Supporter, $5/mo). Instructions are on Neocities itself once you have an account. The game will work the same way on a custom domain — no code changes needed.

**Someone says the page looks broken on mobile.**
The game was designed desktop-first. It's playable on mobile but the windows are tight. That's a content/CSS project for another day, not a Neocities problem.

---

## What I did NOT do (and you might want to)

- **No favicon.** The browser tab will show a generic icon. If you want the little pink flower or whatever, make a 32×32 PNG, name it `favicon.ico` (or `.png`), upload it, and add `<link rel="icon" href="favicon.ico">` inside each chapter's `<head>`. Optional.
- **No analytics.** If you want to know how many people are playing, Neocities shows a built-in view counter on your dashboard. Anything fancier (Plausible, Google Analytics) needs a `<script>` tag added to each HTML file. Not recommended for a game with this tone.
- **No "previous chapter" buttons.** Each chapter only has a "continue" button forward. If a player wants to revisit chapter 3 from chapter 6, they go back to the landing page. That's deliberate (each chapter remembers its own progress). If you want previous-chapter buttons it's a small JS change in each file.
- **CANON has not been deleted from the repo.** It's still in the GitHub repo (which is fine — that's a writing tool). Just don't upload it to Neocities.
