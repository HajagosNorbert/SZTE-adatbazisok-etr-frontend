import React from 'react';
import ReactDOM from 'react-dom';
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import './index.css';
import App from './App';

const options = {
  position: positions.BOTTOM_RIGHT,
  timeout: 5000,
  offset: '5px',
  transition: transitions.FADE
}

ReactDOM.render(

  <React.StrictMode>
    <AlertProvider template={AlertTemplate} {...options}>
      <App />
    </AlertProvider>
  </React.StrictMode>,
  document.getElementById('root')
);