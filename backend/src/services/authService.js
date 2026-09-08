const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { generateToken } = require('../utils/jwt');
const auditService = require('./auditService');
const otpService = require('./otpService');

class AuthService {
  /**
   * User registration (Customer / Seller / Admin)
   */
  async register({ name, email, password, role = 'CUSTOMER', phone = '', storeId = null, store = null, reqContext = {} }) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role.toUpperCase();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: userRole,
      storeId: storeId || (userRole === 'SELLER' ? 'store-01' : null),
      store: store || (userRole === 'SELLER' ? 'Indiranagar Flagship (Store 01)' : 'Headquarters (HQ)'),
      permissions:
        userRole === 'ADMIN'
          ? ['all']
          : userRole === 'SELLER'
          ? ['sales', 'inventory:read', 'orders', 'products:read']
          : ['shop', 'cart', 'orders:read', 'recommendations'],
      avatar: name.trim().slice(0, 2).toUpperCase(),
    });

    // If Customer role, create corresponding Customer record if none exists
    if (userRole === 'CUSTOMER') {
      try {
        await Customer.findOneAndUpdate(
          { email: normalizedEmail },
          {
            $setOnInsert: {
              customerId: `cust-${Date.now().toString().slice(-4)}`,
              userId: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone || '+91 98450 11234',
              status: 'Active',
              preferences: {
                whatsappOffers: true,
                emailUpdates: true,
                smsNotifications: false,
              },
            },
          },
          { upsert: true, new: true }
        );
      } catch (custErr) {
        console.warn('[AuthService] Customer sync notice:', custErr.message);
      }
    }

    await auditService.logSecurityEvent({
      action: 'USER_REGISTERED',
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      resource: 'AUTH_USER',
      status: 'SUCCESS',
      ipAddress: reqContext.ip || '',
      userAgent: reqContext.userAgent || '',
    });

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        store: user.store,
        permissions: user.permissions,
        avatar: user.avatar,
        image: user.image,
      },
    };
  }

  /**
   * Customer Registration with 6-digit OTP verification
   */
  async registerCustomerWithOtp({ name, email, password, phone = '', otp, reqContext = {} }) {
    if (!otp) {
      throw new Error('OTP verification code is required for registration.');
    }

    // Verify OTP first
    await otpService.verifyOtp(email, otp, 'REGISTRATION', reqContext);

    // Register user
    return await this.register({
      name,
      email,
      password,
      role: 'CUSTOMER',
      phone,
      reqContext,
    });
  }

  /**
   * User login with strict bcrypt password verification and security audit logging
   */
  async login(email, password, reqContext = {}) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      await auditService.logLogin({
        email: normalizedEmail,
        status: 'FAILED',
        reason: 'User not found',
        ipAddress: reqContext.ip,
        userAgent: reqContext.userAgent,
      });
      throw new Error('Invalid email or password.');
    }

    if (!user.bit_IsActive) {
      await auditService.logLogin({
        userId: user._id.toString(),
        email: normalizedEmail,
        role: user.role,
        status: 'FAILED',
        reason: 'Account deactivated',
        ipAddress: reqContext.ip,
        userAgent: reqContext.userAgent,
      });
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await auditService.logLogin({
        userId: user._id.toString(),
        email: normalizedEmail,
        role: user.role,
        status: 'FAILED',
        reason: 'Invalid password',
        ipAddress: reqContext.ip,
        userAgent: reqContext.userAgent,
      });
      throw new Error('Invalid email or password.');
    }

    // Log successful authentication
    await auditService.logLogin({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      status: 'SUCCESS',
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
    });

    await auditService.logSecurityEvent({
      action: 'LOGIN_SUCCESS',
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      resource: 'AUTH_SESSION',
      status: 'SUCCESS',
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
    });

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        store: user.store,
        permissions: user.permissions,
        avatar: user.avatar,
        image: user.image,
      },
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  }
}

module.exports = new AuthService();
