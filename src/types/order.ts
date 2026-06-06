export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  skuId: string;
  skuSpec: string;
  price: number;
  quantity: number;
  sellerId: string;
  shopName: string;
}

export interface Order {
  id: string;
  orderNo: string;
  status: 'pending_payment' | 'pending_shipment' | 'shipped' | 'completed' | 'cancelled' | 'returned';
  statusText: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  buyerId: string;
  buyerName: string;
  shippingAddress: {
    name: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  };
  warehouseId: string;
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  trackingNumber: string;
  trackingCompany: string;
  commission: number;
  sellerAmount: number;
  createdAt: string;
  paidAt: string;
  shippedAt: string;
  completedAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNo: string;
  productId: string;
  productName: string;
  productImage: string;
  reason: string;
  description: string;
  images: string[];
  status: 'pending_seller' | 'pending_platform' | 'approved' | 'rejected' | 'completed';
  sellerDeadline: string;
  trackingNumber: string;
  refundAmount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  skuId: string;
  skuSpec: string;
  price: number;
  wholesalePrice: number;
  quantity: number;
  stock: number;
  sellerId: string;
  shopName: string;
  selected: boolean;
}
