// =============================================================================
// study_notes.js
//
// the cousin's diegetic Python reference. opens from a desktop icon styled as
// study_notes.docx, displays as a 2004 Word-document window. unlocked at the
// same trigger as the caseboard (chapter 1's wrap recorded). entries are gated
// by the player's furthest-completed chapter.
//
// data shape:
//   { concept, section, chapter_unlocked, content }
//
// chapters declare the icon as <div id="icon-study-notes" ...>. on script load
// we call refreshIcon() to reveal it iff the player has finished ch1+.
// =============================================================================

(function() {
  'use strict';

  const PROGRESS_KEY = 'pyforthegirls_caseboard_progress';

  // ===========================================================================
  // CSS — 2004 Word-doc cosplay. white page, faux toolbar, serif body.
  // ===========================================================================
  const CSS = `
.sn-overlay {
  position: fixed; inset: 0; z-index: 510;
  background: rgba(20, 8, 36, 0.78);
  display: none;
  align-items: stretch; justify-content: center;
  padding: 16px;
  overflow: auto;
}
.sn-overlay.sn-open { display: flex; }
.sn-shell {
  width: 100%; max-width: 880px;
  background: #ece9d8;
  border: 1px solid #404040;
  box-shadow: 2px 2px 0 #1a0628, 4px 4px 12px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  font-family: Tahoma, Verdana, sans-serif;
  color: #000;
}
.sn-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #0058e6 0%, #1c75e0 8%, #0049b8 100%);
  color: #fff;
  padding: 3px 4px 3px 6px;
  font-family: Tahoma, sans-serif;
  font-size: 11px; font-weight: bold;
  border-bottom: 1px solid #1a0628;
}
.sn-titlebar-icon {
  display: inline-block; width: 14px; height: 14px;
  margin-right: 4px;
  background: #fff; border: 1px solid #1a3a8a;
  position: relative; vertical-align: middle;
}
.sn-titlebar-icon::before {
  content: 'W'; position: absolute; inset: 0;
  font-family: Georgia, serif; font-weight: bold; font-size: 10px;
  color: #1a3a8a; text-align: center; line-height: 12px;
}
.sn-titlebar-buttons { display: flex; gap: 2px; }
.sn-titlebar-btn {
  width: 16px; height: 14px;
  background: #d4d0c8;
  border: 1px solid #fff;
  border-right-color: #404040;
  border-bottom-color: #404040;
  color: #000;
  font-family: Marlett, 'Webdings', sans-serif;
  font-size: 9px; font-weight: normal;
  text-align: center; line-height: 10px;
  cursor: pointer;
}
.sn-titlebar-btn:hover { background: #e8e4d8; }
.sn-titlebar-btn.sn-close:hover { background: #e81123; color: #fff; }
.sn-menubar {
  display: flex; gap: 0;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  padding: 2px 4px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
}
.sn-menubar-item {
  padding: 2px 8px;
  cursor: default;
  user-select: none;
}
.sn-menubar-item:hover { background: #316ac5; color: #fff; }
.sn-toolbar {
  display: flex; align-items: center; gap: 2px;
  background: #ece9d8;
  border-bottom: 1px solid #aca899;
  padding: 3px 4px;
  font-family: Tahoma, sans-serif;
  font-size: 10px;
  color: #404040;
}
.sn-toolbar-btn {
  display: inline-block;
  padding: 2px 5px;
  background: #ece9d8;
  border: 1px solid transparent;
  cursor: default;
  user-select: none;
}
.sn-toolbar-btn:hover {
  background: #fffbe6;
  border: 1px solid #c0bfa7;
}
.sn-toolbar-sep {
  width: 1px; height: 16px;
  background: #aca899;
  margin: 0 3px;
}
.sn-search-row {
  display: flex; align-items: center; gap: 6px;
  background: #f4f1e6;
  border-bottom: 1px solid #aca899;
  padding: 5px 8px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
}
.sn-search-row label { color: #000; }
.sn-search-input {
  flex: 1;
  padding: 2px 4px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  border: 1px solid #7f9db9;
  background: #fff;
  color: #000;
  outline: none;
}
.sn-search-input:focus { border-color: #316ac5; }
.sn-search-count {
  font-size: 10px; color: #606060;
  font-family: Tahoma, sans-serif;
  white-space: nowrap;
}
.sn-page {
  flex: 1;
  background: #fff;
  margin: 12px;
  padding: 48px 64px;
  border: 1px solid #aca899;
  box-shadow: 0 0 0 1px #fff inset, 1px 1px 4px rgba(0,0,0,0.18);
  font-family: Verdana, Tahoma, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: #000;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  min-height: 400px;
}
.sn-section-header {
  font-family: Verdana, Tahoma, sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: #000;
  border-bottom: 1px solid #888;
  padding-bottom: 3px;
  margin: 28px 0 14px;
  letter-spacing: 0.5px;
}
.sn-section-header:first-child { margin-top: 0; }
.sn-entry {
  margin: 16px 0 22px;
}
.sn-entry-heading {
  font-family: Verdana, Tahoma, sans-serif;
  font-weight: bold;
  font-size: 13px;
  letter-spacing: 1px;
  margin-right: 6px;
}
.sn-entry-body {
  white-space: pre-wrap;
  font-family: Verdana, Tahoma, sans-serif;
  font-size: 13px;
  color: #000;
}
.sn-code {
  display: block;
  background: #f0f0ec;
  border: 1px solid #c8c4b4;
  padding: 8px 10px;
  margin: 6px 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre;
  overflow-x: auto;
  color: #1a1a1a;
}
.sn-inline {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  background: transparent;
  color: #1a1a1a;
  padding: 0 1px;
}
.sn-empty {
  font-style: italic;
  color: #606060;
  text-align: center;
  margin-top: 80px;
}
.sn-statusbar {
  background: #ece9d8;
  border-top: 1px solid #aca899;
  padding: 2px 8px;
  font-family: Tahoma, sans-serif;
  font-size: 10px;
  color: #404040;
  display: flex; gap: 12px;
}
@media (max-width: 700px) {
  .sn-page { padding: 28px 24px; margin: 6px; }
  .sn-shell { max-width: 100%; }
}
`;

  // ===========================================================================
  // SECTION ORDERING
  // ===========================================================================
  const SECTION_ORDER = [
    'basics',
    'collections',
    'control_flow',
    'functions',
    'files_and_data',
    'misc_late_game'
  ];
  const SECTION_LABELS = {
    basics: 'BASICS',
    collections: 'COLLECTIONS',
    control_flow: 'CONTROL FLOW',
    functions: 'FUNCTIONS',
    files_and_data: 'FILES & DATA',
    misc_late_game: 'MISC & LATE GAME'
  };

  // ===========================================================================
  // ENTRIES — populated below. order within a section follows array order.
  // ===========================================================================
  const ENTRIES = [
    // ============ BASICS (ch1) ============
    {
      concept: "variables",
      section: "basics",
      chapter_unlocked: 1,
      content: `a variable is a name for a thing.
you write \`name = "wren"\` and now \`name\` means "wren" until you change it.
the equals sign is NOT like math equals. it's more like. an arrow. left side gets the right side.

\`\`\`
my_age = 17
her_name = "tegan"
year = 2004
\`\`\`

variables can hold anything. numbers, words, lists, whole other things.
you can change what's inside them later. that's the whole point. they vary. that's why they're called variables.`
    },
    {
      concept: "strings",
      section: "basics",
      chapter_unlocked: 1,
      content: `a string is text. words. letters. anything in quotes.

\`\`\`
"hello"
"her name is wren halloway"
"i don't know what i'm doing"
\`\`\`

quotes can be single \`'\` or double \`"\`, doesn't matter, just be consistent.

things you can do with strings:
- glue them together with \`+\`
  - \`"camp" + "fire"\` → \`"campfire"\`
  - leave a space if you want one: \`"camp" + " " + "fire"\` → \`"camp fire"\`
- find their length with \`len()\`
  - \`len("tegan")\` → \`5\`
- get one letter at a time with \`[0]\`, \`[1]\`, etc. starts at zero. ALWAYS.

note to self: if you forget the closing quote python freaks out. it'll yell at you. it has yelled at me many times.`
    },
    {
      concept: "numbers",
      section: "basics",
      chapter_unlocked: 1,
      content: `two kinds that matter:
- whole numbers: \`1\`, \`42\`, \`2004\`. these are called integers.
- numbers with decimals: \`3.14\`, \`0.5\`, \`19.5\`. these are called floats. (no idea why floats. they don't float.)

you can do regular math with them.

\`\`\`
2 + 2     # 4
10 - 7    # 3
3 * 4     # 12
10 / 3    # 3.333...
10 // 3   # 3 (no remainder. just the whole part.)
10 % 3    # 1 (just the remainder. no whole part.)
\`\`\`

last two are weird at first. \`//\` chops off the decimal. \`%\` (called modulo) gives you what's left over after dividing. apparently it's useful?? we'll see.`
    },
    {
      concept: "print",
      section: "basics",
      chapter_unlocked: 1,
      content: `\`print()\` shows you what's inside.
without it the computer just. does the thing silently. you'd never know.

\`\`\`
print("hello")
# shows: hello

name = "tegan"
print(name)
# shows: tegan

print("her name is", name)
# shows: her name is tegan
\`\`\`

put commas between things and print puts spaces between them automatically.

i use print constantly to check if my code is working. like a flashlight. point it at the variable and see what's actually in there.`
    },
    {
      concept: "comments",
      section: "basics",
      chapter_unlocked: 1,
      content: `anything after a \`#\` is a comment. python ignores it. you write comments for YOU.

\`\`\`
# this is a note to myself
year = 2004  # the year everything happened
\`\`\`

tegan's notes in her code are mostly comments. that's how i know what she was doing.

i should write more comments. future me will not remember why i did things.`
    },
    {
      concept: "f-strings",
      section: "basics",
      chapter_unlocked: 1,
      content: `a way to put variables INSIDE a string without all the \`+\` mess.
put an \`f\` before the quote, then use \`{curly braces}\` around the variable name.

\`\`\`
name = "tegan"
age = 17

# the old way:
print("her name is " + name + " and she is " + str(age))

# the f-string way:
print(f"her name is {name} and she is {age}")
\`\`\`

both print the same thing. f-strings are SO much easier. i don't know why anyone would use the other way once they know about these.

note: \`str(age)\` in the old version is because you can't \`+\` a number with a string directly. python doesn't know what you mean. f-strings handle it for you. another reason they're better.`
    }
    ,

    // ============ COLLECTIONS (ch2-3) ============
    {
      concept: "lists",
      section: "collections",
      chapter_unlocked: 2,
      content: `a list is a collection of things in order.
square brackets, items separated by commas.

\`\`\`
campers = ["camille", "laila", "jenny", "marcus"]
numbers = [1, 2, 3, 4, 5]
mixed = ["tegan", 17, "missing"]
\`\`\`

yes you can mix types in one list. python doesn't care. (this is wild to me. some languages would scream.)

things you can do:
- get one item: \`campers[0]\` → \`"camille"\` (zero-indexed. always.)
- get the last item: \`campers[-1]\` → \`"marcus"\` (negative indices count from the end. cute.)
- add to the end: \`campers.append("wren")\`
- remove an item: \`campers.remove("laila")\`
- count items: \`len(campers)\` → \`4\`
- check if something is in the list: \`"camille" in campers\` → \`True\`

lists are how i keep track of things. counsellors at the camp. names i'm watching. emails i still need to read.`
    },
    {
      concept: "list comprehensions",
      section: "collections",
      chapter_unlocked: 2,
      content: `this is the thing where you make a new list from an old list in ONE LINE.
i did not understand these for a while. i'm still not 100%. here's what i've got:

normal way (with a for loop):
\`\`\`
names = ["camille", "laila", "jenny"]
upper_names = []
for n in names:
    upper_names.append(n.upper())
# upper_names is now ["CAMILLE", "LAILA", "JENNY"]
\`\`\`

list comprehension way:
\`\`\`
names = ["camille", "laila", "jenny"]
upper_names = [n.upper() for n in names]
# same result. one line.
\`\`\`

the structure is: \`[do_something_with_x for x in some_list]\`

you can also filter:
\`\`\`
short_names = [n for n in names if len(n) < 6]
# only keeps names with fewer than 6 letters
\`\`\`

reads almost like english if you squint. "the upper version of n, for every n in names." or "n, for every n in names, if n has fewer than 6 letters."

i use these constantly now. they feel like cheating.`
    },
    {
      concept: "sets",
      section: "collections",
      chapter_unlocked: 2,
      content: `a set is like a list but:
1. no duplicates allowed
2. no order
3. curly braces instead of square: \`{1, 2, 3}\`

\`\`\`
counsellors_2003 = {"melissa", "wren", "briar"}
counsellors_2004 = {"wren", "briar", "hattie"}
\`\`\`

the magic of sets is the math you can do with them:

\`\`\`
# who was there both years?
both = counsellors_2003 & counsellors_2004
# {"wren", "briar"}

# who was there in 2003 but NOT 2004?
only_2003 = counsellors_2003 - counsellors_2004
# {"melissa"}

# everyone from either year?
all_counsellors = counsellors_2003 | counsellors_2004
# {"melissa", "wren", "briar", "hattie"}
\`\`\`

\`&\` means "in both." \`-\` means "in this one but not the other." \`|\` means "in either."

this is how i found melissa. she was in 2003 and not 2004. set difference. one line.`
    },
    {
      concept: "dictionaries (dicts)",
      section: "collections",
      chapter_unlocked: 3,
      content: `a dict is like a list but instead of getting things by position (\`[0]\`, \`[1]\`), you get them by NAME.

\`\`\`
camper = {
    "name": "camille",
    "age": 16,
    "cabin": "pinewood",
    "year": 2004
}
\`\`\`

each entry has a KEY (left of the colon) and a VALUE (right of the colon).
get values by key: \`camper["name"]\` → \`"camille"\`

things you can do:
- add a new entry: \`camper["status"] = "pulled out aug 16"\`
- change one: \`camper["age"] = 17\`
- remove one: \`del camper["year"]\`
- get all keys: \`camper.keys()\`
- get all values: \`camper.values()\`
- check if a key exists: \`"name" in camper\` → \`True\`

i think of dicts as little file folders. the key is the label on the folder. the value is what's inside.

useful when you have lots of info ABOUT one thing, instead of lots of separate things.`
    },
    {
      concept: "tuples",
      section: "collections",
      chapter_unlocked: 3,
      content: `basically a list but with parentheses and you can't change it after you make it.

\`\`\`
coordinates = (49.84, -116.84)
date = (2004, 8, 14)
\`\`\`

once you make a tuple it's locked. you can read from it but not change it.

i mostly see these in places where the order matters and you don't want to accidentally mess it up. like a date. you don't want to "append" a 5th thing to a date. dates have a fixed shape.

(also: functions can return tuples. more on that later.)`
    },
    {
      concept: "indexing and slicing",
      section: "collections",
      chapter_unlocked: 3,
      content: `how to grab pieces of a list or string.

\`\`\`
names = ["camille", "laila", "jenny", "marcus", "wren"]

names[0]        # "camille"          (first)
names[-1]       # "wren"             (last)
names[1:3]      # ["laila", "jenny"]   (from index 1 up to but NOT including 3)
names[:2]       # ["camille", "laila"] (everything from start to index 2)
names[2:]       # ["jenny", "marcus", "wren"]  (from index 2 to end)
\`\`\`

slicing is \`[start:end]\`. the end is NOT included. i forget this every time. EVERY TIME.

works on strings too:
\`\`\`
name = "halloway"
name[0]      # "h"
name[0:4]    # "hall"
name[-3:]    # "way"
\`\`\``
    }
    ,

    // ============ CONTROL FLOW (ch2-4) ============
    {
      concept: "if / elif / else",
      section: "control_flow",
      chapter_unlocked: 2,
      content: `how to make python do different things based on what's true.

\`\`\`
age = 17

if age >= 18:
    print("adult")
elif age >= 13:
    print("teenager")
else:
    print("kid")
\`\`\`

structure:
- \`if\` checks something. if it's true, run that block.
- \`elif\` (else-if) checks the next thing if the first wasn't true.
- \`else\` runs if NOTHING above was true.

you can have as many \`elif\`s as you want. or none. \`else\` is also optional.

the colon at the end matters. so does the indentation. python uses indentation to know what's "inside" the if. i forgot this once and spent twenty minutes confused.

things you can check:
- \`==\` (equal to) — note: TWO equals signs. one equals sign assigns, two equals checks.
- \`!=\` (not equal)
- \`<\`, \`>\`, \`<=\`, \`>=\`
- \`in\` (is this thing inside that thing)
- \`and\`, \`or\`, \`not\` (combine checks)

\`\`\`
if name == "wren" and year == 2004:
    print("counsellor that summer")
\`\`\``
    },
    {
      concept: "for loops",
      section: "control_flow",
      chapter_unlocked: 2,
      content: `how to do something for every item in a list (or string, or set, or dict, or whatever).

\`\`\`
campers = ["camille", "laila", "jenny"]

for c in campers:
    print(c)
# prints camille, then laila, then jenny
\`\`\`

structure: \`for [variable_name] in [thing_to_loop_over]:\`

the variable name (i used \`c\` here) is whatever you want. it gets assigned to each item one at a time.

you can loop over a range of numbers with \`range()\`:
\`\`\`
for i in range(5):
    print(i)
# prints 0, 1, 2, 3, 4

for i in range(1, 6):
    print(i)
# prints 1, 2, 3, 4, 5
\`\`\`

range goes up to but NOT including the end number. same logic as slicing. python is consistent about this even when it's annoying.`
    },
    {
      concept: "while loops",
      section: "control_flow",
      chapter_unlocked: 3,
      content: `keep doing something AS LONG AS something is true.

\`\`\`
count = 0
while count < 5:
    print(count)
    count = count + 1
# prints 0, 1, 2, 3, 4
\`\`\`

the danger: if the condition never becomes false, the loop never stops. infinite loop. i did this once and had to force-quit. python just sits there forever, very calmly, doing the same thing.

i use \`for\` loops way more than \`while\`. for loops are for "do this for every thing." while loops are for "keep going until something changes."`
    },
    {
      concept: "break and continue",
      section: "control_flow",
      chapter_unlocked: 3,
      content: `two ways to mess with loops mid-flow.

\`break\` stops the whole loop early.
\`\`\`
for n in [1, 2, 3, 4, 5]:
    if n == 3:
        break
    print(n)
# prints 1, 2 — then stops
\`\`\`

\`continue\` skips the rest of THIS iteration and goes to the next one.
\`\`\`
for n in [1, 2, 3, 4, 5]:
    if n == 3:
        continue
    print(n)
# prints 1, 2, 4, 5 — skips 3
\`\`\`

useful when you're searching for something and want to bail early once you find it. (i used break a lot when searching emails. once i found the thing, no point reading the rest.)`
    },
    {
      concept: "truthiness",
      section: "control_flow",
      chapter_unlocked: 4,
      content: `python considers some values "falsy" — they count as false even though they're not literally \`False\`.

falsy stuff:
- \`False\`
- \`None\`
- \`0\`
- \`""\` (empty string)
- \`[]\` (empty list)
- \`{}\` (empty dict/set)

everything else is "truthy."

so you can write:
\`\`\`
names = []
if names:
    print("we have names")
else:
    print("list is empty")
# prints "list is empty" — because [] is falsy
\`\`\`

instead of:
\`\`\`
if len(names) > 0:
    ...
\`\`\`

shorter. reads better once you're used to it.`
    }
    ,

    // ============ FUNCTIONS (ch4-5) ============
    {
      concept: "functions",
      section: "functions",
      chapter_unlocked: 4,
      content: `a function is a block of code you can run again and again by calling its name.

\`\`\`
def greet(name):
    print(f"hello, {name}")

greet("camille")
# prints "hello, camille"
greet("hattie")
# prints "hello, hattie"
\`\`\`

structure:
- \`def\` (short for "define") starts the function.
- the name comes next. (you make this up.)
- \`()\` holds the inputs (called PARAMETERS).
- \`:\` ends the line.
- the indented block is the function body. that's what runs when you call it.

you call the function by writing its name with \`()\` and putting in the inputs.

functions are how you stop writing the same code five times. write it once, give it a name, call it whenever.`
    },
    {
      concept: "return values",
      section: "functions",
      chapter_unlocked: 4,
      content: `a function can \`return\` something — meaning, it hands a value back to whoever called it.

\`\`\`
def double(n):
    return n * 2

result = double(5)
print(result)
# 10
\`\`\`

WITHOUT return, the function does its thing but doesn't give you anything back:
\`\`\`
def double_print(n):
    print(n * 2)

result = double_print(5)
# prints 10, but result is None
\`\`\`

\`None\` is python's way of saying "nothing here." functions that don't return anything return \`None\` automatically.

once \`return\` runs, the function STOPS. anything after it doesn't happen.

\`\`\`
def check(n):
    if n < 0:
        return "negative"
    return "positive or zero"
\`\`\``
    },
    {
      concept: "arguments and parameters",
      section: "functions",
      chapter_unlocked: 5,
      content: `these two words sound the same but they mean different things and i had to look this up several times:

- PARAMETERS are what the function expects. (in the definition.)
- ARGUMENTS are what you actually give it. (in the call.)

\`\`\`
def greet(name):     # name is a parameter
    print(f"hello, {name}")

greet("camille")     # "camille" is the argument
\`\`\`

functions can take multiple:
\`\`\`
def introduce(name, age):
    print(f"this is {name}, age {age}")

introduce("tegan", 17)
\`\`\`

you can also give parameters DEFAULT values. then the argument is optional:
\`\`\`
def greet(name, greeting="hello"):
    print(f"{greeting}, {name}")

greet("camille")              # "hello, camille"
greet("camille", "hi")        # "hi, camille"
\`\`\``
    },
    {
      concept: "scope",
      section: "functions",
      chapter_unlocked: 5,
      content: `variables made INSIDE a function only exist inside that function. they vanish when the function ends.

\`\`\`
def do_thing():
    x = 5
    print(x)

do_thing()
# prints 5
print(x)
# ERROR. x doesn't exist out here.
\`\`\`

this is a feature, not a bug. it means functions don't accidentally mess with each other's stuff.

if you need a function to USE a variable from outside, pass it in as an argument.
if you need a function to GIVE you something, use return.

(this took me a while. i kept trying to use variables across functions and python kept yelling at me.)`
    }
    ,

    // ============ FILES & DATA (ch6) ============
    {
      concept: "opening files",
      section: "files_and_data",
      chapter_unlocked: 6,
      content: `how to read what's in a file from your code.

\`\`\`
with open("emails.txt") as f:
    contents = f.read()
print(contents)
\`\`\`

structure:
- \`open()\` opens the file.
- \`with ... as f:\` is a way to say "use this file as \`f\` for now, and close it automatically when we're done."
- \`f.read()\` gets everything in the file as one big string.

the \`with\` part is important. without it you have to remember to close the file yourself, and if you forget, python gets weird. \`with\` handles closing for you. just always use \`with\`.`
    },
    {
      concept: "reading line by line",
      section: "files_and_data",
      chapter_unlocked: 6,
      content: `if a file has lots of lines and you want to handle them one at a time:

\`\`\`
with open("emails.txt") as f:
    for line in f:
        print(line)
\`\`\`

each \`line\` is one line of the file (with the newline character at the end). you can do whatever you want with each one inside the loop.

if you want all the lines as a list instead:
\`\`\`
with open("emails.txt") as f:
    lines = f.readlines()
# lines is a list of strings, one per line
\`\`\``
    },
    {
      concept: "split and join",
      section: "files_and_data",
      chapter_unlocked: 6,
      content: `\`.split()\` chops a string into a list. by default it splits on whitespace.

\`\`\`
sentence = "her name is wren halloway"
words = sentence.split()
# ["her", "name", "is", "wren", "halloway"]
\`\`\`

you can split on something specific:
\`\`\`
emails = "tegan_a87@hotmail.com,wren.halloway@camppinecrest.ca,marcia.deveraux@camppinecrest.ca"
addresses = emails.split(",")
# ["tegan_a87@hotmail.com", "wren.halloway@camppinecrest.ca", "marcia.deveraux@camppinecrest.ca"]
\`\`\`

\`.join()\` is the opposite. glues a list of strings into one string.
\`\`\`
words = ["her", "name", "is"]
sentence = " ".join(words)
# "her name is"
\`\`\`

the string you call \`.join()\` on (here, \`" "\`) is the GLUE that goes between items. could be \`","\` or \`" - "\` or anything.

i use these two constantly when parsing data.`
    },
    {
      concept: "strip",
      section: "files_and_data",
      chapter_unlocked: 6,
      content: `\`.strip()\` removes whitespace from the start and end of a string.

\`\`\`
messy = "   hello   \\n"
clean = messy.strip()
# "hello"
\`\`\`

useful when reading file lines, because each line has a \`\\n\` (newline) at the end. \`.strip()\` cleans that off.

variants:
- \`.lstrip()\` only strips from the left
- \`.rstrip()\` only strips from the right
- \`.strip("x")\` strips a specific character instead of whitespace`
    }
    ,

    // ============ MISC & LATE GAME (ch7-8) ============
    {
      concept: "the random module",
      section: "misc_late_game",
      chapter_unlocked: 7,
      content: `\`random\` is a built-in module that does random stuff. you have to \`import\` it first.

\`\`\`
import random

random.randint(1, 6)        # random whole number from 1 to 6 (like a die)
random.choice(["a", "b", "c"])  # picks one item randomly
random.shuffle(my_list)     # shuffles a list IN PLACE (changes the original)
\`\`\`

useful for games, simulations, picking things, or pretending to be a die.

note: random isn't TRULY random — it's pseudorandom, based on a seed. for our purposes that's fine. (apparently for cryptography it isn't fine, but i'm not doing cryptography.)`
    },
    {
      concept: "importing",
      section: "misc_late_game",
      chapter_unlocked: 7,
      content: `\`import\` brings in code that someone else wrote. python comes with TONS of built-in modules.

\`\`\`
import random         # for random stuff
import datetime       # for dates and times
import os             # for working with files and folders
\`\`\`

once imported, you use stuff inside the module with a dot:
\`\`\`
random.randint(1, 6)
datetime.date.today()
\`\`\`

you can also import just one specific thing:
\`\`\`
from random import randint
randint(1, 6)   # don't need the random. prefix anymore
\`\`\`

i mostly use \`import x\` because then i remember where things came from.`
    },
    {
      concept: "try / except",
      section: "misc_late_game",
      chapter_unlocked: 7,
      content: `a way to handle errors without crashing.

\`\`\`
try:
    age = int(input("how old are you? "))
    print(f"you are {age}")
except ValueError:
    print("that wasn't a number")
\`\`\`

structure:
- \`try:\` "try this thing"
- \`except SomeError:\` "if THIS specific error happens, do this instead"

without try/except, an error stops everything. with try/except, you catch it and decide what to do.

(this is for when you KNOW something might go wrong and you want to handle it gracefully. don't wrap your whole program in try/except. you'll hide real bugs.)`
    },
    {
      concept: "classes (briefly)",
      section: "misc_late_game",
      chapter_unlocked: 8,
      content: `i don't use these much yet but tegan's notes have them so here goes.

a class is a blueprint for making things that have data AND behavior bundled together.

\`\`\`
class Camper:
    def __init__(self, name, age, cabin):
        self.name = name
        self.age = age
        self.cabin = cabin

    def introduce(self):
        print(f"i'm {self.name}, age {self.age}")

camille = Camper("camille", 16, "pinewood")
camille.introduce()
# "i'm camille, age 16"
\`\`\`

stuff to know:
- \`__init__\` is a special function that runs when you make a new one. (those are double underscores. four total. weird.)
- \`self\` is how the class refers to itself. every method takes \`self\` as the first parameter.
- you make instances by calling the class like a function: \`Camper(...)\`.
- you access stuff with dots: \`camille.name\`, \`camille.age\`.

i think of classes as "custom dicts that can also DO things." dicts hold data; classes hold data and methods.

i'll learn more about these later probably. tegan's notes have a lot.`
    },
    {
      concept: "regular expressions (regex)",
      section: "misc_late_game",
      chapter_unlocked: 8,
      content: `a way to find patterns in text. powerful and confusing.

\`\`\`
import re

text = "tegan was born 1987"
match = re.search(r"\\d{4}", text)
if match:
    print(match.group())
# "1987"
\`\`\`

\`r"\\d{4}"\` is the pattern. it means "four digits in a row."

some pattern pieces:
- \`\\d\` — any digit
- \`\\w\` — any letter, digit, or underscore
- \`\\s\` — any whitespace
- \`.\` — any character (one)
- \`*\` — zero or more of the previous thing
- \`+\` — one or more
- \`{4}\` — exactly 4

regex is its own little language. people write whole books on it. for now i mostly just need to find years (\`\\d{4}\`) and email addresses and that's it.

useful: regex101.com lets you test patterns in your browser before putting them in code. saved me many times.`
    }
  ]; // END_ENTRIES

  // ===========================================================================
  // RENDER HELPERS
  // ===========================================================================
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[c];
    });
  }

  // Convert content text into HTML:
  //   triple-backtick blocks -> <pre class="sn-code">
  //   single-backtick spans  -> <code class="sn-inline">
  //   linebreaks preserved   -> via white-space: pre-wrap on the body wrapper
  function renderContent(text) {
    const parts = String(text).split(/```([\s\S]*?)```/);
    let html = '';
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // code block
        const code = parts[i].replace(/^\n+/, '').replace(/\n+$/, '');
        html += '<pre class="sn-code">' + escapeHtml(code) + '</pre>';
      } else {
        let safe = escapeHtml(parts[i]);
        // single-backtick inline code
        safe = safe.replace(/`([^`]+)`/g, '<code class="sn-inline">$1</code>');
        html += '<span class="sn-entry-body">' + safe + '</span>';
      }
    }
    return html;
  }

  function progress() {
    try {
      return parseInt(localStorage.getItem(PROGRESS_KEY) || '0', 10);
    } catch (e) { return 0; }
  }

  function isUnlocked() { return progress() >= 1; }

  function getVisibleEntries(filter) {
    const maxCh = progress();
    const f = (filter || '').trim().toLowerCase();
    return ENTRIES.filter(function(e) {
      if (e.chapter_unlocked > maxCh) return false;
      if (!f) return true;
      const inConcept = e.concept.toLowerCase().indexOf(f) !== -1;
      const inContent = e.content.toLowerCase().indexOf(f) !== -1;
      return inConcept || inContent;
    });
  }

  function groupBySection(entries) {
    const groups = {};
    entries.forEach(function(e) {
      if (!groups[e.section]) groups[e.section] = [];
      groups[e.section].push(e);
    });
    // within a section, sort by chapter_unlocked then by original index
    SECTION_ORDER.forEach(function(s) {
      if (!groups[s]) return;
      groups[s].sort(function(a, b) {
        if (a.chapter_unlocked !== b.chapter_unlocked) {
          return a.chapter_unlocked - b.chapter_unlocked;
        }
        return ENTRIES.indexOf(a) - ENTRIES.indexOf(b);
      });
    });
    return groups;
  }

  function renderEntries(filter) {
    const page = document.getElementById('sn-page');
    if (!page) return;
    const visible = getVisibleEntries(filter);
    const total = ENTRIES.filter(function(e) { return e.chapter_unlocked <= progress(); }).length;

    const countEl = document.getElementById('sn-count');
    if (countEl) {
      if (filter && filter.trim()) {
        countEl.textContent = visible.length + ' of ' + total + ' entries';
      } else {
        countEl.textContent = total + ' entries';
      }
    }

    if (visible.length === 0) {
      page.innerHTML = '<div class="sn-empty">' +
        (filter && filter.trim()
          ? 'no entries match "' + escapeHtml(filter.trim()) + '"'
          : 'no entries unlocked yet') +
        '</div>';
      return;
    }

    const groups = groupBySection(visible);
    let html = '';
    SECTION_ORDER.forEach(function(s) {
      const entries = groups[s];
      if (!entries || entries.length === 0) return;
      html += '<h2 class="sn-section-header">' + escapeHtml(SECTION_LABELS[s] || s) + '</h2>';
      entries.forEach(function(e) {
        html += '<div class="sn-entry" tabindex="0">';
        html += '<span class="sn-entry-heading">' + escapeHtml(e.concept.toUpperCase()) + '</span>';
        html += renderContent(e.content);
        html += '</div>';
      });
    });
    page.innerHTML = html;
  }

  // ===========================================================================
  // CSS + MODAL INJECTION
  // ===========================================================================
  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    const style = document.createElement('style');
    style.id = 'sn-style';
    style.textContent = CSS;
    document.head.appendChild(style);
    cssInjected = true;
  }

  let modalInjected = false;
  function injectModal() {
    if (modalInjected) return;
    const overlay = document.createElement('div');
    overlay.id = 'sn-overlay';
    overlay.className = 'sn-overlay';
    overlay.innerHTML =
      '<div class="sn-shell" role="dialog" aria-label="study_notes.docx">' +
        '<div class="sn-titlebar">' +
          '<span><span class="sn-titlebar-icon"></span>study_notes.docx - Microsoft Word</span>' +
          '<div class="sn-titlebar-buttons">' +
            '<button class="sn-titlebar-btn" tabindex="-1" aria-hidden="true">_</button>' +
            '<button class="sn-titlebar-btn" tabindex="-1" aria-hidden="true">□</button>' +
            '<button class="sn-titlebar-btn sn-close" id="sn-close" aria-label="close">×</button>' +
          '</div>' +
        '</div>' +
        '<div class="sn-menubar">' +
          '<span class="sn-menubar-item"><u>F</u>ile</span>' +
          '<span class="sn-menubar-item"><u>E</u>dit</span>' +
          '<span class="sn-menubar-item"><u>V</u>iew</span>' +
          '<span class="sn-menubar-item"><u>I</u>nsert</span>' +
        '</div>' +
        '<div class="sn-toolbar">' +
          '<span class="sn-toolbar-btn" title="New">D</span>' +
          '<span class="sn-toolbar-btn" title="Open">📂</span>' +
          '<span class="sn-toolbar-btn" title="Save">💾</span>' +
          '<span class="sn-toolbar-sep"></span>' +
          '<span class="sn-toolbar-btn" title="Cut">✂</span>' +
          '<span class="sn-toolbar-btn" title="Copy">⧉</span>' +
          '<span class="sn-toolbar-btn" title="Paste">📋</span>' +
          '<span class="sn-toolbar-sep"></span>' +
          '<span class="sn-toolbar-btn" title="Undo">↶</span>' +
          '<span class="sn-toolbar-btn" title="Redo">↷</span>' +
        '</div>' +
        '<div class="sn-search-row">' +
          '<label for="sn-search">Find:</label>' +
          '<input id="sn-search" class="sn-search-input" type="text" placeholder="search entries..." autocomplete="off" spellcheck="false">' +
          '<span id="sn-count" class="sn-search-count"></span>' +
        '</div>' +
        '<div id="sn-page" class="sn-page" tabindex="0" aria-label="document"></div>' +
        '<div class="sn-statusbar">' +
          '<span>Page 1</span>' +
          '<span>Sec 1</span>' +
          '<span>1/1</span>' +
          '<span style="margin-left:auto;">English (Canada)</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('sn-close').addEventListener('click', close);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });
    const search = document.getElementById('sn-search');
    search.addEventListener('input', function() {
      renderEntries(search.value);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('sn-open')) {
        close();
      }
    });

    modalInjected = true;
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================
  function open() {
    injectCSS();
    injectModal();
    renderEntries('');
    const overlay = document.getElementById('sn-overlay');
    overlay.classList.add('sn-open');
    setTimeout(function() {
      const search = document.getElementById('sn-search');
      if (search) search.focus();
    }, 30);
  }

  function close() {
    const overlay = document.getElementById('sn-overlay');
    if (overlay) overlay.classList.remove('sn-open');
  }

  function refreshIcon() {
    const el = document.getElementById('icon-study-notes');
    if (!el) return;
    el.style.display = isUnlocked() ? '' : 'none';
  }

  const StudyNotes = {
    open: open,
    close: close,
    refreshIcon: refreshIcon,
    isUnlocked: isUnlocked,
    progress: progress,
    ENTRIES: ENTRIES
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshIcon);
  } else {
    refreshIcon();
  }

  window.StudyNotes = StudyNotes;
})();
