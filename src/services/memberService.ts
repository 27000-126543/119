import type { MemberLevel, Coupon } from '@/types/user';

export interface MemberBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  levels: MemberLevel[];
  value?: string;
}

export interface MemberLevelConfig {
  level: MemberLevel;
  name: string;
  minTradeAmount: number;
  color: string;
  bgColor: string;
  discountRate: number;
  freeReturnCount: number;
  couponCount: number;
  customerService: 'standard' | 'priority' | 'exclusive' | 'dedicated';
  pointsMultiplier: number;
}

export const memberLevelConfigs: MemberLevelConfig[] = [
  {
    level: 'normal',
    name: '普通会员',
    minTradeAmount: 0,
    color: '#6b7280',
    bgColor: '#f3f4f6',
    discountRate: 1.0,
    freeReturnCount: 0,
    couponCount: 2,
    customerService: 'standard',
    pointsMultiplier: 1.0
  },
  {
    level: 'silver',
    name: '银卡会员',
    minTradeAmount: 5000,
    color: '#94a3b8',
    bgColor: '#f1f5f9',
    discountRate: 0.98,
    freeReturnCount: 2,
    couponCount: 5,
    customerService: 'priority',
    pointsMultiplier: 1.2
  },
  {
    level: 'gold',
    name: '金卡会员',
    minTradeAmount: 30000,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    discountRate: 0.95,
    freeReturnCount: 5,
    couponCount: 10,
    customerService: 'exclusive',
    pointsMultiplier: 1.5
  },
  {
    level: 'diamond',
    name: '钻石会员',
    minTradeAmount: 100000,
    color: '#a855f7',
    bgColor: '#faf5ff',
    discountRate: 0.90,
    freeReturnCount: 99,
    couponCount: 20,
    customerService: 'dedicated',
    pointsMultiplier: 2.0
  }
];

export const memberBenefits: MemberBenefit[] = [
  {
    id: 'discount',
    name: '专属折扣',
    description: '购物享受会员专属折扣',
    icon: '🏷️',
    levels: ['silver', 'gold', 'diamond'],
    value: '最高9折'
  },
  {
    id: 'free_return',
    name: '免费退货',
    description: '每月免费退货次数',
    icon: '↩️',
    levels: ['silver', 'gold', 'diamond'],
    value: '2-99次/月'
  },
  {
    id: 'coupon',
    name: '专属优惠券',
    description: '每月赠送专属优惠券',
    icon: '🎫',
    levels: ['normal', 'silver', 'gold', 'diamond'],
    value: '2-20张/月'
  },
  {
    id: 'points',
    name: '积分加速',
    description: '消费积分倍数增长',
    icon: '⭐',
    levels: ['silver', 'gold', 'diamond'],
    value: '1.2x-2x'
  },
  {
    id: 'customer_service',
    name: '专属客服',
    description: '优先接入专属客服通道',
    icon: '👩‍💼',
    levels: ['silver', 'gold', 'diamond'],
    value: 'VIP通道'
  },
  {
    id: 'birthday_gift',
    name: '生日礼包',
    description: '生日当月专属礼包',
    icon: '🎁',
    levels: ['gold', 'diamond'],
    value: '神秘礼品'
  },
  {
    id: 'early_access',
    name: '新品抢先',
    description: '新品优先购买权',
    icon: '✨',
    levels: ['gold', 'diamond'],
    value: '提前72小时'
  },
  {
    id: 'free_shipping',
    name: '包邮特权',
    description: '每月享受包邮券',
    icon: '🚚',
    levels: ['diamond'],
    value: '不限次数'
  }
];

export const mockCoupons: Coupon[] = [
  {
    id: 'c001',
    name: '新人专享券',
    type: 'discount',
    value: 50,
    minAmount: 299,
    discountRate: null,
    category: 'all',
    startTime: '2025-01-01T00:00:00Z',
    endTime: '2025-12-31T23:59:59Z',
    status: 'unused',
    description: '全场通用满299减50'
  },
  {
    id: 'c002',
    name: '数码专享券',
    type: 'discount',
    value: 100,
    minAmount: 999,
    discountRate: null,
    category: '数码电子',
    startTime: '2025-01-01T00:00:00Z',
    endTime: '2025-12-31T23:59:59Z',
    status: 'unused',
    description: '数码电子满999减100'
  },
  {
    id: 'c003',
    name: '95折优惠券',
    type: 'percentage',
    value: null,
    minAmount: 0,
    discountRate: 0.95,
    category: 'all',
    startTime: '2025-01-01T00:00:00Z',
    endTime: '2025-06-30T23:59:59Z',
    status: 'unused',
    description: '全场通用95折'
  },
  {
    id: 'c004',
    name: '会员生日券',
    type: 'discount',
    value: 200,
    minAmount: 500,
    discountRate: null,
    category: 'all',
    startTime: '2025-06-01T00:00:00Z',
    endTime: '2025-06-30T23:59:59Z',
    status: 'unused',
    description: '生日专属满500减200'
  },
  {
    id: 'c005',
    name: '免邮券',
    type: 'shipping',
    value: 0,
    minAmount: 0,
    discountRate: null,
    category: 'all',
    startTime: '2025-01-01T00:00:00Z',
    endTime: '2025-12-31T23:59:59Z',
    status: 'used',
    description: '运费全免'
  }
];

export const getMemberLevelConfig = (level: MemberLevel): MemberLevelConfig => {
  const config = memberLevelConfigs.find(c => c.level === level);
  if (!config) return memberLevelConfigs[0];
  console.log('[MemberService] Get member level config:', level, config);
  return config;
};

export const calculateMemberLevel = (totalTradeAmount: number): {
  level: MemberLevel;
  config: MemberLevelConfig;
  progress: number;
  nextLevelAmount: number;
  amountToNextLevel: number;
} => {
  console.log('[MemberService] Calculating member level, total trade amount:', totalTradeAmount);

  let currentConfig = memberLevelConfigs[0];
  let nextConfig: MemberLevelConfig | null = null;

  for (let i = 0; i < memberLevelConfigs.length; i++) {
    const config = memberLevelConfigs[i];
    if (totalTradeAmount >= config.minTradeAmount) {
      currentConfig = config;
      nextConfig = memberLevelConfigs[i + 1] || null;
    } else {
      break;
    }
  }

  const nextLevelAmount = nextConfig ? nextConfig.minTradeAmount : 0;
  const prevLevelAmount = currentConfig.minTradeAmount;
  let progress = 100;
  let amountToNextLevel = 0;

  if (nextConfig) {
    const levelRange = nextLevelAmount - prevLevelAmount;
    const currentProgress = totalTradeAmount - prevLevelAmount;
    progress = Math.min((currentProgress / levelRange) * 100, 100);
    amountToNextLevel = nextLevelAmount - totalTradeAmount;
  }

  const result = {
    level: currentConfig.level,
    config: currentConfig,
    progress: Math.round(progress * 10) / 10,
    nextLevelAmount,
    amountToNextLevel: Math.round(amountToNextLevel * 100) / 100
  };

  console.log('[MemberService] Member level calculated:', result);
  return result;
};

export const getAvailableBenefits = (level: MemberLevel): MemberBenefit[] => {
  const benefits = memberBenefits.filter(b => b.levels.includes(level));
  console.log('[MemberService] Available benefits for level', level, ':', benefits.length);
  return benefits;
};

export const generateMemberCoupons = (level: MemberLevel): Coupon[] => {
  const config = getMemberLevelConfig(level);
  const count = config.couponCount;
  
  console.log('[MemberService] Generating', count, 'coupons for level:', level);
  
  return mockCoupons.slice(0, count).map((coupon, index) => ({
    ...coupon,
    id: `auto_${level}_${Date.now()}_${index}`,
    status: 'unused' as const
  }));
};

export const calculateDiscount = (amount: number, level: MemberLevel): number => {
  const config = getMemberLevelConfig(level);
  const discount = Math.round(amount * (1 - config.discountRate) * 100) / 100;
  console.log('[MemberService] Calculate discount:', { amount, level, rate: config.discountRate, discount });
  return discount;
};

export const calculatePoints = (amount: number, level: MemberLevel): number => {
  const config = getMemberLevelConfig(level);
  const points = Math.round(amount * config.pointsMultiplier);
  console.log('[MemberService] Calculate points:', { amount, level, multiplier: config.pointsMultiplier, points });
  return points;
};

export const getCustomerServiceLevel = (level: MemberLevel): string => {
  const config = getMemberLevelConfig(level);
  const serviceNames: Record<string, string> = {
    'standard': '标准客服',
    'priority': '优先客服',
    'exclusive': '专属客服',
    'dedicated': '一对一专属客服'
  };
  const service = serviceNames[config.customerService] || '标准客服';
  console.log('[MemberService] Customer service level:', level, '→', service);
  return service;
};

export const checkFreeReturnEligibility = (level: MemberLevel, usedThisMonth: number): {
  eligible: boolean;
  remaining: number;
  total: number;
} => {
  const config = getMemberLevelConfig(level);
  const total = config.freeReturnCount;
  const remaining = Math.max(0, total - usedThisMonth);
  const eligible = remaining > 0;
  
  console.log('[MemberService] Free return eligibility:', { 
    level, usedThisMonth, total, remaining, eligible 
  });
  
  return { eligible, remaining, total };
};
