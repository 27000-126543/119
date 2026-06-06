import { create } from 'zustand';
import type { CartItem } from '@/types/order';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'selected'>) => void;
  updateQuantity: (productId: string, skuId: string, quantity: number) => void;
  removeItem: (productId: string, skuId: string) => void;
  toggleSelect: (productId: string, skuId: string) => void;
  toggleSelectAll: (selected: boolean) => void;
  clearSelected: () => void;
  getSelectedItems: () => CartItem[];
  getSelectedTotal: () => number;
  getSelectedCount: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    {
      productId: 'p001',
      productName: '高端智能无线蓝牙耳机 Pro',
      productImage: 'https://picsum.photos/id/3/300/300',
      skuId: 'sku001',
      skuSpec: '黑色 / 256GB',
      price: 599,
      wholesalePrice: 450,
      quantity: 2,
      stock: 100,
      sellerId: 's001',
      shopName: '全球优品专营店',
      selected: true
    },
    {
      productId: 'p002',
      productName: '轻奢时尚女士手提包',
      productImage: 'https://picsum.photos/id/220/300/300',
      skuId: 'sku003',
      skuSpec: '棕色 / 大号',
      price: 899,
      wholesalePrice: 680,
      quantity: 1,
      stock: 50,
      sellerId: 's002',
      shopName: '精品箱包旗舰店',
      selected: false
    }
  ],
  addItem: (newItem) => set((state) => {
    const existing = state.items.find(
      (i) => i.productId === newItem.productId && i.skuId === newItem.skuId
    );
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.productId === newItem.productId && i.skuId === newItem.skuId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      };
    }
    return { items: [...state.items, { ...newItem, selected: true }] };
  }),
  updateQuantity: (productId, skuId, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.productId === productId && i.skuId === skuId
        ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
        : i
    )
  })),
  removeItem: (productId, skuId) => set((state) => ({
    items: state.items.filter(
      (i) => !(i.productId === productId && i.skuId === skuId)
    )
  })),
  toggleSelect: (productId, skuId) => set((state) => ({
    items: state.items.map((i) =>
      i.productId === productId && i.skuId === skuId
        ? { ...i, selected: !i.selected }
        : i
    )
  })),
  toggleSelectAll: (selected) => set((state) => ({
    items: state.items.map((i) => ({ ...i, selected }))
  })),
  clearSelected: () => set((state) => ({
    items: state.items.filter((i) => !i.selected)
  })),
  getSelectedItems: () => get().items.filter((i) => i.selected),
  getSelectedTotal: () => get().items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.price * i.quantity, 0),
  getSelectedCount: () => get().items.filter((i) => i.selected).length,
  getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0)
}));
