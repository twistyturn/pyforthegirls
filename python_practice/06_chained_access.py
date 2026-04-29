# tegan ashby :: python practice :: may 11 2004
# ===========================================
# chained access: pulling stuff out of nested data
#
# so a list can hold dictionaries. like, a list where
# each item is a dict. that's super common when you
# have records — like a list of fanfics where each fic
# has a title, ship, word count, rating, etc.
#
# to get to the data, you chain the indexes. first
# you grab the dict from the list with [number], then
# you grab the value from the dict with [key].
#
# both use square brackets but they mean different
# things. lists use NUMBERS for position. dicts use
# STRINGS (or other things) for the label.


# ---- exercise 1: get one value out of one dict ----
# here's a dict representing a fic:

fic = {
    "title": "Of Stars and Silver Light",
    "author": "glorfindel_lives",
    "ship": "Maedhros/Fingon",
    "rating": "Teen",
    "word_count": 12847,
}

# print just the title

# ---- ANSWER ----
# print(fic["title"])
#
# // wait. glorfindel_lives is a real LJ user i talk to.
# // i should not put their handle in here in case mom
# // checks. ugh whatever. she doesn't know what LJ is.


# ---- exercise 2: get a value from a list-of-dicts ----
# here's the cousin's fic rec list:

rec_list = [
    {"title": "Of Stars and Silver Light", "ship": "Maedhros/Fingon", "rating": "Teen"},
    {"title": "The Burning of the Ships", "ship": "Maedhros/Fingon", "rating": "Mature"},
    {"title": "Daughter of Twilight", "ship": "Lúthien/Beren", "rating": "Gen"},
    {"title": "Two Trees", "ship": "Galadriel/Celeborn", "rating": "Teen"},
    {"title": "The Silver Crown", "ship": "Finrod/Amarië", "rating": "Gen"},
]

# print the title of the FIRST fic in the list
# (need rec_list[0] to get the dict, then ["title"] to
# get the title)

# ---- ANSWER ----
# print(rec_list[0]["title"])
#
# // read it left to right: rec_list[0] gets the first
# // fic (a dict), then ["title"] pulls the title out
# // of that dict. two steps in one line.


# ---- exercise 3: loop through and print details ----
# go through the whole rec_list and print a line for each
# fic in this format:
#   "{title} ({ship}) — {rating}"
#
# expected output:
#   Of Stars and Silver Light (Maedhros/Fingon) — Teen
#   The Burning of the Ships (Maedhros/Fingon) — Mature
#   Daughter of Twilight (Lúthien/Beren) — Gen
#   Two Trees (Galadriel/Celeborn) — Teen
#   The Silver Crown (Finrod/Amarië) — Gen
#
# you'll need a for loop AND chained dict access AND f-strings.
# this is putting three things together at once.

# ---- ANSWER ----
# for fic in rec_list:
#     print(f"{fic['title']} ({fic['ship']}) — {fic['rating']}")
#
# // notice i used SINGLE quotes inside the f-string.
# // because the f-string itself uses double quotes, you
# // can't use double quotes inside the {curly braces}.
# // single quotes inside, double on the outside. (or
# // you can swap which is inside and outside, doesn't
# // matter as long as they're different.)
# //
# // also: inside the loop, fic IS the dict. so it's
# // fic['title'], not rec_list[i]['title']. the for
# // loop already pulled the dict out for me. one less
# // step.


# ===========================================
# notes:
# - each [thing] is one level of access. lists need
#   numbers in the brackets. dicts need keys (strings,
#   usually).
# - you can chain as deep as you need: data[0]["users"][2]["email"]
#   would be: get item 0 (a dict), get its "users"
#   value (a list), get item 2 (a dict), get its "email"
#   value (a string).
# - if a key doesn't exist in a dict, you get a KeyError.
#   if an index is out of range, you get an IndexError.
#   either way, the program crashes. there are ways to
#   handle this safely but i haven't learned them yet.
