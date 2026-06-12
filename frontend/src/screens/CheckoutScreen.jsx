import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, MapPin, TicketPercent } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/authStore';
import { useCart } from '../context/cartStore';

const CheckoutScreen = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [prices, setPrices] = useState({ itemsPrice: subtotal, taxPrice: 0, shippingPrice: 0, discountPrice: 0, totalPrice: subtotal });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: userInfo?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });
  const [guestEmail, setGuestEmail] = useState(userInfo?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const estimate = async () => {
      if (cartItems.length === 0) return;
      try {
        const { data } = await api.post('/orders/estimate', { items: cartItems, couponCode });
        setPrices(data);
      } catch {
        setPrices({ itemsPrice: subtotal, taxPrice: Math.round(subtotal * 0.18), shippingPrice: subtotal > 49999 ? 0 : 499, discountPrice: 0, totalPrice: subtotal + Math.round(subtotal * 0.18) + (subtotal > 49999 ? 0 : 499) });
      }
    };
    estimate();
  }, [cartItems, couponCode, subtotal]);

  const applyCoupon = async () => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, itemsPrice: subtotal });
      setMessage(`${data.code} applied. Discount Rs ${data.discount.toLocaleString('en-IN')}`);
    } catch (couponError) {
      setError(couponError.response?.data?.message || 'Coupon could not be applied');
    }
  };

  const placeOrder = async () => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/orders', {
        items: cartItems,
        shippingAddress,
        guestEmail,
        couponCode,
        paymentMethod: 'Cash on Delivery',
      });
      clearCart();
      setMessage(`Order ${data._id} placed successfully.`);
      setStep(3);
    } catch (orderError) {
      setError(orderError.response?.data?.message || 'Could not place order');
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="container empty-state glass-panel" style={{ marginTop: 40 }}>
        <h2>Your cart is empty</h2>
        <p>Add products before starting checkout.</p>
        <Link className="primary-button" to="/">Browse catalog</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-grid">
      <section className="checkout-card">
        <div className="checkout-steps">
          <div className={`step ${step === 1 ? 'active' : ''}`}>Shipping</div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>Review</div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>Done</div>
        </div>

        {message && <div className="form-note">{message}</div>}
        {error && <div className="alert">{error}</div>}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <p className="eyebrow"><MapPin size={14} /> Delivery details</p>
            {!userInfo && (
              <div className="field">
                <label htmlFor="guestEmail">Guest email</label>
                <input id="guestEmail" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
              </div>
            )}
            {Object.entries(shippingAddress).map(([key, value]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1')}</label>
                <input id={key} value={value} onChange={(e) => setShippingAddress({ ...shippingAddress, [key]: e.target.value })} required />
              </div>
            ))}
            <button className="primary-button full" type="submit">Continue to review</button>
          </form>
        )}

        {step === 2 && (
          <div>
            <p className="eyebrow"><CreditCard size={14} /> Review order</p>
            {cartItems.map((item) => (
              <div className="order-summary-line" key={item.product}>
                <span>{item.name} x {item.qty}</span>
                <strong>Rs {(item.price * item.qty).toLocaleString('en-IN')}</strong>
              </div>
            ))}
            <div className="pill-row" style={{ marginTop: 18 }}>
              <button className="secondary-button" type="button" onClick={() => setStep(1)}>Back</button>
              <button className="primary-button" type="button" onClick={placeOrder}>Place order</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="empty-state">
            <CheckCircle2 size={48} />
            <h2>Order confirmed</h2>
            <p>Your checkout flow completed successfully.</p>
            <button className="primary-button" type="button" onClick={() => navigate('/')}>Continue shopping</button>
          </div>
        )}
      </section>

      <aside className="checkout-card">
        <p className="eyebrow"><TicketPercent size={14} /> Summary</p>
        <div className="field">
          <label htmlFor="coupon">Coupon code</label>
          <input id="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
        </div>
        <button className="secondary-button full" type="button" onClick={applyCoupon}>Apply coupon</button>
        <div style={{ marginTop: 18 }}>
          <div className="order-summary-line"><span>Items</span><strong>Rs {prices.itemsPrice.toLocaleString('en-IN')}</strong></div>
          <div className="order-summary-line"><span>Tax</span><strong>Rs {prices.taxPrice.toLocaleString('en-IN')}</strong></div>
          <div className="order-summary-line"><span>Shipping</span><strong>Rs {prices.shippingPrice.toLocaleString('en-IN')}</strong></div>
          <div className="order-summary-line"><span>Discount</span><strong>- Rs {prices.discountPrice.toLocaleString('en-IN')}</strong></div>
          <div className="total-row" style={{ paddingTop: 16 }}><span>Total</span><strong>Rs {prices.totalPrice.toLocaleString('en-IN')}</strong></div>
        </div>
      </aside>
    </div>
  );
};

export default CheckoutScreen;
