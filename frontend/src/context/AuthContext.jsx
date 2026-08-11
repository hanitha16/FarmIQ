import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('farmiq_token') || '');
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('farmiq_lang') || 'English');
  const [simpleMode, setSimpleMode] = useState(false);

  // Cart State (Persisted per authenticated user)
  const cartStorageKey = user?.id ? `farmiq_cart_${user.id}` : 'farmiq_cart_guest';
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('farmiq_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Persist cart whenever it changes
  useEffect(() => {
    localStorage.setItem('farmiq_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Auth verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (userToken, userData) => {
    localStorage.setItem('farmiq_token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('farmiq_token');
    setToken('');
    setUser(null);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('farmiq_lang', lang);
  };

  // --- Cart System Functions ---
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        // Increment quantity of existing item
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        // Add new product with initial quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate Total Quantity & Total Price
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      loading,
      loginUser,
      logout,
      language,
      changeLanguage,
      simpleMode,
      setSimpleMode,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      totalCartCount,
      cartSubtotal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
