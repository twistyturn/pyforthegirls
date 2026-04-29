# tegan ashby :: python practice :: mar 3 2004
# ===========================================
# f-strings: putting variables into sentences
#
# okay these are SO USEFUL. instead of doing
#     "hello, " + name + ", you have " + str(count) + " messages"
# (which is ugly AND requires str() on numbers), you can do
#     f"hello, {name}, you have {count} messages"
# and python fills in the variables automatically.
#
# the f at the start makes it an f-string. the {brackets}
# are where variables go. that's it. that's the whole thing.


# ---- exercise 1: simple substitution ----
# you have a variable `character` set to "Lúthien"
# print "Lúthien is the most powerful elf" using an f-string

# ---- ANSWER ----
# character = "Lúthien"
# print(f"{character} is the most powerful elf")


# ---- exercise 2: multiple variables ----
# build a fic summary line. given:
#   ship = "Maedhros/Fingon"
#   word_count = 47291
#   rating = "Mature"
# print: "Pairing: Maedhros/Fingon | Words: 47291 | Rating: Mature"
#
# (the | character is just a vertical bar. it's on the
# keyboard above the backslash.)

# ---- ANSWER ----
# ship = "Maedhros/Fingon"
# word_count = 47291
# rating = "Mature"
# print(f"Pairing: {ship} | Words: {word_count} | Rating: {rating}")
#
# // god this looks so much cleaner than the + version.
# // why didn't the book just lead with this.


# ---- exercise 3: f-string with expressions inside ----
# you can put MATH inside the brackets, not just variables.
# so {x + 1} works, or {len(some_list)}, or whatever.
#
# given these tegan & sara album release years:
#   under_feet_year = 1999
#   if_it_was_you_year = 2002
# print "tegan and sara released two albums {gap} years apart"
# where {gap} is computed from the years
#
# (it's 3 years. but compute it, don't hardcode it.)

# ---- ANSWER ----
# under_feet_year = 1999
# if_it_was_you_year = 2002
# print(f"tegan and sara released two albums {if_it_was_you_year - under_feet_year} years apart")
#
# // i love them so much. okay. focus.


# ===========================================
# notes:
# - the f goes BEFORE the opening quote. not inside.
# - you can use single OR double quotes for f-strings.
#   if you need quotes INSIDE the f-string, use the
#   other kind on the outside.
# - the curly braces are part of python, not the string
#   content. if you want literal curly braces in the
#   output (rare), you'd use {{ and }}.
