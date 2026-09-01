'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authenticateWithCredentials,
  decodeToken,
  generateToken,
  MOCK_USERS_DB,
  normalizeRole,
  ROLES,
} from '@/lib/auth';
import { initialSales } from '@/data/sales';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Customer Shopping Cart State
  const [cart, setCart] = useState([
    {
      id: 'prod-001',
      name: 'Farm Fresh Milk 1L (Whole)',
      price: 58,
      originalPrice: 65,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      unit: 'Tetra',
      category: 'Dairy & Eggs',
    },
    {
      id: 'prod-002',
      name: 'Artisan Whole Wheat Sourdough Bread',
      price: 95,
      originalPrice: 110,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      unit: 'Loaf',
      category: 'Bakery & Snacks',
    },
  ]);

  // Customer Wishlist State
  const [wishlist, setWishlist] = useState([
    {
      id: 'prod-003',
      name: 'Greek Probiotic Natural Yogurt 500g',
      price: 135,
      originalPrice: 150,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
      unit: 'Tub',
      category: 'Dairy & Eggs',
      rating: 4.9,
    },
  ]);

  // Customer Orders State (Personalized order history)
  const [customerOrders, setCustomerOrders] = useState([
    {
      id: 'ORD-2026-9021',
      date: '2026-08-27 14:30',
      status: 'Delivered',
      totalAmount: 1890,
      itemCount: 3,
      store: 'Indiranagar Flagship (Store 01)',
      paymentMethod: 'UPI (Google Pay)',
      deliveryAddress: 'Flat 402, Palm Heights, 12th Main, Indiranagar, Bangalore - 560038',
      items: [
        { name: 'Farm Fresh Milk 1L (Whole)', qty: 4, price: 58, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
        { name: 'Premium Arabica Coffee Beans (1kg)', qty: 1, price: 950, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80' },
        { name: 'Organic Oat Milk 1L Barista Edition', qty: 2, price: 240, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80' },
      ],
    },
    {
      id: 'ORD-2026-8842',
      date: '2026-08-20 18:15',
      status: 'Delivered',
      totalAmount: 730,
      itemCount: 2,
      store: 'Indiranagar Flagship (Store 01)',
      paymentMethod: 'Credit Card (HDFC)',
      deliveryAddress: 'Flat 402, Palm Heights, 12th Main, Indiranagar, Bangalore - 560038',
      items: [
        { name: 'Artisan Whole Wheat Sourdough Bread', qty: 2, price: 95, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
        { name: 'Royal Basmati Rice 5kg', qty: 1, price: 540, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
      ],
    },
  ]);

  useEffect(() => {
    // Hydrate session from stored JWT Token
    try {
      const storedToken = localStorage.getItem('retailmind_jwt_token');
      if (storedToken) {
        const claims = decodeToken(storedToken);
        if (claims && claims.email) {
          if (claims.exp && claims.exp * 1000 < Date.now()) {
            localStorage.removeItem('retailmind_jwt_token');
            localStorage.removeItem('retailmind_user');
            setUser(null);
            setToken(null);
          } else {
            const userPayload = {
              id: claims.sub || claims.id || 'usr-admin-001',
              name: claims.name || 'Admin User',
              email: claims.email,
              role: normalizeRole(claims.role),
              store: claims.store || 'Headquarters (HQ)',
              avatar: claims.avatar || 'AU',
              image: claims.image || null,
              permissions: claims.permissions || ['all'],
            };
            setUser(userPayload);
            setToken(storedToken);
          }
        }
      } else {
        // Default unauthenticated on fresh load
        setUser(null);
        setToken(null);
      }

      // Hydrate cart & wishlist from localStorage if present
      const savedCart = localStorage.getItem('retailmind_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {}
      }
      const savedWishlist = localStorage.getItem('retailmind_wishlist');
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {}
      }
      const savedOrders = localStorage.getItem('retailmind_customer_orders');
      if (savedOrders) {
        try {
          setCustomerOrders(JSON.parse(savedOrders));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error hydrating JWT token:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authenticateWithCredentials(email, password);
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('retailmind_jwt_token', result.token);
      localStorage.setItem('retailmind_user', JSON.stringify(result.user));
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('retailmind_jwt_token');
    localStorage.removeItem('retailmind_user');
  };

  const switchRole = (newRole) => {
    const targetRole = normalizeRole(newRole);
    let targetUser = MOCK_USERS_DB.find((u) => u.role === targetRole);
    if (!targetUser) {
      targetUser = {
        id: `usr-${targetRole.toLowerCase()}-01`,
        name: targetRole === ROLES.CUSTOMER ? 'Vikram Malhotra' : targetRole === ROLES.SELLER ? 'Priya Sharma' : 'Admin Superuser',
        email: `${targetRole.toLowerCase()}@retailmind.ai`,
        role: targetRole,
        store: targetRole === ROLES.ADMIN ? 'Headquarters (HQ)' : 'Indiranagar Flagship (Store 01)',
        permissions: targetRole === ROLES.CUSTOMER ? ['shop', 'cart'] : targetRole === ROLES.SELLER ? ['sales', 'inventory:read'] : ['all'],
        avatar: targetRole.slice(0, 2).toUpperCase(),
      };
    }
    const token = generateToken(targetUser);
    setUser(targetUser);
    setToken(token);
    localStorage.setItem('retailmind_jwt_token', token);
    localStorage.setItem('retailmind_user', JSON.stringify(targetUser));
  };

  // Cart actions for Customer Shopping experience
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || Math.round(product.price * 1.18),
            quantity: qty,
            image: product.image,
            unit: product.unit || 'Unit',
            category: product.category || 'Grocery',
          },
        ];
      }
      localStorage.setItem('retailmind_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      localStorage.setItem('retailmind_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prev) => {
        const updated = prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQty } : item
        );
        localStorage.setItem('retailmind_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('retailmind_cart');
  };

  // Wishlist Actions
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter((item) => item.id !== product.id);
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || Math.round(product.price * 1.18),
            image: product.image,
            unit: product.unit || 'Unit',
            category: product.category || 'Grocery',
            rating: product.rating || 4.8,
          },
        ];
      }
      localStorage.setItem('retailmind_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      localStorage.setItem('retailmind_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Place Customer Order Action
  const placeCustomerOrder = (orderDetails) => {
    const newOrder = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Processing',
      totalAmount: orderDetails.totalAmount || cartTotal,
      itemCount: cartItemCount,
      store: orderDetails.store || user?.store || 'Indiranagar Flagship (Store 01)',
      paymentMethod: orderDetails.paymentMethod || 'UPI',
      deliveryAddress: orderDetails.deliveryAddress || 'Flat 402, Palm Heights, 12th Main, Indiranagar, Bangalore',
      items: cart.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        image: item.image,
      })),
    };

    setCustomerOrders((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('retailmind_customer_orders', JSON.stringify(updated));
      return updated;
    });

    clearCart();
    return newOrder;
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartSavings = cart.reduce(
    (acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  const currentRole = normalizeRole(user?.role);
  const isAdmin = currentRole === ROLES.ADMIN;
  const isSeller = currentRole === ROLES.SELLER;
  const isCustomer = currentRole === ROLES.CUSTOMER;

  const value = {
    user,
    token,
    role: currentRole,
    isAdmin,
    isSeller,
    isCustomer,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    switchRole,
    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartSavings,
    cartItemCount,
    // Wishlist
    wishlist,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
    wishlistItemCount,
    // Orders
    customerOrders,
    placeCustomerOrder,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
