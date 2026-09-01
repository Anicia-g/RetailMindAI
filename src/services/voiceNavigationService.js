import { ROLES, isRouteAllowedForRole } from '@/lib/auth';
import { VOICE_INTENTS, parseVoiceCommand } from '@/utils/voiceCommandParser';

/**
 * Role-Aware Voice Navigation Service
 * Translates speech commands to role-safe routes using existing authorization rules.
 */
class VoiceNavigationService {
  /**
   * Resolve an intent and role into a destination route
   */
  resolveRouteForRole(intent, role) {
    const isCustomer = role === ROLES.CUSTOMER;
    const isSeller = role === ROLES.SELLER;
    const isAdmin = role === ROLES.ADMIN;

    switch (intent) {
      // General Common & AI
      case VOICE_INTENTS.AI_ASSISTANT:
        return {
          route: '/ai-assistant',
          isAction: true,
          actionType: 'OPEN_AI_ASSISTANT',
          title: 'AI Assistant',
          description: 'Opening AI Assistant Drawer...',
        };

      case VOICE_INTENTS.SETTINGS:
        return {
          route: '/settings',
          title: 'Settings',
          description: 'Opening Application Settings...',
        };

      // Products Catalog (Role-specific destination)
      case VOICE_INTENTS.PRODUCTS:
      case VOICE_INTENTS.SELLER_PRODUCTS:
      case VOICE_INTENTS.SHOP_PRODUCTS:
        if (isCustomer) {
          return { route: '/shop/products', title: 'Products', description: 'Opening Supermarket Products Catalog...' };
        }
        if (isSeller) {
          return { route: '/seller/products', title: 'Products', description: 'Opening Store Operational Catalog...' };
        }
        return { route: '/products', title: 'Products', description: 'Opening Enterprise Products Management...' };

      // Inventory
      case VOICE_INTENTS.INVENTORY:
      case VOICE_INTENTS.SELLER_INVENTORY:
        if (isCustomer) {
          // Customers do NOT have access to internal inventory management
          return {
            route: '/inventory',
            title: 'Inventory',
            unauthorizedForCustomer: true,
            description: 'Inventory management is an internal operational section.',
          };
        }
        if (isSeller) {
          return { route: '/seller/inventory', title: 'Store Inventory', description: 'Opening Store Inventory Alerts...' };
        }
        return { route: '/inventory', title: 'Inventory', description: 'Opening Enterprise Multi-Store Inventory...' };

      // Sales
      case VOICE_INTENTS.SALES:
      case VOICE_INTENTS.SELLER_SALES:
        if (isCustomer) {
          // For customers, redirect to orders / deals
          return {
            route: '/sales',
            title: 'Sales Management',
            unauthorizedForCustomer: true,
            description: 'Sales records are reserved for Store Sellers and Administrators.',
          };
        }
        if (isSeller) {
          return { route: '/seller/sales', title: 'Shift Sales POS', description: 'Opening Shift Sales Terminal...' };
        }
        return { route: '/sales', title: 'Sales Analytics', description: 'Opening Enterprise Sales Analytics...' };

      // Customers
      case VOICE_INTENTS.CUSTOMERS:
      case VOICE_INTENTS.SELLER_CUSTOMERS:
        if (isCustomer) {
          return {
            route: '/customers',
            title: 'Customer Management',
            unauthorizedForCustomer: true,
            description: 'Customer analytics is reserved for authorized staff.',
          };
        }
        if (isSeller) {
          return { route: '/seller/customers', title: 'Store Customers', description: 'Opening Store Customer Profiles...' };
        }
        return { route: '/customers', title: 'Customer Intelligence', description: 'Opening Customer Intelligence & K-Means Clusters...' };

      // Dashboard
      case VOICE_INTENTS.DASHBOARD:
      case VOICE_INTENTS.SELLER_DASHBOARD:
      case VOICE_INTENTS.SHOP_HOME:
        if (isCustomer) {
          return { route: '/shop', title: 'Supermarket Home', description: 'Opening Supermarket Storefront...' };
        }
        if (isSeller) {
          return { route: '/seller', title: 'Seller Dashboard', description: 'Opening Store Shift Terminal...' };
        }
        return { route: '/dashboard', title: 'Admin Command Center', description: 'Opening Executive Command Dashboard...' };

      // Admin Only Sections
      case VOICE_INTENTS.SUPPLIERS:
        return { route: '/suppliers', title: 'Suppliers', description: 'Opening Supplier Lead-Time Management...' };

      case VOICE_INTENTS.STORES:
        return { route: '/stores', title: 'Store Outlets', description: 'Opening Retail Branch Outlets Network...' };

      case VOICE_INTENTS.EMPLOYEES:
        return { route: '/employees', title: 'Workforce', description: 'Opening Star Sellers & Employee Hub...' };

      case VOICE_INTENTS.PURCHASE_ORDERS:
        return { route: '/purchase-orders', title: 'Purchase Orders', description: 'Opening Supplier Purchase Orders...' };

      case VOICE_INTENTS.PAYMENTS:
        return { route: '/payments', title: 'Payments', description: 'Opening Payments & Settlements Hub...' };

      case VOICE_INTENTS.ANALYTICS:
        return { route: '/analytics', title: 'Analytics', description: 'Opening Deep Predictive BI Analytics...' };

      case VOICE_INTENTS.FORECASTING:
        return { route: '/forecasting', title: 'Forecasting', description: 'Opening Demand Forecasting Engine...' };

      case VOICE_INTENTS.REPORTS:
      case VOICE_INTENTS.SELLER_REPORTS:
        if (isSeller) {
          return { route: '/seller/reports', title: 'Shift Reports', description: 'Opening Shift Reports...' };
        }
        return { route: '/reports', title: 'Executive Reports', description: 'Opening System Audit Reports...' };

      // Seller Specific
      case VOICE_INTENTS.SELLER_PERFORMANCE:
        if (!isSeller) {
          return { route: '/analytics', title: 'Performance', description: 'Opening Performance Analytics...' };
        }
        return { route: '/seller/performance', title: 'Seller Performance', description: 'Opening Shift Performance...' };

      case VOICE_INTENTS.SELLER_BEST_SELLERS:
        if (isCustomer) {
          return { route: '/shop/products', title: 'Popular Products', description: 'Opening Popular Supermarket Items...' };
        }
        if (isSeller) {
          return { route: '/seller/best-sellers', title: 'Best Sellers', description: 'Opening Best Selling SKUs...' };
        }
        return { route: '/products', title: 'Best Sellers', description: 'Opening Top Selling Catalog...' };

      // Customer Specific
      case VOICE_INTENTS.SHOP_CATEGORIES:
        return { route: '/shop/categories', title: 'Categories', description: 'Opening Grocery Categories...' };

      case VOICE_INTENTS.SHOP_OFFERS:
        return { route: '/shop/offers', title: 'Special Offers', description: 'Opening Deals & Promo Offers...' };

      case VOICE_INTENTS.SHOP_WISHLIST:
        return { route: '/shop/wishlist', title: 'Wishlist', description: 'Opening My Wishlist...' };

      case VOICE_INTENTS.SHOP_CART:
        return {
          route: '/shop/cart',
          isAction: true,
          actionType: 'OPEN_CART',
          title: 'Shopping Basket',
          description: 'Opening Shopping Basket...',
        };

      case VOICE_INTENTS.SHOP_ORDERS:
        return { route: '/shop/orders', title: 'My Orders', description: 'Opening Grocery Order History...' };

      case VOICE_INTENTS.SHOP_PROFILE:
      case VOICE_INTENTS.SELLER_PROFILE:
        if (isCustomer) {
          return { route: '/shop/profile', title: 'Profile', description: 'Opening Customer Profile...' };
        }
        if (isSeller) {
          return { route: '/seller/profile', title: 'Profile', description: 'Opening Seller Profile...' };
        }
        return { route: '/settings', title: 'Settings', description: 'Opening Settings...' };

      default:
        return null;
    }
  }

  /**
   * Main entry point to process a voice transcription
   */
  processVoiceCommand(spokenText, currentRole) {
    const parsed = parseVoiceCommand(spokenText);
    if (!parsed) {
      return {
        success: false,
        status: 'unrecognized',
        spokenText,
        message: `Couldn't recognize command "${spokenText}". Try saying "Open products", "Show sales", or "Go to offers".`,
      };
    }

    const target = this.resolveRouteForRole(parsed.intent, currentRole);
    if (!target) {
      return {
        success: false,
        status: 'unsupported_intent',
        spokenText,
        message: `Command "${spokenText}" is not recognized.`,
      };
    }

    // Role-authorization check
    const isAllowed = isRouteAllowedForRole(currentRole, target.route);

    if (!isAllowed || target.unauthorizedForCustomer) {
      let roleReason = 'That section isn\'t available for your account.';
      if (currentRole === ROLES.CUSTOMER) {
        roleReason = `Access Denied: "${target.title}" is an internal administrative section not accessible to customer accounts.`;
      } else if (currentRole === ROLES.SELLER) {
        roleReason = `Access Denied: "${target.title}" requires Administrator credentials.`;
      }

      return {
        success: false,
        status: 'unauthorized',
        spokenText,
        intent: parsed.intent,
        route: target.route,
        title: target.title,
        message: roleReason,
      };
    }

    return {
      success: true,
      status: 'authorized',
      spokenText,
      intent: parsed.intent,
      route: target.route,
      title: target.title,
      description: target.description,
      isAction: target.isAction || false,
      actionType: target.actionType || null,
      message: `Navigating to ${target.title}...`,
    };
  }
}

export const voiceNavigationService = new VoiceNavigationService();
