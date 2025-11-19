import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/variables.css';
import './styles/globals.css';
import './styles/themes.css';

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

