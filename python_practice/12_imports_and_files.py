# tegan ashby :: python practice :: jul 8 2004
# ===========================================
# imports and reading files from a folder
#
# python has TONS of built-in stuff that's not loaded by
# default. you have to `import` it. the most common ones
# i'll need: `os` (for working with files and folders),
# `re` (for regex — saving for next file).
#
# `os.listdir(folder)` gives you a list of all the files
# inside a folder. then you can loop through and open each
# one.
#
# (writing this on the laptop in my cabin during rest hour.
# brought the laptop to camp and nobody asked why a JC has
# a laptop. i think they think it's for emails. i'm using
# it for emails. and. this.)


# ---- exercise 1: import basics ----
# import the `os` module and use `os.getcwd()` to print the
# current working directory (where python thinks it is)

# ---- ANSWER ----
# import os
# print(os.getcwd())
#
# // the import goes at the TOP of the file usually. then
# // you access stuff inside the module with module.thing.
# //
# // os.getcwd() returns a string with your current folder
# // path. useful when you're confused about where python
# // thinks it is when looking for files.


# ---- exercise 2: list a folder ----
# pretend there's a folder called "fic_drafts" with these
# files in it:
#   chapter_01.txt
#   chapter_02.txt
#   chapter_03.txt
#   notes.txt
#   .DS_Store        (macs are SO ANNOYING about this)
#
# os.listdir("fic_drafts") would give you all five filenames
# as strings in a list.
#
# write code that:
#   - takes that list (i'll fake it for you below)
#   - prints just the filenames that end with .txt
#   - and skips the .DS_Store hidden file
#
# (in real code you'd call os.listdir(). for this exercise
# we're using a hardcoded list because we can't make real
# files in this practice file.)

fake_listdir = ["chapter_01.txt", "chapter_02.txt", "chapter_03.txt", "notes.txt", ".DS_Store"]

# expected output:
#   chapter_01.txt
#   chapter_02.txt
#   chapter_03.txt
#   notes.txt

# ---- ANSWER ----
# for filename in fake_listdir:
#     if filename.endswith(".txt"):
#         print(filename)
#
# // .endswith() is a string method that returns True/False
# // depending on whether the string ends with whatever you
# // pass. .startswith() is the same but for the start.
# // both useful for filtering files.


# ---- exercise 3: open and read a file ----
# the standard way to open a file in python is:
#   with open("filename.txt") as f:
#       contents = f.read()
#
# the `with` statement makes sure the file gets closed
# properly even if something goes wrong. `as f` gives the
# open file the name `f` (you could call it anything,
# `f` is just convention).
#
# .read() reads the whole file as one big string.
# .readlines() reads it as a list of strings, one per line.
# .readline() reads one line at a time.
#
# (we can't actually open a file in this practice file
# because there's no file to open. but here's what the
# code would look like for opening a fic draft and printing
# the line count.)

# ---- ANSWER (no test data, this is just the shape) ----
# with open("fic_drafts/chapter_01.txt") as f:
#     lines = f.readlines()
# print(f"chapter has {len(lines)} lines")
#
# // the `with` block automatically closes the file when
# // it exits. you don't have to remember to call f.close().
# // this is python being nice to you.
# //
# // common gotcha: .readlines() includes the newline
# // character (\n) at the end of each line. if you want
# // clean lines, .strip() each one.


# ===========================================
# notes:
# - import at the top of the file
# - access module contents with module.thing or
#   module.function()
# - os has: getcwd(), listdir(), path.join(), path.exists()
#   and more
# - file opening: with open(filename) as f
# - read whole file: f.read()
# - read as list of lines: f.readlines()
# - alternative: `for line in f:` iterates lines lazily
#   (good for huge files)
