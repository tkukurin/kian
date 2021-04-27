

# kian

Usable WIP alternative frontend for [Anki](https://apps.ankiweb.net/). Features:

* Markdown editor
* Browser right below the add card window.


## Building

You need to have [Node.js](https://nodejs.org/) and [Python 3](https://python.org)
installed. Clone the repository and install the dependencies.

```
$ npm install
$ pip3 install -r backend/requirements.txt
```

To run the development server, you'll need an Anki2 database file at
`backend/testdata`. Copy one from your existing Anki installation so that
`collection.anki2` goes to `backend/testdata/collection.anki2`, with all media
files.


## Vue-cli 3 commands

```
## Project setup
npm install

### Compiles and hot-reloads for development
npm run serve

### Alternatively, separately run backend and frontend
npx vue-cli-service serve
python backend/server.py

### Compiles and minifies for production
npm run build

### Run your tests
npm run test

### Lints and fixes files
npm run lint

### Run your unit tests
npm run test:unit
```

