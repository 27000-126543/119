import type { ShippingMethod } from '@/types/shipping';

export const mockShippingMethods: ShippingMethod[] = [
  {
    id: 'SHIP_STANDARD',
    name: '标准快递',
    code: 'STANDARD',
    provider: '全球物流联盟',
    basePrice: 25,
    pricePerKg: 8,
    pricePerKm: 0.02,
    minDeliveryDays: 7,
    maxDeliveryDays: 15,
    supportedCountries: ['CN', 'US', 'DE', 'JP', 'GB', 'FR', 'AU', 'BR', 'KR'],
    isTrackable: true,
    insuranceRate: 0.005
  },
  {
    id: 'SHIP_EXPRESS',
    name: '急速快递',
    code: 'EXPRESS',
    provider: '国际速运',
    basePrice: 60,
    pricePerKg: 15,
    pricePerKm: 0.05,
    minDeliveryDays: 3,
    maxDeliveryDays: 7,
    supportedCountries: ['CN', 'US', 'DE', 'JP', 'GB', 'FR', 'AU', 'KR'],
    isTrackable: true,
    insuranceRate: 0.01
  },
  {
    id: 'SHIP_ECONOMY',
    name: '经济海运',
    code: 'ECONOMY',
    provider: '环球海运',
    basePrice: 15,
    pricePerKg: 3,
    pricePerKm: 0.005,
    minDeliveryDays: 25,
    maxDeliveryDays: 45,
    supportedCountries: ['CN', 'US', 'DE', 'JP', 'GB', 'FR', 'AU', 'BR', 'KR'],
    isTrackable: true,
    insuranceRate: 0.003
  },
  {
    id: 'SHIP_PREMIUM',
    name: '尊贵专递',
    code: 'PREMIUM',
    provider: 'VIP物流',
    basePrice: 120,
    pricePerKg: 25,
    pricePerKm: 0.1,
    minDeliveryDays: 1,
    maxDeliveryDays: 3,
    supportedCountries: ['CN', 'US', 'DE', 'JP', 'GB', 'FR'],
    isTrackable: true,
    insuranceRate: 0.02
  }
];

export const countryDistances: Record<string, Record<string, number>> = {
  'WH_CN_SH': {
    'CN': 500, 'US': 11000, 'DE': 9200, 'JP': 1900, 
    'GB': 9500, 'FR': 9400, 'AU': 7800, 'BR': 17800, 'KR': 950
  },
  'WH_US_LA': {
    'CN': 11000, 'US': 400, 'DE': 9100, 'JP': 8800,
    'GB': 8700, 'FR': 8900, 'AU': 13400, 'BR': 10100, 'KR': 9600
  },
  'WH_DE_HH': {
    'CN': 9200, 'US': 8200, 'DE': 300, 'JP': 9400,
    'GB': 900, 'FR': 780, 'AU': 17200, 'BR': 9900, 'KR': 8800
  },
  'WH_JP_TY': {
    'CN': 1900, 'US': 8800, 'DE': 9400, 'JP': 200,
    'GB': 9700, 'FR': 9600, 'AU': 7900, 'BR': 18600, 'KR': 1100
  },
  'WH_AU_SY': {
    'CN': 7800, 'US': 13400, 'DE': 17200, 'JP': 7900,
    'GB': 17000, 'FR': 16900, 'AU': 350, 'BR': 13600, 'KR': 8200
  },
  'WH_BR_SP': {
    'CN': 17800, 'US': 10100, 'DE': 9900, 'JP': 18600,
    'GB': 9700, 'FR': 9500, 'AU': 13600, 'BR': 300, 'KR': 18900
  }
};
