export interface Product {
  id: string;
  name: string;
  price: number; // in INR (₹)
  description: string;
  image: string; // Base64 or local server path
  category: 'coasters' | 'keychains' | 'bookmarks' | 'clocks' | 'custom' | 'other' | 'festival';
  dimensions?: string;
  isAvailable: boolean;
  createdAt: string;
  rating?: number;
  discountPercent?: number;
  festivalName?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  paymentMethod: 'UPI' | 'COD';
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  orderStatus: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  transactionId?: string; // UTR code for UPI
  totalAmount: number;
  createdAt: string;
  verifiedAt?: string;
  invoiceNumber?: string;
}

export interface UserSession {
  phone: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}
