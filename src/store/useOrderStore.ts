import { create } from 'zustand';
import type { Order, ReturnRequest } from '@/types/order';
import type { SplitOrderResult } from '@/types/warehouse';
import { splitOrderByWarehouse, reserveStock } from '@/services/orderSplitEngine';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';
import { calculateMemberLevel, calculateDiscount, calculatePoints } from '@/services/memberService';
import { orderService, returnService, userService } from '@/services/apiService';
import type { CartItem } from '@/types/order';

interface OrderState {
  orders: Order[];
  returnRequests: ReturnRequest[];
  splitResults: SplitOrderResult[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  createOrdersFromCart: (countryCode: string, address: any, shippingMethod: string) => Promise<Order[]>;
  getOrders: (status?: string) => Promise<Order[]>;
  getOrderDetail: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  confirmReceipt: (orderId: string) => Promise<boolean>;
  createReturnRequest: (orderId: string, orderNo: string, productId: string, productName: string, productImage: string, skuId: string, skuSpec: string, quantity: number, reason: string, description: string, images: string[], buyerId: string, buyerName: string, sellerId: string, refundAmount: number) => Promise<ReturnRequest | null>;
  getReturnRequests: () => Promise<ReturnRequest[]>;
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

  getOrders: async (status) => {
    const { user } = useUserStore.getState();
    if (!user) return [];

    try {
      const result = await orderService.getOrders(user.id, status);
      if (result.success) {
        set({ orders: result.orders });
        return result.orders;
      }
      return [];
    } catch (error) {
      console.error('[OrderStore] Failed to get orders:', error);
      return [];
    }
  },

  getOrderDetail: async (orderId) => {
    try {
      const result = await orderService.getOrderDetail(orderId);
      if (result.success && result.order) {
        return result.order;
      }
      return null;
    } catch (error) {
      console.error('[OrderStore] Failed to get order detail:', error);
      return null;
    }
  },

  cancelOrder: async (orderId) => {
    console.log('[OrderStore] Cancelling order:', orderId);
    set({ isLoading: true, error: null });

    try {
      const result = await orderService.cancelOrder(orderId);
      if (result.success) {
        const { user } = useUserStore.getState();
        if (user) {
          await get().getOrders();
        }
        set({ isLoading: false });
        return true;
      }
      throw new Error(result.message);
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
      const result = await orderService.confirmOrderReceipt(orderId);
      if (!result.success) {
        throw new Error(result.message);
      }

      const orderDetail = await orderService.getOrderDetail(orderId);
      const order = orderDetail.order;
      
      if (order) {
        const { user } = useUserStore.getState();
        if (user) {
          const updateResult = await userService.updateMemberLevel(user.id, order.total);
          if (updateResult.success && updateResult.user) {
            useUserStore.setState({ user: updateResult.user });
          }
        }
      }

      const { user } = useUserStore.getState();
      if (user) {
        await get().getOrders();
      }

      set({ isLoading: false });
      console.log('[OrderStore] Order receipt confirmed and settled:', orderId);
      return true;
    } catch (error: any) {
      console.error('[OrderStore] Failed to confirm receipt:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  createReturnRequest: async (orderId, orderNo, productId, productName, productImage, skuId, skuSpec, quantity, reason, description, images, buyerId, buyerName, sellerId, refundAmount) => {
    console.log('[OrderStore] Creating return request for order:', orderId);
    set({ isLoading: true, error: null });

    try {
      const result = await returnService.createReturnRequest({
        orderId,
        orderNo,
        productId,
        productName,
        productImage,
        skuId,
        skuSpec,
        quantity,
        reason,
        description,
        images,
        buyerId,
        buyerName,
        sellerId,
        refundAmount
      });

      if (!result.success || !result.returnRequest) {
        throw new Error(result.message);
      }

      set({ 
        returnRequests: [...get().returnRequests, result.returnRequest],
        isLoading: false 
      });

      console.log('[OrderStore] Return request created successfully:', result.returnRequest.id);
      return result.returnRequest;
    } catch (error: any) {
      console.error('[OrderStore] Failed to create return request:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  getReturnRequests: async () => {
    const { user } = useUserStore.getState();
    if (!user) return [];

    try {
      const result = await returnService.getReturnRequests(user.id);
      if (result.success) {
        set({ returnRequests: result.returns });
        return result.returns;
      }
      return [];
    } catch (error) {
      console.error('[OrderStore] Failed to get return requests:', error);
      return [];
    }
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  }
}));
