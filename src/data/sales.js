import { customerAvatars } from '@/lib/images';

export const initialSales = [
  {
    id: "ord-9021",
    customerName: "Vikram Malhotra",
    avatar: customerAvatars["Vikram Malhotra"],
    customerId: "cust-001",
    date: "2024-08-20 14:32",
    itemsCount: 3,
    totalAmount: 1890,
    status: "Completed",
    paymentMethod: "Corporate UPI",
    store: "Indiranagar Flagship (Store 01)",
    items: [
      { name: "Farm Fresh Milk 1L (Whole)", sku: "MILK-001", qty: 4, price: 58 },
      { name: "Premium Arabica Coffee Beans (1kg)", sku: "BEV-882", qty: 1, price: 950 },
      { name: "Organic Oat Milk 1L Barista Edition", sku: "OAT-109", qty: 2, price: 240 }
    ]
  },
  {
    id: "ord-9022",
    customerName: "Priya Sundaram",
    avatar: customerAvatars["Priya Sundaram"],
    customerId: "cust-002",
    date: "2024-08-20 16:15",
    itemsCount: 4,
    totalAmount: 1425,
    status: "Completed",
    paymentMethod: "Credit Card",
    store: "Bandra Central (Store 12)",
    items: [
      { name: "Artisan Whole Wheat Sourdough Bread", sku: "BAK-102", qty: 2, price: 95 },
      { name: "Royal Basmati Rice 5kg", sku: "RICE-501", qty: 1, price: 540 },
      { name: "Greek Probiotic Natural Yogurt 500g", sku: "DAIRY-302", qty: 3, price: 135 }
    ]
  },
  {
    id: "ord-9023",
    customerName: "Rahul Deshmukh",
    avatar: customerAvatars["Rahul Deshmukh"],
    customerId: "cust-003",
    date: "2024-08-19 11:05",
    itemsCount: 2,
    totalAmount: 899,
    status: "Completed",
    paymentMethod: "UPI",
    store: "Indiranagar Flagship (Store 01)",
    items: [
      { name: "Stainless Steel Hydration Flask (750ml)", sku: "LIF-551", qty: 1, price: 899 }
    ]
  },
  {
    id: "ord-9024",
    customerName: "Ananya Iyer",
    avatar: customerAvatars["Ananya Iyer"],
    customerId: "cust-004",
    date: "2024-08-18 18:40",
    itemsCount: 5,
    totalAmount: 1320,
    status: "Completed",
    paymentMethod: "Debit Card",
    store: "Anna Nagar Supercenter (Store 03)",
    items: [
      { name: "Crisp Red Fuji Apples (1kg Bag)", sku: "FRU-201", qty: 2, price: 155 },
      { name: "Artisan Whole Wheat Sourdough Bread", sku: "BAK-102", qty: 2, price: 95 },
      { name: "Farm Fresh Milk 1L (Whole)", sku: "MILK-001", qty: 2, price: 58 }
    ]
  },
  {
    id: "ord-9025",
    customerName: "Arjun Verma",
    avatar: customerAvatars["Arjun Verma"],
    customerId: "cust-005",
    date: "2024-08-18 12:10",
    itemsCount: 2,
    totalAmount: 1250,
    status: "Completed",
    paymentMethod: "UPI",
    store: "Bandra Central (Store 12)",
    items: [
      { name: "Wireless Ergonomic Mouse (Silent Click)", sku: "TECH-001", qty: 1, price: 1250 }
    ]
  }
];
