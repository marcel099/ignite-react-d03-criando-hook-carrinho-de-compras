import { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  formattedPrice: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {  
  const [productsFormatted, setProductsFormatted] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount

    return sumAmount
  }, {} as CartItemsAmount)

  useEffect(() => {  
    async function loadProducts() {
      const response = await api.get<Product[]>('/products')
      
      const productsFormatted = response.data.map(product => ({
        ...product,
        formattedPrice: formatPrice(product.price),
      }))

      setProductsFormatted(productsFormatted);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {productsFormatted.map(productFormatted => (
        <li key={productFormatted.id}>
          <img src={productFormatted.image} alt={productFormatted.title} />
          <strong>{productFormatted.title}</strong>
          <span>{productFormatted.formattedPrice}</span>
          <button
            type="button"
            data-testid="add-product-button"
          onClick={() => handleAddProduct(productFormatted.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[productFormatted.id] ?? 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
