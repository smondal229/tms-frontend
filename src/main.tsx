import { SnackbarProvider } from 'notistack';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './config/i18n';
import './index.css';

import { ApolloProvider } from '@apollo/client/react';
import client from './apollo/client.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </SnackbarProvider>
  </StrictMode>
);
