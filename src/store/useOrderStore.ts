import { create } from 'zustand';
import type { Order, ReturnRequest } from '@/types/order';
import type { SplitOrderResult } from '@/types/warehouse';
import { splitOrderByWarehouse, reserveStock } from '@/services/orderSplitEngine';
import { apiService } from '@/services/apiService';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';
import { calculateMemberLevel, calculateDiscount, calculatePoints } from '@/services/memberService';
import type { CartItem } from '@/types/cart';

interface OrderState {
  orders: Order[];
  returnRequests: ReturnRequest[];
  splitResults: SplitOrderResult[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  createOrdersFromCart: (countryCode: string, address: any, shippingMethod: string) => Promise<Order[]>;
  getOrders: (status?: string) => Order[];
  getOrderDetail: (orderId: string) => Order | null;
  cancelOrder: (orderId: string) => Promise<boolean>;
  confirmReceipt: (orderId: string) => Promise<boolean>;
  createReturnRequest: (orderId: string, productId: string, reason: string, description: string, images: string[]) => Promise<ReturnRequest | null>;
  getReturnRequests: () => ReturnRequest[];
  previewSplitOrder: (items: CartItem[], countryCode: string) => SplitOrderResult[];
  clearSplitResults: () => void;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  returnRequests: [],
  splitResults: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  previewSplitOrder: (items, countryCode) => {
    console.log('[OrderStore] Previewing order split for country:', countryCode);
    const results = splitOrderByWarehouse(items, countryCode);
    set({ splitResults: results });
    return results;
  },

  clearSplitResults: () => {
    set({ splitResults: [] });
  },

  createOrdersFromCart: async (countryCode, address, shippingMethod) => {
    console.log('[OrderStore] Creating orders from cart for country:', countryCode);
    set({ isLoading: true, error: null });

    try {
      const { items } = useCartStore.getState();
      const selectedItems = items.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        throw new Error('请先选择商品');
      }

      const { user } = useUserStore.getState();
      if (!user) {
        throw new Error('请先登录');
      }

      const splitResults = splitOrderByWarehouse(selectedItems, countryCode);
      console.log('[OrderStore] Split results:', splitResults.length, 'orders');

      const createdOrders: Order[] = [];
      const now = new Date();
      const orderNoPrefix = `GS${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

      for (let i = 0; i < splitResults.length; i++) {
        const split = splitResults[i];
        
        reserveStock(split.warehouseId, split.items[0].productId, split.items[0].skuId, split.items[0].quantity);

        const memberLevel = user.memberLevel;
        const discount = calculateDiscount(split.subtotal, memberLevel);
        const points = calculatePoints(split.total, memberLevel);
        
        const commissionRate = 0.05;
        const commissionAmount = Math.round(split.total * commissionRate * 100) / 100;
        const sellerAmount = Math.round((split.total - commissionAmount) * 100) / 100;

        const orderNo = `${orderNoPrefix}${String(i + 1).padStart(4, '0')}`;
        
        const order: Order = {
          id: `ord_${Date.now()}_${i}`,
          orderNo,
          status: 'pending_payment',
          statusText: '待付款',
          items: split.items.map(item => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image,
            skuId: item.skuId,
            skuSpec: Object.values(item.specs).join(' / '),
            price: item.price,
            quantity: item.quantity,
            sellerId: 's001',
            shopName: '全球优品专营店'
          })),
          subtotal: split.subtotal,
          shippingFee: split.shippingFee,
          tax: split.tax,
          total: Math.round((split.total - discount) * 100) / 100,
          currency: 'CNY',
          buyerId: user.id,
          buyerName: user.nickname,
          shippingAddress: {
            name: address.name,
            phone: address.phone,
            country: address.country,
            province: address.province,
            city: address.city,
            address: address.address,
            postalCode: address.postalCode
          },
          warehouseId: split.warehouseId,
          paymentMethod: '',
          paymentStatus: 'unpaid',
          trackingNumber: '',
          trackingCompany: '',
          commission: commissionAmount,
          sellerAmount,
          createdAt: now.toISOString(),
          paidAt: '',
          shippedAt: '',
          completedAt: ''
        };

        createdOrders.push(order);
      }

      const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
      localStorage.setItem('gb2c_orders', JSON.stringify([...storedOrders, ...createdOrders]));

      useCartStore.getState().clearSelected();

      set({ 
        orders: [...get().orders, ...createdOrders], 
        splitResults,
        isLoading: false 
      });

      console.log('[OrderStore] Orders created successfully:', createdOrders.length);
      return createdOrders;
    } catch (error: any) {
      console.error('[OrderStore] Failed to create orders:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getOrders: (status) => {
    const { orders } = get();
    const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
    const allOrders = [...orders, ...storedOrders];
    
    if (status) {
      return allOrders.filter(o => o.status === status);
    }
    return allOrders;
  },

  getOrderDetail: (orderId) => {
    const { orders } = get();
    const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
    const allOrders = [...orders, ...storedOrders];
    return allOrders.find(o => o.id === orderId) || null;
  },

  cancelOrder: async (orderId) => {
    console.log('[OrderStore] Cancelling order:', orderId);
    set({ isLoading: true, error: null });

    try {
      const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
      const updatedOrders = storedOrders.map((o: Order) => 
        o.id === orderId ? { ...o, status: 'cancelled', statusText: '已取消' } : o
      );
      localStorage.setItem('gb2c_orders', JSON.stringify(updatedOrders));
      
      set({ 
        orders: updatedOrders.filter((o: Order) => get().orders.some(existing => existing.id === o.id)),
        isLoading: false 
      });

      console.log('[OrderStore] Order cancelled successfully:', orderId);
      return true;
    } catch (error: any) {
      console.error('[OrderStore] Failed to cancel order:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  confirmReceipt: async (orderId) => {
    console.log('[OrderStore] Confirming receipt for order:', orderId);
    set({ isLoading: true, error: null });

    try {
      const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
      const order = storedOrders.find((o: Order) => o.id === orderId);
      
      if (!order) {
        throw new Error('订单不存在');
      }

      const updatedOrder = {
        ...order,
        status: 'completed' as const,
        statusText: '已完成',
        paymentStatus: 'paid' as const,
        completedAt: new Date().toISOString()
      };

      const updatedOrders = storedOrders.map((o: Order) => 
        o.id === orderId ? updatedOrder : o
      );
      localStorage.setItem('gb2c_orders', JSON.stringify(updatedOrders));

      const { user, updateMemberLevel } = useUserStore.getState();
      if (user) {
        updateMemberLevel(order.total);
        
        const newLevelInfo = calculateMemberLevel(user.totalTradeAmount + order.total);
        useUserStore.setState({
          user: {
            ...user,
            totalTradeAmount: user.totalTradeAmount + order.total,
            memberLevel: newLevelInfo.level,
            memberLevelText: newLevelInfo.config.name,
            nextLevelAmount: newLevelInfo.nextLevelAmount,
            levelProgress: newLevelInfo.progress
          }
        });
      }

      set({ 
        orders: updatedOrders.filter((o: Order) => get().orders.some(existing => existing.id === o.id)),
        isLoading: false 
      });

      console.log('[OrderStore] Order receipt confirmed and settled:', orderId);
      return true;
    } catch (error: any) {
      console.error('[OrderStore] Failed to confirm receipt:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  createReturnRequest: async (orderId, productId, reason, description, images) => {
    console.log('[OrderStore] Creating return request for order:', orderId);
    set({ isLoading: true, error: null });

    try {
      const storedReturns = JSON.parse(localStorage.getItem('gb2c_returns') || '[]');
      const storedOrders = JSON.parse(localStorage.getItem('gb2c_orders') || '[]');
      const order = storedOrders.find((o: Order) => o.id === orderId);
      
      if (!order) {
        throw new Error('订单不存在');
      }

      const orderItem = order.items.find((i: any) => i.productId === productId);
      if (!orderItem) {
        throw new Error('商品不存在');
      }

      const sellerDeadline = new Date();
      sellerDeadline.setHours(sellerDeadline.getHours() + 72);

      const returnRequest: ReturnRequest = {
        id: `ret_${Date.now()}`,
        orderId,
        orderNo: order.orderNo,
        productId,
        productName: orderItem.productName,
        productImage: orderItem.productImage,
        reason,
        description,
        images,
        status: 'pending_seller',
        sellerDeadline: sellerDeadline.toISOString(),
        trackingNumber: '',
        refundAmount: orderItem.price * orderItem.quantity,
        createdAt: new Date().toISOString()
      };

      const updatedReturns = [...storedReturns, returnRequest];
      localStorage.setItem('gb2c_returns', JSON.stringify(updatedReturns));

      set({ 
        returnRequests: [...get().returnRequests, returnRequest],
        isLoading: false 
      });

      console.log('[OrderStore] Return request created successfully:', returnRequest.id);
      return returnRequest;
    } catch (error: any) {
      console.error('[OrderStore] Failed to create return request:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  getReturnRequests: () => {
    const { returnRequests } = get();
    const storedReturns = JSON.parse(localStorage.getItem('gb2c_returns') || '[]');
    return [...returnRequests, ...storedReturns];
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  }
}));
