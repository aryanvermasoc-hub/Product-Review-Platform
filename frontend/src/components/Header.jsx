import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BarChart3, Home, LogOut, Search, Shield, ShoppingBag, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authStore';
import { useCart } from '../context/cartStore';

const Header = () => {
  const { userInfo, logout } = useAuth();
  const { itemCount, setCartOpen } = useCart();

  // Safely check if the logged-in user has admin privileges
  const isUserAdmin = userInfo && (userInfo.isAdmin || ['admin', 'super-admin'].includes(userInfo.role));

  // --- THE SMART RESTORE ---
  // Restores the user's specific data when they log back in
  useEffect(() => {
    if (userInfo && userInfo._id) {
      if (!sessionStorage.getItem(`restored_${userInfo._id}`)) {
        // Pull cloud history directly from DB payload
        if (userInfo.recentSearches?.length) localStorage.setItem('recentSearches', JSON.stringify(userInfo.recentSearches));
        if (userInfo.recentlyViewed?.length) localStorage.setItem('recentlyViewed', JSON.stringify(userInfo.recentlyViewed));
        if (userInfo.recentCategory) localStorage.setItem('recentCategory', userInfo.recentCategory);
        if (userInfo.recentBrand) localStorage.setItem('recentBrand', userInfo.recentBrand);
        if (userInfo.recentMinRating !== undefined) localStorage.setItem('recentMinRating', userInfo.recentMinRating);
        if (userInfo.recentSort) localStorage.setItem('recentSort', userInfo.recentSort);
        
        sessionStorage.setItem(`restored_${userInfo._id}`, 'true');
        window.location.reload(); // Force state stores to pick up the restored data
      }
    }
  }, [userInfo]);

  const handleLogout = async () => {
    // 1. Call the original logout function to destroy the session
    await logout();
    
    // 2. Wipe ONLY the shared active state, NOT the entire local storage!
    ['cartItems', 'recentSearches', 'recentCategory', 'recentSearch', 'recentlyViewed', 'savedItems', 'recentBrand', 'recentMinRating', 'recentSort'].forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    
    // 3. Force a full page reload to clear any remaining in-memory React state
    window.location.href = '/login';
  };

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand-mark" aria-label="Go to home">
          <span className="brand-orb">P</span>
          <span>
            <strong>Product review platform</strong>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <NavLink to="/"><Home size={17} /> Store</NavLink>
          <a href="/#catalog"><Search size={17} /> Search</a>
          <NavLink to="/compare"><BarChart3 size={17} /> Compare</NavLink>
          {isUserAdmin && <NavLink to="/admin"><Shield size={17} /> Admin Dashboard</NavLink>}
        </nav>

        <div className="header-actions">
          <button className="icon-button" type="button" onClick={() => setCartOpen(true)} aria-label="Open cart">
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </button>
          {userInfo ? (
            <>
              <Link className="profile-chip" to="/account"><UserRound size={17} /> {userInfo.name?.split(' ')[0]}</Link>
              <button className="ghost-button compact" type="button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <Link to="/login" className="primary-button compact">Sign in</Link>
          )}
        </div>
      </header>

      <motion.nav className="mobile-bottom-nav" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} aria-label="Mobile navigation">
        <NavLink to="/"><Home size={20} /><span>Store</span></NavLink>
        <NavLink to="/compare"><BarChart3 size={20} /><span>Compare</span></NavLink>
        <button type="button" onClick={() => setCartOpen(true)}><ShoppingBag size={20} /><span>Cart</span></button>
        {isUserAdmin ? (
          <NavLink to="/admin"><Shield size={20} /><span>Admin</span></NavLink>
        ) : (
          <NavLink to={userInfo ? '/account' : '/login'}><UserRound size={20} /><span>Account</span></NavLink>
        )}
      </motion.nav>
    </>
  );
};

export default Header;
