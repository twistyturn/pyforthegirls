# tegan ashby :: python practice :: jun 4 2004
# ===========================================
# and, or, not, and the WEIRD thing called "truthiness"
#
# you've used == to check if things are equal. now you can
# combine multiple checks with `and` (both must be true) and
# `or` (at least one must be true). and you can flip a true
# into a false (or vice versa) with `not`.
#
# the weird part: python considers a LOT of things to be
# "true" or "false" even when they're not literally True or
# False. an empty string "" is false. an empty list [] is
# false. the number 0 is false. but ANY non-empty string,
# any non-empty list, any non-zero number is true. this is
# called "truthiness" and it's how `if some_list:` works
# (it's true if the list has anything in it).


# ---- exercise 1: and + or basics ----
# write code that prints "yes" if BOTH conditions are true:
#   - the year is 2004
#   - the month is "june"
# otherwise print "no"

year = 2004
month = "june"

# expected output: yes

# ---- ANSWER ----
# year = 2004
# month = "june"
# if year == 2004 and month == "june":
#     print("yes")
# else:
#     print("no")
#
# // both have to be true. if either one is false, the
# // whole expression is false. python checks left to right
# // and stops as soon as it knows the answer (so if year
# // wasn't 2004, it wouldn't even bother checking month).


# ---- exercise 2: not ----
# `not` flips a boolean. `not True` is False, `not False`
# is True. it's also useful with `in` — `not in` checks
# that something is NOT in a list/string.
#
# given this list of fic ratings you'll read:
#   ratings_youll_read = ["Gen", "Teen", "Mature"]
# write code that prints "yes" if "Explicit" is NOT in
# the list, otherwise prints "no"
#
# (do it BOTH ways: once with `not in`, once with `not (x in y)`.
# they do the same thing. `not in` is just nicer.)

ratings_youll_read = ["Gen", "Teen", "Mature"]

# ---- ANSWER ----
# # nicer way:
# if "Explicit" not in ratings_youll_read:
#     print("yes")
# else:
#     print("no")
#
# # equivalent uglier way:
# if not ("Explicit" in ratings_youll_read):
#     print("yes")
# else:
#     print("no")
#
# // not in is the python-y way. the parens version works
# // but it's like writing "not equal" as "not (equal)" —
# // technically right but who does that.


# ---- exercise 3: truthiness in if statements ----
# this is the weird one. python treats certain values as
# "falsy" (act like False in if statements) and everything
# else as "truthy" (acts like True).
#
# falsy values: False, None, 0, "", [], {}, set()
# truthy values: literally everything else
#
# so you can write `if my_list:` instead of `if len(my_list) > 0:`
# and `if name:` instead of `if name != "":`. it's shorter and
# more pythonic.
#
# given these variables:
#   bookmarks = []
#   current_fic = "Of Stars and Silver Light"
#   word_count = 0
#
# write three checks. for each variable, print
# "<name> is truthy" or "<name> is falsy" using its
# bare value in the if (no comparisons, no len(), nothing —
# just `if bookmarks:` etc.)

bookmarks = []
current_fic = "Of Stars and Silver Light"
word_count = 0

# expected output:
#   bookmarks is falsy
#   current_fic is truthy
#   word_count is falsy

# ---- ANSWER ----
# if bookmarks:
#     print("bookmarks is truthy")
# else:
#     print("bookmarks is falsy")
#
# if current_fic:
#     print("current_fic is truthy")
# else:
#     print("current_fic is falsy")
#
# if word_count:
#     print("word_count is truthy")
# else:
#     print("word_count is falsy")
#
# // empty list = falsy. non-empty string = truthy. zero
# // = falsy. this trips people up because in real life
# // we'd say "well 0 is a NUMBER, it's not nothing." but
# // to python, 0 means "no count" which is functionally
# // the same as "nothing" so it's falsy.
# //
# // this is mostly nice. occasionally it's a trap — if
# // you have a function that returns either a string or
# // None, and you write `if result:`, that ALSO returns
# // false for empty strings, which might not be what you
# // wanted. for those cases you write `if result is not None:`
# // explicitly.


# ===========================================
# notes:
# - and: BOTH must be truthy
# - or: AT LEAST ONE must be truthy
# - not: flips truthy <-> falsy
# - falsy values to remember: False, None, 0, "", [], {}, set()
# - and/or short-circuit: they stop evaluating as soon as
#   they know the answer. `False and (some_complicated_thing)`
#   never even runs the complicated thing.
# - chained comparisons work: `if 0 < x < 10:` is the same
#   as `if x > 0 and x < 10:`. python is the only major
#   language that does this and i love it.
