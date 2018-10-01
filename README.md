# kian

<p align="center">
<img src='public/favicon.png' alt='kian logo' style='background-color:white;'>
</p>

> Work in progress. Lots of functionalities missing!

kian is an alternative frontend for [Anki](https://apps.ankiweb.net/). It tries to be a **very opinionated** frontend. You'll configure less, and spend your time doing more Anki. Some of the features rae:

- Markdown editor for everything. Make structured notes faster with markdown. You can edit your old plain-html cards using [WYSIWYG editor (summernote)](https://summernote.org/) though, but most of kian's functionality is built for markdown mode only.
![Editing with markdown](readme_assets/codemirror.png)

- **Word autocomplete** based on your existing notes. ![Word autocomplete](readme_assets/word_autocomplete.png)

- Image-editor embedded ([MiniPaint](https://github.com/viliusle/miniPaint))
![Image editor](readme_assets/image_editor.png)
- Browser right below the add card window. I know you need it.
- Better designed everything. (In my sense.)

## Building

You need to have [Node.js](https://nodejs.org/) and [Python 3](https://python.org) installed. Clone the repository and install the dependencies.

```
$ npm install  // Install node.js dependencies
$ pip3 install -r backend/requirements.txt  // Install python3 dependencies
```

To run the development server, you'll need an Anki2 database file at `backend/testdata`. Copy one from your existing Anki installation so that `collection.anki2` goes to `backend/testdata/collection.anki2`, with all media files.

> Right now kian cannot create an empty collection. Not yet implemented. So you should start with your existing collection.

After you've done that, you can start the development server.

```
$ npm start
```


## License

This project is licensed under AGPL.