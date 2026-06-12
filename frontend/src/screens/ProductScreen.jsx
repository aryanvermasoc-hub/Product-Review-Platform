import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, PackageCheck, ShieldCheck, ShoppingBag, Star, Truck, ZoomIn } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/authStore';
import { useCart } from '../context/cartStore';

const formatPrice = (price = 0) => `Rs ${Number(price).toLocaleString('en-IN')}`;

const ProductScreen = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [deliveryDate] = useState(() =>
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  );
  const { userInfo } = useAuth();
  const { addToCart } = useCart();

  const navigate = useNavigate();
  const isUserAdmin = userInfo && (userInfo.isAdmin || ['admin', 'super-admin'].includes(userInfo.role));

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const [{ data }, recommendations] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get(`/products/${productId}/recommendations`).catch(() => ({ data: [] })),
        ]);
        setProduct(data);
        setSelectedImage(data.image);
        setRelated(recommendations.data || []);
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const nextRecent = [data, ...recent.filter((item) => item._id !== data._id)].slice(0, 6);
        localStorage.setItem('recentlyViewed', JSON.stringify(nextRecent));
        if (userInfo?._id) {
          api.put('/users/sync', { recentlyViewed: nextRecent }).catch(console.error);
        }
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, userInfo?._id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
  }, [product]);

  const specs = useMemo(() => {
    if (!product?.specifications) return [];
    const source = product.specifications instanceof Map ? Object.fromEntries(product.specifications) : product.specifications;
    return Object.entries(source).slice(0, 8);
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setReviewMessage('');
    try {
      await api.post(`/products/${productId}/reviews`, { rating: Number(rating), comment });
      const { data } = await api.get(`/products/${productId}`);
      setProduct(data);
      setRating('');
      setComment('');
      setReviewMessage('Review submitted successfully.');
    } catch (submitError) {
      setReviewMessage(submitError.response?.data?.message || 'Error submitting review');
    }
  };

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const editHandler = async () => {
    const newName = window.prompt('Enter new product name:', product.name);
    if (!newName) return;
    const newPrice = window.prompt('Enter new price (INR):', product.price);
    if (!newPrice) return;
    
    try {
      const { data } = await api.put(`/products/${productId}`, { ...product, name: newName, price: Number(newPrice) });
      setProduct(data);
      alert('Product updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating product');
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: 40 }}><div className="skeleton" /></div>;
  }

  if (error || !product) {
    return <div className="container empty-state glass-panel" style={{ marginTop: 40 }}><h2>{error || 'Product not found'}</h2><Link className="primary-button" to="/">Back to catalog</Link></div>;
  }

  const stockLabel = product.countInStock > 0 ? `${product.countInStock} units available` : 'Out of stock';

  return (
    <div className="container">
      <Link className="ghost-button compact" to="/" style={{ marginTop: 24 }}>Back to catalog</Link>

      <section className="product-hero">
        <div>
          <motion.div className="gallery-main" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <img src={selectedImage || product.image} alt={product.name} />
          </motion.div>
          {gallery.length > 1 && (
            <div className="pill-row" style={{ marginTop: 12 }}>
              {gallery.map((image) => (
                <button className={`pill ${selectedImage === image ? 'active' : ''}`} type="button" key={image} onClick={() => setSelectedImage(image)}>
                  <ZoomIn size={14} /> Image
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <p className="eyebrow">{product.brand} / {product.category}</p>
          <h1>{product.name}</h1>
          <div className="rating-line">
            <Star className="star" size={19} />
            <strong>{Number(product.rating || 0).toFixed(2)}</strong>
            <span>{product.numReviews || 0} reviews</span>
          </div>
          <div className="product-price">{formatPrice(product.price)}</div>
          <p className="muted" style={{ lineHeight: 1.7 }}>{product.description}</p>

          <div className="trust-grid" style={{ margin: '20px 0' }}>
            <div><Truck size={20} /><strong>Delivery</strong><p className="muted">Arrives by {deliveryDate}</p></div>
            <div><PackageCheck size={20} /><strong>Inventory</strong><p className="muted">{stockLabel}</p></div>
            <div><ShieldCheck size={20} /><strong>Protection</strong><p className="muted">Verified reviews and secure checkout</p></div>
          </div>

          {product.variants?.length > 0 && (
            <div className="pill-row" style={{ marginBottom: 18 }}>
              {product.variants.map((variant) => <button className="pill" type="button" key={`${variant.name}-${variant.value}`}>{variant.name}: {variant.value}</button>)}
            </div>
          )}

          <div className="product-actions" style={{ justifyContent: 'flex-start' }}>
            <button className="primary-button" type="button" disabled={product.countInStock === 0} onClick={() => addToCart(product)}>
              <ShoppingBag size={18} /> Add to cart
            </button>
            <Link className="secondary-button" to="/checkout">Buy now</Link>
        
        {isUserAdmin && (
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button className="secondary-button" onClick={editHandler}>Edit Name/Price</button>
            <button className="ghost-button" onClick={deleteHandler} style={{ color: '#dc2626' }}>Delete</button>
          </div>
        )}
          </div>
        </div>
      </section>

      {specs.length > 0 && (
        <section className="review-panel" style={{ marginBottom: 24 }}>
          <div className="section-head"><h2>Technical Profile</h2><span className="muted">Structured specs</span></div>
          <div className="spec-grid">
            {specs.map(([key, value]) => <div key={key}><strong>{key}</strong><p className="muted">{value}</p></div>)}
          </div>
        </section>
      )}

      <section className="reviews-grid">
        <div className="review-panel">
          <div className="section-head">
            <h2>Community Reviews</h2>
            <span className="muted">{product.reviews?.length || 0} entries</span>
          </div>
          {(!product.reviews || product.reviews.length === 0) && <p className="muted">No reviews yet. Be the first to review this product.</p>}
          {product.reviews?.map((review) => (
            <article className="review-item" key={review._id}>
              <div className="review-header">
                <strong>{review.name}</strong>
                <span>{Array.from({ length: 5 }).map((_, index) => <Star className={index < review.rating ? 'star' : ''} size={15} key={index} />)}</span>
              </div>
              <p className="muted"><Clock3 size={14} /> {review.createdAt?.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>

        <aside className="review-panel">
          <h2>Write a Review</h2>
          {reviewMessage && <div className={reviewMessage.includes('success') ? 'form-note' : 'alert'}>{reviewMessage}</div>}
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <div className="field">
                <label htmlFor="rating">Rating</label>
                <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)} required>
                  <option value="">Select rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="comment">Comment</label>
                <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What should other buyers know?" required />
              </div>
              <button className="primary-button full" type="submit"><CheckCircle2 size={18} /> Submit review</button>
            </form>
          ) : (
            <div className="empty-state">
              <p>Please sign in to write a review.</p>
              <Link className="primary-button" to="/login">Sign in</Link>
            </div>
          )}
        </aside>
      </section>

      {related.length > 0 && (
        <section style={{ marginBottom: 90 }}>
          <div className="section-head"><h2>Smart Recommendations</h2><span className="muted">Related by brand and category</span></div>
          <div className="product-grid">
            {related.slice(0, 4).map((item) => (
              <article className="product-card" key={item._id}>
                <div className="product-image-wrap"><img src={item.image} alt={item.name} loading="lazy" /></div>
                <div className="brand-line"><span>{item.brand}</span><span>{item.category}</span></div>
                <h3>{item.name}</h3>
                <div className="price-line"><strong>{formatPrice(item.price)}</strong></div>
                <div className="product-actions">
                  <Link className="secondary-button compact" to={`/product/${item._id}`}>Details</Link>
                  <button className="primary-button compact" type="button" onClick={() => addToCart(item)}>Add</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductScreen;
