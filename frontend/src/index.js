import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import io from 'socket.io-client'
import {setMainSocket, listDeck, getReviewerNextEntry} from './call.ts';

// Woohoo this actually works


const MContext = React.createContext();
setMainSocket(io('http://localhost:28735/'))
listDeck().then(d => console.log('eyo', d));
getReviewerNextEntry('DeepMind').then(n => {
  let state = {html:n};
  console.log(state);
  ReactDOM.render(
    <React.StrictMode>
      <MContext.Provider value={{state:n}}>
        <a href="#" onClick={e => listDeck().then(d => console.log(d))}>Reload</a>
        <App card={state} />
      </MContext.Provider>
    </React.StrictMode>,
    document.getElementById('root'));
});

export default MContext;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
