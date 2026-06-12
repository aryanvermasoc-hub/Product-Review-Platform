import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import LoginScreen from './screens/LoginScreen';
import CompareScreen from './screens/CompareScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import AdminScreen from './screens/AdminScreen';
import AccountScreen from './screens/AccountScreen';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/login" element={<LoginScreen mode="login" />} />
          <Route path="/signup" element={<LoginScreen mode="signup" />} />
          <Route path="/forgot-password" element={<LoginScreen mode="forgot" />} />
          <Route path="/reset-password/:token" element={<LoginScreen mode="reset" />} />
          <Route path="/super-admin-login" element={<LoginScreen mode="admin" />} />
          <Route path="/compare" element={<CompareScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/account" element={<AccountScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Header />
          <AnimatedRoutes />
          <CartDrawer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
