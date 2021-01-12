import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './screens/App';
import First from './screens/First';
import Buttons from './screens/Buttons';

import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Switch, Route } from "react-router-dom";


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact path='/'>
          <First />
        </Route>
        <Route path='/0'>
          <App />
        </Route>
        <Route path='/1'>
          <Buttons />
        </Route>
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
