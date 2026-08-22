import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { EduTrackProvider } from './context/EduTrackContext';

// Import CSS
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <EduTrackProvider>
        <App />
      </EduTrackProvider>
    </BrowserRouter>
  </React.StrictMode>
);
