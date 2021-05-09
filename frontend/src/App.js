import './App.css';
import React, {useState, useEffect} from 'react';
import {getReviewerNextEntry} from './call.ts';
import katex from 'katex';

/**
 * Fixup Katex expressions which were rendered using some other page's CSS.
 * Basically it seems Katex renders in 2 blocks:
 * <span class='katex'>
 *   <math> ... <annotation> {{latex}} </annotation> ...
 *   <span class='katex-html'> ... </span>
 * </span>
 * We need to replace '.katex-html' inner HTML with re-rendered 'annotation'.
 */
function processHtml(htmlString) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(htmlString, 'text/html');
  let katexs = doc.querySelectorAll('.katex');
  for (let kx of katexs) {
    let realTex = kx.querySelector('annotation').innerHTML;
    let rendered = kx.querySelector('.katex-html');
    // NOTE(tk) node is mutable, so this works.
    rendered.innerHTML = katex.renderToString(realTex);
  }
  return doc.children[0].innerHTML;
}

function App({decksInit, cardInit}) {
  const defaultCard = {front: 'Done', back: 'No more cards to review.'};
  const [decks, setDecks] = useState(decksInit);
  const [deck, setDeck] = useState(decks[0]);
  const [isActive, setActive] = useState(false);
  const [card, setCard] = useState(cardInit || defaultCard);

  function update(card) {
    setCard(card || defaultCard);
    setActive(false);
  }

  function clickDeck(e) {
    console.log(e);
    setDeck(e.target.innerText);
    getReviewerNextEntry(deck).then(update);
  }

  function handleShortcut(e) {
    console.log(e);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  });

  return (
    <div tabIndex="0" className="App">
      <ul>{decks.map(d => <li key={d}><a href='#' onClick={clickDeck}>{d}</a></li>)}</ul>
      <p>Deck: {deck}</p>
      <a href="#" onClick={e => getReviewerNextEntry(deck).then(update)}>
        Reload
      </a>
      <div>
        <a dangerouslySetInnerHTML={{__html:processHtml(card.front)}} href="#"
          className={isActive ? "hidden" : ""}
          onClick={evt => setActive(true)} />
        <div className={isActive ? "" : "hidden"}
          dangerouslySetInnerHTML={{__html:processHtml(card.back)}} />
      </div>
    </div>
  );
}

export default App;
