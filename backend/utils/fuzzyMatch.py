# import hgtk


def fuzzyMatch(needle, haystack):
  #needle = hgtk.text.decompose(needle).lower()
  #haystack = hgtk.text.decompose(haystack).lower()

  needle=needle.lower()
  haystack=haystack.lower()

  try:
    idx = 0
    for ch in needle:
      while True:
        if haystack[idx] == ch:
          break
        idx += 1
      idx += 1
    return True
  except IndexError:
    return False
