# Mystery audit — pyforthegirls

Read-through pass against `CANON`, looking for places where the
storytelling either lands cleanly or risks confusing a first-time
player. No code changes here — this is a punch list.

Format: ✅ works as intended · ⚠️ might confuse · ❌ contradicts canon
or itself.

## ✅ What works

**The structural mystery is sound.** Across eight chapters you build
the player up to suspect Wren, then redirect to an H-name search,
then reveal Hannah, then converge on Tyler. The pedagogy-as-plot
shape holds: each Python skill genuinely earns the next reveal.

**Wren-as-misdirection lands.** Ch2's `realization` beat plants
"wren has been on this account" without overcommitting; ch3's
`pivot` beat ("wren wasn't at the boathouse") puts that suspicion
to bed cleanly using the player's own filtered output as evidence.
By the time we meet Wren in ch8 she's allowed to be a real person:
predator, but not the killer. Camille's "wren was a monster, she
just wasn't THIS monster" is the line that makes the whole
misdirection feel earned rather than cheap.

**Hannah's reveal in ch5 is the strongest single beat.** Tegan's
decoded letter ("if you're reading this, i'm not dead") + Hannah's
typing-storm response ("oh my god you are real / tegan never made
it / i waited eight hours / the last text i got from her was 'h'")
delivers two reversals at once: Tegan was running, AND something
happened in those minutes. The player reaches ch6 with a coherent
new picture.

**The Camille redirect in ch8 is well-built.** Her "i've spent
fifteen months hating her" → "ok if it was tyler" → "wait, the
jersey" beat sequence is a small masterpiece of someone updating
in real time. The jersey detail is the kind of evidence that feels
like an actual witness remembering something they didn't know
mattered.

**Tyler's father being RCMP at the responding detachment is good
mystery architecture.** It makes the cousin's "i can't take this
to anyone" feel earned rather than convenient.

## ⚠️ Hannah's "she's still not here" red herring

This is the one you flagged, and it's the most fragile thing in
the mystery.

**The setup.** Ch1 ends with Tegan's last diary entry:
> she said meet me at the boathouse tonight. we'll talk it out.

Then ch3 puts ten time-ordered fragments on a corkboard, including
Tegan's SMS to Hannah:
- 22:15  she wants me to meet her at the boathouse at 11
- 23:18  she's not here yet
- 23:31  she's STILL not here
- 23:44  someone's coming up the path. it's not her.

The player has just been primed (ch1) that "she" = Wren. So all
four of those texts read as "Wren stood Tegan up, then someone
else came." That's the intended misread.

**The intended canonical reading**, per `CANON`:
- "she wants me to meet her at the boathouse at 11" — "she" = the
  ride Hannah arranged
- "she's not here yet" / "STILL not here" — the ride is late
- "it's not her" — Tyler arrives, not the ride
- "h" — first letter of *Hannah*, panic-typed in the last seconds

**The clarity gap.** Ch5 reveals Hannah arranged a ride
("tonight a friend of hers is picking me up at the boathouse")
and Hannah confirms in the AIM thread that she waited eight hours
at the rendezvous. Ch8 mentions in passing that "the friend who
was supposed to drive her … was at the boathouse from midnight to
2 AM. tegan never came."

But the *texts themselves are never reread*. The cousin never
narrates "the 'she's not here yet' I assumed was Wren — that was
the driver, late." A close reader will work it out; a casual
reader will end the game still half-thinking Wren stood Tegan up
and that's why Tyler had access.

**Suggested fix.** A short reread beat after Hannah's ch5 reveal,
either as a `notes/` diary entry or inline in the cousin's
post-decode reflection. Something like:

> *every text from her phone reads differently now. "she wants me
> to meet her at the boathouse at 11" — that wasn't wren. that
> was the driver hannah sent. wren had already left. tegan was
> standing there alone, waiting for a stranger to pull up. and
> tyler got there first.*

Even one beat doing this work explicitly would close the gap.

**Secondary issue** in canon itself: per the SMS log, Tegan texts
"left hemlock. heading down." at 23:03 — but `CANON` also has
Wren and Tegan meeting at the boathouse "around 10–11 PM" and
hooking up before Wren leaves at 23:34. Those don't quite line
up: if Tegan only leaves hemlock at 23:03, when did the hookup
happen? The fix is probably either (a) the hookup happened earlier
elsewhere (Wren's quarters?) and they walked down together later,
or (b) "left hemlock. heading down" actually means Tegan returned
to hemlock briefly and is now heading back to the boathouse. The
chapters don't pin this down, and a reader trying to reconstruct
the night will hit the same wall.

## ⚠️ Tyler's motive

The other big one. Per `CANON`, Tyler's motive is:

1. He had a crush on Wren.
2. Tegan kissed Wren in front of him at the bonfire as a "joke"
   for him — and he read it as Tegan flirting with him personally,
   not just two girls performing.
3. Sometime between bonfire and Aug 14, he started suspecting he
   was being used as a beard.
4. The boathouse on Aug 14 confirmed it. He saw Tegan and Wren
   together for real, realized he'd been the cover story, and
   killed Tegan in retaliation.

**What the chapters give the player.** Ch1's bonfire diary plants
the kiss and Tyler's reaction beautifully ("tyler made a sound
like he'd been hit … tyler said 'do it again'"). Ch7's nurse
report places him with bandaged hands the next morning. Ch7's
multiplatform dossier shows him going right back to hockey and
his life. Ch8 has Camille's "the boy with the staring problem,"
the jersey detail, and the inferred path: Tyler waited in the
bushes, Wren left at 11:34, Tyler emerged at 11:44.

**The clarity gap.** None of the four canon motive beats above
gets *stated* by the cousin or anyone else. The player has the
opportunity-and-means triangle (he was there, his hands were
torn up, his dad ran the response). They have the bonfire detail.
But the connective tissue — "he thought she was flirting with
*him* and the boathouse confirmed she'd lied" — is left for the
reader to assemble.

For some readers that'll work; the chess pieces are all on the
board. For others, Tyler will read as "a creepy boy who was
watching, who happened to be there, who happened to fall on the
trail." Without the motive being legible, his murder feels less
like a coherent why and more like a generic "boy at camp does
violence."

**Suggested fix.** The cousin connecting the dots in their own
voice, probably in ch7 (after the nurse report) or ch8 (after the
Camille jersey beat). Something the cousin types into a `notes/`
file:

> *the bonfire wasn't a joke for him. or it was — but he didn't
> know that. tegan grabbed wren's face in front of him because
> he was watching, and his face when she did it ("a sound like
> he'd been hit") wasn't shock at two girls kissing. it was the
> face of a kid who thought she was performing for him. and
> then aug 14 he saw what was actually happening and his
> performance ran out.*

Or shorter, more Camille-shaped, in the AIM thread: *"the kiss
at the bonfire — he thought it was for him. he wasn't watching
two girls. he thought he was being chosen."*

The mystery is structurally complete; the **why** is what
needs the extra sentence.

## ⚠️ The "h" referent

Per `CANON`: the "h" was Tegan reaching for **Hannah** in panic
in her last seconds. Tyler's last name being **Hughes** is a
secondary cipher coincidence — not what Tegan meant.

**What the chapters do.** Ch3 builds an H-name search assuming
"h" = killer's first name. Ch4 exhausts that and pivots to
Melissa. Ch5 has Hannah say "the last text i got from her was
'h'" — which is the moment a careful reader realizes the "h"
was *for* Hannah. Ch7 then surfaces "Tyler **Hughes**," whose
last name also starts with H, presented as new evidence.

**The risk.** Some readers will land on "the 'h' was for Hughes"
and never revisit. The Hughes reading even feels satisfying —
Tegan recognized her killer and started typing his name. But
canonically the "h" isn't pointing at Tyler at all; it's pointing
at the person who could have called for help.

**Suggested fix.** A single line acknowledging the double
meaning, probably from the cousin near the end of ch7 or in ch8:

> *the "h" wasn't him. she wasn't typing his name. she was
> typing hannah's. she was reaching for the only person who
> could do anything. she got one letter out.*

This makes the Hughes-coincidence land as a poetic accident
rather than the intended decoding, which is the right way for
this beat to feel.

## ⚠️ My own viewers.js diary entries are dated wrong

I shipped six diary entries in `viewers.js` (the `diary/`
desktop-icon viewer) as atmospheric texture. Cross-checking against
chapter canon, several of them drift:

- `2004-06-14.txt` — first day at camp. Per ch1's diary the first
  entry is dated **june 21**. Off by a week.
- `2004-08-02.txt` — bonfire aftermath dated 3:14 AM. Per ch1's
  bonfire diary the timestamp is **august 1, 4:08 AM**. Close
  but inconsistent.
- `2004-08-13.txt` — "meeting her at the boathouse at 11" written
  the night before. The actual canon last-diary is **august 14,
  9:31 PM**, written hours before going down. My entry duplicates
  the wrong day and slightly wrong content.

These are mine to fix. None of them spoils anything (the content
is intentionally vague), but they don't line up with the chapter
beats and a reader who opens the desktop diary icon between
chapters will get a slightly off-canon parallel timeline.

**Suggested fix.** Realign the dates and trim the entries so they
either (a) match the chapter beats verbatim or (b) sit clearly in
the gaps between chapter beats. I can do this in a small follow-up
PR.

## ⚠️ Smaller continuity notes

**Wren's "i can see when it logs on" vs Wren editing the laptop.**
Ch2's `realization` says Wren has been signing in to Tegan's
account. `CANON` says Wren may have edited *some* files
(post-Aug-14 chat logs, the Aug 15+ files showing the account
"alive") but **not** the Aug 14 last-diary. This is consistent —
the chapter says Wren wouldn't have known to scrub for repetition,
which works for everything except the Aug 14 entry. But a reader
will probably not pick up the distinction and will assume Wren
edited the diary too. Worth a follow-up beat in ch5 (after the
letter decode) where the cousin notices the encrypted letter is
in a `.hidden/` folder Wren didn't touch — implying Wren didn't
edit Tegan's last entry either, just other things.

**Camille saw Wren wet from the dock, not from the water.** Ch8
clarifies this: Wren was wet because she'd been on the dock with
Tegan, not because she'd been in the lake. This is a key
exoneration for Wren but it's tucked into Camille's redirect AIM
("they hadn't been in the water"). Easy to miss on a fast read.
A reader who skims ch8 might leave thinking "ok Tyler did it
but Wren also did some weird wet thing." Worth bolding visually
or repeating in the chapter wrap.

**Hannah is `glorfindel_lives` is shown but the "the screenname
is in this folder, you've seen it before" handoff is subtle.**
Ch5's letter says "her screenname is in this folder." The player
is meant to recall `glorfindel_lives` from the SMS contact in ch3.
Some players will land on this fast; others may need to scroll
back. The line is good, but a small in-game callout (e.g.,
highlight the contact name in the cousin's notes) would help.

**Briar's role gets dropped after ch3.** She gives Wren the
alibi, then disappears from the chapters. `CANON` has her as
knowing about the predation but not the murder, which is rich,
but the player just files her under "Wren's accomplice" and
forgets her. If you wanted to do anything with her — even a
single beat in ch6 or ch8 where she's mentioned doing something
in the year since — it would close the loop. Otherwise she reads
as a plot device.

**Hattie's exoneration in ch4 is clean.** No issue, just noting:
this is well-handled, the reader believes it.

**Melissa's storyline in ch8 is a quiet B-plot, well-judged.**
Her LiveJournal arc ("doing okay, not contacted, her right")
gives the cousin (and player) a shape for what survival looks
like. No issues; mentioning here because it's the right kind of
restraint.

## ❌ Nothing fully contradicts canon

Reading end-to-end I didn't find a beat that flatly disagrees
with `CANON`. The two soft contradictions:

1. The Aug 14 hookup-vs-SMS-times timing (above) — internal
   tension between canon and the SMS log.
2. Marcia's email and Wren's email in some chapters use the
   `<initial>.<lastname>@camppinecrest.ca` form rather than the
   canonical `<firstname>.<lastname>@`. `CANON` already flags
   this as a known cleanup item.

## Suggested priority

If you want to ship clarity fixes in one pass, the order I'd
work in:

1. **Tyler motive line** — single sentence in ch7 or ch8
   making the "led on" arc explicit. Highest impact for the
   smallest patch.
2. **SMS reread beat** — short cousin reflection after ch5
   establishing that "she's not here yet" was the driver, not
   Wren. Closes the biggest red-herring exit.
3. **The "h" disambiguation** — one line distinguishing
   Hannah-as-referent from Hughes-as-coincidence.
4. **viewers.js diary date fixes** — mine to fix, small.
5. **Wren-edited-which-files distinction** — optional, helps
   readers who try to map the timeline carefully.
6. **Briar handoff in ch6 or ch8** — optional, depends on
   whether you want to close her arc or leave her ambient.

1–3 are the substance. 4 is hygiene. 5–6 are if-you-have-time.

