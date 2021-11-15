import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { api } from "../services/api";
import { Product } from "../types";

interface ProductContextData {
  products: Product[];
}

const ProductContext = createContext<ProductContextData>({} as ProductContextData)

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('/products')
      
      setProducts(response.data)
    }

    loadProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{products}}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct(): ProductContextData {
  const context = useContext(ProductContext);

  return context;
}