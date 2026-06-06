export interface Warehouse {
  id: string;
  name: string;
  country: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentStock: number;
  isActive: boolean;
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  skuId: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface SplitOrderResult {
  warehouseId: string;
  warehouseName: string;
  items: Array<{
    productId: string;
    skuId: string;
    name: string;
    image: string;
    specs: Record<string, string>;
    price: number;
    quantity: number;
    weight: number;
  }>;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  estimatedDelivery: string;
}
