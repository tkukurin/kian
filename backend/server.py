#!/usr/bin/env python3

from aiohttp import web
from aiohttp_index import IndexMiddleware
import socketio
import logging
import api
import sys
import os
import mimetypes

from utils.dispatchTable import apiDispatch
from utils.col import db_path
from utils.copyMedia import copyAllMedia


assert api # Disable unused import warning

logging.basicConfig(
  level=logging.DEBUG,
  handlers=[logging.FileHandler('server.out'), logging.StreamHandler()],
  format="[%(asctime)s %(levelname)s] %(message)s"
)

L = logging.getLogger()


NET_PORT = 28735
sio = socketio.AsyncServer(cors_allowed_origins='*')


@sio.on('connect')
def connect(sid, environ):
  L.info('socket.io connected: %s', sid)


@sio.on('msg')
async def message(sid, data):
  # syncKey is client generated
  syncKey = data['syncKey']
  del data['syncKey']

  data['sio'] = sio
  result = await apiDispatch(data)
  result['syncKey'] = syncKey
  await sio.emit('msg', result, room=sid)


@sio.on('disconnect')
def disconnect(sid):
  L.info('socket.io disconnected: %s', sid)


def some_special_case(app):
  async def handler(request):
    path = str(request.rel_url)
    if path[0] == '/':
      path = path[1:]
    if path == '':
      path = 'index.html'

    resolvedPath = os.path.join('frontend/', path)
    if not os.path.exists(resolvedPath):
      resolvedPath = os.path.join(
        os.path.dirname(db_path),
        'collection.media/', path)
      if not os.path.exists(resolvedPath):
        return web.Response(status=404, text='Not found')

    try:
      with open(resolvedPath, 'rb') as f:
        return web.Response(
          content_type=mimetypes.guess_type(resolvedPath)[0],
          body=f.read(),
        )
    except Exception:
      return web.Response(status=404, text='Not found')

  app.router.add_route('GET', '/{tail:.*}', handler)

  import webbrowser
  L.info('Opening localhost: %d', NET_PORT)
  webbrowser.open(f'http://localhost:{NET_PORT}/')


def main():
  L.info('Starting server...')

  copyAllMedia()

  app = web.Application(middlewares=[IndexMiddleware()])
  sio.attach(app)

  if hasattr(sys, 'frozen'):
    some_special_case(app)

  web.run_app(app, host='127.0.0.1', port=NET_PORT)


if __name__ == '__main__':
  main()

