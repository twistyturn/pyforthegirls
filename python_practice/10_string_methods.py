# tegan ashby :: python practice :: jun 22 2004
# ===========================================
# string methods: .lower(), .strip(), .split(), .isalpha()
# and friends
#
# strings have built-in methods for cleaning them up,
# breaking them apart, and asking questions about them.
# you call them with a dot: `name.lower()`, `text.strip()`,
# etc.
#
# important: most string methods RETURN a new string,
# they don't change the original. strings in python are
# "immutable" which means once you make one, it can't
# be modified. so you write `name = name.lower()` to
# replace name with its lowercased version, NOT just
# `name.lower()` (which computes the lowercased version
# and throws it away — same problem as the password
# task).


# ---- exercise 1: .lower() and .strip() ----
# user input is messy. when someone types "  Maedhros  "
# with extra spaces and weird capitalization, you want to
# normalize it before comparing.
#
# given:
#   raw_input = "  MAEDHROS  "
# clean it: strip the whitespace, then lowercase it. the
# result should be exactly "maedhros".
# print the cleaned version.

raw_input = "  MAEDHROS  "

# ---- ANSWER ----
# raw_input = "  MAEDHROS  "
# cleaned = raw_input.strip().lower()
# print(cleaned)
#
# // you can chain methods: .strip() returns a new string,
# // and then .lower() is called on that new string. the
# // dot just keeps applying things left to right.
# //
# // also: .strip() removes whitespace from BOTH ends. if
# // you only want one side, .lstrip() and .rstrip() exist.
# // .strip() is the one i'll use 95% of the time.


# ---- exercise 2: .split() ----
# .split() breaks a string into a list. by default it splits
# on whitespace, but you can pass any character to split on.
#
# given this comma-separated list of ships:
#   ship_list = "Maedhros/Fingon, Lúthien/Beren, Galadriel/Celeborn"
# split it on the comma to get a list. then loop through
# and print each ship STRIPPED of leading/trailing whitespace.
#
# expected output:
#   Maedhros/Fingon
#   Lúthien/Beren
#   Galadriel/Celeborn

ship_list = "Maedhros/Fingon, Lúthien/Beren, Galadriel/Celeborn"

# ---- ANSWER ----
# ship_list = "Maedhros/Fingon, Lúthien/Beren, Galadriel/Celeborn"
# ships = ship_list.split(",")
# for ship in ships:
#     print(ship.strip())
#
# // the comma splits "a, b, c" into ["a", " b", " c"] —
# // notice the leading spaces on items 2 and 3 because the
# // original had ", " (comma SPACE). that's why the .strip()
# // inside the loop matters. without it you'd be printing
# // " Lúthien/Beren" (with the space).
# //
# // alternative: split(", ") with the space included would
# // also work. but stripping after is safer because real
# // data is messy and might have inconsistent spacing.


# ---- exercise 3: character methods .isalpha() and .isupper() ----
# strings have methods that ask questions about their
# contents. these return True or False.
#
# .isalpha() — True if every character is a letter (no
#   numbers, no punctuation, no spaces)
# .isupper() — True if every cased letter is uppercase
# .islower() — True if every cased letter is lowercase
# .isdigit() — True if every character is a digit
#
# (these check the WHOLE string. if you have any non-letter
# in there, .isalpha() is False.)
#
# given this list of usernames i collected from LJ comments:

usernames = [
    "glorfindel_lives",
    "ARWENFAN1987",
    "elrond_simp",
    "Maedhros4ever",
    "luthiens_dog",
    "    ",
    "",
]

# loop through and for each one print:
#   "{username}: alpha={x}, upper={y}"
# where x is whether it's all letters and y is whether it's
# all uppercase

# ---- ANSWER ----
# for username in usernames:
#     print(f"{username}: alpha={username.isalpha()}, upper={username.isupper()}")
#
# // expected:
# // glorfindel_lives: alpha=False, upper=False  (underscore isn't a letter)
# // ARWENFAN1987: alpha=False, upper=True  (digits aren't letters; everything cased is upper)
# // elrond_simp: alpha=False, upper=False
# // Maedhros4ever: alpha=False, upper=False
# // luthiens_dog: alpha=False, upper=False
# //     : alpha=False, upper=False  (spaces aren't letters)
# // : alpha=False, upper=False  (empty string — all of these
# //   methods return False for empty strings, which is its own
# //   gotcha)
# //
# // i learned the hard way that .isupper() returns False for
# // empty strings AND for strings with no cased letters at
# // all (like "1234" or "    "). so it's not just "are all
# // upper" — it's "are all the cased letters upper, AND there
# // is at least one cased letter."


# ===========================================
# notes:
# - strings are immutable. methods RETURN new strings;
#   they don't modify the original. always reassign:
#   `name = name.lower()`.
# - chain methods with dots: `text.strip().lower().replace("a", "b")`
#   reads left to right.
# - .split() default is whitespace, including tabs and
#   newlines. .split(",") splits only on commas.
# - .join() is the opposite of .split(). "x".join(["a","b","c"])
#   gives "axbxc". useful for re-combining stuff.
# - empty strings make .isalpha() etc. return False, not
#   True. think of it as "is there any letter content here?
#   no? then no."
