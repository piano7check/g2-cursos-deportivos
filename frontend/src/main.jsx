import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { UsuarioProvider } from './context/UsuarioContext';
import { BrowserRouter as Router } from 'react-router-dom'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <UsuarioProvider>
        <App />
      </UsuarioProvider>
    </Router>
  </React.StrictMode>
);
