# tegan ashby :: python practice :: jun 27 2004
# ===========================================
# slicing: getting a CHUNK out of a list or string
#
# you've seen [0] and [-1] for grabbing one item. slicing
# uses [a:b] to grab a RANGE. it works on lists AND strings
# (and other things) — same syntax everywhere.
#
# the rule: list[a:b] gives you items from index a UP TO
# but NOT INCLUDING index b. so list[0:3] gives you items
# 0, 1, 2 (three items, indexes 0 through 2).
#
# why "not including b"? so list[0:3] + list[3:6] = list[0:6]
# without overlap or gap. it's a math thing. you get used
# to it.


# ---- exercise 1: basic list slicing ----
# given this list of all silmarillion books in publication
# order:

silm_sections = [
    "Ainulindalë",
    "Valaquenta",
    "Quenta Silmarillion",
    "Akallabêth",
    "Of the Rings of Power and the Third Age",
]

# print the first 3 sections (indexes 0, 1, 2) using slicing.
# expected:
#   ['Ainulindalë', 'Valaquenta', 'Quenta Silmarillion']

# ---- ANSWER ----
# print(silm_sections[0:3])
#
# // [0:3] means "from index 0 up to but not including 3."
# // you can also write [:3] which is shorthand for "from
# // the start up to 3" — python assumes the start is 0
# // if you leave it out.


# ---- exercise 2: slicing from the end ----
# you can use negative numbers in slices too. list[-2:]
# gives you the last 2 items. list[:-2] gives you everything
# EXCEPT the last 2 items.
#
# given:

camp_packing = [
    "tegan & sara t-shirt",
    "MCR hoodie",
    "the silmarillion (paperback)",
    "headphones",
    "discman",
    "notebook",
    "diary",
]

# print the last 3 items using a negative slice
# expected:
#   ['discman', 'notebook', 'diary']

# ---- ANSWER ----
# print(camp_packing[-3:])
#
# // [-3:] means "from index -3 to the end." -3 from the end
# // is the third-to-last item. so this gives you the last
# // three.
# //
# // (i'm packing for camp tomorrow. trying not to think about
# // it. the silmarillion paperback is going.)


# ---- exercise 3: slicing strings ----
# strings work the same way. each character is at an index,
# and you can slice ranges of characters.
#
# given:
#   date_string = "2004-06-27"
# extract:
#   - just the year (first 4 characters): "2004"
#   - just the month (characters 5 and 6): "06"
#   - just the day (last 2 characters): "27"
# print all three on separate lines.

date_string = "2004-06-27"

# ---- ANSWER ----
# print(date_string[0:4])    # "2004"
# print(date_string[5:7])    # "06"
# print(date_string[-2:])    # "27" (or [8:10])
#
# // notice how [5:7] gets characters at index 5 and 6 (the
# // two month digits), NOT including 7 (the dash before 27).
# // up-to-but-not-including. you have to internalize this.
# //
# // the year part [0:4] could also be written [:4]. both
# // mean the same thing.
# //
# // there's also a third number for "step" — [::2] gives
# // you every other character. [::-1] reverses a string.
# // but i don't need those yet, just noting them so future
# // me knows they exist.


# ===========================================
# notes:
# - [a:b] = from a UP TO but NOT INCLUDING b
# - [:b] = from start to b (a defaults to 0)
# - [a:] = from a to end (b defaults to len)
# - [:] = the whole thing (makes a copy)
# - negative indexes count from the end
# - works on lists, strings, and tuples (and other
#   sequence types) — same syntax everywhere
# - SLICES MAKE COPIES. modifying the slice doesn't
#   modify the original. this is occasionally important.
