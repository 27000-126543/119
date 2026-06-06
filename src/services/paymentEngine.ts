import { mockOrders } from '@/data/orders';
import type { PaymentOrder, PaymentResult, Settlement } from '@/types/payment';

const DEFAULT_COMMISSION_RATE = 0.05;
const PAYMENT_SUCCESS_RATE = 0.95;
const PAYMENT_METHODS = ['alipay', 'wechat', 'card', 'apple_pay'] as const;
const PAYMENT_METHOD_NAMES: Record<string, string> = {
  alipay: '支付宝',
  wechat: '微信支付',
  card: '银行卡',
  apple_pay: 'Apple Pay'
};

let paymentOrders: PaymentOrder[] = [];
let settlements: Settlement[] = [];

export const calculateCommission = (amount: number, rate: number = DEFAULT_COMMISSION_RATE): number => {
  console.log('[PaymentEngine] Calculating commission:', { amount, rate: `${(rate * 100)}%` });

  const commission = Math.round(amount * rate * 100) / 100;
  console.log('[PaymentEngine] Commission calculated:', commission);

  return commission;
};

export const generateSettlementRecord = (orderId: string): Settlement => {
  console.log('[PaymentEngine] Generating settlement record for order:', orderId);

  const order = mockOrders.find((o) => o.id === orderId);

  if (!order) {
    console.warn('[PaymentEngine] Order not found, using mock data for settlement:', orderId);
  }

  const orderAmount = order?.total || 100;
  const commission = calculateCommission(orderAmount);
  const settlementAmount = Math.round((orderAmount - commission) * 100) / 100;

  const settlement: Settlement = {
    id: `STL_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    paymentOrderId: `PAY_${Date.now()}`,
    orderId,
    sellerId: order?.items?.[0]?.sellerId || 'SELLER_001',
    shopName: order?.items?.[0]?.shopName || '官方旗舰店',
    orderAmount,
    commissionRate: DEFAULT_COMMISSION_RATE,
    commissionAmount: commission,
    settlementAmount,
    status: 'pending',
    paymentProof: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    settledAt: null
  };

  settlements.push(settlement);
  console.log('[PaymentEngine] Settlement record generated:', settlement);

  return settlement;
};

export const createPaymentOrder = (
  orderIds: string[],
  buyerId: string,
  totalAmount: number,
  currency: string = 'CNY'
): PaymentOrder => {
  console.log('[PaymentEngine] Creating payment order:');
  console.log('[PaymentEngine] Order IDs:', orderIds);
  console.log('[PaymentEngine] Buyer ID:', buyerId);
  console.log('[PaymentEngine] Total amount:', totalAmount, currency);

  const orders = orderIds.map(id => mockOrders.find((o) => o.id === id)).filter(Boolean);

  console.log('[PaymentEngine] Found', orders.length, 'of', orderIds.length, 'orders');

  const totalCommission = calculateCommission(totalAmount);
  const escrowAmount = Math.round((totalAmount - totalCommission) * 100) / 100;

  const sellerSettlements: PaymentOrder['sellerSettlements'] = [];
  const sellerOrderMap: Record<string, { orderId: string; amount: number }[]> = {};

  orders.forEach((order: any) => {
    const sellerId = order.items?.[0]?.sellerId || 'SELLER_001';
    if (!sellerOrderMap[sellerId]) {
      sellerOrderMap[sellerId] = [];
    }
    const orderCommission = calculateCommission(order.total);
    sellerOrderMap[sellerId].push({
      orderId: order.id,
      amount: Math.round((order.total - orderCommission) * 100) / 100
    });
  });

  Object.entries(sellerOrderMap).forEach(([sellerId, orderAmounts]) => {
    orderAmounts.forEach(({ orderId, amount }) => {
      const orderCommission = calculateCommission(amount / (1 - DEFAULT_COMMISSION_RATE));
      sellerSettlements.push({
        sellerId,
        orderId,
        amount,
        commission: orderCommission,
        settled: false,
        settledAt: null
      });
    });
  });

  console.log('[PaymentEngine] Seller settlements prepared:', sellerSettlements.length, 'settlements');

  const now = new Date();
  const expiredAt = new Date(now.getTime() + 30 * 60 * 1000);

  const paymentOrder: PaymentOrder = {
    id: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    orderNo: `PAY${Date.now().toString().slice(-8)}`,
    orderIds,
    buyerId,
    amount: Math.round(totalAmount * 100) / 100,
    currency,
    status: 'pending',
    paymentMethod: 'alipay',
    thirdPartyTransactionId: '',
    escrowAmount,
    commission: totalCommission,
    sellerSettlements,
    createdAt: now.toISOString(),
    paidAt: null,
    expiredAt: expiredAt.toISOString()
  };

  paymentOrders.push(paymentOrder);

  console.log('[PaymentEngine] Payment order created successfully:');
  console.log('[PaymentEngine]   - ID:', paymentOrder.id);
  console.log('[PaymentEngine]   - Order No:', paymentOrder.orderNo);
  console.log('[PaymentEngine]   - Amount:', paymentOrder.amount, currency);
  console.log('[PaymentEngine]   - Commission:', paymentOrder.commission);
  console.log('[PaymentEngine]   - Escrow amount:', paymentOrder.escrowAmount);
  console.log('[PaymentEngine]   - Expires at:', expiredAt.toLocaleString());

  return paymentOrder;
};

const simulateThirdPartyPayment = (
  amount: number,
  paymentMethod: string
): Promise<{ success: boolean; transactionId: string; message: string }> => {
  const delay = 1000 + Math.random() * 2000;
  console.log('[PaymentEngine] Simulating third-party payment via', PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod);
  console.log('[PaymentEngine] Amount:', amount);
  console.log('[PaymentEngine] Simulated delay:', delay.toFixed(0), 'ms');

  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() < PAYMENT_SUCCESS_RATE;
      const transactionId = success
        ? `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        : '';
      const message = success
        ? '支付成功'
        : `支付失败：${Math.random() < 0.5 ? '余额不足' : '网络超时，请重试'}`;

      if (success) {
        console.log('[PaymentEngine] Third-party payment SUCCESS:');
        console.log('[PaymentEngine]   - Transaction ID:', transactionId);
        console.log('[PaymentEngine]   - Amount:', amount);
        console.log('[PaymentEngine]   - Method:', PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod);
      } else {
        console.warn('[PaymentEngine] Third-party payment FAILED:');
        console.warn('[PaymentEngine]   - Reason:', message);
        console.warn('[PaymentEngine]   - Method:', PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod);
      }

      resolve({ success, transactionId, message });
    }, delay);
  });
};

export const processPayment = async (
  paymentOrderId: string,
  paymentMethod: typeof PAYMENT_METHODS[number]
): Promise<PaymentResult> => {
  console.log('[PaymentEngine] Processing payment:');
  console.log('[PaymentEngine] Payment order ID:', paymentOrderId);
  console.log('[PaymentEngine] Payment method:', PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod);

  const paymentOrder = paymentOrders.find(p => p.id === paymentOrderId);
  if (!paymentOrder) {
    console.error('[PaymentEngine] Payment order not found:', paymentOrderId);
    throw new Error(`Payment order ${paymentOrderId} not found`);
  }

  if (paymentOrder.status !== 'pending') {
    console.warn('[PaymentEngine] Payment order already processed. Current status:', paymentOrder.status);
    return {
      success: paymentOrder.status === 'paid',
      paymentOrderId,
      transactionId: paymentOrder.thirdPartyTransactionId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      paidAt: paymentOrder.paidAt || new Date().toISOString(),
      message: paymentOrder.status === 'paid' ? '订单已支付' : `订单状态: ${paymentOrder.status}`
    };
  }

  const now = new Date();
  if (now > new Date(paymentOrder.expiredAt)) {
    console.warn('[PaymentEngine] Payment order expired');
    paymentOrder.status = 'failed';
    return {
      success: false,
      paymentOrderId,
      transactionId: '',
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      paidAt: '',
      message: '支付订单已过期，请重新发起支付'
    };
  }

  console.log('[PaymentEngine] Calling third-party payment gateway...');
  const result = await simulateThirdPartyPayment(paymentOrder.amount, paymentMethod);

  if (result.success) {
    paymentOrder.status = 'paid';
    paymentOrder.paymentMethod = paymentMethod;
    paymentOrder.thirdPartyTransactionId = result.transactionId;
    paymentOrder.paidAt = new Date().toISOString();

    console.log('[PaymentEngine] Payment successful! Funds held in escrow:');
    console.log('[PaymentEngine]   - Escrow amount:', paymentOrder.escrowAmount);
    console.log('[PaymentEngine]   - Commission:', paymentOrder.commission);
    console.log('[PaymentEngine]   - Will be settled after buyer confirms receipt');
  } else {
    paymentOrder.status = 'failed';
  }

  return {
    success: result.success,
    paymentOrderId,
    transactionId: result.transactionId,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency,
    paidAt: paymentOrder.paidAt || '',
    message: result.message
  };
};

export const confirmReceiptAndSettle = (orderId: string): Settlement[] => {
  console.log('[PaymentEngine] Confirming receipt and initiating settlement for order:', orderId);

  const order = mockOrders.find((o) => o.id === orderId);

  const relatedPaymentOrders = paymentOrders.filter(p =>
    p.orderIds.includes(orderId) && p.status === 'paid'
  );

  if (relatedPaymentOrders.length === 0) {
    console.warn('[PaymentEngine] No paid payment order found for order:', orderId);
    return [];
  }

  const completedSettlements: Settlement[] = [];

  relatedPaymentOrders.forEach(paymentOrder => {
    console.log('[PaymentEngine] Processing payment order:', paymentOrder.id);

    paymentOrder.sellerSettlements.forEach(settlement => {
      if (settlement.orderId === orderId && !settlement.settled) {
        console.log('[PaymentEngine] Settling funds to seller:', settlement.sellerId);
        console.log('[PaymentEngine]   - Order:', settlement.orderId);
        console.log('[PaymentEngine]   - Settlement amount:', settlement.amount);
        console.log('[PaymentEngine]   - Commission:', settlement.commission);

        settlement.settled = true;
        settlement.settledAt = new Date().toISOString();

        const settlementRecord: Settlement = {
          id: `STL_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentOrderId: paymentOrder.id,
          orderId: settlement.orderId,
          sellerId: settlement.sellerId,
          shopName: order?.items?.[0]?.shopName || settlement.sellerId,
          orderAmount: Math.round((settlement.amount + settlement.commission) * 100) / 100,
          commissionRate: DEFAULT_COMMISSION_RATE,
          commissionAmount: settlement.commission,
          settlementAmount: settlement.amount,
          status: 'completed',
          paymentProof: paymentOrder.thirdPartyTransactionId,
          createdAt: paymentOrder.createdAt,
          settledAt: settlement.settledAt
        };

        settlements.push(settlementRecord);
        completedSettlements.push(settlementRecord);

        console.log('[PaymentEngine] Settlement completed successfully!');
        console.log('[PaymentEngine] Settlement record ID:', settlementRecord.id);
      }
    });
  });

  console.log('[PaymentEngine] Total settlements completed for this order:', completedSettlements.length);

  return completedSettlements;
};

console.log('[PaymentEngine] Engine initialized successfully');
console.log('[PaymentEngine] Default commission rate:', `${(DEFAULT_COMMISSION_RATE * 100)}%`);
console.log('[PaymentEngine] Payment success rate:', `${(PAYMENT_SUCCESS_RATE * 100)}%`);
console.log('[PaymentEngine] Supported payment methods:', PAYMENT_METHODS.map(m => PAYMENT_METHOD_NAMES[m]));
