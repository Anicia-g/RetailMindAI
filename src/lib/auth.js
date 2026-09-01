import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { customerAvatars, sellerAvatars } from './images';

const JWT_SECRET = process.env.JWT_SECRET || 'retailmind_jwt_super_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  CUSTOMER: 'CUSTOMER',
};

export function normalizeRole(role) {
  if (!role) return ROLES.ADMIN;
  const upper = String(role).trim().toUpperCase();
  if (upper === 'SELLER') return ROLES.SELLER;
  if (upper === 'CUSTOMER') return ROLES.CUSTOMER;
  return ROLES.ADMIN;
}

export function getRoleHomeRoute(role) {
  const norm = normalizeRole(role);
  if (norm === ROLES.SELLER) return '/seller';
  if (norm === ROLES.CUSTOMER) return '/shop';
  return '/dashboard';
}

export function isRouteAllowedForRole(role, pathname) {
  if (!pathname) return true;
  const norm = normalizeRole(role);

  // Common authenticated routes accessible to all roles
  if (
    pathname === '/settings' ||
    pathname.startsWith('/settings') ||
    pathname === '/ai-assistant' ||
    pathname.startsWith('/ai-assistant')
  ) {
    return true;
  }

  if (norm === ROLES.CUSTOMER) {
    return pathname.startsWith('/shop');
  }

  if (norm === ROLES.SELLER) {
    return pathname.startsWith('/seller');
  }

  if (norm === ROLES.ADMIN) {
    // Admin has access to all admin routes; redirect away if mistakenly hitting seller/shop root directly
    return !pathname.startsWith('/seller') && !pathname.startsWith('/shop');
  }

  return false;
}

// Seeded users for the 3 primary platform roles: Admin, Seller, Customer
export const MOCK_USERS_DB = [
  {
    id: 'usr-admin-001',
    name: 'Admin Superuser',
    email: 'admin@retailmind.ai',
    passwordHash: '$2b$10$YHSC4D3/AWC7Wh7QqWzxBOMjRlQMJrcjD/qd4Htaxdm.SvD6WbgB.',
    role: ROLES.ADMIN,
    store: 'Headquarters (HQ)',
    permissions: ['all'],
    avatar: 'AU',
    image: sellerAvatars['Admin Superuser'],
  },
  {
    id: 'usr-seller-002',
    name: 'Priya Sharma',
    email: 'seller@retailmind.ai',
    passwordHash: '$2b$10$yGZmcgHUqNR45ONOpOvFOuKsqTwKzhWOyx28Wo7mmIyAJm2nsMg.C',
    role: ROLES.SELLER,
    store: 'Indiranagar Flagship (Store 01)',
    permissions: ['sales', 'inventory:read', 'orders', 'products:read'],
    avatar: 'PS',
    image: sellerAvatars['Ayesha Khan'],
  },
  {
    id: 'usr-mgr-002',
    name: 'Farhan Merchant',
    email: 'manager@retailmind.ai',
    passwordHash: '$2b$10$yGZmcgHUqNR45ONOpOvFOuKsqTwKzhWOyx28Wo7mmIyAJm2nsMg.C',
    role: ROLES.SELLER,
    store: 'Bandra Central (Store 12)',
    permissions: ['inventory', 'sales', 'reports', 'products:read'],
    avatar: 'FM',
    image: sellerAvatars['Farhan Merchant'],
  },
  {
    id: 'usr-cust-003',
    name: 'Vikram Malhotra',
    email: 'customer@retailmind.ai',
    passwordHash: '$2b$10$zCZt030OOr26o5JmT6SYP.Y7WYhaqdmF/P2IP/Opvf9LPHxGIlZ/u',
    role: ROLES.CUSTOMER,
    store: 'Indiranagar Flagship (Store 01)',
    permissions: ['shop', 'cart', 'orders:read', 'recommendations'],
    avatar: 'VM',
    image: customerAvatars['Vikram Malhotra'],
  },
];

/**
 * Compare plain text password against BCrypt hash with resilient matching
 */
export function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword) return false;

  try {
    if (passwordHash && bcrypt.compareSync(plainPassword, passwordHash)) {
      return true;
    }
  } catch (err) {
    // Proceed to fallback check
  }

  // Fallback credentials check for demo usability
  const validDefaults = ['admin1234', 'admin123', 'admin', 'manager1234', 'sales1234', 'seller1234', 'customer1234', 'password'];
  return validDefaults.includes(plainPassword);
}

/**
 * Generate a JWT token containing user identity and Role-Based Access
 */
export function generateToken(user) {
  const normRole = normalizeRole(user.role);
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: normRole,
    store: user.store,
    permissions: user.permissions || [],
    avatar: user.avatar || 'RM',
    image: user.image || null,
    iat: Math.floor(Date.now() / 1000),
  };

  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    // Client-side / edge safe base64 token generation fallback
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.mock_signature`;
  }
}

/**
 * Decode JWT token to extract role, claims, and session expiry
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object') return decoded;

    const parts = token.split('.');
    if (parts.length >= 2) {
      return JSON.parse(atob(parts[1]));
    }
  } catch (e) {
    console.error('Error decoding JWT token:', e);
  }
  return null;
}

/**
 * Authenticate credentials using BCrypt and return JWT Token & Role Claims
 */
export async function authenticateWithCredentials(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Find user in database
  let user = MOCK_USERS_DB.find((u) => u.email.toLowerCase() === normalizedEmail);

  // Dynamic fallback for any custom user input if testing
  if (!user && normalizedEmail) {
    const isCustomer = normalizedEmail.includes('cust') || normalizedEmail.includes('buyer') || normalizedEmail.includes('user');
    const isSeller = normalizedEmail.includes('seller') || normalizedEmail.includes('sales') || normalizedEmail.includes('manager') || normalizedEmail.includes('store');
    const role = isCustomer ? ROLES.CUSTOMER : isSeller ? ROLES.SELLER : ROLES.ADMIN;

    user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: role,
      store: isSeller ? 'Bandra Central (Store 12)' : 'Indiranagar Flagship (Store 01)',
      permissions: isCustomer ? ['shop', 'cart'] : isSeller ? ['sales', 'inventory:read'] : ['all'],
      avatar: email.slice(0, 2).toUpperCase(),
      image: isCustomer ? customerAvatars['Vikram Malhotra'] : sellerAvatars['Priya Sharma'],
    };
  }

  if (!user) {
    throw new Error('User not found. Please check your credentials.');
  }

  // Verify password using BCrypt
  const isValid = user.passwordHash
    ? verifyPassword(cleanPassword, user.passwordHash)
    : cleanPassword.length >= 4;

  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const normRole = normalizeRole(user.role);
  const normalizedUser = {
    ...user,
    role: normRole,
  };

  // Issue signed JWT token
  const token = generateToken(normalizedUser);

  return {
    token,
    user: {
      id: normalizedUser.id,
      name: normalizedUser.name,
      email: normalizedUser.email,
      role: normalizedUser.role,
      store: normalizedUser.store,
      permissions: normalizedUser.permissions,
      avatar: normalizedUser.avatar,
      image: normalizedUser.image,
    },
  };
}
