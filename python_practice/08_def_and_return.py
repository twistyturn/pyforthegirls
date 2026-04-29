# tegan ashby :: python practice :: jun 24 2004
# ===========================================
# def: writing your own functions
#
# you've been USING functions forever — print(), len(),
# int(), input(). those are built-in functions someone
# else wrote. now you write your own.
#
# `def` defines a function. you give it a name, list its
# inputs (parameters) in parentheses, and the indented
# body is what it does.
#
# THE BIG IDEA you have to internalize:
# print() shows something on the screen.
# return GIVES VALUES BACK to whoever called the function.
#
# these are NOT the same. a function that prints doesn't
# necessarily return anything. a function that returns
# doesn't necessarily print. you'll mix them up at first.
# everyone does.


# ---- exercise 1: a function that prints ----
# write a function called greet_elf that takes one parameter,
# the elf's name, and prints "Hail, {name}!"
# then call it with "Fingon"

# ---- ANSWER ----
# def greet_elf(name):
#     print(f"Hail, {name}!")
#
# greet_elf("Fingon")
#
# // the function gets DEFINED with `def` and then nothing
# // happens until you CALL it on the last line. defining
# // is like writing down a recipe. calling is actually
# // making the recipe.


# ---- exercise 2: a function that returns ----
# write a function called fic_summary that takes a fic dict
# (like the ones from earlier files) and RETURNS a string
# in this format: "{title} ({ship})". don't print inside
# the function — return the string. then PRINT the result
# of calling the function.

example_fic = {
    "title": "Of Stars and Silver Light",
    "ship": "Maedhros/Fingon",
    "rating": "Teen",
}

# expected output when printed: "Of Stars and Silver Light (Maedhros/Fingon)"

# ---- ANSWER ----
# def fic_summary(fic):
#     return f"{fic['title']} ({fic['ship']})"
#
# print(fic_summary(example_fic))
#
# // the function HANDS BACK a string. you can do whatever
# // you want with it — print it, store it in a variable,
# // pass it to ANOTHER function, whatever. that's the
# // power of return. the function does work and gives
# // you the result; what to do with the result is your
# // problem.
# //
# // if you printed inside the function instead:
# //     def fic_summary(fic):
# //         print(f"{fic['title']} ({fic['ship']})")
# // ...then calling fic_summary(example_fic) would print,
# // but you couldn't store the result anywhere because
# // there'd be nothing to store. print just throws text
# // at the screen. return hands you something usable.


# ---- exercise 3: function with multiple parameters ----
# write a function called rec_a_fic that takes:
#   - a fic dict
#   - a min_word_count number
# and RETURNS True if the fic's word_count is at least
# min_word_count, False otherwise.
#
# (functions can return True or False just like they can
# return strings or numbers.)
#
# then call it twice on this fic — once with a low threshold
# (should return True), once with a high one (should return False).
# print each result.

big_fic = {
    "title": "The Burning of the Ships",
    "ship": "Maedhros/Fingon",
    "word_count": 47291,
}

# ---- ANSWER ----
# def rec_a_fic(fic, min_word_count):
#     return fic["word_count"] >= min_word_count
#
# print(rec_a_fic(big_fic, 10000))   # True
# print(rec_a_fic(big_fic, 100000))  # False
#
# // the comparison `fic["word_count"] >= min_word_count`
# // already evaluates to True or False. you can return
# // it directly — you don't need an if statement.
# //
# // a lot of beginners (me, last week) write:
# //     if fic["word_count"] >= min_word_count:
# //         return True
# //     else:
# //         return False
# // which works but is way more code than needed. the
# // comparison itself IS the boolean. just return it.


# ===========================================
# notes:
# - def NAME(parameters): defines a function
# - the function body must be indented (4 spaces is
#   standard)
# - parameters are local to the function — they only
#   exist inside it. you can name a parameter `name`
#   and have a different `name` variable outside the
#   function and they won't conflict.
# - return ENDS the function. anything after a return
#   doesn't execute. you can have multiple returns in
#   different branches of an if/else though.
# - a function without an explicit return value
#   automatically returns None. so if you forget to
#   return something and try to use the result, you
#   get None and probably an error downstream.
#
# (mom. these are functions. they are math functions
# basically. it is just programming. it is FOR THE
# COURSE. i am not hiding anything weird in here. i
# love you. please respect the boundaries of my
# personal computer files.)
