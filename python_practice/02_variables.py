# tegan ashby :: python practice :: feb 24 2004
# ===========================================
# variables: how python remembers stuff
#
# a variable is just a name with a value attached. you
# write `name = value` and python remembers it for later.
# you can change the value by assigning a new one.
#
# the weird part: you can re-assign a variable using its
# OWN current value. like `x = x + 1` looks crazy but it
# means "the new x is the old x plus 1." that's how
# counting works.
#
# also pretty important: an assignment is NOT the same as
# checking if two things are equal. one = means assign,
# == means equals (we'll get to == later).


# ---- exercise 1: assign and print ----
# make a variable called "favourite_elf" with the value "Fingon"
# then print it

# ---- ANSWER ----
# favourite_elf = "Fingon"
# print(favourite_elf)


# ---- exercise 2: reassign ----
# make a variable called "fic_chapter" starting at 1
# then update it to 2
# then print it (should print 2)
#
# this seems pointless until you realize the WHOLE POINT
# is that you can change variables. the second value
# completely replaces the first.

# ---- ANSWER ----
# fic_chapter = 1
# fic_chapter = 2
# print(fic_chapter)


# ---- exercise 3: update a variable using its own value ----
# you've been writing the same fic for FIVE WEEKS and you're
# at chapter 7. you finished chapter 8 today. write code that:
#   - starts chapters_done at 7
#   - adds 1 to chapters_done (using the x = x + 1 pattern)
#   - prints chapters_done
#
# expected output: 8
#
# the trick: you have to write `chapters_done = chapters_done + 1`
# NOT just `chapters_done + 1`. without the assignment, python
# computes the new value and throws it away. you have to STORE
# the result back in the variable.

# ---- ANSWER ----
# chapters_done = 7
# chapters_done = chapters_done + 1
# print(chapters_done)
#
# // okay so. this took me a minute to wrap my head around.
# // the right side gets calculated FIRST (chapters_done + 1
# // = 7 + 1 = 8) and THEN the result gets put into
# // chapters_done. so the old value is used to compute the
# // new value, and then it gets overwritten. it's not
# // simultaneous. it's right-to-left.
# //
# // the book says i'll use this pattern constantly. for
# // counters. for building stuff up. it's apparently a
# // big deal.


# ===========================================
# notes:
# - one = means "set this variable to this value"
# - == means "is this equal to that?" (totally different)
# - python doesn't care what type you assign — strings,
#   numbers, lists, whatever. variables can hold anything.
# - you can also reassign a variable to a totally
#   different type. weird but legal:
#       x = 5
#       x = "hello"
#   the book says don't do this because it's confusing.
#   but you CAN.
