'''Simple query from Sqlite3 databases.
'''

import sqlite3
import re
import functools
import typing as T

from dataclasses import dataclass, field
from types import SimpleNamespace as ns
from collections import namedtuple
from pathlib import Path


def _sql_cleanup(sql: str):
  # remove CREATE TABLE and get rid of extra whitespace
  # TODO(tk) probably should handle other types of table definitions too
  return [
    re.sub(' +', ' ', line.strip(' ,'))
    for line in sql.split('\n')[1:-1]
  ]


@dataclass
class Fetcher:

  @dataclass
  class TableInfo:
    name: str
    def __init__(self, name: str, sql: str):
      self.name = name
      self.sql = _sql_cleanup(sql)

  @property
  def tables(self):
    tables = self.qall(
      '''SELECT tbl_name, sql FROM sqlite_master WHERE type='table' ''')
    return [self.TableInfo(*t) for t in tables]

  def __init__(self, database: T.Union[str, Path]):
    self.database = database
    # TODO(tk) migrate connection to context manager
    self.conn = sqlite3.connect(database, isolation_level=None)

  for_ = lambda self, table: TableFetcher(self, table)

  exe = lambda self, *a, kw=None: self.conn.execute(' '.join(a))
  qone = lambda self, *a, **kw: self.exe(*a, **kw).fetchone()
  qall = lambda self, *a, **kw: self.exe(*a, **kw).fetchall()


def _select_cleanup(select):
  # make sure namespace doesn't contain brackets in queries below
  return re.sub(r'[\(|\)]', '', select)

def _zipns(keys, vals):
  return ns(**dict(zip(keys, vals)))


@dataclass
class TableFetcher:
  fetcher: Fetcher
  table: str

  @functools.cached_property
  def columns(self):
    sql = self.fetcher.qone(
      f'SELECT sql FROM sqlite_master WHERE name=\'{self.table}\'')[0]
    return _sql_cleanup(sql)

  qq = lambda self, sel, *a: self.fetcher.exe(
    f'SELECT {sel} FROM {self.table} ' + ' '.join(a))

  # suitable for * queries
  qone = lambda self, sel, *a: self.qq(sel, *a).fetchone()
  qall = lambda self, sel, *a: self.qq(sel, *a).fetchall()

  def qone_(self, *selects: str, **kw):
    cursor, selects = self._get_named(*selects, **kw)
    return _zipns(selects, cursor.fetchone())

  def qmany_(self, *selects: str, size=10, **kw):
    cursor, selects = self._get_named(*selects, **kw)
    while rows := cursor.fetchmany(size=size):
      yield from map(lambda row: _zipns(selects, row), rows)

  def qall_(self, *selects: str, **kw):
    cursor, selects = self._get_named(*selects, **kw)
    return list(map(lambda row: _zipns(selects, row), cursor.fetchall()))

  def _get_named(self, *selects, **kw):
    data = self.qd(*selects, **kw)
    selects = list(map(_select_cleanup, selects))
    return data, selects

  def qd(self, *sel, **kw):
    '''Ex: qd('title', WHERE='title <> "abc"', LIMIT=5)
    '''
    query_params = ' '.join(f'{k} {v}' for k, v in kw.items())
    return self.qq(','.join(sel), query_params)

