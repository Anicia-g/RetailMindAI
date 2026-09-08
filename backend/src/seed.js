const bcrypt = require('bcryptjs');
const { connectDB, mongoose } = require('./config/db');
const User = require('./models/User');
const Store = require('./models/Store');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Supplier = require('./models/Supplier');
const PurchaseOrder = require('./models/PurchaseOrder');
const Setting = require('./models/Setting');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting RetailMind AI Database Seeding...');
    await connectDB();

    // 1. Clear Existing Collections
    await Promise.all([
      User.deleteMany({}),
      Store.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    console.log('🧹 Purged previous collection data.');

    // 2. Hash Default Passwords
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin1234', salt);
    const sellerPasswordHash = await bcrypt.hash('seller1234', salt);
    const customerPasswordHash = await bcrypt.hash('customer1234', salt);

    // 3. Seed Users
    const users = await User.create([
      {
        name: 'Admin Superuser',
        email: 'admin@retailmind.ai',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        store: 'Headquarters (HQ)',
        storeId: 'store-hq',
        permissions: ['all'],
        avatar: 'AU',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        rank: 0,
      },
      {
        name: 'Priya Sharma',
        email: 'seller@retailmind.ai',
        passwordHash: sellerPasswordHash,
        role: 'SELLER',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        department: 'Dairy & Fresh Foods',
        permissions: ['sales', 'inventory:read', 'orders', 'products:read'],
        avatar: 'PS',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        rank: 1,
        salesAmount: 184200,
        ordersHandled: 342,
        targetAchievement: 124,
        rating: 4.9,
        performanceScore: 98,
        badge: 'Top Performer',
      },
      {
        name: 'Farhan Merchant',
        email: 'manager@retailmind.ai',
        passwordHash: sellerPasswordHash,
        role: 'SELLER',
        store: 'Bandra Central (Store 12)',
        storeId: 'store-12',
        department: 'Supermarket Operations',
        permissions: ['sales', 'inventory:read', 'orders', 'products:read', 'reports'],
        avatar: 'FM',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rank: 4,
        salesAmount: 215000,
        ordersHandled: 410,
        targetAchievement: 108,
        rating: 4.8,
        performanceScore: 92,
        badge: 'Store Leader',
      },
      {
        name: 'Vikram Malhotra',
        email: 'customer@retailmind.ai',
        passwordHash: customerPasswordHash,
        role: 'CUSTOMER',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        permissions: ['shop', 'cart', 'orders:read', 'recommendations'],
        avatar: 'VM',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      },
    ]);
    console.log(`✅ Seeded ${users.length} Users (Admin, Sellers, Customer)`);

    // 4. Seed Stores
    const stores = await Store.create([
      {
        storeId: 'store-01',
        name: 'Indiranagar Flagship',
        code: 'Store 01',
        city: 'Bangalore',
        state: 'Karnataka',
        manager: 'Sanjay Menon',
        phone: '+91 80 2521 8899',
        employeesCount: 18,
        monthlySales: 4850000,
        inventoryHealth: 'Healthy',
        stockoutItemsCount: 2,
        status: 'Active',
        address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore',
      },
      {
        storeId: 'store-12',
        name: 'Bandra Central',
        code: 'Store 12',
        city: 'Mumbai',
        state: 'Maharashtra',
        manager: 'Farhan Merchant',
        phone: '+91 22 2640 1122',
        employeesCount: 14,
        monthlySales: 3920000,
        inventoryHealth: 'Critical',
        stockoutItemsCount: 6,
        status: 'Active',
        address: 'Hill Road, Bandra West, Mumbai',
        aiAlert: 'Recent sales drop of 8% traced directly to stockouts of high-velocity items.',
      },
      {
        storeId: 'store-03',
        name: 'Anna Nagar Supercenter',
        code: 'Store 03',
        city: 'Chennai',
        state: 'Tamil Nadu',
        manager: 'Karthik Subramanian',
        phone: '+91 44 2621 3344',
        employeesCount: 16,
        monthlySales: 3450000,
        inventoryHealth: 'Low Stock',
        stockoutItemsCount: 3,
        status: 'Active',
        address: '2nd Avenue, Anna Nagar, Chennai',
      },
      {
        storeId: 'store-04',
        name: 'Connaught Place Hub',
        code: 'Store 04',
        city: 'New Delhi',
        state: 'Delhi',
        manager: 'Simran Kaur',
        phone: '+91 11 2332 5566',
        employeesCount: 20,
        monthlySales: 5120000,
        inventoryHealth: 'Healthy',
        stockoutItemsCount: 1,
        status: 'Active',
        address: 'Inner Circle, Connaught Place, New Delhi',
      },
    ]);
    console.log(`✅ Seeded ${stores.length} Retail Stores`);

    // 5. Seed Categories
    const categories = await Category.create([
      {
        categoryId: 'cat-dairy',
        name: 'Dairy & Eggs',
        nameTa: 'பால் & முட்டை',
        nameHi: 'डेयरी और अंडे',
        itemCount: '24 Items',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
        tag: 'Fresh Daily',
        color: 'from-blue-600 to-cyan-500',
      },
      {
        categoryId: 'cat-bakery',
        name: 'Bakery & Snacks',
        nameTa: 'ரொட்டி & தின்பண்டங்கள்',
        nameHi: 'बेकरी और स्नैक्स',
        itemCount: '38 Items',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        tag: 'Warm & Fresh',
        color: 'from-amber-600 to-yellow-500',
      },
      {
        categoryId: 'cat-fruits',
        name: 'Fruits & Vegetables',
        nameTa: 'பழங்கள் & காய்கறிகள்',
        nameHi: 'फल और सब्जियां',
        itemCount: '52 Items',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
        tag: 'Farm Direct',
        color: 'from-emerald-600 to-teal-500',
      },
      {
        categoryId: 'cat-grains',
        name: 'Rice & Grains',
        nameTa: 'அரிசி & தானியங்கள்',
        nameHi: 'चावल और अनाज',
        itemCount: '19 Items',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        tag: 'Pantry Essentials',
        color: 'from-orange-600 to-amber-500',
      },
      {
        categoryId: 'cat-gourmet',
        name: 'Groceries & Gourmet',
        nameTa: 'மளிகை & நுகர்பொருட்கள்',
        nameHi: 'किराने और पेटू',
        itemCount: '45 Items',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        tag: 'Premium Roasts',
        color: 'from-indigo-600 to-purple-500',
      },
      {
        categoryId: 'cat-tech',
        name: 'Electronics & Tech',
        nameTa: 'மின்னணுவியல்',
        nameHi: 'इलेक्ट्रॉनिक्स',
        itemCount: '28 Items',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
        tag: 'Smart Gadgets',
        color: 'from-violet-600 to-indigo-500',
      },
      {
        categoryId: 'cat-home',
        name: 'Home & Lifestyle',
        nameTa: 'வீடு & வாழ்க்கை முறை',
        nameHi: 'घर और जीवन शैली',
        itemCount: '31 Items',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        tag: 'Eco Essentials',
        color: 'from-teal-600 to-emerald-500',
      },
    ]);
    console.log(`✅ Seeded ${categories.length} Categories`);

    // 6. Seed Suppliers
    const suppliers = await Supplier.create([
      {
        supplierId: 'sup-001',
        name: 'Apex Tech Distributors',
        contactPerson: 'Rajesh Kulkarni',
        email: 'orders@apextech.in',
        phone: '+91 80 4123 9000',
        category: 'Electronics & Peripherals',
        rating: 4.8,
        leadTimeDays: 3,
        activeOrders: 2,
        totalOrdersCompleted: 48,
        reliabilityScore: '98%',
        address: 'Electronic City Phase 1, Bangalore, Karnataka',
        status: 'Active',
        suppliedProducts: ['Wireless Ergonomic Mouse', 'Mechanical Gaming Keyboard RGB'],
      },
      {
        supplierId: 'sup-002',
        name: 'Valley Harvest Goods',
        contactPerson: 'Meenakshi Sundaram',
        email: 'supply@valleyharvest.com',
        phone: '+91 44 2811 4400',
        category: 'Groceries & Gourmet',
        rating: 4.6,
        leadTimeDays: 2,
        activeOrders: 1,
        totalOrdersCompleted: 76,
        reliabilityScore: '94%',
        address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
        status: 'Active',
        suppliedProducts: ['Farm Fresh Milk 1L (Whole)', 'Premium Arabica Coffee Beans (1kg)', 'Organic Oat Milk 1L'],
      },
      {
        supplierId: 'sup-003',
        name: 'Matrix Digital Systems',
        contactPerson: 'Amitabh Sen',
        email: 'b2b@matrixdigital.co.in',
        phone: '+91 22 6789 1200',
        category: 'Displays & Hardware',
        rating: 4.9,
        leadTimeDays: 5,
        activeOrders: 0,
        totalOrdersCompleted: 32,
        reliabilityScore: '99%',
        address: 'Andheri East MIDC, Mumbai, Maharashtra',
        status: 'Active',
        suppliedProducts: ['4K Ultra-HD Monitor 27-inch'],
      },
      {
        supplierId: 'sup-004',
        name: 'EcoLiving Supplies',
        contactPerson: 'Siddharth Jain',
        email: 'wholesale@ecoliving.in',
        phone: '+91 11 4567 8900',
        category: 'Home & Lifestyle',
        rating: 4.4,
        leadTimeDays: 4,
        activeOrders: 1,
        totalOrdersCompleted: 29,
        reliabilityScore: '91%',
        address: 'Okhla Industrial Area Phase 3, New Delhi',
        status: 'Active',
        suppliedProducts: ['Stainless Steel Hydration Flask (750ml)'],
      },
    ]);
    console.log(`✅ Seeded ${suppliers.length} Suppliers`);

    // 7. Seed Products
    const products = await Product.create([
      {
        productId: 'prod-001',
        name: 'Farm Fresh Milk 1L (Whole)',
        sku: 'MILK-001',
        category: 'Dairy & Eggs',
        brand: 'Heritage Dairy',
        unit: 'Tetra',
        price: 58,
        originalPrice: 65,
        discountPct: 10,
        costPrice: 42,
        tax: 0,
        stock: 24,
        reorderLevel: 80,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        storeAssignments: [
          { storeId: 'store-01', storeName: 'Indiranagar Flagship', sellerName: 'Priya Sharma', stock: 24, dailyVelocity: 18.5, stockStatus: 'Low Stock' },
          { storeId: 'store-12', storeName: 'Bandra Central', sellerName: 'Arjun Mehta', stock: 80, dailyVelocity: 14.2, stockStatus: 'Healthy' },
          { storeId: 'store-03', storeName: 'Anna Nagar Supercenter', sellerName: 'Rahul Nambiar', stock: 42, dailyVelocity: 10.0, stockStatus: 'Healthy' },
        ],
        status: 'Active',
        stockStatus: 'Low Stock',
        dailyVelocity: 18.5,
        velocityChange: '+24%',
        stockoutRisk: 92,
        expectedStockoutDays: 1.3,
        suggestedReorder: 120,
        unitsSold: 842,
        revenue: 48836,
        salesGrowth: '+18%',
        rating: 4.9,
        ratingCount: 312,
        expiryDays: 5,
        demandLevel: 'High',
        inventoryLevel: 'Critical',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
        smartDiscount: {
          recommended: 0,
          model: 'ID3',
          confidence: 94,
          reason: 'Product has strong daily demand (+24%) and critically low inventory (24 units). Discounting would deplete stock faster.',
          factors: ['High Demand (+24% surge)', 'Low Stock (24 units remaining)', 'Fast Runway (1.3 days)'],
          expectedEffect: 'Protect gross margin while stock replenishment is underway.',
        },
        aiInsight: 'Milk demand is running 24% above 30-day baseline across all stores. Immediate replenishment of 120 units advised.',
      },
      {
        productId: 'prod-002',
        name: 'Artisan Whole Wheat Sourdough Bread',
        sku: 'BAK-102',
        category: 'Bakery & Snacks',
        brand: 'Golden Crust Bakery',
        unit: 'Loaf',
        price: 95,
        originalPrice: 110,
        discountPct: 15,
        costPrice: 58,
        tax: 0,
        stock: 8,
        reorderLevel: 25,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        storeAssignments: [
          { storeId: 'store-01', storeName: 'Indiranagar Flagship', sellerName: 'Priya Sharma', stock: 8, dailyVelocity: 14.2, stockStatus: 'Critical' },
        ],
        status: 'Active',
        stockStatus: 'Critical',
        dailyVelocity: 14.2,
        velocityChange: '+12%',
        stockoutRisk: 86,
        expectedStockoutDays: 1.8,
        suggestedReorder: 40,
        unitsSold: 512,
        revenue: 48640,
        salesGrowth: '+14%',
        rating: 4.8,
        ratingCount: 189,
        expiryDays: 2,
        demandLevel: 'High',
        inventoryLevel: 'Critical',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        smartDiscount: {
          recommended: 15,
          model: 'C4.5',
          confidence: 88,
          reason: 'Daily breakfast volume depletion imminent with 2-day freshness window. 15% markdown ensures zero waste.',
          factors: ['Short Freshness Window (2 days)', 'Breakfast Demand Driver', 'Healthy Margin Room'],
          expectedEffect: 'Clear inventory before freshness expiration.',
        },
      },
      {
        productId: 'prod-003',
        name: 'Royal Basmati Rice 5kg',
        sku: 'RICE-501',
        category: 'Rice & Grains',
        brand: 'Kohinoor Gold',
        unit: 'Bag (5kg)',
        price: 540,
        originalPrice: 620,
        discountPct: 12,
        costPrice: 410,
        tax: 0,
        stock: 35,
        reorderLevel: 50,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        status: 'Active',
        stockStatus: 'Low Stock',
        dailyVelocity: 6.8,
        velocityChange: '+8%',
        stockoutRisk: 72,
        expectedStockoutDays: 5.1,
        suggestedReorder: 60,
        unitsSold: 320,
        revenue: 172800,
        salesGrowth: '+9%',
        rating: 4.9,
        ratingCount: 245,
        expiryDays: 180,
        demandLevel: 'Medium',
        inventoryLevel: 'Healthy',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-004',
        name: 'Greek Probiotic Natural Yogurt 500g',
        sku: 'DAIRY-302',
        category: 'Dairy & Eggs',
        brand: 'Epigamia',
        unit: 'Tub',
        price: 135,
        originalPrice: 150,
        discountPct: 10,
        costPrice: 95,
        tax: 0,
        stock: 18,
        reorderLevel: 40,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        status: 'Active',
        stockStatus: 'Low Stock',
        dailyVelocity: 9.4,
        velocityChange: '-6%',
        stockoutRisk: 79,
        expectedStockoutDays: 2.1,
        suggestedReorder: 50,
        unitsSold: 410,
        revenue: 55350,
        salesGrowth: '-4%',
        rating: 4.9,
        ratingCount: 164,
        expiryDays: 4,
        demandLevel: 'High',
        inventoryLevel: 'Low',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
        smartDiscount: {
          recommended: 15,
          model: 'C4.5',
          confidence: 89,
          reason: 'Approaching shelf expiry window (4 days) with declining 14-day velocity. 15% discount accelerates sell-through.',
          factors: ['Short shelf life (4 days)', 'Overstock relative to runway', 'Decent unit margin'],
          expectedEffect: 'Prevent spoilage and clear stock.',
        },
      },
      {
        productId: 'prod-005',
        name: 'Premium Arabica Coffee Beans (1kg)',
        sku: 'BEV-882',
        category: 'Groceries & Gourmet',
        brand: 'Blue Tokai Roasters',
        unit: 'Pack (1kg)',
        price: 950,
        originalPrice: 1100,
        discountPct: 14,
        costPrice: 620,
        tax: 48,
        stock: 22,
        reorderLevel: 35,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        status: 'Active',
        stockStatus: 'Low Stock',
        dailyVelocity: 4.8,
        velocityChange: '+15%',
        stockoutRisk: 64,
        expectedStockoutDays: 4.6,
        suggestedReorder: 30,
        unitsSold: 218,
        revenue: 207100,
        salesGrowth: '+16%',
        rating: 4.9,
        ratingCount: 142,
        expiryDays: 90,
        demandLevel: 'Medium',
        inventoryLevel: 'Healthy',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-006',
        name: 'Crisp Red Fuji Apples (1kg Bag)',
        sku: 'FRU-201',
        category: 'Fruits & Vegetables',
        brand: 'Himachal Orchards',
        unit: 'Bag (1kg)',
        price: 155,
        originalPrice: 180,
        discountPct: 14,
        costPrice: 105,
        tax: 0,
        stock: 42,
        reorderLevel: 30,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        status: 'Active',
        stockStatus: 'Healthy',
        dailyVelocity: 16.0,
        velocityChange: '+11%',
        stockoutRisk: 58,
        expectedStockoutDays: 2.6,
        suggestedReorder: 50,
        unitsSold: 680,
        revenue: 105400,
        salesGrowth: '+12%',
        rating: 4.8,
        ratingCount: 198,
        expiryDays: 7,
        demandLevel: 'High',
        inventoryLevel: 'Healthy',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-007',
        name: 'Organic Oat Milk 1L Barista Edition',
        sku: 'OAT-109',
        category: 'Dairy & Eggs',
        brand: 'Oatly & Co',
        unit: 'Tetra (1L)',
        price: 240,
        originalPrice: 280,
        discountPct: 14,
        costPrice: 160,
        tax: 0,
        stock: 15,
        reorderLevel: 30,
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        seller: 'Priya Sharma',
        sellerId: 'emp-001',
        store: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        status: 'Active',
        stockStatus: 'Low Stock',
        dailyVelocity: 6.2,
        velocityChange: '+28%',
        stockoutRisk: 81,
        expectedStockoutDays: 2.4,
        suggestedReorder: 40,
        unitsSold: 290,
        revenue: 69600,
        salesGrowth: '+22%',
        rating: 4.8,
        ratingCount: 175,
        expiryDays: 45,
        demandLevel: 'High',
        inventoryLevel: 'Low',
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-008',
        name: 'Wireless Ergonomic Mouse (Silent Click)',
        sku: 'TECH-001',
        category: 'Electronics & Tech',
        brand: 'Logitech Master',
        unit: 'Box',
        price: 1250,
        originalPrice: 1499,
        discountPct: 16,
        costPrice: 850,
        tax: 150,
        stock: 14,
        reorderLevel: 25,
        supplier: 'Apex Tech Distributors',
        supplierId: 'sup-001',
        seller: 'Arjun Mehta',
        sellerId: 'emp-002',
        store: 'Bandra Central (Store 12)',
        storeId: 'store-12',
        status: 'Active',
        stockStatus: 'Low Stock',
        dailyVelocity: 3.5,
        velocityChange: '+32%',
        stockoutRisk: 74,
        expectedStockoutDays: 4.0,
        suggestedReorder: 25,
        unitsSold: 140,
        revenue: 175000,
        salesGrowth: '+19%',
        rating: 4.9,
        ratingCount: 88,
        expiryDays: 365,
        demandLevel: 'High',
        inventoryLevel: 'Low',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
      },
    ]);
    console.log(`✅ Seeded ${products.length} Products`);

    // 8. Seed Inventory records
    const inventoryDocs = products.map((p) => ({
      inventoryId: `inv-${p.productId}`,
      productId: p.productId,
      productName: p.name,
      sku: p.sku,
      category: p.category,
      image: p.image,
      store: p.store,
      storeId: p.storeId,
      currentStock: p.stock,
      minStock: p.reorderLevel,
      maxStock: p.stock * 3 || 150,
      dailyVelocity: p.dailyVelocity,
      daysRemaining: p.expectedStockoutDays,
      riskLevel: p.stockStatus === 'Critical' ? 'Critical' : p.stockStatus === 'Low Stock' ? 'High' : 'Low',
      stockoutProbability: p.stockoutRisk,
      status: p.stockStatus,
      location: 'Aisle 1 / Shelf 2',
      lastRestocked: '2026-08-25',
      suggestedReorder: p.suggestedReorder,
      reorderCost: p.suggestedReorder * (p.costPrice || 50),
      supplier: p.supplier,
      supplierId: p.supplierId,
      aiRecommendation: p.aiInsight || `Stock velocity is ${p.dailyVelocity}/day. Reorder recommended.`,
    }));
    await Inventory.create(inventoryDocs);
    console.log(`✅ Seeded ${inventoryDocs.length} Inventory records`);

    // 9. Seed Customers
    const customers = await Customer.create([
      {
        customerId: 'cust-001',
        name: 'Vikram Malhotra',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        email: 'customer@retailmind.ai',
        phone: '+91 98450 11234',
        orders: 34,
        totalSpent: 184500,
        aov: 5426,
        lastPurchase: '2 days ago',
        rank: 1,
        tag: '🏆 Top Customer (Highest Spending)',
        segment: 'VIP',
        cluster: 'Cluster 1: High Value Champions',
        recencyDays: 2,
        frequency: 34,
        monetary: 184500,
        status: 'Active',
        joinedDate: '2023-01-15',
        preferredStore: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        assignedSeller: 'Priya Sharma',
        sellerId: 'emp-001',
        smartCoins: 480,
        aiInsight: 'Top 1% store customer by LTV. Frequently purchases organic dairy, artisanal bakery, and gourmet pantry goods.',
        recommendedAction: 'Offer exclusive early access to upcoming high-tier supermarket gourmet launches and VIP double SmartCoins.',
        recentPurchases: [
          { id: 'ord-8891', date: '2026-08-26', items: 'Organic Milk (2x), Sourdough Bread, Arabica Coffee', total: 1250, payment: 'UPI' },
          { id: 'ord-8812', date: '2026-08-20', items: 'Basmati Rice 5kg, Greek Yogurt (3x)', total: 960, payment: 'Card' },
          { id: 'ord-8740', date: '2026-08-14', items: 'Fuji Apples 2kg, Oat Milk 2L, Almonds', total: 1140, payment: 'UPI' },
        ],
      },
      {
        customerId: 'cust-002',
        name: 'Ananya Iyer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        email: 'ananya.iyer@outlook.com',
        phone: '+91 94440 33221',
        orders: 26,
        totalSpent: 68420,
        aov: 2631,
        lastPurchase: 'Yesterday',
        rank: 2,
        tag: '⚡ High-Value VIP',
        segment: 'VIP',
        cluster: 'Cluster 1: High Value Champions',
        recencyDays: 1,
        frequency: 26,
        monetary: 68420,
        status: 'Active',
        joinedDate: '2023-08-04',
        preferredStore: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        assignedSeller: 'Priya Sharma',
        sellerId: 'emp-001',
        smartCoins: 310,
        aiInsight: 'Consistently orders weekly organic vegetables, fresh milk, and whole wheat loaves.',
        recommendedAction: 'Enroll in Smart Reorder automated weekly basket delivery.',
        recentPurchases: [
          { id: 'ord-8902', date: '2026-08-27', items: 'Farm Fresh Milk 1L (2x), Whole Wheat Bread', total: 211, payment: 'UPI' },
        ],
      },
      {
        customerId: 'cust-003',
        name: 'Meena Krishnan',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email: 'meena.k@gmail.com',
        phone: '+91 98200 45678',
        orders: 38,
        totalSpent: 48900,
        aov: 1286,
        lastPurchase: 'Today (10:15 AM)',
        rank: 3,
        tag: '🔁 Most Frequent Customer',
        segment: 'Loyal',
        cluster: 'Cluster 2: Loyal Regulars',
        recencyDays: 0,
        frequency: 38,
        monetary: 48900,
        status: 'Active',
        joinedDate: '2023-03-20',
        preferredStore: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        assignedSeller: 'Priya Sharma',
        sellerId: 'emp-001',
        smartCoins: 520,
        aiInsight: 'Highest visit frequency in Indiranagar store (avg 3.2 visits/week). Primary shopper for daily dairy & bakery.',
        recommendedAction: 'Award 100 bonus SmartCoins milestone for completing 35th order.',
        recentPurchases: [
          { id: 'ord-8914', date: '2026-08-28', items: 'Farm Fresh Milk 1L, Fresh Croissant', total: 145, payment: 'UPI' },
        ],
      },
      {
        customerId: 'cust-004',
        name: 'Rahul Deshmukh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        email: 'rahul.deshmukh@gmail.com',
        phone: '+91 98110 55667',
        orders: 14,
        totalSpent: 22400,
        aov: 1600,
        lastPurchase: '4 days ago',
        rank: 4,
        tag: '🌱 Growing Regular',
        segment: 'Growing',
        cluster: 'Cluster 3: Mid-Tier Growth',
        recencyDays: 4,
        frequency: 14,
        monetary: 22400,
        status: 'Active',
        joinedDate: '2024-01-10',
        preferredStore: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        assignedSeller: 'Priya Sharma',
        sellerId: 'emp-001',
        smartCoins: 120,
      },
      {
        customerId: 'cust-005',
        name: 'Priya Sundaram',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        email: 'priya.sundaram@tcs.com',
        phone: '+91 98450 77889',
        orders: 19,
        totalSpent: 59800,
        aov: 3147,
        lastPurchase: '45 days ago',
        rank: 5,
        tag: '⚠️ At-Risk VIP',
        segment: 'At Risk',
        cluster: 'Cluster 4: At-Risk Lapsed',
        recencyDays: 45,
        frequency: 19,
        monetary: 59800,
        status: 'Active',
        joinedDate: '2023-04-12',
        preferredStore: 'Indiranagar Flagship (Store 01)',
        storeId: 'store-01',
        assignedSeller: 'Priya Sharma',
        sellerId: 'emp-001',
        smartCoins: 210,
        aiInsight: 'Previously high lifetime value with no purchases in the last 45 days.',
        recommendedAction: 'Send personalized WhatsApp win-back discount voucher (₹250 off).',
      },
    ]);
    console.log(`✅ Seeded ${customers.length} Customers`);

    // 10. Seed Orders, Payments & Stock Transactions across past 60 days
    const orderDocs = [];
    const paymentDocs = [];
    const StockTransaction = require('./models/StockTransaction');

    const customerPool = [
      { id: 'cust-001', name: 'Vikram Malhotra', weight: 4 },
      { id: 'cust-002', name: 'Ananya Iyer', weight: 3 },
      { id: 'cust-003', name: 'Meena Krishnan', weight: 4 },
      { id: 'cust-004', name: 'Rahul Deshmukh', weight: 2 },
      { id: 'cust-005', name: 'Priya Sundaram', weight: 1 },
      { id: 'cust-006', name: 'Karthik Raja', weight: 2 },
      { id: 'cust-007', name: 'Sunita Rao', weight: 2 },
    ];

    const storePool = [
      { id: 'store-01', name: 'Indiranagar Flagship (Store 01)', sellerId: 'emp-001', sellerName: 'Priya Sharma' },
      { id: 'store-12', name: 'Bandra Central (Store 12)', sellerId: 'emp-004', sellerName: 'Farhan Merchant' },
      { id: 'store-03', name: 'Anna Nagar Express (Store 03)', sellerId: 'emp-003', sellerName: 'Sneha Patel' },
    ];

    const paymentMethods = ['UPI', 'UPI', 'UPI', 'Credit Card', 'Credit Card', 'Cash', 'Debit Cards / POS'];

    const today = new Date();

    // Generate 60 days of realistic daily transactions
    for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - dayOffset);
      const dateStr = orderDate.toISOString().split('T')[0];

      // 2 to 5 orders per day
      const dailyOrdersCount = 2 + ((dayOffset * 7 + 3) % 4);

      for (let oIdx = 0; oIdx < dailyOrdersCount; oIdx++) {
        const orderNumberSeq = 1000 + (59 - dayOffset) * 10 + oIdx;
        const cust = customerPool[(dayOffset + oIdx) % customerPool.length];
        const storeInfo = storePool[(dayOffset * 3 + oIdx) % storePool.length];
        const paymentMethod = paymentMethods[(dayOffset + oIdx * 2) % paymentMethods.length];

        // Select 1 to 3 items
        const numItems = 1 + ((dayOffset + oIdx) % 3);
        const orderItems = [];
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          const prod = products[(dayOffset + oIdx + i) % products.length];
          const qty = 1 + ((dayOffset + i) % 3);
          const itemTotal = prod.price * qty;
          subtotal += itemTotal;

          orderItems.push({
            productId: prod.productId,
            name: prod.name,
            sku: prod.sku,
            qty,
            price: prod.price,
            originalPrice: prod.originalPrice || prod.price,
            discount: (prod.originalPrice - prod.price) * qty || 0,
            total: itemTotal,
            image: prod.image,
          });
        }

        const discountAmount = Math.round(subtotal * 0.05);
        const totalAmount = Math.max(50, subtotal - discountAmount);

        // Adjust order time during business hours (9am to 9pm)
        const orderTime = new Date(orderDate);
        orderTime.setHours(9 + (oIdx * 3) % 12, (oIdx * 17) % 60, 0, 0);

        const orderId = `ord-${orderNumberSeq}`;
        const orderNumber = `ORD-2026-${orderNumberSeq}`;

        orderDocs.push({
          orderId,
          orderNumber,
          customerId: cust.id,
          customerName: cust.name,
          sellerId: storeInfo.sellerId,
          sellerName: storeInfo.sellerName,
          storeId: storeInfo.id,
          store: storeInfo.name,
          items: orderItems,
          itemsCount: orderItems.reduce((acc, it) => acc + it.qty, 0),
          subtotal,
          discount: discountAmount,
          tax: 0,
          totalAmount,
          orderType: oIdx % 3 === 0 ? 'ONLINE' : 'POS_SALE',
          status: 'Completed',
          paymentStatus: 'Paid',
          paymentMethod,
          deliveryAddress: oIdx % 3 === 0 ? 'Home Delivery - Bangalore' : 'Walk-in Store POS',
          date: orderTime.toISOString().replace('T', ' ').slice(0, 16),
          createdAt: orderTime,
          updatedAt: orderTime,
        });

        paymentDocs.push({
          paymentId: `PAY-${orderNumberSeq}`,
          orderId,
          customerName: cust.name,
          customerId: cust.id,
          method: paymentMethod,
          amount: totalAmount,
          date: orderTime.toISOString().replace('T', ' ').slice(0, 16),
          status: 'Completed',
          gateway: paymentMethod === 'UPI' ? 'Razorpay Enterprise' : paymentMethod === 'Credit Card' ? 'Stripe India' : 'Cash Counter',
          referenceId: `ref_${orderNumberSeq}_${Math.random().toString(36).substring(2, 7)}`,
          paidAt: orderTime,
          createdAt: orderTime,
          updatedAt: orderTime,
        });
      }
    }

    const orders = await Order.create(orderDocs);
    const payments = await Payment.create(paymentDocs);
    console.log(`✅ Seeded ${orders.length} Orders across 60 days`);
    console.log(`✅ Seeded ${payments.length} Matching Payments`);

    // 11. Seed Purchase Orders
    const purchaseOrders = await PurchaseOrder.create([
      {
        poId: 'PO-8801',
        poNumber: 'PO-2026-8801',
        supplier: 'Apex Tech Distributors',
        supplierId: 'sup-001',
        storeId: 'store-01',
        orderDate: '2026-08-22',
        expectedDelivery: '2026-08-25',
        totalCost: 124000,
        status: 'Pending Approval',
        isAiGenerated: true,
        items: [
          { name: 'Wireless Ergonomic Mouse', sku: 'WM-001', quantity: 40, unitCost: 1100, total: 44000, reason: 'Stock-out in 3 days (+32% velocity)' },
          { name: 'Mechanical Gaming Keyboard RGB', sku: 'KB-204', quantity: 25, unitCost: 3200, total: 80000, reason: 'Stock-out in 4 days' },
        ],
        notes: 'AI Recommended auto-reorder based on demand surge (+32% velocity) and low stock trigger.',
      },
      {
        poId: 'PO-8802',
        poNumber: 'PO-2026-8802',
        supplier: 'Valley Harvest Goods',
        supplierId: 'sup-002',
        storeId: 'store-01',
        orderDate: '2026-08-21',
        expectedDelivery: '2026-08-23',
        totalCost: 42550,
        status: 'In Transit',
        isAiGenerated: true,
        items: [
          { name: 'Premium Arabica Coffee Beans (1kg)', sku: 'BEV-882', quantity: 60, unitCost: 580, total: 34800 },
          { name: 'Organic Oat Milk 1L', sku: 'DAIRY-109', quantity: 50, unitCost: 155, total: 7750 },
        ],
        notes: 'Restocking critical inventory across Chennai and Bangalore distribution points.',
      },
    ]);
    console.log(`✅ Seeded ${purchaseOrders.length} Purchase Orders`);

    // 12. Seed System Settings
    await Setting.create([
      {
        key: 'platform_name',
        value: 'RetailMind AI Supermarket Intelligence',
        category: 'SYSTEM',
        description: 'Enterprise brand name',
      },
      {
        key: 'currency_symbol',
        value: '₹',
        category: 'STORE',
        description: 'Store pricing currency',
      },
      {
        key: 'smart_discount_engine',
        value: 'C4.5_Gain_Ratio',
        category: 'AI_ML',
        description: 'Primary decision tree classification model',
      },
    ]);
    console.log('✅ Seeded System Settings');

    console.log('\n====================================================');
    console.log('🎉 RETAILMIND AI DATABASE SEEDING COMPLETED');
    console.log('====================================================');
    console.log('👤 Admin: admin@retailmind.ai | pass: admin1234');
    console.log('🏪 Seller: seller@retailmind.ai | pass: seller1234');
    console.log('🛒 Customer: customer@retailmind.ai | pass: customer1234');
    console.log('====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
