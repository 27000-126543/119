export interface PaymentOrder {
  id: string;
  orderNo: string;
  orderIds: string[];
  buyerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refunded';
  paymentMethod: 'alipay' | 'wechat' | 'card' | 'apple_pay';
  thirdPartyTransactionId: string;
  escrowAmount: number;
  commission: number;
  sellerSettlements: Array<{
    sellerId: string;
    orderId: string;
    amount: number;
    commission: number;
    settled: boolean;
    settledAt: string | null;
  }>;
  createdAt: string;
  paidAt: string | null;
  expiredAt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentOrderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paidAt: string;
  message: string;
}

export interface Settlement {
  id: string;
  paymentOrderId: string;
  orderId: string;
  sellerId: string;
  shopName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  settlementAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentProof: string;
  createdAt: string;
  settledAt: string | null;
}
