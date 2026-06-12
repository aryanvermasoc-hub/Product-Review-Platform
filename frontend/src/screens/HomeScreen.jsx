import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Filter, Search, ShoppingBag, SlidersHorizontal, Star, X } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/cartStore';
import { useAuth } from '../context/authStore';

const formatPrice = (price = 0) => `Rs ${Number(price).toLocaleString('en-IN')}`;

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(localStorage.getItem('recentCategory') || 'All');
  const [searchInput, setSearchInput] = useState(localStorage.getItem('recentSearch') || '');
  const [keyword, setKeyword] = useState(localStorage.getItem('recentSearch') || '');
  const [minRating, setMinRating] = useState(Number(localStorage.getItem('recentMinRating')) || 0);
  const [brand, setBrand] = useState(localStorage.getItem('recentBrand') || '');
  const [sort, setSort] = useState(localStorage.getItem('recentSort') || 'rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('recentSearches') || '[]'));
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userInfo } = useAuth();

  const isUserAdmin = userInfo && (userInfo.isAdmin || ['admin', 'super-admin'].includes(userInfo.role));

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/products', {
          params: {
            pageNumber: page,
            category: selectedCategory === 'All' ? '' : selectedCategory,
            keyword,
            rating: minRating,
            brand,
            sort,
          },
        });
        setProducts(data.products || []);
        setPage(data.page || 1);
        setTotalPages(data.pages || 1);
        setCategories(['All', ...(data.categories || [])]);
        setBrands(data.brands || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Could not load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedCategory, keyword, minRating, brand, sort]);

  const trendingSearches = useMemo(() => ['iPhone', 'Gaming Console', 'Laptop', 'Headphones'], []);

  const handleSearch = (e, value = searchInput) => {
    e?.preventDefault();
    const nextKeyword = value.trim();
    setKeyword(nextKeyword);
    setPage(1);
    setSelectedCategory('All');
    localStorage.setItem('recentCategory', 'All');
    localStorage.setItem('recentSearch', nextKeyword);
    if (nextKeyword) {
      const nextRecent = [nextKeyword, ...recentSearches.filter((item) => item.toLowerCase() !== nextKeyword.toLowerCase())].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('recentSearches', JSON.stringify(nextRecent));
      if (userInfo?._id) {
        api.put('/users/sync', { recentSearches: nextRecent }).catch(console.error);
      }
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setKeyword('');
    setSearchInput('');
    setPage(1);
    localStorage.setItem('recentCategory', cat);
    localStorage.removeItem('recentSearch');
    if (userInfo?._id) {
      api.put('/users/sync', { recentCategory: cat }).catch(console.error);
    }
  };

  const handleToggleCompare = (product) => {
    setError(''); // Clear any stuck error message immediately

    const exists = compareList.find((p) => p._id === product._id);
    if (exists) {
      setCompareList(compareList.filter((p) => p._id !== product._id));
      return;
    }
    if (compareList.length >= 3) {
      setError('You can compare up to 3 products at once.');
      setTimeout(() => setError(''), 3500); // Auto-dismiss the error after 3.5 seconds
      return;
    }
    setCompareList([...compareList, product]);
  };

  const clearFilters = () => {
    localStorage.removeItem('recentCategory');
    localStorage.removeItem('recentSearch');
    localStorage.removeItem('recentBrand');
    localStorage.removeItem('recentMinRating');
    localStorage.removeItem('recentSort');
    setSelectedCategory('All');
    setKeyword('');
    setSearchInput('');
    setMinRating(0);
    setBrand('');
    setSort('rating');
    setPage(1);
  };

  const createProductHandler = async () => {
    if (window.confirm('Create a new sample product?')) {
      try {
        const { data } = await api.post('/products');
        // Navigate to the newly created product so the admin can edit it immediately
        navigate(`/product/${data._id}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Error creating product. Make sure you are an Admin.');
      }
    }
  };

  const featured = products[0];

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <p className="eyebrow">Luxury commerce intelligence</p>
            <h1>Compare, choose, and checkout with absolute confidence.</h1>
            <p>
              A premium catalog experience with instant search, smart filters, product reviews, live cart,
              delivery estimates, and data-rich comparisons.
            </p>

            <form className="search-command" onSubmit={handleSearch} role="search">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search smartphones, laptops, cameras..."
                aria-label="Search products"
              />
              <button className="primary-button" type="submit"><Search size={18} /> Search</button>
            </form>

            <div className="pill-row" style={{ marginTop: 14 }}>
              {[...new Set([...recentSearches, ...trendingSearches])].slice(0, 8).map((item) => (
                <button className="pill" type="button" key={item} onClick={(e) => { setSearchInput(item); handleSearch(e, item); }}>
                  {item}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div className="hero-visual glass-panel" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}>
            {featured ? <img src={featured.image} alt={featured.name} /> : <div className="skeleton" />}
            <div className="hero-stat-grid">
              <div className="hero-stat"><strong>{categories.length - 1}</strong><span>Curated categories</span></div>
              <div className="hero-stat"><strong>{brands.length}</strong><span>Brand filters</span></div>
              <div className="hero-stat"><strong>18%</strong><span>Tax estimate ready</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container" id="catalog">

        <div className="section-head">
          <div>
            <p className="eyebrow"><Filter size={14} /> Curated results</p>
            <h2 className="page-title">Premium Catalog</h2>
          </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isUserAdmin && (
            <button className="primary-button compact" onClick={createProductHandler} style={{ backgroundColor: '#111' }}>+ Create Product</button>
          )}
          <span className="muted">Page {page} of {totalPages}</span>
        </div>
        </div>

        <div className="catalog-toolbar" style={{ marginBottom: '40px', position: 'relative', backgroundColor: '#f8f9fa', zIndex: 20 }}>
          <div className="filter-grid">
            <div className="pill-row" aria-label="Categories">
              {categories.map((cat) => (
                <button className={`pill ${selectedCategory === cat ? 'active' : ''}`} key={cat} type="button" onClick={() => handleCategoryClick(cat)}>
                  {cat}
                </button>
              ))}
            </div>
        <select className="premium-select" value={brand} onChange={(e) => { 
          const val = e.target.value;
          setBrand(val); 
          localStorage.setItem('recentBrand', val);
          if (userInfo?._id) api.put('/users/sync', { recentBrand: val }).catch(console.error);
          setPage(1); 
        }} aria-label="Brand filter">
              <option value="">All brands</option>
              {brands.slice(0, 80).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
        <select className="premium-select" value={minRating} onChange={(e) => { 
          const val = Number(e.target.value);
          setMinRating(val); 
          localStorage.setItem('recentMinRating', val);
          if (userInfo?._id) api.put('/users/sync', { recentMinRating: val }).catch(console.error);
          setPage(1); 
        }} aria-label="Rating filter">
              <option value="0">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
            </select>
        <select className="premium-select" value={sort} onChange={(e) => {
          const val = e.target.value;
          setSort(val);
          localStorage.setItem('recentSort', val);
          if (userInfo?._id) api.put('/users/sync', { recentSort: val }).catch(console.error);
        }} aria-label="Sort products">
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
              <option value="priceAsc">Price low to high</option>
              <option value="priceDesc">Price high to low</option>
            </select>
            <button className="ghost-button compact" type="button" onClick={clearFilters}><X size={16} /> Reset</button>
          </div>
        </div>

        {error && <div className="alert" role="alert">{error}</div>}

        {loading ? (
          <div className="product-grid">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}</div>
        ) : products.length === 0 ? (
          <div className="empty-state glass-panel">
            <SlidersHorizontal size={36} />
            <h3>No products match your filters</h3>
            <p>Try a broader search or reset the catalog filters.</p>
            <button className="primary-button" type="button" onClick={clearFilters}>Reset filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => {
              const selected = compareList.some((p) => p._id === product._id);
              const lowStock = product.countInStock <= 5;
              return (
                <motion.article
                  className="product-card"
                  key={product._id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: Math.min(index * 0.025, 0.25) }}
                >
                  <div className="product-image-wrap">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="brand-line"><span>{product.brand}</span><span>{product.category}</span></div>
                  <h3>{product.name}</h3>
                  <div className="rating-line">
                    <Star className="star" size={16} />
                    <strong>{Number(product.rating || 0).toFixed(1)}</strong>
                    <span>({product.numReviews || 0})</span>
                  </div>
                  <div className="price-line">
                    <strong>{formatPrice(product.price)}</strong>
                    <span className="muted"><span className={`stock-dot ${lowStock ? 'low' : ''}`} /> {lowStock ? 'Low stock' : 'In stock'}</span>
                  </div>
                  <div className="product-actions" style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px' }}>
                    <Link className="secondary-button compact" to={`/product/${product._id}`} style={{ flex: 1, minWidth: 0, padding: '0 4px', fontSize: '12px', display: 'flex', justifyContent: 'center' }}>Details</Link>
                    <button 
                      className={`secondary-button compact ${selected ? 'active' : ''}`} 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleCompare(product);
                      }}
                      style={{ flex: 1, minWidth: 0, padding: '0 4px', fontSize: '12px', display: 'flex', justifyContent: 'center' }}
                    >
                      {selected ? 'Selected' : 'Compare'}
                    </button>
                    <button className="primary-button compact" type="button" onClick={() => addToCart(product)} style={{ flex: 1, minWidth: 0, padding: '0 4px', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      <ShoppingBag size={14} /> Add
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="pill-row" style={{ justifyContent: 'center', marginBottom: 100 }}>
            <button className="secondary-button compact" type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
            <button className="secondary-button compact" type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
          </div>
        )}
      </section>

      {compareList.length > 0 && (
        <motion.div className="compare-bar glass-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <strong><BarChart3 size={17} /> {compareList.length} / 3 selected</strong>
          <div className="pill-row">
            <button className="ghost-button compact" type="button" onClick={() => setCompareList([])}>Clear</button>
            <button className="primary-button compact" type="button" onClick={() => navigate('/compare', { state: { compareProducts: compareList } })}>Compare now</button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default HomeScreen;
