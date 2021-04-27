import itertools as it


def typeCheck(obj, type_defs_dict=None, **type_defs):
  def yield_impl():
    for k, v in it.chain((type_defs_dict or {}).items(), type_defs.items()):
      if isinstance(v, type):
        if not isinstance(obj[k], v):
          raise TypeError
        yield obj[k]
      elif isinstance(v, dict):
        yield from typeCheck(obj[k], v)
  return tuple(yield_impl())


if __name__ == '__main__':
  x, = typeCheck({'a':1}, dict(a=int))
  assert x == 1
  print(x)

  x, y = typeCheck({'a':1, 'b': 'asdf'}, a=int, b=str)
  assert x == 1 and y == 'asdf'
  print(x, y)

  try:
    typeCheck({'a':1}, a=str)
    assert False
  except TypeError as e:
    pass


