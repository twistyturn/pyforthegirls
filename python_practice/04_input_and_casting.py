# tegan ashby :: python practice :: mar 12 2004
# ===========================================
# input() and int(): asking the user for stuff
#
# input() makes the program PAUSE and wait for the user
# to type something. when they hit enter, you get back
# whatever they typed.
#
# big gotcha: input() ALWAYS gives you a string, even
# if the user types digits. so input() then "5" is the
# string "5", not the number 5. you have to convert
# with int() if you want to do math.
#
# (these exercises are weird to test in a practice file
# because input() needs you to type something. for the
# practice runner, just type whatever it asks for and
# watch what happens.)


# ---- exercise 1: ask a question, echo the answer ----
# ask "what's your favourite colour? " and then print
# "you said: <whatever they typed>"

# ---- ANSWER ----
# answer = input("what's your favourite colour? ")
# print(f"you said: {answer}")


# ---- exercise 2: the math gotcha ----
# this code has a bug. read it and predict what happens
# if you type "5" when it asks:
#
#     age = input("how old are you? ")
#     next_year = age + 1
#     print(next_year)
#
# (try it. then fix it.)
#
# you'll get an error: "unsupported operand type(s) for +:
# 'str' and 'int'". because age is the string "5" and you
# can't add a number to a string.
#
# fix: convert age to an int with int(age) BEFORE the math.

# ---- ANSWER ----
# age = input("how old are you? ")
# age = int(age)
# next_year = age + 1
# print(next_year)
#
# // OR you can do it inline:
# // age = int(input("how old are you? "))
# // next_year = age + 1
# // print(next_year)
# //
# // the inline version is shorter but you have to
# // mentally unwrap it. i think i prefer the two-line
# // version while i'm still learning.


# ---- exercise 3: type-juggling on purpose ----
# write a program that:
#   - asks for two numbers (one at a time)
#   - converts both to ints
#   - prints their sum AND prints them concatenated
#     as strings
#
# example: if user types "12" and "34":
#   sum is 46
#   strings smooshed is 1234
#
# this is to make yourself FEEL the difference between
# adding numbers and concatenating strings.

# ---- ANSWER ----
# a = input("first number: ")
# b = input("second number: ")
# # at this point a and b are STRINGS
# print(f"sum: {int(a) + int(b)}")
# print(f"smooshed: {a + b}")
#
# // when you add the int versions you get math.
# // when you add the string versions you get text-glue.
# // SAME + OPERATOR. different behaviour based on type.
# // python is doing a lot under the hood.


# ===========================================
# notes:
# - input() ALWAYS returns a string. always. no matter what.
# - int("5") gives you the number 5
# - int("hello") will CRASH (ValueError). only convert
#   if you actually have digits.
# - there's also float("3.14") for decimal numbers and
#   str(5) for going the other way (number to string).
#   we'll need str() less often because f-strings handle
#   that automatically.
