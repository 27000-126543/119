export interface MonthlyReport {
  month: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  countryBreakdown: Array<{
    countryCode: string;
    countryName: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
  }>;
  sellerPerformance: Array<{
    sellerId: string;
    shopName: string;
    revenue: number;
    orders: number;
    returns: number;
    returnRate: number;
    rating: number;
  }>;
  returnAnalysis: Array<{
    reason: string;
    count: number;
    percentage: number;
    avgRefundAmount: number;
  }>;
  logisticsPerformance: Array<{
    provider: string;
    totalShipments: number;
    avgDeliveryDays: number;
    onTimeRate: number;
    damageRate: number;
  }>;
  categorySales: Array<{
    category: string;
    revenue: number;
    orders: number;
    growthRate: number;
  }>;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeSellers: number;
  activeBuyers: number;
  returnRate: number;
  avgComplaintResolutionHours: number;
  categorySales: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
  sellerActivity: Array<{
    sellerId: string;
    shopName: string;
    ordersToday: number;
    revenueToday: number;
    lastActive: string;
  }>;
  hotCategories: Array<{
    category: string;
    trend: 'up' | 'down' | 'stable';
    growthRate: number;
    predictedDemand: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNo: string;
    buyer: string;
    country: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}
