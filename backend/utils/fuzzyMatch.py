
def fuzzymatch_score(search_term_cased: str, with_ix=False):
  search_term = search_term_cased.lower()
  def fuzzy_inner(test_against: str, start=0):
    test_against = test_against.lower()
    score = 0
    for iterm, char in enumerate(search_term):
      if (last_match := test_against.find(char, start)) < 0: return 0
      score += 1.0 / (last_match - start + 1)
      start = last_match + 1
    return (i, score) if with_ix else score
  return fuzzy_inner if search_term else (lambda x: 1)


def fuzzyMatch(needle, haystack):
  score = fuzzymatch_score(needle)(haystack)
  return score > 0

if __name__ == '__main__':
  # "Unit test" lol
  print(fuzzyMatch('xyz', 'asdfxyyyybtytbz'), 'should be T')
  print(fuzzyMatch('xyz', 'asdfxyyyybtytb'), 'should be F')

