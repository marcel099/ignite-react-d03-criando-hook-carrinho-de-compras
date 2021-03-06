import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    
    return [];
  });

  async function hasAvailableStock(productId: number, newAmount: number) {
    const response = await api.get<Stock>(`/stock/${productId}`);

    const {
      amount: amountInStock,
    } = response.data;

    if (newAmount > amountInStock) {
      toast.error('Quantidade solicitada fora de estoque');
      return false;
    }
    else {
      return true;
    }
  }

  const addProduct = async (productId: number) => {
    try {
      let newCart: Product[] = [...cart], newAmount: number;

      const cartProductIndex = newCart.findIndex(product => product.id === productId);
      const cartAlreadyHasThisProduct = cartProductIndex !== -1;

      if (cartAlreadyHasThisProduct) {
        newAmount = newCart[cartProductIndex].amount + 1;
      } else {
        newAmount = 1;
      }

      if (await hasAvailableStock(productId, newAmount) === false) {
        return;
      }

      if (cartAlreadyHasThisProduct) {
        const updatedCartProduct = {
          ...newCart[cartProductIndex],
          amount: newAmount,
        }

        newCart[cartProductIndex] = updatedCartProduct;
      } else {
        const response = await api.get<Product>(`/products/${productId}`)

        const product = response.data

        const newCartProduct = {
          ...product,
          amount: newAmount,
        }

        newCart.push(newCartProduct);
      }

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na adi????o do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];
      const cartProductIndex = newCart.findIndex(product => product.id === productId);

      if (cartProductIndex === -1) {
        throw(`Product doesn't exist`)
      }

      newCart.splice(cartProductIndex, 1);

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const newCart = [...cart];
      const cartProductIndex = newCart.findIndex(product => product.id === productId);

      if (cartProductIndex === -1) {
        throw(`Product doesn't exist`)
      }

      const newAmount = amount;
      // const newAmount = newCart[cartProductIndex].amount - 1;

      if (newAmount <= 0) {
        return;
      }

      if (await hasAvailableStock(productId, newAmount) === false) {
        return;
      }

      const updatedCartProduct = {
        ...newCart[cartProductIndex],
        amount: newAmount,
      }

      newCart[cartProductIndex] = updatedCartProduct;

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na altera????o de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
