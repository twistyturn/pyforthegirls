# tegan ashby :: python practice :: aug 2 2004 :: 3:14 am
# ===========================================
# try / except: handling things that go wrong
# also: scope (where variables exist)
#
# the book has a section on "exception handling" which
# is what programmers call "code that handles errors
# without crashing." instead of letting an error crash
# the program, you can CATCH the error and decide what
# to do.
#
# the syntax is:
#   try:
#       # code that might fail
#   except SomeError:
#       # what to do if it failed
#
# you wrap the risky code in `try`, and the `except`
# block runs ONLY if something went wrong. if nothing
# went wrong, the except block is skipped.
#
# (couldn't sleep. typing this in the bathroom. the
# screen is too bright in the cabin and i don't want
# to wake anyone up. my hands are kind of shaky which
# is making typos. okay. focus on the code.)


# ---- exercise 1: catching a specific error ----
# trying to convert a non-number string to int crashes:
#   int("hello")  →  ValueError
#
# wrap a conversion in try/except so that if the input
# isn't a number, you print "not a number" instead of
# crashing.

inputs = ["12", "47", "hello", "8", "fingon", "1985"]

# expected output:
#   12
#   47
#   not a number
#   8
#   not a number
#   1985

# ---- ANSWER ----
# inputs = ["12", "47", "hello", "8", "fingon", "1985"]
# for s in inputs:
#     try:
#         n = int(s)
#         print(n)
#     except ValueError:
#         print("not a number")
#
# // the except clause specifies which kind of error to
# // catch. int("hello") raises a ValueError. we catch
# // ValueError specifically so other kinds of errors
# // (which we don't want to ignore) would still crash.
# //
# // never use a bare `except:` that catches everything.
# // it'll silently swallow real bugs.


# ---- exercise 2: try/except with a fallback value ----
# sometimes when an operation fails you want to use a
# default value instead. wrap the conversion in try/except
# and use 0 as the default if the conversion fails. then
# sum all the values.

inputs = ["12", "47", "hello", "8", "fingon", "1985"]

# expected total: 2052 (12 + 47 + 0 + 8 + 0 + 1985)

# ---- ANSWER ----
# inputs = ["12", "47", "hello", "8", "fingon", "1985"]
# total = 0
# for s in inputs:
#     try:
#         total = total + int(s)
#     except ValueError:
#         total = total + 0  # could just leave this out
# print(total)
#
# // the `total = total + 0` line is unnecessary (adding
# // 0 doesn't change anything) but i'm leaving it for
# // clarity. you could also just `pass` in the except
# // block to do nothing.
# //
# // try/except is for situations where you can RECOVER
# // from the error. it's not for hiding bugs. if the
# // error is something you can't reasonably handle, let
# // it crash so you know about it.


# ---- exercise 3: scope ----
# variables defined inside a function are LOCAL to that
# function. they don't exist outside. variables defined
# outside a function (at the top level) are GLOBAL and
# can be READ from inside functions, but if you want to
# CHANGE a global from inside a function, you need the
# `global` keyword (which you should mostly avoid).
#
# predict what this code does:

x = 10

def doubled():
    x = 20  # this creates a NEW LOCAL x, doesn't change the global
    return x

# print(doubled())   # what does this print?
# print(x)           # what does THIS print?

# ---- ANSWER ----
# print(doubled())   # 20 (the local x)
# print(x)           # 10 (the global x is unchanged)
#
# // inside doubled(), `x = 20` creates a LOCAL variable
# // named x that exists only inside the function. the
# // global x outside is untouched.
# //
# // this is python protecting you. functions can't
# // accidentally clobber variables outside themselves.
# // you have to be very explicit (with `global x`) to
# // modify the outside x from inside a function, and
# // most code shouldn't do this.
# //
# // there is also `nonlocal` for nested functions, which
# // i don't fully understand yet and don't need to.


# ===========================================
# notes:
# - try: { code } except SomeError: { handling }
# - catch SPECIFIC errors, not bare `except:`
# - common errors: ValueError, KeyError, TypeError,
#   IndexError, FileNotFoundError, ZeroDivisionError
# - you can have multiple except blocks for different
#   error types
# - else: runs if no error happened (less common)
# - finally: runs no matter what (cleanup)
#
# scope notes:
# - variables in a function are local by default
# - functions can READ globals but not modify them
#   without `global` keyword
# - this is a feature, not a bug — it prevents accidents
#
# (it's almost 4 am and i need to sleep. i don't think
# i'm going to. i keep thinking about something i did
# yesterday and i don't know how to undo it. i wish you
# could try/except on real life. you can't. it doesn't
# work like that.)
#
# (mom if you ever read this, this whole file is just
# python practice. i love you. please respect my files.)
