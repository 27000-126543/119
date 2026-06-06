import type { MonthlyReport, DashboardStats } from '@/types/report';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  country?: string;
  category?: string;
  sellerId?: string;
}

export const mockMonthlyReports: Record<string, MonthlyReport> = {
  '2025-06': {
    month: '2025-06',
    totalRevenue: 2586420.50,
    totalOrders: 15842,
    avgOrderValue: 163.26,
    countryBreakdown: [
      { countryCode: 'CN', countryName: '中国', revenue: 985620.80, orders: 5236, avgOrderValue: 188.24 },
      { countryCode: 'US', countryName: '美国', revenue: 652380.50, orders: 3852, avgOrderValue: 169.36 },
      { countryCode: 'DE', countryName: '德国', revenue: 256890.30, orders: 1852, avgOrderValue: 138.71 },
      { countryCode: 'JP', countryName: '日本', revenue: 225680.40, orders: 1523, avgOrderValue: 148.18 },
      { countryCode: 'GB', countryName: '英国', revenue: 185620.25, orders: 1236, avgOrderValue: 150.18 },
      { countryCode: 'FR', countryName: '法国', revenue: 125680.15, orders: 985, avgOrderValue: 127.60 },
      { countryCode: 'AU', countryName: '澳大利亚', revenue: 85620.10, orders: 652, avgOrderValue: 131.32 },
      { countryCode: 'BR', countryName: '巴西', revenue: 52360.20, orders: 425, avgOrderValue: 123.20 },
      { countryCode: 'KR', countryName: '韩国', revenue: 118968.80, orders: 1081, avgOrderValue: 110.05 }
    ],
    sellerPerformance: [
      { sellerId: 's001', shopName: '全球优品专营店', revenue: 523680.50, orders: 3256, returns: 125, returnRate: 3.84, rating: 4.8 },
      { sellerId: 's002', shopName: '数码电子旗舰店', revenue: 685230.80, orders: 2856, returns: 98, returnRate: 3.43, rating: 4.9 },
      { sellerId: 's003', shopName: '服饰时尚馆', revenue: 325680.30, orders: 2568, returns: 156, returnRate: 6.07, rating: 4.6 },
      { sellerId: 's004', shopName: '家居生活馆', revenue: 256890.40, orders: 2125, returns: 85, returnRate: 4.00, rating: 4.7 },
      { sellerId: 's005', shopName: '美妆个护专店', revenue: 452360.25, orders: 2856, returns: 168, returnRate: 5.88, rating: 4.5 }
    ],
    returnAnalysis: [
      { reason: '质量问题', count: 256, percentage: 35.2, avgRefundAmount: 156.80 },
      { reason: '发错商品', count: 128, percentage: 17.6, avgRefundAmount: 125.60 },
      { reason: '尺码不符', count: 156, percentage: 21.4, avgRefundAmount: 89.50 },
      { reason: '与描述不符', count: 98, percentage: 13.5, avgRefundAmount: 178.30 },
      { reason: '不想要了', count: 89, percentage: 12.2, avgRefundAmount: 68.90 }
    ],
    logisticsPerformance: [
      { provider: '全球物流联盟', totalShipments: 8523, avgDeliveryDays: 10.5, onTimeRate: 92.5, damageRate: 0.8 },
      { provider: '国际速运', totalShipments: 4256, avgDeliveryDays: 5.2, onTimeRate: 96.8, damageRate: 0.5 },
      { provider: '环球海运', totalShipments: 2125, avgDeliveryDays: 32.5, onTimeRate: 88.2, damageRate: 1.2 },
      { provider: 'VIP物流', totalShipments: 938, avgDeliveryDays: 2.1, onTimeRate: 99.2, damageRate: 0.2 }
    ],
    categorySales: [
      { category: '数码电子', revenue: 685230.80, orders: 2856, growthRate: 15.2 },
      { category: '服饰鞋包', revenue: 523680.50, orders: 3562, growthRate: 8.6 },
      { category: '美妆个护', revenue: 452360.25, orders: 2856, growthRate: 22.4 },
      { category: '家居生活', revenue: 325680.30, orders: 2125, growthRate: 12.8 },
      { category: '母婴用品', revenue: 256890.40, orders: 1852, growthRate: 18.5 },
      { category: '食品饮料', revenue: 156820.15, orders: 1236, growthRate: -2.3 },
      { category: '运动户外', revenue: 125680.10, orders: 985, growthRate: 25.6 },
      { category: '图书文具', revenue: 60078.00, orders: 370, growthRate: 5.2 }
    ]
  }
};

export const generateDashboardStats = (
  filter: ReportFilter = {}
): DashboardStats => {
  console.log('[ReportService] Generating dashboard stats with filter:', filter);

  const baseRevenue = 2586420.50;
  const baseOrders = 15842;
  
  const countryMultiplier = filter.country ? 
    (mockMonthlyReports['2025-06']?.countryBreakdown.find(c => c.countryCode === filter.country)?.revenue || 0) / baseRevenue || 1 : 1;

  return {
    totalOrders: Math.round(baseOrders * countryMultiplier),
    totalRevenue: Math.round(baseRevenue * countryMultiplier * 100) / 100,
    activeSellers: 1256,
    activeBuyers: 45823,
    returnRate: 3.58,
    avgComplaintResolutionHours: 4.2,
    categorySales: mockMonthlyReports['2025-06'].categorySales.map(c => ({
      category: c.category,
      revenue: c.revenue,
      orders: c.orders
    })),
    sellerActivity: mockMonthlyReports['2025-06'].sellerPerformance.map(s => ({
      sellerId: s.sellerId,
      shopName: s.shopName,
      ordersToday: Math.floor(Math.random() * 50) + 10,
      revenueToday: Math.round((Math.random() * 5000 + 1000) * 100) / 100,
      lastActive: new Date(Date.now() - Math.random() * 3600000).toISOString()
    })),
    hotCategories: [
      { category: '运动户外', trend: 'up', growthRate: 25.6, predictedDemand: 15680 },
      { category: '美妆个护', trend: 'up', growthRate: 22.4, predictedDemand: 12560 },
      { category: '母婴用品', trend: 'up', growthRate: 18.5, predictedDemand: 9850 },
      { category: '数码电子', trend: 'stable', growthRate: 15.2, predictedDemand: 8560 },
      { category: '食品饮料', trend: 'down', growthRate: -2.3, predictedDemand: 6520 }
    ],
    recentOrders: [
      { id: 'o001', orderNo: 'GS202506060001', buyer: '张**', country: '中国', amount: 568.50, status: '已发货', createdAt: new Date(Date.now() - 300000).toISOString() },
      { id: 'o002', orderNo: 'GS202506060002', buyer: 'John D.', country: '美国', amount: 128.90, status: '待发货', createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: 'o003', orderNo: 'GS202506060003', buyer: 'Hans M.', country: '德国', amount: 345.80, status: '已完成', createdAt: new Date(Date.now() - 900000).toISOString() },
      { id: 'o004', orderNo: 'GS202506060004', buyer: '田中 太郎', country: '日本', amount: 89.50, status: '待付款', createdAt: new Date(Date.now() - 1200000).toISOString() },
      { id: 'o005', orderNo: 'GS202506060005', buyer: 'Sophie L.', country: '法国', amount: 256.30, status: '已发货', createdAt: new Date(Date.now() - 1500000).toISOString() }
    ]
  };
};

export const getMonthlyReport = (month: string): MonthlyReport | null => {
  console.log('[ReportService] Getting monthly report for:', month);
  const report = mockMonthlyReports[month] || mockMonthlyReports['2025-06'];
  return report;
};

export const generateCountryCSV = (report: MonthlyReport): string => {
  console.log('[ReportService] Generating country CSV');
  
  const headers = ['国家代码', '国家名称', '营收(CNY)', '订单数', '客单价(CNY)'];
  const rows = report.countryBreakdown.map(c => [
    c.countryCode,
    c.countryName,
    c.revenue.toFixed(2),
    c.orders.toString(),
    c.avgOrderValue.toFixed(2)
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return '\ufeff' + csv;
};

export const generateSellerCSV = (report: MonthlyReport): string => {
  console.log('[ReportService] Generating seller CSV');
  
  const headers = ['卖家ID', '店铺名称', '营收(CNY)', '订单数', '退货数', '退货率(%)', '评分'];
  const rows = report.sellerPerformance.map(s => [
    s.sellerId,
    s.shopName,
    s.revenue.toFixed(2),
    s.orders.toString(),
    s.returns.toString(),
    s.returnRate.toFixed(2),
    s.rating.toFixed(1)
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return '\ufeff' + csv;
};

export const generateReturnCSV = (report: MonthlyReport): string => {
  console.log('[ReportService] Generating return CSV');
  
  const headers = ['退货原因', '数量', '占比(%)', '平均退款金额(CNY)'];
  const rows = report.returnAnalysis.map(r => [
    r.reason,
    r.count.toString(),
    r.percentage.toFixed(1),
    r.avgRefundAmount.toFixed(2)
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return '\ufeff' + csv;
};

export const generateLogisticsCSV = (report: MonthlyReport): string => {
  console.log('[ReportService] Generating logistics CSV');
  
  const headers = ['物流商', '发货量', '平均配送天数', '准时率(%)', '破损率(%)'];
  const rows = report.logisticsPerformance.map(l => [
    l.provider,
    l.totalShipments.toString(),
    l.avgDeliveryDays.toFixed(1),
    l.onTimeRate.toFixed(1),
    l.damageRate.toFixed(2)
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return '\ufeff' + csv;
};

export const generateFullReportCSV = (report: MonthlyReport): string => {
  console.log('[ReportService] Generating full report CSV');
  
  let csv = '\ufeff';
  
  csv += `月度报表 - ${report.month}\n`;
  csv += `总营收: ${report.totalRevenue.toFixed(2)} CNY\n`;
  csv += `总订单数: ${report.totalOrders}\n`;
  csv += `客单价: ${report.avgOrderValue.toFixed(2)} CNY\n\n`;
  
  csv += '=== 各国家营收 ===\n';
  csv += generateCountryCSV(report).replace('\ufeff', '') + '\n\n';
  
  csv += '=== 卖家绩效 ===\n';
  csv += generateSellerCSV(report).replace('\ufeff', '') + '\n\n';
  
  csv += '=== 退货原因分析 ===\n';
  csv += generateReturnCSV(report).replace('\ufeff', '') + '\n\n';
  
  csv += '=== 物流时效 ===\n';
  csv += generateLogisticsCSV(report).replace('\ufeff', '') + '\n';
  
  console.log('[ReportService] Full report CSV generated, length:', csv.length);
  return csv;
};

export const downloadCSV = (content: string, filename: string): void => {
  console.log('[ReportService] Downloading CSV:', filename);
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('[ReportService] CSV download initiated');
};

export const exportMonthlyReport = async (month: string, type: 'full' | 'country' | 'seller' | 'return' | 'logistics' = 'full'): Promise<{ csvContent: string; filename: string }> => {
  console.log('[ReportService] Exporting monthly report:', month, 'type:', type);
  
  const report = getMonthlyReport(month);
  if (!report) {
    throw new Error('报表不存在');
  }
  
  let csvContent: string;
  let filename: string;
  
  switch (type) {
    case 'country':
      csvContent = generateCountryCSV(report);
      filename = `各国家营收_${month}.csv`;
      break;
    case 'seller':
      csvContent = generateSellerCSV(report);
      filename = `卖家绩效_${month}.csv`;
      break;
    case 'return':
      csvContent = generateReturnCSV(report);
      filename = `退货原因分析_${month}.csv`;
      break;
    case 'logistics':
      csvContent = generateLogisticsCSV(report);
      filename = `物流时效_${month}.csv`;
      break;
    default:
      csvContent = generateFullReportCSV(report);
      filename = `月度报表_${month}.csv`;
  }
  
  console.log('[ReportService] Report generated successfully:', filename);
  return { csvContent, filename };
};

export const predictHotCategories = (months: number = 3): Array<{
  category: string;
  predictedGrowth: number;
  confidence: number;
  recommendation: string;
}> => {
  console.log('[ReportService] Predicting hot categories for next', months, 'months');
  
  const predictions = [
    { category: '运动户外', predictedGrowth: 28.5, confidence: 0.92, recommendation: '建议增加20%库存，加大推广力度' },
    { category: '美妆个护', predictedGrowth: 24.3, confidence: 0.88, recommendation: '建议增加15%库存，推出节日限定套装' },
    { category: '母婴用品', predictedGrowth: 19.8, confidence: 0.85, recommendation: '建议增加10%库存，加强安全认证宣传' },
    { category: '数码电子', predictedGrowth: 16.5, confidence: 0.78, recommendation: '建议保持现有库存，关注新品发布时机' },
    { category: '家居生活', predictedGrowth: 12.3, confidence: 0.75, recommendation: '建议保持现有库存，推出组合套餐' },
    { category: '服饰鞋包', predictedGrowth: 9.8, confidence: 0.72, recommendation: '建议换季时调整库存结构' },
    { category: '食品饮料', predictedGrowth: -1.5, confidence: 0.68, recommendation: '建议减少5%库存，优化产品结构' },
    { category: '图书文具', predictedGrowth: 4.2, confidence: 0.65, recommendation: '建议保持现有库存，开学季可适当增加' }
  ];
  
  console.log('[ReportService] Hot category predictions:', predictions);
  return predictions;
};
