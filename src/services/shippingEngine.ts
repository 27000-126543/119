import { mockShippingMethods, countryDistances } from '@/data/shippingMethods';
import type { ShippingCalculationResult } from '@/types/shipping';

interface ShippingItem {
  productId: string;
  productName: string;
  weight: number;
  quantity: number;
  price: number;
}

export const getAvailableShippingMethods = (
  countryCode: string,
  warehouseId: string
): typeof mockShippingMethods => {
  console.log('[ShippingEngine] Getting available shipping methods:', { countryCode, warehouseId });

  const availableMethods = mockShippingMethods.filter(method =>
    method.supportedCountries.includes(countryCode)
  );

  console.log('[ShippingEngine] Found', availableMethods.length, 'available methods:');
  availableMethods.forEach((method, index) => {
    console.log(`[ShippingEngine] ${index + 1}. ${method.name} (${method.code}) - 基础价: ¥${method.basePrice}`);
  });

  return availableMethods;
};

export const calculateEstimatedDeliveryDate = (
  minDays: number,
  maxDays: number
): string => {
  console.log('[ShippingEngine] Calculating estimated delivery date:', { minDays, maxDays });

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const result = `${formatDate(minDate)} ~ ${formatDate(maxDate)}`;
  console.log('[ShippingEngine] Estimated delivery date:', result);

  return result;
};

export const calculateShipping = (
  items: ShippingItem[],
  warehouseId: string,
  countryCode: string,
  methodId: string
): ShippingCalculationResult => {
  console.log('[ShippingEngine] Calculating shipping cost:');
  console.log('[ShippingEngine] Items:', items.length, 'items');
  console.log('[ShippingEngine] Warehouse:', warehouseId);
  console.log('[ShippingEngine] Country:', countryCode);
  console.log('[ShippingEngine] Method:', methodId);

  const method = mockShippingMethods.find(m => m.id === methodId);
  if (!method) {
    console.error('[ShippingEngine] Shipping method not found:', methodId);
    throw new Error(`Shipping method ${methodId} not found`);
  }

  console.log('[ShippingEngine] Method details:', {
    name: method.name,
    provider: method.provider,
    basePrice: method.basePrice,
    pricePerKg: method.pricePerKg,
    pricePerKm: method.pricePerKm,
    insuranceRate: `${(method.insuranceRate * 100)}%`
  });

  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  console.log('[ShippingEngine] Total weight:', totalWeight.toFixed(2), 'kg');

  const distance = countryDistances[warehouseId]?.[countryCode] || 5000;
  console.log('[ShippingEngine] Shipping distance:', distance, 'km');

  const basePrice = Math.round(method.basePrice * 100) / 100;
  const weightFee = Math.round(totalWeight * method.pricePerKg * 100) / 100;
  const distanceFee = Math.round(distance * method.pricePerKm * 100) / 100;

  const insuredValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const insuranceFee = Math.round(insuredValue * method.insuranceRate * 100) / 100;

  const total = Math.round((basePrice + weightFee + distanceFee + insuranceFee) * 100) / 100;

  console.log('[ShippingEngine] Cost breakdown:');
  console.log('[ShippingEngine]   - Base price: ¥', basePrice);
  console.log('[ShippingEngine]   - Weight fee: ¥', weightFee, `(${totalWeight.toFixed(2)}kg × ¥${method.pricePerKg}/kg)`);
  console.log('[ShippingEngine]   - Distance fee: ¥', distanceFee, `(${distance}km × ¥${method.pricePerKm}/km)`);
  console.log('[ShippingEngine]   - Insurance fee: ¥', insuranceFee, `(¥${insuredValue.toFixed(2)} × ${(method.insuranceRate * 100)}%)`);
  console.log('[ShippingEngine]   - Total: ¥', total);

  const estimatedDeliveryDate = calculateEstimatedDeliveryDate(
    method.minDeliveryDays,
    method.maxDeliveryDays
  );

  const result: ShippingCalculationResult = {
    methodId: method.id,
    methodName: method.name,
    provider: method.provider,
    basePrice,
    weightFee,
    distanceFee,
    insuranceFee,
    total,
    currency: 'CNY',
    estimatedDeliveryMin: method.minDeliveryDays,
    estimatedDeliveryMax: method.maxDeliveryDays,
    estimatedDeliveryDate
  };

  console.log('[ShippingEngine] Final result:', result);
  return result;
};

console.log('[ShippingEngine] Engine initialized successfully');
console.log('[ShippingEngine] Available shipping methods:', mockShippingMethods.map(m => `${m.id} (${m.name})`));
console.log('[ShippingEngine] Supported warehouses:', Object.keys(countryDistances));
