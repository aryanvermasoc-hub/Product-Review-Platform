import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, X } from 'lucide-react';

const CompareScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState(location.state?.compareProducts || []);

  const handleRemove = (productId) => {
    setCompareList(compareList.filter((product) => product._id !== productId));
  };

  const uniqueSpecs = useMemo(() => {
    const keys = new Set(['Price', 'Rating', 'Reviews', 'Stock', 'Brand', 'Category']);
    compareList.forEach((product) => {
      const specs = getProductSpecs(product);
      Object.keys(specs).forEach((key) => keys.add(normalizeKey(key)));
    });
    const priority = ['Price', 'Rating', 'Reviews', 'Stock', 'Brand', 'Category', 'Processor', 'RAM', 'Storage', 'Battery', 'Display', 'Camera', 'GPU', 'OS'];
    return Array.from(keys).sort((a, b) => {
      const indexA = priority.indexOf(a);
      const indexB = priority.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <div className="container empty-state glass-panel" style={{ marginTop: 40 }}>
        <BarChart3 size={46} />
        <h2>Nothing to compare</h2>
        <p>Select up to 3 products from the catalog to see a premium side-by-side analysis.</p>
        <button className="primary-button" type="button" onClick={() => navigate('/')}>Browse products</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-head" style={{ marginTop: 30 }}>
        <div>
          <p className="eyebrow"><BarChart3 size={14} /> Product intelligence</p>
          <h1 className="page-title">Compare Products</h1>
        </div>
        <Link className="secondary-button compact" to="/">Back to catalog</Link>
      </div>

      <section className="compare-shell">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Product</th>
              {compareList.map((product) => (
                <th key={product._id}>
                  <button className="icon-button" type="button" onClick={() => handleRemove(product._id)} aria-label={`Remove ${product.name}`}><X size={17} /></button>
                  <div className="product-image-wrap" style={{ marginTop: 10 }}><img src={product.image} alt={product.name} /></div>
                  <p className="eyebrow" style={{ marginTop: 12 }}>{product.brand}</p>
                  <h3>{cleanTitle(product.name)}</h3>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueSpecs.map((spec) => (
              <tr key={spec}>
                <td>{spec}</td>
                {compareList.map((product) => <td key={product._id}>{renderValue(product, spec)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const cleanTitle = (title = '') => title.split('|')[0].split('(')[0].split(',')[0].replace(/\b\d+\s*(GB|TB)\b/gi, '').trim();

const normalizeKey = (key) => {
  const lower = key.toLowerCase();
  if (lower === 'ram') return 'RAM';
  if (lower === 'gpu') return 'GPU';
  if (lower === 'os') return 'OS';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const extractSpecs = (title = '') => {
  const specs = {};
  const patterns = {
    RAM: /(\d+)\s*GB\s*RAM/i,
    Storage: /(\d+)\s*(GB|TB)\s*(Storage|ROM|Internal)?/i,
    Battery: /(\d+)\s*mAh/i,
    Camera: /(\d+)\s*MP/i,
    Display: /([\d.]+)\s*(inch|"|-inch)/i,
    Processor: /(Snapdragon|Dimensity|Helio|Exynos|Bionic|Intel Core|Ryzen)\s*([a-zA-Z0-9-]*)/i,
    OS: /(Android|iOS|Windows|macOS)\s*(\d+)?/i,
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = title.match(pattern);
    if (match) specs[key] = key === 'Storage' ? `${match[1]}${match[2] || 'GB'}` : match.slice(1).filter(Boolean).join(' ');
  });

  return specs;
};

const getProductSpecs = (product) => {
  if (product.specifications && Object.keys(product.specifications).length > 0) return product.specifications;
  return extractSpecs(product.name);
};

const renderValue = (product, spec) => {
  const baseValues = {
    Price: `Rs ${Number(product.price || 0).toLocaleString('en-IN')}`,
    Rating: Number(product.rating || 0).toFixed(1),
    Reviews: product.numReviews || 0,
    Stock: product.countInStock > 0 ? `${product.countInStock} available` : 'Out of stock',
    Brand: product.brand,
    Category: product.category,
  };

  if (baseValues[spec] !== undefined) return baseValues[spec];
  const specs = getProductSpecs(product);
  const key = Object.keys(specs).find((candidate) => normalizeKey(candidate) === spec);
  return key ? specs[key] : '-';
};

export default CompareScreen;
