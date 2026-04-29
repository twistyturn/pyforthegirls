# tegan ashby :: python practice :: jul 30 2004
# ===========================================
# numbers (// and %) and dates
#
# two number operators i haven't used much:
#   //  integer division — divides and throws away the remainder
#       7 // 2 → 3 (not 3.5)
#   %   modulo — gives you ONLY the remainder
#       7 % 2 → 1
#
# these are weirdly useful together. // tells you "how
# many whole times does b fit into a" and % tells you
# "what's left over." if a % b == 0, then b divides
# evenly into a (no remainder).
#
# also: dates. python has a `datetime` module that lets
# you compare dates, do math with them, format them.
#
# (last day of session 1 tomorrow. session 2 starts sunday.
# the boys arrive monday. tyler is a boy. moving on.)


# ---- exercise 1: // and % basics ----
# you have 47 hours until the end of camp session 1.
# how many full days is that, and how many leftover hours?

hours_left = 47

# expected:
#   1 days, 23 hours
#
# (47 hours is 1 full day with 23 hours left over)

# ---- ANSWER ----
# hours_left = 47
# days = hours_left // 24
# remainder = hours_left % 24
# print(f"{days} days, {remainder} hours")
#
# // // and % go together so often. anytime you're
# // converting "total something" into "groups of N
# // with leftovers", you use both.
# //
# // (also useful: minutes // 60 for hours, minutes %
# // 60 for the remaining minutes. seconds // 60 for
# // minutes. it's the same pattern at every scale.)


# ---- exercise 2: even/odd checking with % ----
# % is the standard way to check if a number is divisible
# by something. n % 2 == 0 means n is even. n % 2 == 1
# means n is odd. n % 5 == 0 means it's divisible by 5.
#
# given a list of fic word counts, print each one and
# whether it's even or odd.

word_counts = [12847, 4200, 8888, 47291, 1500, 67324]

# expected:
#   12847: odd
#   4200: even
#   8888: even
#   47291: odd
#   1500: even
#   67324: even

# ---- ANSWER ----
# for count in word_counts:
#     if count % 2 == 0:
#         print(f"{count}: even")
#     else:
#         print(f"{count}: odd")


# ---- exercise 3: comparing dates ----
# python's datetime module lets you create date objects
# and compare them with <, >, ==.
#
# import:
#   import datetime
#
# create a date:
#   d = datetime.date(2004, 7, 30)
#
# compare two dates:
#   d1 < d2  →  True if d1 is earlier
#
# subtract two dates:
#   d2 - d1  →  a timedelta object with .days
#
# how many days between today (jul 30) and the end of
# session 2 (aug 14)?

import datetime

today = datetime.date(2004, 7, 30)
session_end = datetime.date(2004, 8, 14)

# expected:
#   15 days until session ends

# ---- ANSWER ----
# import datetime
# today = datetime.date(2004, 7, 30)
# session_end = datetime.date(2004, 8, 14)
# diff = session_end - today
# print(f"{diff.days} days until session ends")
#
# // diff is a timedelta object. .days gets the days
# // (timedeltas also have .seconds and .microseconds
# // for finer detail, but for date math .days is what
# // you usually want).
# //
# // datetime.datetime is the bigger version with hours
# // and minutes. datetime.date is just year/month/day.
# // datetime.time is just hours/minutes/seconds. they
# // each have their uses.
# //
# // (15 days is a long time. and a short time. depending
# // on how you measure.)


# ===========================================
# notes:
# - // is integer division (no remainder)
# - % is modulo (just the remainder)
# - n % m == 0 means n is divisible by m
# - import datetime to use dates
# - datetime.date(y, m, d) makes a date
# - subtract dates to get a timedelta
# - .days on the timedelta gives whole days
