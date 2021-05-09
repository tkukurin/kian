import './index.css';
import 'katex/dist/katex.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import io from 'socket.io-client'
import {setMainSocket, listDeck, getReviewerNextEntry} from './call.ts';

// renders superscript as subscript ??
// example to test Katex:
// import katex from 'katex';
// <div dangerouslySetInnerHTML={{__html:katex.renderToString('A=S^{-1}D_{-1}S')}} />

setMainSocket(io('http://localhost:28735/'))
listDeck().then(d => {
  return getReviewerNextEntry(d[0]).then(n => {
    ReactDOM.render(
      <React.StrictMode>
        <App decksInit={d} cardInit={n} />
      </React.StrictMode>,
      document.getElementById('root'));
  })
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
