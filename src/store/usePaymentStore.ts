import { create } from 'zustand';
import type { PaymentOrder, PaymentResult, Settlement } from '@/types/payment';
import { paymentService, orderService } from '@/services/apiService';
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

      const result = await paymentService.createPaymentOrder({
        orderIds,
        buyerId: user.id,
        totalAmount,
        currency
      });

      if (!result.success || !result.paymentOrder) {
        throw new Error(result.message || '创建支付订单失败');
      }

      set({ 
        paymentOrders: [...get().paymentOrders, result.paymentOrder],
        currentPayment: result.paymentOrder,
        isProcessing: false 
      });

      console.log('[PaymentStore] Payment order created:', result.paymentOrder.id);
      return result.paymentOrder;
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
      const result = await paymentService.processPayment(paymentOrderId, paymentMethod);
      
      if (result.success) {
        const { user } = useUserStore.getState();
        if (user) {
          await useOrderStore.getState().getOrders();
        }

        set({ 
          isProcessing: false 
        });

        console.log('[PaymentStore] Payment processed successfully');
        return {
          success: true,
          paymentOrderId,
          transactionId: `TXN_${Date.now()}`,
          amount: 0,
          currency: 'CNY',
          paidAt: new Date().toISOString(),
          message: result.message
        };
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
      const result = await paymentService.settlePayment(orderId, 0.05);
      
      if (result.success && result.settlement) {
        set({ 
          settlements: [...get().settlements, result.settlement],
          isProcessing: false 
        });

        console.log('[PaymentStore] Settlement completed:', result.settlement.id);
        return result.settlement;
      }

      set({ isProcessing: false });
      return null;
    } catch (error: any) {
      console.error('[PaymentStore] Failed to settle:', error);
      set({ error: error.message, isProcessing: false });
      return null;
    }
  },

  getPaymentOrders: async () => {
    const { user } = useUserStore.getState();
    if (!user) return [];
    return get().paymentOrders;
  },

  getSettlements: async (sellerId) => {
    const { settlements } = get();
    if (sellerId) {
      return settlements.filter(s => s.sellerId === sellerId);
    }
    return settlements;
  },

  clearCurrentPayment: () => {
    set({ currentPayment: null });
  }
}));
