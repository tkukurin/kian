import {React, useState} from 'react';
import './App.css';
import MContext from './index.js';

function App(card) {
  const [isActive, setActive] = useState(false);
  return (
    <div className="App">
      <MContext.Consumer>
        {context => (
          <div>
            <a dangerouslySetInnerHTML={{__html:context.state.front}} href="#"
              className={isActive ? "hidden" : ""}
              onClick={evt => setActive(true)} />
            <div className={isActive ? "" : "hidden"}
              dangerouslySetInnerHTML={{__html:context.state.back}} />
          </div>
        )}
      </MContext.Consumer>
    </div>
  );
}

export default App;
