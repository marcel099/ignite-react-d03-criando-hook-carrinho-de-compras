import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';


import Routes from './routes';
import GlobalStyles from './styles/global';
import Header from './components/Header';

import { CartProvider } from './hooks/useCart';
import { ProductProvider } from './hooks/useProduct';

const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <ProductProvider>
        <CartProvider>
          <GlobalStyles />
          <Header />
          <Routes />
          <ToastContainer autoClose={3000} />
        </CartProvider>
      </ProductProvider>
    </BrowserRouter>
  );
};

export default App;
