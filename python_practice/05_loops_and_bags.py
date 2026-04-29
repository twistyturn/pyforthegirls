# tegan ashby :: python practice :: apr 6 2004
# ===========================================
# loops where you keep stuff
#
# ok so i finally GET this i think. you start with an empty
# thing and you add to it inside the loop. like, the variable
# starts empty before the loop and gets bigger every time
# the loop runs. by the end it has everything in it.
#
# the book calls it an "accumulator pattern" which sounds
# like a car part. i'm calling it the bag pattern because
# you're putting things in a bag.
#
# (note for future me: do NOT save anything embarrassing in
# this folder. mom checks. okay obviously this whole file
# is a bit. you know. but at least it's just python.)


# ---- exercise 1: count something ----
# count how many of these songs have the word "you" in the title
# (it's like, all of them. mcr is so dramatic. i love it)

bullets_tracklist = [
    "Romance",
    "Honey This Mirror Isn't Big Enough for the Two of Us",
    "Vampires Will Never Hurt You",
    "Drowning Lessons",
    "Our Lady of Sorrows",
    "Headfirst for Halos",
    "Skylines and Turnstiles",
    "Early Sunsets Over Monroeville",
    "This Is the Best Day Ever",
    "Cubicles",
    "Demolition Lovers",
]

# count titles containing "you" (lowercase). expected: 3
#
# you'll need:
#   - count = 0 before the loop
#   - for title in bullets_tracklist:
#   - if "you" in title.lower(): count = count + 1
#   - print(count) at the end

# ---- ANSWER ----
# count = 0
# for title in bullets_tracklist:
#     if "you" in title.lower():
#         count = count + 1
# print(count)


# ---- exercise 2: build a sentence ----
# combine these silmarillion characters into one long string
# separated by " and " — because honestly they're all married
# to each other in some way

elves = ["Maedhros", "Fingon", "Finrod", "Beleg", "Maglor"]

# expected: "Maedhros and Fingon and Finrod and Beleg and Maglor"
#
# tricky part: don't put " and " at the start. one way to
# handle it: only add " and " if the bag isn't empty yet.

# ---- ANSWER ----
# sentence = ""
# for elf in elves:
#     if sentence == "":
#         sentence = elf
#     else:
#         sentence = sentence + " and " + elf
# print(sentence)
#
# // this took me three tries. the empty-string check
# // was the trick. before i added that, i kept getting
# // " and Maedhros and Fingon..." with the weird leading
# // space. THE BAG STARTS EMPTY. you have to handle the
# // first item differently because there's nothing to
# // "and" it onto yet.


# ---- exercise 3: combine a counter AND a string-builder ----
# go through these characters and BOTH:
#   - count how many have the letter "a" in their name
#   - build a string of all the names that DO, separated by commas

silm_girls = [
    "Galadriel",
    "Lúthien",
    "Idril",
    "Nienna",
    "Varda",
    "Melian",
    "Aredhel",
    "Nerdanel",
]

# expected output:
#   6 names contain "a"
#   Galadriel, Varda, Melian, Aredhel, Nerdanel
#
# (i KNOW lúthien and idril and nienna don't have an "a".
# focus.)
#
# this is a stretch because you have TWO bags going at once.
# both get updated inside the same if statement.

# ---- ANSWER ----
# count = 0
# matches = ""
# for name in silm_girls:
#     if "a" in name.lower():
#         count = count + 1
#         if matches == "":
#             matches = name
#         else:
#             matches = matches + ", " + name
# print(f"{count} names contain \"a\"")
# print(matches)
#
# // okay so. i could not stop thinking about Aredhel while
# // writing this. she's literally so cool and tragic and
# // she just WANTED to ride her horse through the woods
# // and the universe punished her for it. anyway. focus.


# ===========================================
# notes for me:
#
# the bag pattern is everywhere. once you see it you
# can't unsee it. it's the same shape whether you're
# counting (bag is a number, +1 each pass) or building
# a string (bag is a string, += new piece each pass)
# or building a list (bag is a list, .append() each
# pass — i haven't learned that one yet but i bet
# it's the same).
#
# the empty-bag-at-the-start thing matters more than
# i thought. counters start at 0. strings start at "".
# if you forget to declare it before the loop you get
# a NameError because python doesn't know what `count`
# is yet when the loop tries to update it.
#
# (and. mom. if you're reading this. it's just a list
# of tolkien characters. it's literally just python
# practice. please stop going through my files.)
