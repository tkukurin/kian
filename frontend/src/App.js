import './App.css';
import React, {useState, useEffect, useCallback} from 'react';
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

function App({inputComponent, decksInit, cardInit}) {
  const defaultCard = {front: 'Done', back: 'No more cards to review.'};
  const [decks, setDecks] = useState(decksInit);
  const [allDecks, _] = useState(decksInit);
  const [selIdx, setSelected] = useState(0);
  const [isActive, setActive] = useState(false);
  const [card, setCard] = useState(cardInit || defaultCard);
  const [inputState, setInputState] = useState('');

  function update(card) {
    setCard(card || defaultCard);
    setActive(false);
  }

  function clickDeck(e, index) {
    console.log(e);
    setSelected(index);
    const newDeck = (e.decks || decks)[index];
    if (newDeck) {
      return getReviewerNextEntry(newDeck).then(c => {
        update(c)
      });
    }
    return update(null);
  }

  function handleShortcut(e) {
    function move(delta) {
      const newIndex = (selIdx + delta + decks.length) % decks.length;
      clickDeck({}, newIndex);
    }

    const deck = decks[selIdx];
    if (e.key === 'a' && e.altKey) {
      setActive(true);
    } else if (e.key === 'n' && e.altKey) {
      getReviewerNextEntry(deck).then(update);
    } else if (e.key === 'j' && e.altKey) {
      move(1);
    } else if (e.key === 'k' && e.altKey) {
      move(-1);
    } else if (e.key === 'Enter') {
      clickDeck({}, 0);
    }
  }

  function handleChange(event) {
    function parse(str) {
      let parts = str.trim().split(/[ ]+/);
      return parts;
    }

    console.log('Logging args', event);
    setInputState(event.target.value);

    const val = event.target.value.toLowerCase();

    // TODO(tk) implement some kind of command usage
    // const parts = parse(val);
    // console.log(parts);
    // const cmd = ...

    const prevSelectedDeck = decks[selIdx];
    const newDecks = allDecks.filter(d => d.toLowerCase().includes(val));
    setDecks(newDecks);

    // TODO(tk) this shouldn't be with the dict of new decks.
    // TODO(tk) also use smarter selection than 0
    // TODO(tk) also make nicer
    const newIdx = newDecks.indexOf(prevSelectedDeck);
    if (newIdx == -1) {
      clickDeck({decks:newDecks}, 0);
    } else {
      setSelected(newIdx);
    }
  }

  const shortcutCallback = useCallback(handleShortcut, [decks, selIdx]);
  useEffect(() => {
    document.addEventListener('keydown', shortcutCallback);
    return () => document.removeEventListener('keydown', shortcutCallback);
  }, [shortcutCallback]);

  return (
    <div className="App">
      <input autoFocus value={inputState} onChange={handleChange} />
      <ul>{decks.map((d, i) =>
        <li key={d}>
          <a href='#' className={i == selIdx ? 'selected' : ''}
            onClick={e => clickDeck(e, i)}>{d}</a>
        </li>)
      }</ul>
      <a href="#" onClick={e => getReviewerNextEntry(selIdx).then(update)}>
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
