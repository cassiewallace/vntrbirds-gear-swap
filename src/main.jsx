import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SubmissionProvider } from './context/SubmissionContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SubmissionProvider>
        <App />
      </SubmissionProvider>
    </BrowserRouter>
  </StrictMode>
);
