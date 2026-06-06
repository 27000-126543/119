import { create } from 'zustand';
import type { PaymentOrder, PaymentResult, Settlement } from '@/types/payment';
import { createPaymentOrder as createPaymentOrderEngine, processPayment as processPaymentEngine, confirmReceiptAndSettle } from '@/services/paymentEngine';
import { useOrderStore } from '@/store/useOrderStore';
import { useUserStore } from '@/store/useUserStore';

interface PaymentState {
  paymentOrders: PaymentOrder[];
  settlements: Settlement[];
  currentPayment: PaymentOrder | null;
  isProcessing: boolean;
  error: string | null;
  
  createPaymentOrder: (orderIds: string[], totalAmount: number, currency: string) => Promise<PaymentOrder | null>;
  processPayment: (paymentOrderId: string, paymentMethod: 'alipay' | 'wechat' | 'card' | 'apple_pay') => Promise<PaymentResult | null>;
  confirmReceiptAndSettle: (orderId: string) => Promise<Settlement | null>;
  getPaymentOrders: () => PaymentOrder[];
  getSettlements: (sellerId?: string) => Settlement[];
  clearCurrentPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  paymentOrders: [],
  settlements: [],
  currentPayment: null,
  isProcessing: false,
  error: null,

  createPaymentOrder: async (orderIds, totalAmount, currency) => {
    console.log('[PaymentStore] Creating payment order for orders:', orderIds);
    set({ isProcessing: true, error: null });

    try {
      const { user } = useUserStore.getState();
      if (!user) {
        throw new Error('请先登录');
      }

      const paymentOrder = await createPaymentOrderEngine(orderIds, user.id, totalAmount, currency);
      
      const storedPayments = JSON.parse(localStorage.getItem('gb2c_payments') || '[]');
      localStorage.setItem('gb2c_payments', JSON.stringify([...storedPayments, paymentOrder]));

      set({ 
        paymentOrders: [...get().paymentOrders, paymentOrder],
        currentPayment: paymentOrder,
        isProcessing: false 
      });

      console.log('[PaymentStore] Payment order created:', paymentOrder.id);
      return paymentOrder;
    } catch (error: any) {
      console.error('[PaymentStore] Failed to create payment order:', error);
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },

  processPayment: async (paymentOrderId, paymentMethod) => {
    console.log('[PaymentStore] Processing payment:', paymentOrderId, 'method:', paymentMethod);
    set({ isProcessing: true, error: null });

    try {
      const result = await processPaymentEngine(paymentOrderId, paymentMethod);
      
      if (result.success) {
        const storedPayments = JSON.parse(localStorage.getItem('gb2c_payments') || '[]');
        const updatedPayments = storedPayments.map((p: PaymentOrder) => 
          p.id === paymentOrderId ? {
            ...p,
            status: 'paid' as const,
            paymentMethod,
            thirdPartyTransactionId: result.transactionId,
            paidAt: result.paidAt
          } : p
        );
        localStorage.setItem('gb2c_payments', JSON.stringify(updatedPayments));

        const { orders } = useOrderStore.getState();
        const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
        
        const payment = updatedPayments.find((p: PaymentOrder) => p.id === paymentOrderId);
        if (payment) {
          const updatedOrders = storedOrders.map((o: any) => 
            payment.orderIds.includes(o.id) ? {
              ...o,
              status: 'pending_shipment',
              statusText: '待发货',
              paymentStatus: 'paid',
              paymentMethod,
              paidAt: result.paidAt
            } : o
          );
          localStorage.setItem('gb2c_orders', JSON.stringify(updatedOrders));
        }

        set({ 
          paymentOrders: updatedPayments,
          isProcessing: false 
        });

        console.log('[PaymentStore] Payment processed successfully:', result.transactionId);
        return result;
      } else {
        throw new Error(result.message || '支付失败');
      }
    } catch (error: any) {
      console.error('[PaymentStore] Failed to process payment:', error);
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },

  confirmReceiptAndSettle: async (orderId) => {
    console.log('[PaymentStore] Confirming receipt and settling for order:', orderId);
    set({ isProcessing: true, error: null });

    try {
      const settlement = await confirmReceiptAndSettle(orderId);
      
      if (settlement) {
        const storedSettlements = JSON.parse(localStorage.getItem('gb2c_settlements') || '[]');
        localStorage.setItem('gb2c_settlements', JSON.stringify([...storedSettlements, settlement]));

        set({ 
          settlements: [...get().settlements, settlement],
          isProcessing: false 
        });

        console.log('[PaymentStore] Settlement completed:', settlement.id);
        return settlement;
      }

      set({ isProcessing: false });
      return null;
    } catch (error: any) {
      console.error('[PaymentStore] Failed to settle:', error);
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },

  getPaymentOrders: () => {
    const { paymentOrders } = get();
    const storedPayments = JSON.parse(localStorage.getItem('gb2c_payments') || '[]');
    return [...paymentOrders, ...storedPayments];
  },

  getSettlements: (sellerId) => {
    const { settlements } = get();
    const storedSettlements = JSON.parse(localStorage.getItem('gb2c_settlements') || '[]');
    const allSettlements = [...settlements, ...storedSettlements];
    
    if (sellerId) {
      return allSettlements.filter(s => s.sellerId === sellerId);
    }
    return allSettlements;
  },

  clearCurrentPayment: () => {
    set({ currentPayment: null });
  }
}));
