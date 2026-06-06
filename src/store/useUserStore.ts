import { create } from 'zustand';
import type { User, MemberLevel } from '@/types/user';
import { calculateMemberLevel, getMemberLevelConfig, generateMemberCoupons, getAvailableBenefits, calculateDiscount, calculatePoints, checkFreeReturnEligibility } from '@/services/memberService';
import type { Coupon, MemberBenefit } from '@/types/user';
import { userService } from '@/services/apiService';
import { initMockData } from '@/services/apiService';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  coupons: Coupon[];
  benefits: MemberBenefit[];
  freeReturnUsage: number;
  isLoading: boolean;
  error: string | null;
  
  login: (phone: string, password: string) => Promise<boolean>;
  register: (phone: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateMemberLevel: (amount: number) => void;
  submitRealnameAuth: (name: string, idCard: string, idCardFront: string, idCardBack: string) => Promise<boolean>;
  refreshMemberBenefits: () => void;
  useFreeReturn: () => boolean;
  getUserBenefits: () => MemberBenefit[];
}

const mockUser: User = {
  id: 'u001',
  phone: '138****8888',
  email: 'user@example.com',
  avatar: 'https://picsum.photos/id/64/200/200',
  nickname: '全球购达人',
  realname: '张三',
  realnameStatus: 'approved',
  idCardNo: '330***********1234',
  idCardFront: '',
  idCardBack: '',
  language: 'zh',
  currency: 'CNY',
  country: 'CN',
  memberLevel: 'gold',
  memberLevelText: '金卡会员',
  totalTradeAmount: 45800,
  nextLevelAmount: 100000,
  levelProgress: 45.8,
  couponCount: 8,
  freeReturnCount: 3,
  hasShop: true,
  shopId: 's001',
  shopName: '全球优品专营店',
  isAdmin: true,
  createdAt: '2024-01-15T00:00:00Z'
};

export const useUserStore = create<UserState>((set, get) => ({
  user: mockUser,
  isLoggedIn: true,
  coupons: generateMemberCoupons('gold'),
  benefits: getAvailableBenefits('gold'),
  freeReturnUsage: 1,
  isLoading: false,
  error: null,

  login: async (phone, password) => {
    console.log('[UserStore] Login attempt:', phone);
    set({ isLoading: true, error: null });
    
    try {
      initMockData();
      
      const result = await userService.login(phone, password);
      
      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      const coupons = generateMemberCoupons(result.user.memberLevel);
      const benefits = getAvailableBenefits(result.user.memberLevel);
      
      set({
        user: result.user,
        isLoggedIn: true,
        coupons,
        benefits,
        isLoading: false
      });

      console.log('[UserStore] Login successful:', result.user.nickname);
      return true;
    } catch (error: any) {
      console.error('[UserStore] Login failed:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  register: async (phone, password, nickname) => {
    console.log('[UserStore] Register attempt:', phone, nickname);
    set({ isLoading: true, error: null });
    
    try {
      initMockData();
      
      const result = await userService.register(phone, password, nickname);
      
      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      const coupons = generateMemberCoupons(result.user.memberLevel);
      const benefits = getAvailableBenefits(result.user.memberLevel);
      
      set({
        user: result.user,
        isLoggedIn: true,
        coupons,
        benefits,
        isLoading: false
      });

      console.log('[UserStore] Registration successful:', result.user.nickname);
      return true;
    } catch (error: any) {
      console.error('[UserStore] Registration failed:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  setUser: (user) => {
    if (user) {
      const coupons = generateMemberCoupons(user.memberLevel);
      const benefits = getAvailableBenefits(user.memberLevel);
      set({ user, isLoggedIn: true, coupons, benefits });
    } else {
      set({ user: null, isLoggedIn: false, coupons: [], benefits: [] });
    }
  },

  updateMemberLevel: (amount) => {
    const { user } = get();
    if (!user) return;
    
    console.log('[UserStore] Updating member level with amount:', amount);
    
    const newTotal = user.totalTradeAmount + amount;
    const levelInfo = calculateMemberLevel(newTotal);
    const coupons = generateMemberCoupons(levelInfo.level);
    const benefits = getAvailableBenefits(levelInfo.level);
    
    set({
      user: {
        ...user,
        totalTradeAmount: newTotal,
        memberLevel: levelInfo.level,
        memberLevelText: levelInfo.config.name,
        nextLevelAmount: levelInfo.nextLevelAmount,
        levelProgress: levelInfo.progress,
        couponCount: levelInfo.config.couponCount,
        freeReturnCount: levelInfo.config.freeReturnCount
      },
      coupons,
      benefits
    });

    console.log('[UserStore] Member level updated:', levelInfo.config.name);
  },

  submitRealnameAuth: async (name, idCard, idCardFront, idCardBack) => {
    console.log('[UserStore] Submitting realname auth');
    set({ isLoading: true, error: null });
    
    try {
      const { user } = get();
      if (!user) {
        throw new Error('请先登录');
      }

      const result = await userService.submitRealnameAuth(user.id, name, idCard, idCardFront, idCardBack);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      set({
        user: {
          ...user,
          realname: name,
          idCardNo: idCard,
          idCardFront,
          idCardBack,
          realnameStatus: 'pending'
        },
        isLoading: false
      });

      console.log('[UserStore] Realname auth submitted successfully');
      return true;
    } catch (error: any) {
      console.error('[UserStore] Realname auth failed:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  refreshMemberBenefits: () => {
    const { user } = get();
    if (!user) return;
    
    console.log('[UserStore] Refreshing member benefits');
    const coupons = generateMemberCoupons(user.memberLevel);
    const benefits = getAvailableBenefits(user.memberLevel);
    
    set({ coupons, benefits });
  },

  useFreeReturn: () => {
    const { user, freeReturnUsage } = get();
    if (!user) return false;
    
    const eligibility = checkFreeReturnEligibility(user.memberLevel, freeReturnUsage);
    if (!eligibility.eligible) {
      return false;
    }

    set({ freeReturnUsage: freeReturnUsage + 1 });
    console.log('[UserStore] Free return used, remaining:', eligibility.remaining - 1);
    return true;
  },

  getUserBenefits: () => {
    const { benefits } = get();
    return benefits;
  },

  logout: () => {
    console.log('[UserStore] User logged out');
    set({ 
      user: null, 
      isLoggedIn: false, 
      coupons: [], 
      benefits: [],
      freeReturnUsage: 0
    });
  }
}));
