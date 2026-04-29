# tegan ashby :: python practice :: jul 18 2004
# ===========================================
# building dicts in a loop: lookup tables
#
# you've used dicts to STORE data. now: building them
# inside a loop. the syntax is `dict[key] = value` which
# either adds a new key (if it doesn't exist) or updates
# an existing one (if it does).
#
# the most common use: counting things. you have a list,
# and you want to know how many times each unique item
# appears. you build a dict where the keys are the items
# and the values are the counts.
#
# (writing this in the rec hall during free period. it's
# raining. half the campers are inside losing their minds.
# i'm at a corner table with the laptop and headphones in
# and nobody is bothering me which is amazing.)


# ---- exercise 1: basic dict building in a loop ----
# you have a list of fic ratings. build a dict where each
# rating is a key and the value is just True (we don't
# care about counts yet, just unique values).

ratings_list = ["Teen", "Mature", "Gen", "Teen", "Gen", "Teen", "Mature", "Explicit", "Gen"]

# expected dict:
#   {"Teen": True, "Mature": True, "Gen": True, "Explicit": True}
# (then print it)

# ---- ANSWER ----
# seen = {}
# for rating in ratings_list:
#     seen[rating] = True
# print(seen)
#
# // you start with an empty dict. for each rating, you
# // set seen[rating] = True. if the key already exists,
# // it just gets set to True again (no harm done). if
# // not, it gets added.
# //
# // this is essentially using a dict as a SET — you're
# // tracking unique values. python actually has a real
# // set type for this (which we'll use later) but the
# // dict trick works.


# ---- exercise 2: counting with the long version ----
# now actually count how many times each rating appears.
# the catch: when you encounter a rating, you have to
# check if it's already a key. if yes, add 1. if no,
# start at 1.

ratings_list = ["Teen", "Mature", "Gen", "Teen", "Gen", "Teen", "Mature", "Explicit", "Gen"]

# expected counts:
#   Teen: 3
#   Mature: 2
#   Gen: 3
#   Explicit: 1
#
# print each on its own line in the format above.

# ---- ANSWER ----
# counts = {}
# for rating in ratings_list:
#     if rating in counts:
#         counts[rating] = counts[rating] + 1
#     else:
#         counts[rating] = 1
#
# for rating, count in counts.items():
#     print(f"{rating}: {count}")
#
# // the if/else is to handle the "first time we see this
# // key" case. if you tried to do counts[rating] = counts[rating] + 1
# // without the check, the first time you'd get a KeyError
# // because counts[rating] doesn't exist yet.


# ---- exercise 3: same thing with .get() ----
# the if/else above is annoying. dict has a .get() method
# that returns a default value if the key doesn't exist:
#
#   counts.get(rating, 0)
#
# returns counts[rating] if it exists, otherwise 0. so you
# can write the whole counter as ONE LINE inside the loop:
#
#   counts[rating] = counts.get(rating, 0) + 1
#
# rewrite the counter using .get() instead of if/else.

ratings_list = ["Teen", "Mature", "Gen", "Teen", "Gen", "Teen", "Mature", "Explicit", "Gen"]

# expected output: same as exercise 2

# ---- ANSWER ----
# counts = {}
# for rating in ratings_list:
#     counts[rating] = counts.get(rating, 0) + 1
#
# for rating, count in counts.items():
#     print(f"{rating}: {count}")
#
# // SO MUCH NICER. one line inside the loop. .get(key,
# // default) is the cleanest way to handle "either get
# // the value or use a default if it's not there."
# //
# // this is the dict version of the bag pattern. each
# // pass through the loop, you take what's currently in
# // counts[rating] (or 0 if nothing) and add 1, and put
# // it back. same shape as count = count + 1, just with
# // a dict cell instead of a single variable.


# ===========================================
# notes:
# - dict[key] = value adds OR updates
# - check existence with `if key in dict`
# - dict.get(key, default) returns default if key missing
# - dict.get(key) without a default returns None if missing
# - looping with .items() gives you (key, value) pairs
# - counter pattern: dict[k] = dict.get(k, 0) + 1
