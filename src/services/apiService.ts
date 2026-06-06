import type { User, Order, ReturnRequest, DashboardStats, MonthlyReport } from '@/types';
import type { Product } from '@/types/product';

// ============================================
// API 配置 - 可通过环境变量或全局配置修改
// ============================================

export const API_CONFIG = {
  BASE_URL: (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
            (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) || 
            '',
  
  TIMEOUT: 15000,
  
  get isMockMode(): boolean {
    return !this.BASE_URL || this.BASE_URL.trim() === '';
  }
};

// 设置API地址的方法（支持运行时动态修改）
export const setApiBaseUrl = (url: string): void => {
  API_CONFIG.BASE_URL = url;
  console.log('[ApiConfig] API Base URL updated to:', url);
};

const STORAGE_KEYS = {
  USERS: 'gb2c_users',
  ORDERS: 'gb2c_orders',
  PAYMENTS: 'gb2c_payments',
  RETURNS: 'gb2c_returns',
  REALNAME_AUTH: 'gb2c_realname_auth',
  AUTH_TOKEN: 'gb2c_auth_token'
} as const;

// ============================================
// Fetch 请求封装
// ============================================

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  code?: number;
}

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
};

const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('[ApiService] Failed to save auth token:', error);
  }
};

const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('[ApiService] Failed to clear auth token:', error);
  }
};

const apiFetch = async <T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> => {
  if (API_CONFIG.isMockMode) {
    console.warn('[ApiService] Running in MOCK mode - set API_BASE_URL to use real API');
    throw new Error('API is in mock mode');
  }

  const url = API_CONFIG.BASE_URL + endpoint;
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[ApiService] ${options.method || 'GET'} ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[ApiService] HTTP Error ${response.status}:`, errorText);
      return {
        success: false,
        message: `请求失败 (${response.status})`,
        code: response.status
      };
    }

    const data = await response.json();
    console.log(`[ApiService] Response:`, data);

    return data as ApiResponse<T>;
  } catch (error: any) {
    console.error('[ApiService] Request failed:', error);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: '请求超时，请重试'
      };
    }
    
    return {
      success: false,
      message: error.message || '网络请求失败'
    };
  }
};

// ============================================
// Mock 模式辅助函数（兼容旧代码）
// ============================================

const simulateNetworkDelay = async (): Promise<void> => {
  const delay = Math.floor(Math.random() * 500) + 300;
  console.log(`[ApiService] Simulating network delay: ${delay}ms`);
  return new Promise(resolve => setTimeout(resolve, delay));
};

const generateId = (prefix: string): string => {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const loadData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`[ApiService] Failed to load data from ${key}:`, error);
    return [];
  }
};

const saveData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[ApiService] Data saved to ${key} successfully, count:`, data.length);
  } catch (error) {
    console.error(`[ApiService] Failed to save data to ${key}:`, error);
    throw new Error('保存数据失败');
  }
};

export const initMockData = (): void => {
  console.log('[ApiService] Initializing mock data...');

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const mockUsers: User[] = [
      {
        id: 'u001',
        phone: '13888888888',
        email: 'zhangsan@example.com',
        avatar: 'https://picsum.photos/id/64/100/100',
        nickname: '张三',
        realname: '张三',
        realnameStatus: 'approved',
        idCardNo: '330102199001011234',
        idCardFront: 'https://picsum.photos/id/1/200/200',
        idCardBack: 'https://picsum.photos/id/2/200/200',
        language: 'zh',
        currency: 'CNY',
        country: 'CN',
        memberLevel: 'gold',
        memberLevelText: '黄金会员',
        totalTradeAmount: 125800,
        nextLevelAmount: 50000,
        levelProgress: 71.5,
        couponCount: 8,
        freeReturnCount: 3,
        hasShop: true,
        shopId: 'shop001',
        shopName: '全球优品专营店',
        isAdmin: true,
        createdAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'u002',
        phone: '13999999999',
        email: 'lisi@example.com',
        avatar: 'https://picsum.photos/id/65/100/100',
        nickname: '李四',
        realname: '',
        realnameStatus: 'not_submitted',
        idCardNo: '',
        idCardFront: '',
        idCardBack: '',
        language: 'zh',
        currency: 'CNY',
        country: 'CN',
        memberLevel: 'silver',
        memberLevelText: '白银会员',
        totalTradeAmount: 25600,
        nextLevelAmount: 24400,
        levelProgress: 51.2,
        couponCount: 5,
        freeReturnCount: 1,
        hasShop: false,
        shopId: '',
        shopName: '',
        isAdmin: false,
        createdAt: '2024-03-20T00:00:00Z'
      }
    ];
    saveData(STORAGE_KEYS.USERS, mockUsers);
    console.log('[ApiService] Mock users initialized');
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const mockOrders: Order[] = [
      {
        id: 'o001',
        orderNo: 'GS202406060001',
        status: 'pending_payment',
        statusText: '待付款',
        items: [
          {
            productId: 'p001',
            productName: '高端智能无线蓝牙耳机 Pro',
            productImage: 'https://picsum.photos/id/3/200/200',
            skuId: 'sku001',
            skuSpec: '黑色 / 256GB',
            price: 599,
            quantity: 2,
            sellerId: 's001',
            shopName: '全球优品专营店'
          }
        ],
        subtotal: 1198,
        shippingFee: 0,
        tax: 71.88,
        total: 1269.88,
        currency: 'CNY',
        buyerId: 'u001',
        buyerName: '张三',
        shippingAddress: {
          name: '张三',
          phone: '138****8888',
          country: 'CN',
          province: '浙江省',
          city: '杭州市',
          address: '西湖区文三路123号',
          postalCode: '310000'
        },
        warehouseId: 'wh001',
        paymentMethod: '',
        paymentStatus: 'unpaid',
        trackingNumber: '',
        trackingCompany: '',
        commission: 59.9,
        sellerAmount: 1138.1,
        createdAt: '2024-06-06T10:30:00Z',
        paidAt: '',
        shippedAt: '',
        completedAt: ''
      },
      {
        id: 'o002',
        orderNo: 'GS202406050002',
        status: 'pending_shipment',
        statusText: '待发货',
        items: [
          {
            productId: 'p002',
            productName: '轻奢时尚女士手提包',
            productImage: 'https://picsum.photos/id/220/200/200',
            skuId: 'sku003',
            skuSpec: '棕色 / 大号',
            price: 899,
            quantity: 1,
            sellerId: 's002',
            shopName: '精品箱包旗舰店'
          }
        ],
        subtotal: 899,
        shippingFee: 20,
        tax: 55.14,
        total: 974.14,
        currency: 'CNY',
        buyerId: 'u001',
        buyerName: '张三',
        shippingAddress: {
          name: '张三',
          phone: '138****8888',
          country: 'CN',
          province: '浙江省',
          city: '杭州市',
          address: '西湖区文三路123号',
          postalCode: '310000'
        },
        warehouseId: 'wh002',
        paymentMethod: 'alipay',
        paymentStatus: 'paid',
        trackingNumber: '',
        trackingCompany: '',
        commission: 44.95,
        sellerAmount: 854.05,
        createdAt: '2024-06-05T14:20:00Z',
        paidAt: '2024-06-05T14:25:00Z',
        shippedAt: '',
        completedAt: ''
      },
      {
        id: 'o003',
        orderNo: 'GS202406030003',
        status: 'shipped',
        statusText: '待收货',
        items: [
          {
            productId: 'p003',
            productName: '智能手表运动版',
            productImage: 'https://picsum.photos/id/1/200/200',
            skuId: 'sku005',
            skuSpec: '黑色硅胶带',
            price: 1299,
            quantity: 1,
            sellerId: 's001',
            shopName: '全球优品专营店'
          }
        ],
        subtotal: 1299,
        shippingFee: 0,
        tax: 77.94,
        total: 1376.94,
        currency: 'CNY',
        buyerId: 'u001',
        buyerName: '张三',
        shippingAddress: {
          name: '张三',
          phone: '138****8888',
          country: 'CN',
          province: '浙江省',
          city: '杭州市',
          address: '西湖区文三路123号',
          postalCode: '310000'
        },
        warehouseId: 'wh001',
        paymentMethod: 'wechat',
        paymentStatus: 'paid',
        trackingNumber: 'SF1234567890',
        trackingCompany: '顺丰速运',
        commission: 64.95,
        sellerAmount: 1234.05,
        createdAt: '2024-06-03T09:15:00Z',
        paidAt: '2024-06-03T09:20:00Z',
        shippedAt: '2024-06-04T10:00:00Z',
        completedAt: ''
      },
      {
        id: 'o004',
        orderNo: 'GS202405280004',
        status: 'completed',
        statusText: '已完成',
        items: [
          {
            productId: 'p005',
            productName: '婴幼儿纯棉连体衣套装',
            productImage: 'https://picsum.photos/id/237/200/200',
            skuId: 'sku009',
            skuSpec: '粉色 6-12个月',
            price: 199,
            quantity: 3,
            sellerId: 's004',
            shopName: '爱婴坊母婴店'
          }
        ],
        subtotal: 597,
        shippingFee: 0,
        tax: 35.82,
        total: 632.82,
        currency: 'CNY',
        buyerId: 'u001',
        buyerName: '张三',
        shippingAddress: {
          name: '张三',
          phone: '138****8888',
          country: 'CN',
          province: '浙江省',
          city: '杭州市',
          address: '西湖区文三路123号',
          postalCode: '310000'
        },
        warehouseId: 'wh003',
        paymentMethod: 'alipay',
        paymentStatus: 'paid',
        trackingNumber: 'YT9876543210',
        trackingCompany: '圆通速递',
        commission: 29.85,
        sellerAmount: 567.15,
        createdAt: '2024-05-28T16:45:00Z',
        paidAt: '2024-05-28T16:50:00Z',
        shippedAt: '2024-05-29T08:30:00Z',
        completedAt: '2024-06-01T11:20:00Z'
      },
      {
        id: 'o005',
        orderNo: 'GS202405200005',
        status: 'completed',
        statusText: '已完成',
        items: [
          {
            productId: 'p009',
            productName: '高端护肤套装礼盒',
            productImage: 'https://picsum.photos/id/312/200/200',
            skuId: 'sku019',
            skuSpec: '补水保湿款',
            price: 1288,
            quantity: 1,
            sellerId: 's007',
            shopName: '美颜馆美妆旗舰店'
          }
        ],
        subtotal: 1288,
        shippingFee: 0,
        tax: 77.28,
        total: 1365.28,
        currency: 'CNY',
        buyerId: 'u001',
        buyerName: '张三',
        shippingAddress: {
          name: '张三',
          phone: '138****8888',
          country: 'CN',
          province: '浙江省',
          city: '杭州市',
          address: '西湖区文三路123号',
          postalCode: '310000'
        },
        warehouseId: 'wh004',
        paymentMethod: 'alipay',
        paymentStatus: 'paid',
        trackingNumber: 'ZT5678901234',
        trackingCompany: '中通快递',
        commission: 64.4,
        sellerAmount: 1223.6,
        createdAt: '2024-05-20T11:30:00Z',
        paidAt: '2024-05-20T11:35:00Z',
        shippedAt: '2024-05-21T09:00:00Z',
        completedAt: '2024-05-25T15:40:00Z'
      }
    ];
    saveData(STORAGE_KEYS.ORDERS, mockOrders);
    console.log('[ApiService] Mock orders initialized');
  }

  if (!localStorage.getItem(STORAGE_KEYS.RETURNS)) {
    const mockReturns: ReturnRequest[] = [
      {
        id: 'ret_001',
        orderId: 'o004',
        orderNo: 'GS202405280004',
        productId: 'p005',
        productName: '婴幼儿纯棉连体衣套装',
        productImage: 'https://picsum.photos/id/237/200/200',
        reason: '尺码不合适',
        description: '买大了一码，想换小一点的',
        images: ['https://picsum.photos/id/237/200/200'],
        status: 'pending_seller',
        sellerDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        trackingNumber: '',
        refundAmount: 597,
        createdAt: '2024-06-02T10:00:00Z'
      }
    ];
    saveData(STORAGE_KEYS.RETURNS, mockReturns);
    console.log('[ApiService] Mock returns initialized');
  }

  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    saveData(STORAGE_KEYS.PAYMENTS, []);
    console.log('[ApiService] Mock payments initialized');
  }

  if (!localStorage.getItem(STORAGE_KEYS.REALNAME_AUTH)) {
    saveData(STORAGE_KEYS.REALNAME_AUTH, []);
    console.log('[ApiService] Mock realname auth initialized');
  }

  console.log('[ApiService] Mock data initialization completed');
};

export const userService = {
  async login(phone: string, password: string): Promise<{ success: boolean; user?: User; message: string; token?: string }> {
    console.log('[ApiService][User] Login attempt:', { phone });

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
          method: 'POST',
          body: { phone, password }
        });

        if (response.success && response.data) {
          if (response.data.token) {
            setAuthToken(response.data.token);
          }
          return {
            success: true,
            user: response.data.user,
            token: response.data.token,
            message: response.message || '登录成功'
          };
        }
        return { success: false, message: response.message || '登录失败' };
      }

      console.log('[ApiService][User] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const users = loadData<User>(STORAGE_KEYS.USERS);
      const user = users.find(u => u.phone === phone);

      if (!user) {
        console.warn('[ApiService][User] Login failed - user not found:', phone);
        return { success: false, message: '用户不存在' };
      }

      const mockToken = 'mock_token_' + Date.now();
      setAuthToken(mockToken);

      console.log('[ApiService][User] Login successful:', user.id);
      return { success: true, user, token: mockToken, message: '登录成功' };
    } catch (error) {
      console.error('[ApiService][User] Login error:', error);
      return { success: false, message: '登录失败，请稍后重试' };
    }
  },

  async register(phone: string, password: string, nickname: string): Promise<{ success: boolean; user?: User; message: string; token?: string }> {
    console.log('[ApiService][User] Register attempt:', { phone, nickname });

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<{ user: User; token: string }>('/api/auth/register', {
          method: 'POST',
          body: { phone, password, nickname }
        });

        if (response.success && response.data) {
          if (response.data.token) {
            setAuthToken(response.data.token);
          }
          return {
            success: true,
            user: response.data.user,
            token: response.data.token,
            message: response.message || '注册成功'
          };
        }
        return { success: false, message: response.message || '注册失败' };
      }

      console.log('[ApiService][User] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const users = loadData<User>(STORAGE_KEYS.USERS);
      const existingUser = users.find(u => u.phone === phone);

      if (existingUser) {
        console.warn('[ApiService][User] Register failed - phone already registered:', phone);
        return { success: false, message: '该手机号已注册' };
      }

      const newUser: User = {
        id: generateId('u'),
        phone,
        email: '',
        avatar: 'https://picsum.photos/id/64/100/100',
        nickname,
        realname: '',
        realnameStatus: 'not_submitted',
        idCardNo: '',
        idCardFront: '',
        idCardBack: '',
        language: 'zh',
        currency: 'CNY',
        country: 'CN',
        memberLevel: 'normal',
        memberLevelText: '普通会员',
        totalTradeAmount: 0,
        nextLevelAmount: 10000,
        levelProgress: 0,
        couponCount: 3,
        freeReturnCount: 1,
        hasShop: false,
        shopId: '',
        shopName: '',
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveData(STORAGE_KEYS.USERS, users);

      const mockToken = 'mock_token_' + Date.now();
      setAuthToken(mockToken);

      console.log('[ApiService][User] Register successful:', newUser.id);
      return { success: true, user: newUser, token: mockToken, message: '注册成功' };
    } catch (error) {
      console.error('[ApiService][User] Register error:', error);
      return { success: false, message: '注册失败，请稍后重试' };
    }
  },

  async submitRealnameAuth(
    userId: string,
    name: string,
    idCard: string,
    idCardFront: string,
    idCardBack: string
  ): Promise<{ success: boolean; message: string }> {
    console.log('[ApiService][User] Submit realname auth:', { userId, name });

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch('/api/user/realname-auth', {
          method: 'POST',
          body: { userId, name, idCard, idCardFront, idCardBack }
        });
        return { success: response.success, message: response.message || '提交成功' };
      }

      console.log('[ApiService][User] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const users = loadData<User>(STORAGE_KEYS.USERS);
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        console.error('[ApiService][User] Realname auth failed - user not found:', userId);
        return { success: false, message: '用户不存在' };
      }

      users[userIndex].realname = name;
      users[userIndex].idCardNo = idCard;
      users[userIndex].idCardFront = idCardFront;
      users[userIndex].idCardBack = idCardBack;
      users[userIndex].realnameStatus = 'pending';

      saveData(STORAGE_KEYS.USERS, users);

      const authRecords = loadData(STORAGE_KEYS.REALNAME_AUTH);
      authRecords.push({
        id: generateId('auth'),
        userId,
        name,
        idCard,
        idCardFront,
        idCardBack,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      saveData(STORAGE_KEYS.REALNAME_AUTH, authRecords);

      console.log('[ApiService][User] Realname auth submitted successfully:', userId);
      return { success: true, message: '实名认证提交成功，等待审核' };
    } catch (error) {
      console.error('[ApiService][User] Realname auth error:', error);
      return { success: false, message: '提交失败，请稍后重试' };
    }
  },

  async getUserProfile(userId: string): Promise<{ success: boolean; user?: User; message: string }> {
    console.log('[ApiService][User] Get user profile:', userId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<User>(`/api/user/profile/${userId}`);
        if (response.success && response.data) {
          return { success: true, user: response.data, message: '获取成功' };
        }
        return { success: false, message: response.message || '获取失败' };
      }

      console.log('[ApiService][User] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const users = loadData<User>(STORAGE_KEYS.USERS);
      const user = users.find(u => u.id === userId);

      if (!user) {
        console.error('[ApiService][User] Get profile failed - user not found:', userId);
        return { success: false, message: '用户不存在' };
      }

      console.log('[ApiService][User] User profile retrieved:', user.id);
      return { success: true, user, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][User] Get profile error:', error);
      return { success: false, message: '获取失败，请稍后重试' };
    }
  },

  async updateMemberLevel(userId: string, tradeAmount: number): Promise<{ success: boolean; user?: User; message: string }> {
    console.log('[ApiService][User] Update member level:', { userId, tradeAmount });

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<User>('/api/user/update-member-level', {
          method: 'POST',
          body: { userId, tradeAmount }
        });
        if (response.success && response.data) {
          return { success: true, user: response.data, message: '会员等级更新成功' };
        }
        return { success: false, message: response.message || '更新失败' };
      }

      console.log('[ApiService][User] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const users = loadData<User>(STORAGE_KEYS.USERS);
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }

      const { calculateMemberLevel } = await import('@/services/memberService');
      const newTotal = users[userIndex].totalTradeAmount + tradeAmount;
      const levelInfo = calculateMemberLevel(newTotal);

      users[userIndex].totalTradeAmount = newTotal;
      users[userIndex].memberLevel = levelInfo.level;
      users[userIndex].memberLevelText = levelInfo.config.name;
      users[userIndex].nextLevelAmount = levelInfo.nextLevelAmount;
      users[userIndex].levelProgress = levelInfo.progress;
      users[userIndex].couponCount = levelInfo.config.couponCount;
      users[userIndex].freeReturnCount = levelInfo.config.freeReturnCount;

      saveData(STORAGE_KEYS.USERS, users);

      return { success: true, user: users[userIndex], message: '会员等级更新成功' };
    } catch (error) {
      console.error('[ApiService][User] Update member level error:', error);
      return { success: false, message: '更新失败，请稍后重试' };
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    console.log('[ApiService][User] Logout');

    try {
      if (!API_CONFIG.isMockMode) {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      }

      clearAuthToken();
      return { success: true, message: '登出成功' };
    } catch (error) {
      console.error('[ApiService][User] Logout error:', error);
      clearAuthToken();
      return { success: true, message: '登出成功' };
    }
  }
};

export const orderService = {
  async createOrder(orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; message: string }> {
    console.log('[ApiService][Order] Creating order:', orderData);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<Order>('/api/orders', {
          method: 'POST',
          body: orderData
        });

        if (response.success && response.data) {
          return {
            success: true,
            order: response.data,
            message: response.message || '订单创建成功'
          };
        }
        return { success: false, message: response.message || '订单创建失败' };
      }

      await simulateNetworkDelay();
      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      const orderNo = 'GS' + Date.now();

      const newOrder: Order = {
        id: generateId('o'),
        orderNo,
        status: 'pending_payment',
        statusText: '待付款',
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        shippingFee: orderData.shippingFee || 0,
        tax: orderData.tax || 0,
        total: orderData.total || 0,
        currency: orderData.currency || 'CNY',
        buyerId: orderData.buyerId || '',
        buyerName: orderData.buyerName || '',
        shippingAddress: orderData.shippingAddress || {
          name: '',
          phone: '',
          country: 'CN',
          province: '',
          city: '',
          address: '',
          postalCode: ''
        },
        warehouseId: orderData.warehouseId || '',
        paymentMethod: '',
        paymentStatus: 'unpaid',
        trackingNumber: '',
        trackingCompany: '',
        commission: orderData.commission || 0,
        sellerAmount: orderData.sellerAmount || 0,
        createdAt: new Date().toISOString(),
        paidAt: '',
        shippedAt: '',
        completedAt: ''
      };

      orders.push(newOrder);
      saveData(STORAGE_KEYS.ORDERS, orders);

      console.log('[ApiService][Order] Order created successfully:', newOrder.id);
      return { success: true, order: newOrder, message: '订单创建成功' };
    } catch (error) {
      console.error('[ApiService][Order] Create order error:', error);
      return { success: false, message: '订单创建失败，请稍后重试' };
    }
  },

  async getOrders(userId: string, status?: string): Promise<{ success: boolean; orders: Order[]; message: string }> {
    console.log('[ApiService][Order] Getting orders:', { userId, status });

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<Order[]>(`/api/orders?userId=${userId}&status=${status || ''}`);

        if (response.success && response.data) {
          return {
            success: true,
            orders: response.data,
            message: response.message || '获取成功'
          };
        }
        return { success: false, orders: [], message: response.message || '获取失败' };
      }

      await simulateNetworkDelay();
      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      let userOrders = orders.filter(o => o.buyerId === userId);

      if (status && status !== 'all') {
        userOrders = userOrders.filter(o => o.status === status);
      }

      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('[ApiService][Order] Orders retrieved:', userOrders.length);
      return { success: true, orders: userOrders, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Order] Get orders error:', error);
      return { success: false, orders: [], message: '获取失败，请稍后重试' };
    }
  },

  async getOrderDetail(orderId: string): Promise<{ success: boolean; order?: Order; message: string }> {
    console.log('[ApiService][Order] Getting order detail:', orderId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<Order>(`/api/orders/${orderId}`);

        if (response.success && response.data) {
          return {
            success: true,
            order: response.data,
            message: response.message || '获取成功'
          };
        }
        return { success: false, message: response.message || '获取失败' };
      }

      await simulateNetworkDelay();
      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        console.error('[ApiService][Order] Order not found:', orderId);
        return { success: false, message: '订单不存在' };
      }

      console.log('[ApiService][Order] Order detail retrieved:', order.id);
      return { success: true, order, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Order] Get order detail error:', error);
      return { success: false, message: '获取失败，请稍后重试' };
    }
  },

  async cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    console.log('[ApiService][Order] Cancelling order:', orderId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST'
        });

        return {
          success: response.success,
          message: response.message || (response.success ? '订单取消成功' : '订单取消失败')
        };
      }

      await simulateNetworkDelay();
      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        console.error('[ApiService][Order] Order not found for cancel:', orderId);
        return { success: false, message: '订单不存在' };
      }

      if (orders[orderIndex].status !== 'pending_payment') {
        console.error('[ApiService][Order] Cannot cancel order with status:', orders[orderIndex].status);
        return { success: false, message: '当前订单状态不支持取消' };
      }

      orders[orderIndex].status = 'cancelled';
      orders[orderIndex].statusText = '已取消';
      saveData(STORAGE_KEYS.ORDERS, orders);

      console.log('[ApiService][Order] Order cancelled successfully:', orderId);
      return { success: true, message: '订单取消成功' };
    } catch (error) {
      console.error('[ApiService][Order] Cancel order error:', error);
      return { success: false, message: '取消失败，请稍后重试' };
    }
  },

  async confirmOrderReceipt(orderId: string): Promise<{ success: boolean; message: string }> {
    console.log('[ApiService][Order] Confirming order receipt:', orderId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch(`/api/orders/${orderId}/confirm`, {
          method: 'POST'
        });

        return {
          success: response.success,
          message: response.message || (response.success ? '确认收货成功' : '确认收货失败')
        };
      }

      await simulateNetworkDelay();
      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        console.error('[ApiService][Order] Order not found for confirm:', orderId);
        return { success: false, message: '订单不存在' };
      }

      if (orders[orderIndex].status !== 'shipped') {
        console.error('[ApiService][Order] Cannot confirm order with status:', orders[orderIndex].status);
        return { success: false, message: '当前订单状态不支持确认收货' };
      }

      orders[orderIndex].status = 'completed';
      orders[orderIndex].statusText = '已完成';
      orders[orderIndex].completedAt = new Date().toISOString();
      saveData(STORAGE_KEYS.ORDERS, orders);

      console.log('[ApiService][Order] Order receipt confirmed successfully:', orderId);
      return { success: true, message: '确认收货成功' };
    } catch (error) {
      console.error('[ApiService][Order] Confirm order receipt error:', error);
      return { success: false, message: '确认收货失败，请稍后重试' };
    }
  }
};

export const productService = {
  async getProducts(
    category?: string,
    keyword?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ success: boolean; products: Product[]; total: number; message: string }> {
    console.log('[ApiService][Product] Getting products:', { category, keyword, page, pageSize });
    await simulateNetworkDelay();

    try {
      const { mockProducts } = await import('@/data/products');
      let products = [...mockProducts];

      if (category) {
        products = products.filter(p => p.categoryId === category || p.categoryName === category);
      }

      if (keyword) {
        const keywordLower = keyword.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(keywordLower) ||
          p.description.toLowerCase().includes(keywordLower) ||
          p.tags.some(t => t.toLowerCase().includes(keywordLower))
        );
      }

      const total = products.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

      console.log('[ApiService][Product] Products retrieved:', { total, returned: paginatedProducts.length });
      return { success: true, products: paginatedProducts, total, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Product] Get products error:', error);
      return { success: false, products: [], total: 0, message: '获取失败，请稍后重试' };
    }
  },

  async getProductDetail(productId: string): Promise<{ success: boolean; product?: Product; message: string }> {
    console.log('[ApiService][Product] Getting product detail:', productId);
    await simulateNetworkDelay();

    try {
      const { getProductById } = await import('@/data/products');
      const product = getProductById(productId);

      if (!product) {
        console.error('[ApiService][Product] Product not found:', productId);
        return { success: false, message: '商品不存在' };
      }

      console.log('[ApiService][Product] Product detail retrieved:', product.id);
      return { success: true, product, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Product] Get product detail error:', error);
      return { success: false, message: '获取失败，请稍后重试' };
    }
  }
};

export const adminService = {
  async getDashboardStats(
    country?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; stats?: DashboardStats; message: string }> {
    console.log('[ApiService][Admin] Getting dashboard stats:', { country, startDate, endDate });

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<DashboardStats>(`/api/admin/dashboard?country=${country || ''}&startDate=${startDate || ''}&endDate=${endDate || ''}`);
        if (response.success && response.data) {
          return { success: true, stats: response.data, message: response.message || '获取成功' };
        }
        return { success: false, message: response.message || '获取失败' };
      }

      console.log('[ApiService][Admin] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      const users = loadData<User>(STORAGE_KEYS.USERS);
      const returns = loadData<ReturnRequest>(STORAGE_KEYS.RETURNS);

      const completedOrders = orders.filter(o => o.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
      const totalOrders = orders.length;
      const returnRate = orders.length > 0 ? (returns.length / orders.length) * 100 : 0;

      const stats: DashboardStats = {
        totalOrders,
        totalRevenue,
        activeSellers: 12,
        activeBuyers: users.filter(u => !u.isAdmin).length,
        returnRate: Math.round(returnRate * 100) / 100,
        avgComplaintResolutionHours: 4.5,
        categorySales: [
          { category: '数码电子', revenue: 125600, orders: 156 },
          { category: '服饰鞋包', revenue: 89500, orders: 234 },
          { category: '家居生活', revenue: 67800, orders: 89 },
          { category: '母婴用品', revenue: 45600, orders: 312 },
          { category: '食品饮料', revenue: 34200, orders: 178 }
        ],
        sellerActivity: [
          { sellerId: 's001', shopName: '全球优品专营店', ordersToday: 12, revenueToday: 15680, lastActive: new Date().toISOString() },
          { sellerId: 's002', shopName: '精品箱包旗舰店', ordersToday: 8, revenueToday: 9850, lastActive: new Date(Date.now() - 3600000).toISOString() },
          { sellerId: 's003', shopName: '北欧家居官方店', ordersToday: 5, revenueToday: 7200, lastActive: new Date(Date.now() - 7200000).toISOString() }
        ],
        hotCategories: [
          { category: '数码电子', trend: 'up', growthRate: 15.6, predictedDemand: 1250 },
          { category: '美妆个护', trend: 'up', growthRate: 22.3, predictedDemand: 980 },
          { category: '母婴用品', trend: 'stable', growthRate: 5.2, predictedDemand: 850 },
          { category: '运动户外', trend: 'down', growthRate: -3.1, predictedDemand: 420 }
        ],
        recentOrders: orders.slice(0, 5).map(o => ({
          id: o.id,
          orderNo: o.orderNo,
          buyer: o.buyerName,
          country: o.shippingAddress.country,
          amount: o.total,
          status: o.statusText,
          createdAt: o.createdAt
        }))
      };

      console.log('[ApiService][Admin] Dashboard stats retrieved successfully');
      return { success: true, stats, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Admin] Get dashboard stats error:', error);
      return { success: false, message: '获取失败，请稍后重试' };
    }
  },

  async getMonthlyReport(month: string): Promise<{ success: boolean; report?: MonthlyReport; message: string }> {
    console.log('[ApiService][Admin] Getting monthly report:', month);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<MonthlyReport>(`/api/admin/report/monthly?month=${month}`);
        if (response.success && response.data) {
          return { success: true, report: response.data, message: response.message || '获取成功' };
        }
        return { success: false, message: response.message || '获取失败' };
      }

      console.log('[ApiService][Admin] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const report: MonthlyReport = {
        month,
        totalRevenue: 568900,
        totalOrders: 1256,
        avgOrderValue: 452.95,
        countryBreakdown: [
          { countryCode: 'CN', countryName: '中国', revenue: 289600, orders: 689, avgOrderValue: 420.32 },
          { countryCode: 'US', countryName: '美国', revenue: 125800, orders: 256, avgOrderValue: 491.41 },
          { countryCode: 'DE', countryName: '德国', revenue: 68900, orders: 134, avgOrderValue: 514.18 },
          { countryCode: 'JP', countryName: '日本', revenue: 52300, orders: 112, avgOrderValue: 466.96 },
          { countryCode: 'OTHER', countryName: '其他', revenue: 32300, orders: 65, avgOrderValue: 496.92 }
        ],
        sellerPerformance: [
          { sellerId: 's001', shopName: '全球优品专营店', revenue: 156800, orders: 234, returns: 8, returnRate: 3.42, rating: 4.8 },
          { sellerId: 's002', shopName: '精品箱包旗舰店', revenue: 112500, orders: 156, returns: 5, returnRate: 3.21, rating: 4.9 },
          { sellerId: 's003', shopName: '北欧家居官方店', revenue: 89600, orders: 89, returns: 3, returnRate: 3.37, rating: 4.7 }
        ],
        returnAnalysis: [
          { reason: '尺码不合适', count: 23, percentage: 35.4, avgRefundAmount: 328.5 },
          { reason: '商品质量问题', count: 18, percentage: 27.7, avgRefundAmount: 568.2 },
          { reason: '与描述不符', count: 12, percentage: 18.5, avgRefundAmount: 425.8 },
          { reason: '不想要了', count: 12, percentage: 18.5, avgRefundAmount: 289.6 }
        ],
        logisticsPerformance: [
          { provider: '顺丰速运', totalShipments: 568, avgDeliveryDays: 2.3, onTimeRate: 98.5, damageRate: 0.3 },
          { provider: '圆通速递', totalShipments: 345, avgDeliveryDays: 3.5, onTimeRate: 95.2, damageRate: 0.8 },
          { provider: '中通快递', totalShipments: 256, avgDeliveryDays: 3.8, onTimeRate: 94.8, damageRate: 0.6 }
        ],
        categorySales: [
          { category: '数码电子', revenue: 189600, orders: 256, growthRate: 15.6 },
          { category: '服饰鞋包', revenue: 145800, orders: 312, growthRate: 12.3 },
          { category: '家居生活', revenue: 98500, orders: 124, growthRate: 8.7 },
          { category: '母婴用品', revenue: 78600, orders: 289, growthRate: 18.2 },
          { category: '美妆个护', revenue: 56400, orders: 275, growthRate: 22.5 }
        ]
      };

      console.log('[ApiService][Admin] Monthly report retrieved successfully:', month);
      return { success: true, report, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Admin] Get monthly report error:', error);
      return { success: false, message: '获取失败，请稍后重试' };
    }
  },

  async exportReportCSV(reportData: any): Promise<{ success: boolean; csvContent?: string; filename?: string; message: string }> {
    console.log('[ApiService][Admin] Exporting report CSV:', reportData);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<{ csvContent: string; filename: string }>('/api/admin/report/export', {
          method: 'POST',
          body: reportData
        });
        if (response.success && response.data) {
          return {
            success: true,
            csvContent: response.data.csvContent,
            filename: response.data.filename,
            message: response.message || '导出成功'
          };
        }
        return { success: false, message: response.message || '导出失败' };
      }

      console.log('[ApiService][Admin] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const headers = Object.keys(reportData[0] || {}).join(',');
      const rows = reportData.map((row: any) =>
        Object.values(row).map(value => `"${value}"`).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      const filename = `report_${Date.now()}.csv`;

      console.log('[ApiService][Admin] Report CSV exported successfully:', filename);
      return { success: true, csvContent, filename, message: '导出成功' };
    } catch (error) {
      console.error('[ApiService][Admin] Export report CSV error:', error);
      return { success: false, message: '导出失败，请稍后重试' };
    }
  }
};

export const returnService = {
  async createReturnRequest(returnData: Partial<ReturnRequest>): Promise<{ success: boolean; returnRequest?: ReturnRequest; message: string }> {
    console.log('[ApiService][Return] Creating return request:', returnData);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<ReturnRequest>('/api/returns', {
          method: 'POST',
          body: returnData
        });

        if (response.success && response.data) {
          return {
            success: true,
            returnRequest: response.data,
            message: response.message || '退货申请提交成功'
          };
        }
        return { success: false, message: response.message || '提交失败' };
      }

      console.log('[ApiService][Return] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const returns = loadData<ReturnRequest>(STORAGE_KEYS.RETURNS);
      
      const now = new Date();
      const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      
      const newReturn: ReturnRequest = {
        id: generateId('ret'),
        orderId: returnData.orderId || '',
        orderNo: returnData.orderNo || '',
        productId: returnData.productId || '',
        productName: returnData.productName || '',
        productImage: returnData.productImage || '',
        skuId: returnData.skuId || '',
        skuSpec: returnData.skuSpec || '',
        quantity: returnData.quantity || 1,
        reason: returnData.reason || '',
        description: returnData.description || '',
        images: returnData.images || [],
        buyerId: returnData.buyerId || '',
        buyerName: returnData.buyerName || '',
        sellerId: returnData.sellerId || '',
        status: 'pending_seller',
        statusText: '待卖家审核',
        sellerDeadline: deadline.toISOString(),
        refundAmount: returnData.refundAmount || 0,
        returnOrderNo: '',
        trackingNumber: '',
        trackingCompany: '',
        platformReviewNote: '',
        createdAt: now.toISOString(),
        approvedAt: '',
        completedAt: ''
      };

      returns.push(newReturn);
      saveData(STORAGE_KEYS.RETURNS, returns);

      console.log('[ApiService][Return] Return request created successfully:', newReturn.id);
      return { success: true, returnRequest: newReturn, message: '退货申请提交成功' };
    } catch (error) {
      console.error('[ApiService][Return] Create return request error:', error);
      return { success: false, message: '提交失败，请稍后重试' };
    }
  },

  async getReturnRequests(userId: string): Promise<{ success: boolean; returns: ReturnRequest[]; message: string }> {
    console.log('[ApiService][Return] Getting return requests for user:', userId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<ReturnRequest[]>(`/api/returns?userId=${userId}`);

        if (response.success && response.data) {
          return {
            success: true,
            returns: response.data,
            message: response.message || '获取成功'
          };
        }
        return { success: false, returns: [], message: response.message || '获取失败' };
      }

      console.log('[ApiService][Return] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const returns = loadData<ReturnRequest>(STORAGE_KEYS.RETURNS);
      const userReturns = returns.filter(r => r.buyerId === userId);
      userReturns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('[ApiService][Return] Return requests retrieved:', userReturns.length);
      return { success: true, returns: userReturns, message: '获取成功' };
    } catch (error) {
      console.error('[ApiService][Return] Get return requests error:', error);
      return { success: false, returns: [], message: '获取失败，请稍后重试' };
    }
  },

  async escalateToPlatform(returnId: string, note?: string): Promise<{ success: boolean; message: string }> {
    console.log('[ApiService][Return] Escalating to platform:', returnId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch(`/api/returns/${returnId}/escalate`, {
          method: 'POST',
          body: { note }
        });

        return {
          success: response.success,
          message: response.message || '已升级到平台审核'
        };
      }

      console.log('[ApiService][Return] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const returns = loadData<ReturnRequest>(STORAGE_KEYS.RETURNS);
      const returnIndex = returns.findIndex(r => r.id === returnId);

      if (returnIndex === -1) {
        return { success: false, message: '退货申请不存在' };
      }

      returns[returnIndex].status = 'pending_platform';
      returns[returnIndex].statusText = '待平台审核';
      returns[returnIndex].platformReviewNote = note || '';
      saveData(STORAGE_KEYS.RETURNS, returns);

      console.log('[ApiService][Return] Return escalated to platform:', returnId);
      return { success: true, message: '已升级到平台审核' };
    } catch (error) {
      console.error('[ApiService][Return] Escalate to platform error:', error);
      return { success: false, message: '操作失败，请稍后重试' };
    }
  },

  async approveReturn(returnId: string, isPlatform: boolean = false): Promise<{ success: boolean; returnRequest?: ReturnRequest; message: string }> {
    console.log('[ApiService][Return] Approving return:', returnId, 'isPlatform:', isPlatform);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<ReturnRequest>(`/api/returns/${returnId}/approve`, {
          method: 'POST',
          body: { isPlatform }
        });

        if (response.success && response.data) {
          return {
            success: true,
            returnRequest: response.data,
            message: response.message || '退货申请已通过，快递将上门取件'
          };
        }
        return { success: false, message: response.message || '审核失败' };
      }

      console.log('[ApiService][Return] Mock mode: Using localStorage');
      await simulateNetworkDelay();
      const returns = loadData<ReturnRequest>(STORAGE_KEYS.RETURNS);
      const returnIndex = returns.findIndex(r => r.id === returnId);

      if (returnIndex === -1) {
        return { success: false, message: '退货申请不存在' };
      }

      const returnOrderNo = 'RTN' + Date.now();
      const trackingNumber = 'SF' + Math.random().toString().substr(2, 10).toUpperCase();
      
      returns[returnIndex].status = 'approved';
      returns[returnIndex].statusText = '审核通过';
      returns[returnIndex].approvedAt = new Date().toISOString();
      returns[returnIndex].returnOrderNo = returnOrderNo;
      returns[returnIndex].trackingNumber = trackingNumber;
      returns[returnIndex].trackingCompany = '顺丰速运';
      saveData(STORAGE_KEYS.RETURNS, returns);

      console.log('[ApiService][Return] Return approved:', returnId, 'tracking:', trackingNumber);
      return { success: true, returnRequest: returns[returnIndex], message: '退货申请已通过，快递将上门取件' };
    } catch (error) {
      console.error('[ApiService][Return] Approve return error:', error);
      return { success: false, message: '审核失败，请稍后重试' };
    }
  }
};

export const paymentService = {
  async createPaymentOrder(paymentData: any): Promise<{ success: boolean; paymentOrder?: any; message: string }> {
    console.log('[ApiService][Payment] Creating payment order:', paymentData);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<any>('/api/payments', {
          method: 'POST',
          body: paymentData
        });

        if (response.success && response.data) {
          return {
            success: true,
            paymentOrder: response.data,
            message: response.message || '支付订单创建成功'
          };
        }
        return { success: false, message: response.message || '创建失败' };
      }

      console.log('[ApiService][Payment] Mock mode: Using localStorage');
      await simulateNetworkDelay();

      const payments = loadData<any>(STORAGE_KEYS.PAYMENTS);
      
      const newPayment = {
        id: generateId('pay'),
        orderIds: paymentData.orderIds || [],
        buyerId: paymentData.buyerId || '',
        totalAmount: paymentData.totalAmount || 0,
        currency: paymentData.currency || 'CNY',
        paymentMethod: '',
        status: 'pending',
        statusText: '待支付',
        createdAt: new Date().toISOString(),
        paidAt: ''
      };

      payments.push(newPayment);
      saveData(STORAGE_KEYS.PAYMENTS, payments);

      console.log('[ApiService][Payment] Payment order created:', newPayment.id);
      return { success: true, paymentOrder: newPayment, message: '支付订单创建成功' };
    } catch (error) {
      console.error('[ApiService][Payment] Create payment order error:', error);
      return { success: false, message: '创建失败，请稍后重试' };
    }
  },

  async processPayment(paymentId: string, paymentMethod: string): Promise<{ success: boolean; message: string }> {
    console.log('[ApiService][Payment] Processing payment:', paymentId, 'method:', paymentMethod);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch(`/api/payments/${paymentId}/pay`, {
          method: 'POST',
          body: { paymentMethod }
        });

        return { success: response.success, message: response.message || (response.success ? '支付成功' : '支付失败') };
      }

      console.log('[ApiService][Payment] Mock mode: Using localStorage');
      await simulateNetworkDelay();

      const payments = loadData<any>(STORAGE_KEYS.PAYMENTS);
      const paymentIndex = payments.findIndex(p => p.id === paymentId);

      if (paymentIndex === -1) {
        return { success: false, message: '支付订单不存在' };
      }

      const successRate = 0.95;
      const isSuccess = Math.random() < successRate;

      if (!isSuccess) {
        payments[paymentIndex].status = 'failed';
        payments[paymentIndex].statusText = '支付失败';
        saveData(STORAGE_KEYS.PAYMENTS, payments);
        return { success: false, message: '支付失败，请重试' };
      }

      payments[paymentIndex].status = 'paid';
      payments[paymentIndex].statusText = '支付成功';
      payments[paymentIndex].paymentMethod = paymentMethod;
      payments[paymentIndex].paidAt = new Date().toISOString();
      saveData(STORAGE_KEYS.PAYMENTS, payments);

      console.log('[ApiService][Payment] Payment successful:', paymentId);
      return { success: true, message: '支付成功' };
    } catch (error) {
      console.error('[ApiService][Payment] Process payment error:', error);
      return { success: false, message: '支付失败，请稍后重试' };
    }
  },

  async settlePayment(orderId: string, commissionRate: number = 0.05): Promise<{ success: boolean; settlement?: any; message: string }> {
    console.log('[ApiService][Payment] Settling payment for order:', orderId);

    try {
      if (!API_CONFIG.isMockMode) {
        const response = await apiFetch<any>(`/api/payments/settle/${orderId}`, {
          method: 'POST',
          body: { commissionRate }
        });

        if (response.success && response.data) {
          return {
            success: true,
            settlement: response.data,
            message: response.message || '结算完成'
          };
        }
        return { success: false, message: response.message || '结算失败' };
      }

      console.log('[ApiService][Payment] Mock mode: Using localStorage');
      await simulateNetworkDelay();

      const orders = loadData<Order>(STORAGE_KEYS.ORDERS);
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        return { success: false, message: '订单不存在' };
      }

      const commissionAmount = Math.round(order.total * commissionRate * 100) / 100;
      const sellerAmount = Math.round((order.total - commissionAmount) * 100) / 100;

      const settlement = {
        id: generateId('set'),
        orderId,
        orderNo: order.orderNo,
        totalAmount: order.total,
        commissionRate,
        commissionAmount,
        sellerAmount,
        sellerId: order.items[0]?.sellerId || '',
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      console.log('[ApiService][Payment] Settlement completed:', settlement);
      return { success: true, settlement, message: '结算完成' };
    } catch (error) {
      console.error('[ApiService][Payment] Settle payment error:', error);
      return { success: false, message: '结算失败，请稍后重试' };
    }
  }
};

export default {
  initMockData,
  userService,
  orderService,
  productService,
  adminService,
  returnService,
  paymentService
};
