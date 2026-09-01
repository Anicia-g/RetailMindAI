import { productImages } from '@/lib/images';

export const supermarketDeals = [
  {
    id: 'deal-001',
    title: 'Morning Breakfast Essentials Trio',
    description: 'Artisan Sourdough Bread + Farm Fresh Butter + Pure Strawberry Fruit Jam',
    image: productImages.bread,
    items: [
      { name: 'Whole Wheat Sourdough Bread', price: 95, img: productImages.bread },
      { name: 'Farm Fresh Butter (200g)', price: 65, img: productImages.butter },
      { name: 'Strawberry Jam (340g)', price: 90, img: productImages.jam },
    ],
    originalTotal: 250,
    bundlePrice: 220,
    discountPct: 12,
    badge: '🔥 12% OFF BUNDLE',
    savings: 30,
    tag: 'Frequently Bought Together',
  },
  {
    id: 'deal-002',
    title: 'Barista Specialty Coffee Combo',
    description: 'Arabica Roasted Whole Coffee Beans (1kg) + Organic Oat Milk Barista Edition 1L',
    image: productImages.coffee,
    items: [
      { name: 'Premium Arabica Coffee Beans', price: 950, img: productImages.coffee },
      { name: 'Organic Oat Milk 1L', price: 240, img: productImages.oatMilk },
    ],
    originalTotal: 1190,
    bundlePrice: 999,
    discountPct: 16,
    badge: '⭐ SAVE ₹191',
    savings: 191,
    tag: 'Top Pairing',
  },
  {
    id: 'deal-003',
    title: 'Healthy Orchard & Dairy Pack',
    description: 'Crisp Red Fuji Apples (1kg) + Greek Probiotic Yogurt 500g + Raw Forest Honey',
    image: productImages.apples,
    items: [
      { name: 'Crisp Red Fuji Apples (1kg)', price: 180, img: productImages.apples },
      { name: 'Greek Probiotic Yogurt 500g', price: 160, img: productImages.yogurt },
    ],
    originalTotal: 340,
    bundlePrice: 285,
    discountPct: 16,
    badge: '🌿 ORGANIC SPECIAL',
    savings: 55,
    tag: 'Supermarket Special',
  },
];
