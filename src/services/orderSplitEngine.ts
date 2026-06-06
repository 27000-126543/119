import { mockWarehouses, mockWarehouseStocks } from '@/data/warehouses';
import type { SplitOrderResult } from '@/types/warehouse';
import type { CartItem } from '@/types/cart';

interface CartItemExtended extends CartItem {
  weight?: number;
  category?: string;
}

export const calculateDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearestWarehouse = (
  countryCode: string,
  productId: string,
  skuId: string,
  quantity: number
): { warehouseId: string; warehouseName: string; distance: number } | null => {
  console.log('[OrderSplitEngine] Finding nearest warehouse for:', { countryCode, productId, skuId, quantity });

  const countryCoordinates: Record<string, { lat: number; lon: number }> = {
    'CN': { lat: 35.8617, lon: 104.1954 },
    'US': { lat: 37.0902, lon: -95.7129 },
    'DE': { lat: 51.1657, lon: 10.4515 },
    'JP': { lat: 36.2048, lon: 138.2529 },
    'GB': { lat: 55.3781, lon: -3.4360 },
    'FR': { lat: 46.2276, lon: 2.2137 },
    'AU': { lat: -25.2744, lon: 133.7751 },
    'BR': { lat: -14.2350, lon: -51.9253 },
    'KR': { lat: 35.9078, lon: 127.7669 }
  };

  const targetCoords = countryCoordinates[countryCode] || { lat: 35.8617, lon: 104.1954 };

  const availableWarehouses = mockWarehouseStocks
    .filter(stock => 
      stock.productId === productId && 
      stock.skuId === skuId && 
      (stock.quantity - stock.reservedQuantity) >= quantity
    )
    .map(stock => {
      const warehouse = mockWarehouses.find(w => w.id === stock.warehouseId);
      if (!warehouse) return null;
      const distance = calculateDistance(
        warehouse.latitude, warehouse.longitude,
        targetCoords.lat, targetCoords.lon
      );
      return {
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouseName,
        distance
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.distance - b!.distance);

  if (availableWarehouses.length === 0) {
    console.log('[OrderSplitEngine] No warehouse found with sufficient stock');
    return null;
  }

  const result = availableWarehouses[0]!;
  console.log('[OrderSplitEngine] Nearest warehouse found:', result);
  return result;
};

export const splitOrderByWarehouse = (
  items: CartItemExtended[],
  countryCode: string
): SplitOrderResult[] => {
  console.log('[OrderSplitEngine] Splitting order for country:', countryCode);
  console.log('[OrderSplitEngine] Items to split:', items.length);

  const warehouseGroups: Record<string, SplitOrderResult> = {};

  items.forEach(item => {
    const warehouse = findNearestWarehouse(
      countryCode,
      item.productId,
      item.skuId,
      item.quantity
    );

    if (!warehouse) {
      console.warn('[OrderSplitEngine] Skipping item - no warehouse available:', item.productName);
      return;
    }

    if (!warehouseGroups[warehouse.warehouseId]) {
      warehouseGroups[warehouse.warehouseId] = {
        warehouseId: warehouse.warehouseId,
        warehouseName: warehouse.warehouseName,
        items: [],
        subtotal: 0,
        shippingFee: 0,
        tax: 0,
        total: 0,
        estimatedDelivery: ''
      };
    }

    const group = warehouseGroups[warehouse.warehouseId];
    const weight = item.weight || 0.5;
    
    group.items.push({
      productId: item.productId,
      skuId: item.skuId,
      name: item.productName,
      image: item.productImage,
      specs: {},
      price: item.price,
      quantity: item.quantity,
      weight
    });

    group.subtotal += item.price * item.quantity;
  });

  const results = Object.values(warehouseGroups);
  console.log('[OrderSplitEngine] Split into', results.length, 'warehouse orders');
  
  results.forEach(result => {
    const totalWeight = result.items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    result.shippingFee = calculateShippingFee(totalWeight, result.warehouseId, countryCode);
    result.tax = calculateTax(result.subtotal, countryCode, 'general');
    result.total = result.subtotal + result.shippingFee + result.tax;
    result.estimatedDelivery = calculateEstimatedDelivery(result.warehouseId, countryCode);
  });

  return results;
};

export const calculateShippingFee = (
  totalWeight: number,
  warehouseId: string,
  countryCode: string
): number => {
  const baseFee = 25;
  const weightFee = totalWeight * 8;
  
  const distances: Record<string, Record<string, number>> = {
    'WH_CN_SH': { 'CN': 10, 'US': 35, 'DE': 40, 'JP': 15, 'GB': 42, 'FR': 40, 'AU': 30, 'BR': 50, 'KR': 12 },
    'WH_US_LA': { 'CN': 45, 'US': 8, 'DE': 35, 'JP': 38, 'GB': 36, 'FR': 37, 'AU': 48, 'BR': 28, 'KR': 42 },
    'WH_DE_HH': { 'CN': 38, 'US': 32, 'DE': 6, 'JP': 42, 'GB': 10, 'FR': 8, 'AU': 55, 'BR': 38, 'KR': 40 },
    'WH_JP_TY': { 'CN': 18, 'US': 38, 'DE': 42, 'JP': 5, 'GB': 45, 'FR': 44, 'AU': 32, 'BR': 55, 'KR': 10 },
    'WH_AU_SY': { 'CN': 32, 'US': 45, 'DE': 52, 'JP': 35, 'GB': 55, 'FR': 54, 'AU': 8, 'BR': 48, 'KR': 38 },
    'WH_BR_SP': { 'CN': 50, 'US': 28, 'DE': 40, 'JP': 55, 'GB': 38, 'FR': 36, 'AU': 50, 'BR': 5, 'KR': 52 }
  };

  const distanceFee = distances[warehouseId]?.[countryCode] || 30;
  const fee = Math.round((baseFee + weightFee + distanceFee) * 100) / 100;
  
  console.log('[OrderSplitEngine] Shipping fee calculated:', { totalWeight, warehouseId, countryCode, fee });
  return fee;
};

export const calculateTax = (
  amount: number,
  countryCode: string,
  category: string
): number => {
  const taxRates: Record<string, number> = {
    'CN': 0.13, 'US': 0.08, 'DE': 0.19, 'JP': 0.10,
    'GB': 0.20, 'FR': 0.20, 'AU': 0.10, 'BR': 0.17, 'KR': 0.10
  };
  
  const rate = taxRates[countryCode] || 0.1;
  const tax = Math.round(amount * rate * 100) / 100;
  
  console.log('[OrderSplitEngine] Tax calculated:', { amount, countryCode, category, rate, tax });
  return tax;
};

export const calculateEstimatedDelivery = (
  warehouseId: string,
  countryCode: string
): string => {
  const deliveryDays: Record<string, Record<string, [number, number]>> = {
    'WH_CN_SH': { 'CN': [2, 4], 'US': [10, 15], 'DE': [12, 18], 'JP': [3, 6], 'GB': [14, 20], 'FR': [12, 18], 'AU': [10, 15], 'BR': [20, 30], 'KR': [2, 5] },
    'WH_US_LA': { 'CN': [12, 18], 'US': [2, 5], 'DE': [10, 15], 'JP': [10, 15], 'GB': [10, 15], 'FR': [10, 15], 'AU': [15, 22], 'BR': [8, 14], 'KR': [12, 18] },
    'WH_DE_HH': { 'CN': [14, 20], 'US': [10, 15], 'DE': [1, 3], 'JP': [12, 18], 'GB': [2, 5], 'FR': [1, 3], 'AU': [20, 30], 'BR': [12, 20], 'KR': [14, 20] },
    'WH_JP_TY': { 'CN': [3, 7], 'US': [12, 18], 'DE': [14, 20], 'JP': [1, 3], 'GB': [16, 24], 'FR': [14, 20], 'AU': [12, 18], 'BR': [25, 35], 'KR': [2, 5] },
    'WH_AU_SY': { 'CN': [12, 18], 'US': [18, 25], 'DE': [22, 32], 'JP': [14, 20], 'GB': [24, 35], 'FR': [22, 32], 'AU': [2, 5], 'BR': [20, 30], 'KR': [14, 20] },
    'WH_BR_SP': { 'CN': [25, 35], 'US': [14, 22], 'DE': [18, 28], 'JP': [28, 40], 'GB': [16, 25], 'FR': [16, 25], 'AU': [22, 32], 'BR': [2, 5], 'KR': [28, 40] }
  };

  const [minDays, maxDays] = deliveryDays[warehouseId]?.[countryCode] || [7, 15];
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
};

export const reserveStock = (
  warehouseId: string,
  productId: string,
  skuId: string,
  quantity: number
): boolean => {
  console.log('[OrderSplitEngine] Reserving stock:', { warehouseId, productId, skuId, quantity });
  
  const stock = mockWarehouseStocks.find(
    s => s.warehouseId === warehouseId && s.productId === productId && s.skuId === skuId
  );

  if (!stock) {
    console.warn('[OrderSplitEngine] Stock record not found');
    return false;
  }

  const available = stock.quantity - stock.reservedQuantity;
  if (available < quantity) {
    console.warn('[OrderSplitEngine] Insufficient stock. Available:', available, 'Requested:', quantity);
    return false;
  }

  stock.reservedQuantity += quantity;
  stock.updatedAt = new Date().toISOString();
  
  console.log('[OrderSplitEngine] Stock reserved successfully. New reserved quantity:', stock.reservedQuantity);
  return true;
};

export const releaseStock = (
  warehouseId: string,
  productId: string,
  skuId: string,
  quantity: number
): void => {
  console.log('[OrderSplitEngine] Releasing stock:', { warehouseId, productId, skuId, quantity });
  
  const stock = mockWarehouseStocks.find(
    s => s.warehouseId === warehouseId && s.productId === productId && s.skuId === skuId
  );

  if (stock) {
    stock.reservedQuantity = Math.max(0, stock.reservedQuantity - quantity);
    stock.updatedAt = new Date().toISOString();
    console.log('[OrderSplitEngine] Stock released successfully. New reserved quantity:', stock.reservedQuantity);
  }
};
