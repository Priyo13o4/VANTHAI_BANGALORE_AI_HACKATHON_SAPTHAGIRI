import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Load tour registries at startup (side effects — registers tours globally)
import './apps/cloudcare/tours/index';
import './apps/itr/tours/index';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
