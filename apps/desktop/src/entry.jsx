import React from 'react';
import { createRoot } from 'react-dom/client';
import StaffRoot from './StaffRoot';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StaffRoot />
  </React.StrictMode>,
);
