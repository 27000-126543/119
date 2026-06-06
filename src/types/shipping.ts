export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  provider: string;
  basePrice: number;
  pricePerKg: number;
  pricePerKm: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  supportedCountries: string[];
  isTrackable: boolean;
  insuranceRate: number;
}

export interface ShippingAddress {
  country: string;
  countryCode: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface ShippingCalculationResult {
  methodId: string;
  methodName: string;
  provider: string;
  basePrice: number;
  weightFee: number;
  distanceFee: number;
  insuranceFee: number;
  total: number;
  currency: string;
  estimatedDeliveryMin: number;
  estimatedDeliveryMax: number;
  estimatedDeliveryDate: string;
}
