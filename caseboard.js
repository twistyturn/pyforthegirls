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

  // populated in subsequent chunks
  const SNAPSHOTS = {};

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
