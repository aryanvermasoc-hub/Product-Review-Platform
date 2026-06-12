import { useState, useEffect } from 'react';
import { CartContext } from './cartStore';
import { useAuth } from './authStore';
import api from '../lib/api';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [savedItems, setSavedItems] = useState(() => JSON.parse(localStorage.getItem('savedItems') || '[]'));

  const { userInfo } = useAuth();

  // --- CLOUD SYNC: MERGE LOCAL AND MONGODB CARTS ON LOGIN ---
  useEffect(() => {
    if (userInfo && userInfo._id) {
      const dbCart = userInfo.cartItems || [];
      const localCart = readCart();

      // Merge: Keep local items, add missing cloud items
      const merged = [...localCart];
      dbCart.forEach(dbItem => {
        if (!merged.find(i => i.product === dbItem.product)) {
          merged.push(dbItem);
        }
      });

      setCartItems(merged);

      // Merge: Saved Items
      const dbSaved = userInfo.savedItems || [];
      const localSaved = JSON.parse(localStorage.getItem('savedItems') || '[]');
      const mergedSaved = [...localSaved];
      dbSaved.forEach(dbItem => {
        if (!mergedSaved.find(i => i.product === dbItem.product)) {
          mergedSaved.push(dbItem);
        }
      });
      
      setSavedItems(mergedSaved);
      localStorage.setItem('cartItems', JSON.stringify(merged));
      localStorage.setItem('savedItems', JSON.stringify(mergedSaved));

      // Save merged cart back to the cloud
      api.put('/users/sync', { cartItems: merged, savedItems: mergedSaved }).catch(console.error);
    } else {
      setCartItems(readCart());
      setSavedItems(JSON.parse(localStorage.getItem('savedItems') || '[]'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?._id]);

  const persist = (items) => {
    setCartItems(items);
    localStorage.setItem('cartItems', JSON.stringify(items));

    // Auto-save to MongoDB whenever the cart changes
    if (userInfo && userInfo._id) {
      api.put('/users/sync', { cartItems: items }).catch(console.error);
    }
  };

  const addToCart = (product, qty = 1) => {
    const existing = cartItems.find((item) => item.product === product._id);
    const nextItems = existing
      ? cartItems.map((item) => (item.product === product._id ? { ...item, qty: Math.min(item.qty + qty, product.countInStock || 99) } : item))
      : [
          ...cartItems,
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            brand: product.brand,
            countInStock: product.countInStock,
            qty,
          },
        ];
    persist(nextItems);
    setCartOpen(true);
  };

  const updateQty = (productId, qty) => {
    persist(cartItems.map((item) => (item.product === productId ? { ...item, qty: Math.max(1, Math.min(Number(qty), item.countInStock || 99)) } : item)));
  };

  const removeFromCart = (productId) => {
    persist(cartItems.filter((item) => item.product !== productId));
  };

  const saveForLater = (item) => {
    const nextSaved = savedItems.some((saved) => saved.product === item.product) ? savedItems : [...savedItems, item];
    setSavedItems(nextSaved);
    localStorage.setItem('savedItems', JSON.stringify(nextSaved));
    if (userInfo && userInfo._id) {
      api.put('/users/sync', { savedItems: nextSaved }).catch(console.error);
    }
    removeFromCart(item.product);
  };

  const clearCart = () => persist([]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartOpen, setCartOpen, addToCart, updateQty, removeFromCart, saveForLater, clearCart, savedItems, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
