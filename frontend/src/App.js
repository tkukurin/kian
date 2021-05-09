import './App.css';
import React, {useState, useEffect} from 'react';
import {getReviewerNextEntry} from './call.ts';
import katex from 'katex';


function Inp() {
  let inputComponent = null;
  // useEffect(() => {
  //   window.addEventListener('blur', e => {
  //     console.log(e);
  //     console.log(inputComponent);
  //     inputComponent && inputComponent.focus();
  //   });
  //   document.addEventListener(
  //     'focus', e => console.log(e) || (inputComponent.focus && inputComponent.focus()));
  // });
  function set(i) {
    // persistent focus
    if (i) {
      inputComponent = i;
      i.addEventListener('blur', e => i.focus());
    }
  }
  //useEffect(() => inputComponent.focus && inputComponent.focus());
  return <input autoFocus onKeyDown={console.log} ref={set} />;
}


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

function App({inputComponent, decksInit, cardInit}) {
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
    getReviewerNextEntry(deck).then(c => {
      update(c)
      setDeck(e.target.innerText);
    });
  }

  function handleShortcut(e) {
    //console.log(e);
    if (e.key === 'a' && e.altKey) {
      setActive(true);
    } else if (e.key === 'n' && e.altKey) {
      getReviewerNextEntry(deck).then(update);
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  });

  return (
    <div className="App">
      <Inp />
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
