export type MemberLevel = 'normal' | 'silver' | 'gold' | 'diamond';
export type Language = 'zh' | 'en' | 'ja' | 'ko';
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY';
export type RealnameStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted';

export interface User {
  id: string;
  phone: string;
  email: string;
  avatar: string;
  nickname: string;
  realname: string;
  realnameStatus: RealnameStatus;
  idCardNo: string;
  idCardFront: string;
  idCardBack: string;
  language: Language;
  currency: Currency;
  country: string;
  memberLevel: MemberLevel;
  memberLevelText: string;
  totalTradeAmount: number;
  nextLevelAmount: number;
  levelProgress: number;
  couponCount: number;
  freeReturnCount: number;
  hasShop: boolean;
  shopId: string;
  shopName: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface MemberBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  levels: MemberLevel[];
}

export interface Coupon {
  id: string;
  name: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minAmount: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  status: 'available' | 'used' | 'expired';
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Shop {
  id: string;
  name: string;
  logo: string;
  description: string;
  sellerId: string;
  sellerName: string;
  country: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  orderCount: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}
