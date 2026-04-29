# tegan ashby :: python practice :: jul 26 2004
# ===========================================
# regex: pattern matching for strings
#
# regex (short for "regular expressions") lets you match
# patterns in strings, not just exact matches. like "any
# 4 digits in a row" or "anything that looks like an
# email" or "anything starting with 'tegan_'".
#
# you import the `re` module to use it. the two main
# functions:
#   re.match(pattern, string) — checks if the pattern
#     matches AT THE START of the string
#   re.search(pattern, string) — checks if the pattern
#     matches ANYWHERE in the string
#
# both return a "match object" if it matched, or None
# if it didn't. you can use that as a truthy/falsy check
# in an if.
#
# (i'm getting more comfortable with python now. doing
# this in the boathouse during my break. the keys click
# really loud here.)


# ---- exercise 1: simple search ----
# given:
#   text = "i talked to glorfindel_lives on AIM yesterday"
# check if the text contains "glorfindel" and print
# "found it" or "nope" depending.

import re

text = "i talked to glorfindel_lives on AIM yesterday"

# ---- ANSWER ----
# import re
# text = "i talked to glorfindel_lives on AIM yesterday"
# if re.search("glorfindel", text):
#     print("found it")
# else:
#     print("nope")
#
# // for this simple case you could also do
# // `if "glorfindel" in text`. regex is overkill for
# // exact substring matches. it earns its keep when you
# // want PATTERNS, not literal strings.


# ---- exercise 2: case-insensitive search ----
# regex has flags that change how it matches. the most
# useful one is re.IGNORECASE which makes the match
# case-insensitive.
#
# given:
#   message = "OMG MAEDHROS deserved better"
# check if "maedhros" appears (case-insensitive) and
# if so, print "yes maedhros mention"

message = "OMG MAEDHROS deserved better"

# ---- ANSWER ----
# if re.search("maedhros", message, re.IGNORECASE):
#     print("yes maedhros mention")
#
# // re.IGNORECASE is the third argument to re.search().
# // some people abbreviate it as re.I. either works.
# //
# // without IGNORECASE, "maedhros" wouldn't match
# // "MAEDHROS" because regex is case-sensitive by
# // default.


# ---- exercise 3: extracting groups with re.match() ----
# patterns can have GROUPS in parentheses. the groups
# capture parts of the match so you can extract them.
#
# given a list of LJ-style timestamp lines:
#   "[2004-07-15 22:14] tegan_a87: are you online"
# extract the date, time, sender, and message.
#
# the regex:
#   r"\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\] (\w+): (.*)"
#
# breaking it down:
#   \[ and \] match literal brackets (escaped)
#   \d{4} matches 4 digits
#   \d{2} matches 2 digits
#   \w+ matches one or more word characters (letters,
#       digits, underscore)
#   .* matches anything (the message body)
#   each ( ) group captures a piece
#
# the r"..." prefix makes it a "raw string" so the
# backslashes don't get interpreted by python before
# regex sees them. always use r"..." for regex.

line = "[2004-07-15 22:14] tegan_a87: are you online"

# extract and print:
#   date: 2004-07-15
#   time: 22:14
#   sender: tegan_a87
#   message: are you online

# ---- ANSWER ----
# pattern = r"\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\] (\w+): (.*)"
# match = re.match(pattern, line)
# if match:
#     print(f"date: {match.group(1)}")
#     print(f"time: {match.group(2)}")
#     print(f"sender: {match.group(3)}")
#     print(f"message: {match.group(4)}")
#
# // .group(1), .group(2), etc. return the captured pieces.
# // .group(0) returns the WHOLE match.
# //
# // this took me a long time to get right. the regex looks
# // like a cat walked across the keyboard. the trick is
# // reading it left to right and matching each piece to
# // what you expect in the input.
# //
# // (for what it's worth: this exact pattern shape is
# // basically how every chat log on every IM platform
# // ever has been structured. AIM logs, IRC logs, LJ
# // comments. once you have this regex you can parse all
# // of them.)


# ===========================================
# notes:
# - import re
# - re.match: matches at the START of string
# - re.search: matches ANYWHERE in string
# - re.IGNORECASE: case-insensitive matching
# - r"..." raw strings: use for regex always
# - groups in (parens) capture pieces
# - .group(N) extracts the Nth captured group
# - common patterns:
#     \d  digit
#     \w  word character (letter, digit, underscore)
#     \s  whitespace
#     .   any character (except newline)
#     +   one or more of previous
#     *   zero or more of previous
#     {N} exactly N of previous
#     {N,M} between N and M of previous
