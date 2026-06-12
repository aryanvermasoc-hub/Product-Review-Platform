import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/cartStore';

const CartDrawer = () => {
  const { cartItems, cartOpen, setCartOpen, updateQty, removeFromCart, saveForLater, subtotal } = useCart();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            aria-label="Close cart overlay"
            className="drawer-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            aria-label="Shopping cart"
          >
            <div className="drawer-header">
              <div>
                <p className="eyebrow">Checkout ready</p>
                <h2>Your Cart</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={36} />
                <h3>Your cart is waiting</h3>
                <p>Add premium products from the catalog and checkout when you are ready.</p>
                <Link to="/" className="primary-button" onClick={() => setCartOpen(false)}>Browse catalog</Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article className="cart-line" key={item.product}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="line-brand">{item.brand}</p>
                        <h3>{item.name}</h3>
                        <strong>Rs {item.price.toLocaleString('en-IN')}</strong>
                        <div className="quantity-stepper">
                          <button type="button" onClick={() => updateQty(item.product, item.qty - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.product, item.qty + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                        </div>
                      </div>
                      <div className="line-actions">
                        <button type="button" onClick={() => saveForLater(item)}>Save</button>
                        <button type="button" onClick={() => removeFromCart(item.product)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="drawer-footer">
                  <div className="total-row"><span>Subtotal</span><strong>Rs {subtotal.toLocaleString('en-IN')}</strong></div>
                  <p>Shipping, tax, and coupons are calculated in checkout.</p>
                  <Link to="/checkout" className="primary-button full" onClick={() => setCartOpen(false)}>Checkout</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
