import '../../node_modules/@aptible/arrow-ds/public/css/styles.min.css';
import './main.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
