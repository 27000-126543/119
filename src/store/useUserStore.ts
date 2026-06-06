import { create } from 'zustand';
import type { User, MemberLevel } from '@/types/user';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  updateMemberLevel: (amount: number) => void;
  logout: () => void;
}

const getMemberLevel = (amount: number): { level: MemberLevel; text: string; nextLevel: number } => {
  if (amount >= 100000) return { level: 'diamond', text: '钻石会员', nextLevel: 0 };
  if (amount >= 30000) return { level: 'gold', text: '金卡会员', nextLevel: 100000 };
  if (amount >= 5000) return { level: 'silver', text: '银卡会员', nextLevel: 30000 };
  return { level: 'normal', text: '普通会员', nextLevel: 5000 };
};

export const useUserStore = create<UserState>((set, get) => ({
  user: {
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
  },
  isLoggedIn: true,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  updateMemberLevel: (amount) => {
    const { user } = get();
    if (!user) return;
    const newTotal = user.totalTradeAmount + amount;
    const { level, text, nextLevel } = getMemberLevel(newTotal);
    const progress = nextLevel > 0 ? (newTotal / nextLevel) * 100 : 100;
    set({
      user: {
        ...user,
        totalTradeAmount: newTotal,
        memberLevel: level,
        memberLevelText: text,
        nextLevelAmount: nextLevel,
        levelProgress: Math.min(progress, 100)
      }
    });
  },
  logout: () => set({ user: null, isLoggedIn: false })
}));
