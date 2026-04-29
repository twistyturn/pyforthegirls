# tegan ashby :: python practice :: jun 2 2004
# ===========================================
# filters and list comprehensions
#
# manual filter pattern: start with empty list, loop
# through, if condition, append to the new list. it's
# the bag pattern but for lists.
#
# THEN list comprehensions: same thing but in one line.
# the book says to learn both because comprehensions are
# nicer but you should understand the for-loop version
# first so you know what's actually happening.


# ---- exercise 1: manual filter (the long way) ----
# from this list of all the silmarillion fics i've read,
# filter to just the Maedhros/Fingon ones

all_fics = [
    {"title": "Of Stars and Silver Light", "ship": "Maedhros/Fingon"},
    {"title": "Daughter of Twilight", "ship": "Lúthien/Beren"},
    {"title": "The Burning of the Ships", "ship": "Maedhros/Fingon"},
    {"title": "Two Trees", "ship": "Galadriel/Celeborn"},
    {"title": "The Silver Crown", "ship": "Finrod/Amarië"},
    {"title": "Steel and Star", "ship": "Maedhros/Fingon"},
    {"title": "The Long Defeat", "ship": "Galadriel/Celeborn"},
]

# build a new list called maedhros_fingon containing only
# the dicts where ship is "Maedhros/Fingon".
# then print how many there are.
# expected count: 3

# ---- ANSWER ----
# maedhros_fingon = []
# for fic in all_fics:
#     if fic["ship"] == "Maedhros/Fingon":
#         maedhros_fingon.append(fic)
# print(len(maedhros_fingon))
#
# // the bag pattern again. start empty, loop, if-condition,
# // .append() to grow the bag. .append() adds an item to
# // the end of a list (instead of having to do
# // list = list + [item] every time, which works but is
# // ugly).


# ---- exercise 2: same filter, list comprehension version ----
# rewrite exercise 1 as a single-line list comprehension.
# the syntax is:
#     new_list = [item for item in old_list if condition]
#
# read it as: "the new list is each item from the old list,
# IF the condition is true."

# ---- ANSWER ----
# maedhros_fingon = [fic for fic in all_fics if fic["ship"] == "Maedhros/Fingon"]
# print(len(maedhros_fingon))
#
# // SAME RESULT. one line. once you see it you can read
# // the for-loop version and just go "oh that's a
# // comprehension waiting to happen."
# //
# // the rule: any time you have
# //     new_list = []
# //     for x in old_list:
# //         if condition:
# //             new_list.append(x)
# // you can write it as
# //     new_list = [x for x in old_list if condition]
# //
# // the order is weird at first — the thing you want goes
# // FIRST (before the for), even though execution-wise it
# // happens last. the book says read it as "give me x for
# // each x in the list, if the condition holds."


# ---- exercise 3: comprehension with a transformation ----
# from this list of song titles, build a new list of just
# the titles in lowercase. don't filter — keep all of them.

bullets_tracklist = [
    "Romance",
    "Vampires Will Never Hurt You",
    "Drowning Lessons",
    "Our Lady of Sorrows",
    "Headfirst for Halos",
    "Demolition Lovers",
]

# expected output (printed as a list):
# ['romance', 'vampires will never hurt you', 'drowning lessons',
#  'our lady of sorrows', 'headfirst for halos', 'demolition lovers']
#
# this comprehension has a TRANSFORMATION but no condition:
#     new_list = [transform(item) for item in old_list]
# (no `if`, so nothing gets filtered out)

# ---- ANSWER ----
# lowered = [title.lower() for title in bullets_tracklist]
# print(lowered)
#
# // .lower() is a string method that returns a new lowercase
# // copy of the string. it doesn't change the original.
# //
# // you can have BOTH a transformation AND a condition in
# // the same comprehension:
# //     [title.lower() for title in tracklist if "you" in title.lower()]
# // would lowercase ONLY the titles containing "you". the
# // transformation is applied to each item that passes the
# // filter.


# ===========================================
# notes:
# - manual filter: empty list + for + if + .append()
# - comprehension: [thing for thing in list if condition]
# - the comprehension is shorter AND faster. but the manual
#   version is sometimes clearer for complicated logic.
# - you can ALSO do dict comprehensions and set
#   comprehensions but i'll get to those later.
# - .append() modifies the list in place — it doesn't
#   return a new list. so you write `mylist.append(x)`,
#   NOT `mylist = mylist.append(x)`. the second one
#   would set mylist to None which is a great way to
#   confuse yourself for an hour. (i did this. it took
#   me an hour.)
