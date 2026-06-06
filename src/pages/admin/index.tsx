import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Button,
  Picker
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import { getHotProducts } from '@/data/products';
import type { Product } from '@/types/product';
import { adminService, initMockData } from '@/services/apiService';
import { exportMonthlyReport } from '@/services/reportService';
import type { DashboardStats } from '@/types/report';

interface StatData {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: string;
  iconClass: string;
}

interface CategoryData {
  name: string;
  nameEn: string;
  sales: number;
  orders: number;
}

interface SellerActivity {
  name: string;
  shopName: string;
  orders: number;
  activity: number;
}

interface PredictionItem {
  rank: number;
  product: Product;
  score: number;
  trend: string;
}

const AdminPage: React.FC = () => {
  const t = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<string>('global');
  const [selectedTime, setSelectedTime] = useState<string>('30days');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const countries = [
    { label: '全球', value: 'global' },
    { label: '中国', value: 'CN' },
    { label: '美国', value: 'US' },
    { label: '日本', value: 'JP' },
    { label: '韩国', value: 'KR' },
    { label: '德国', value: 'DE' }
  ];

  const timeRanges = [
    { label: '近7天', value: '7days' },
    { label: '近30天', value: '30days' },
    { label: '近90天', value: '90days' },
    { label: '今年', value: 'year' }
  ];

  const predictions: PredictionItem[] = [
    { rank: 1, product: getHotProducts()[0], score: 98.5, trend: '上升' },
    { rank: 2, product: getHotProducts()[1], score: 92.3, trend: '上升' },
    { rank: 3, product: getHotProducts()[2], score: 87.6, trend: '稳定' },
    { rank: 4, product: getHotProducts()[3], score: 82.1, trend: '上升' },
    { rank: 5, product: getHotProducts()[4], score: 78.9, trend: '下降' }
  ];

  const loadDashboardStats = useCallback(async (country?: string) => {
    setLoading(true);
    try {
      const result = await adminService.getDashboardStats(country);
      if (result.success && result.stats) {
        setStats(result.stats);
        console.log('[AdminPage] Dashboard stats loaded successfully');
      } else {
        Taro.showToast({ title: result.message || '加载失败', icon: 'error' });
      }
    } catch (e) {
      console.error('[AdminPage] Data load error:', e);
      Taro.showToast({ title: '加载失败，请稍后重试', icon: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[AdminPage] Mounted, loading dashboard data...');
    initMockData();
    loadDashboardStats();
  }, [loadDashboardStats]);

  const handleCountryChange = (e: any) => {
    const index = e.detail.value;
    const country = countries[index].value;
    setSelectedCountry(country);
    console.log('[AdminPage] Country changed:', country);
    loadDashboardStats(country);
  };

  const handleTimeChange = (e: any) => {
    const index = e.detail.value;
    setSelectedTime(timeRanges[index].value);
    console.log('[AdminPage] Time range changed:', timeRanges[index].value);
    loadDashboardStats(selectedCountry);
  };

  const handleExportReport = async (type: 'full' | 'country' | 'seller' | 'return' | 'logistics') => {
    setExporting(true);
    Taro.showLoading({ title: '正在导出...' });
    try {
      const { csvContent, filename } = await exportMonthlyReport(new Date().toISOString().slice(0, 7), type);
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      Taro.hideLoading();
      Taro.showToast({ title: '导出成功', icon: 'success' });
      console.log('[AdminPage] Report exported successfully:', filename);
    } catch (e) {
      console.error('[AdminPage] Export error:', e);
      Taro.hideLoading();
      Taro.showToast({ title: '导出失败，请稍后重试', icon: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleStatClick = (stat: StatData) => {
    console.log('[AdminPage] Stat clicked:', stat.title, stat.value);
  };

  const handlePredictionClick = (item: PredictionItem) => {
    console.log('[AdminPage] Prediction clicked:', item.product.id, item.product.name);
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${item.product.id}` });
  };

  const getCountryLabel = () => {
    return countries.find(c => c.value === selectedCountry)?.label || '全球';
  };

  const getTimeLabel = () => {
    return timeRanges.find(t => t.value === selectedTime)?.label || '近30天';
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return styles.rank1;
    if (rank === 2) return styles.rank2;
    if (rank === 3) return styles.rank3;
    return styles.rankOther;
  };

  const statData: StatData[] = stats ? [
    {
      title: t('globalOrders'),
      value: stats.totalOrders.toLocaleString(),
      change: '+12.5%',
      isUp: true,
      icon: '📦',
      iconClass: styles.statIconBlue
    },
    {
      title: '总销售额',
      value: formatPrice(stats.totalRevenue),
      change: '+8.3%',
      isUp: true,
      icon: '💰',
      iconClass: styles.statIconGreen
    },
    {
      title: t('returnRate'),
      value: `${stats.returnRate}%`,
      change: '-0.5%',
      isUp: true,
      icon: '↩️',
      iconClass: styles.statIconOrange
    },
    {
      title: t('complaintTime'),
      value: `${stats.avgComplaintResolutionHours}h`,
      change: '-15.3%',
      isUp: true,
      icon: '⏱️',
      iconClass: styles.statIconRed
    }
  ] : [];

  const categoryData: CategoryData[] = stats?.categorySales.map(cs => ({
    name: cs.category,
    nameEn: cs.category,
    sales: cs.revenue,
    orders: cs.orders
  })) || [];

  const sellerActivities: SellerActivity[] = stats?.sellerActivity.map(sa => ({
    name: sa.sellerId,
    shopName: sa.shopName,
    orders: sa.ordersToday,
    activity: Math.min(99, Math.round((sa.ordersToday / 20) * 100))
  })) || [];

  const maxSales = categoryData.length > 0 ? Math.max(...categoryData.map(c => c.sales)) : 1;
  const maxOrders = categoryData.length > 0 ? Math.max(...categoryData.map(c => c.orders)) : 1;

  return (
    <View className={styles.adminPage}>
      <View className={styles.header}>
        <Text className={styles.title}>{t('adminDashboard')}</Text>
        <Text className={styles.subtitle}>实时监控 · 数据驱动决策</Text>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterItem}>
          <Text className={styles.filterLabel}>国家/地区</Text>
          <Picker
            range={countries.map(c => c.label)}
            value={countries.findIndex(c => c.value === selectedCountry)}
            onChange={handleCountryChange}
          >
            <View className={styles.filterPicker}>
              <Text className={styles.pickerValue}>{getCountryLabel()}</Text>
              <Text className={styles.pickerIcon}>▼</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.filterItem}>
          <Text className={styles.filterLabel}>时间范围</Text>
          <Picker
            range={timeRanges.map(t => t.label)}
            value={timeRanges.findIndex(t => t.value === selectedTime)}
            onChange={handleTimeChange}
          >
            <View className={styles.filterPicker}>
              <Text className={styles.pickerValue}>{getTimeLabel()}</Text>
              <Text className={styles.pickerIcon}>▼</Text>
            </View>
          </Picker>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.statGrid}>
          {loading || !stats ? (
            [1, 2, 3, 4].map((i) => (
              <View key={i} className={styles.statCard}>
                <View className={styles.statHeader}>
                  <View className={styles.statIcon}>
                    <Text>📊</Text>
                  </View>
                </View>
                <Text className={styles.statTitle}>加载中...</Text>
                <Text className={styles.statValue}>--</Text>
                <Text className={styles.statChange}>
                  <Text>--</Text>
                </Text>
              </View>
            ))
          ) : (
            statData.map((stat, index) => (
              <View
                key={index}
                className={styles.statCard}
                onClick={() => handleStatClick(stat)}
              >
                <View className={styles.statHeader}>
                  <View className={`${styles.statIcon} ${stat.iconClass}`}>
                    <Text>{stat.icon}</Text>
                  </View>
                </View>
                <Text className={styles.statTitle}>{stat.title}</Text>
                <Text className={styles.statValue}>{stat.value}</Text>
                <Text className={`${styles.statChange} ${stat.isUp ? styles.statChangeUp : styles.statChangeDown}`}>
                  <Text>{stat.isUp ? '↑' : '↓'}</Text>
                  <Text>{stat.change}</Text>
                  <Text> 较上期</Text>
                </Text>
              </View>
            ))
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📊</Text>
              {t('categorySales')}
            </Text>
            <Text className={styles.sectionAction}>查看详情 ›</Text>
          </View>
          <View className={styles.chartContainer}>
            {loading || !stats ? (
              <View className={styles.loadingPlaceholder}>
                <Text>加载中...</Text>
              </View>
            ) : (
              <>
                <View className={styles.chartBars}>
                  {categoryData.map((item, index) => (
                    <View key={index} className={styles.chartBarGroup}>
                      <View
                        className={styles.chartBar}
                        style={{ height: `${(item.sales / maxSales) * 220 + 20}rpx` }}
                        data-value={`${(item.sales / 10000).toFixed(0)}万`}
                      />
                      <View
                        className={`${styles.chartBar} ${styles.chartBarSecondary}`}
                        style={{ height: `${(item.orders / maxOrders) * 180 + 10}rpx` }}
                        data-value={`${(item.orders / 1000).toFixed(1)}k`}
                      />
                      <Text className={styles.chartLabel}>{item.name}</Text>
                    </View>
                  ))}
                </View>
                <View className={styles.chartLegend}>
                  <View className={styles.legendItem}>
                    <View className={`${styles.legendDot} ${styles.legendDotPrimary}`} />
                    <Text>销售额</Text>
                  </View>
                  <View className={styles.legendItem}>
                    <View className={`${styles.legendDot} ${styles.legendDotSecondary}`} />
                    <Text>订单量</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>👥</Text>
              {t('sellerActivity')}
            </Text>
            <Text className={styles.sectionAction}>查看更多 ›</Text>
          </View>
          <View className={styles.activityList}>
            {loading || !stats ? (
              <View className={styles.loadingPlaceholder}>
                <Text>加载中...</Text>
              </View>
            ) : (
              sellerActivities.map((item, index) => (
                <View key={index} className={styles.activityItem}>
                  <View className={styles.activityInfo}>
                    <Text className={styles.activityName}>{item.name}</Text>
                    <Text className={styles.activityMeta}>{item.shopName} · {item.orders} 单</Text>
                  </View>
                  <View className={styles.activityBar}>
                    <View
                      className={styles.activityProgress}
                      style={{ width: `${item.activity}%` }}
                    />
                  </View>
                  <Text className={styles.activityValue}>{item.activity}%</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📈</Text>
              核心指标
            </Text>
          </View>
          <View className={styles.metricsRow}>
            <View className={styles.metricCard}>
              <Text className={styles.metricValue}>98.6%</Text>
              <Text className={styles.metricLabel}>履约率</Text>
            </View>
            <View className={styles.metricCard}>
              <Text className={`${styles.metricValue} ${styles.metricValueWarning}`}>{stats?.returnRate || '--'}%</Text>
              <Text className={styles.metricLabel}>{t('returnRate')}</Text>
            </View>
            <View className={styles.metricCard}>
              <Text className={`${styles.metricValue} ${styles.metricValueError}`}>1.8%</Text>
              <Text className={styles.metricLabel}>投诉率</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🔥</Text>
              {t('hotPrediction')}
            </Text>
            <Text className={styles.sectionAction}>刷新 ›</Text>
          </View>
          <View className={styles.predictionList}>
            {predictions.map((item) => (
              <View
                key={item.rank}
                className={styles.predictionItem}
                onClick={() => handlePredictionClick(item)}
              >
                <View className={`${styles.predictionRank} ${getRankClass(item.rank)}`}>
                  <Text>{item.rank}</Text>
                </View>
                <Image
                  className={styles.predictionImage}
                  src={item.product.images[0]}
                  mode="aspectFill"
                  onError={(e) => console.error('[AdminPage] Prediction image error:', e)}
                />
                <View className={styles.predictionInfo}>
                  <Text className={styles.predictionName}>{item.product.name}</Text>
                  <View className={styles.predictionMeta}>
                    <Text>销量: {item.product.sales}</Text>
                    <Text>趋势: {item.trend}</Text>
                  </View>
                </View>
                <Text className={styles.predictionScore}>{item.score}分</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📥</Text>
              导出报表
            </Text>
          </View>
          <View className={styles.exportSection}>
            <Button className={styles.exportCardBtn} onClick={() => handleExportReport('full')} disabled={exporting}>
              <Text className={styles.exportCardIcon}>�</Text>
              <Text className={styles.exportCardTitle}>完整报表</Text>
              <Text className={styles.exportCardDesc}>包含所有数据</Text>
            </Button>
            <Button className={styles.exportCardBtn} onClick={() => handleExportReport('country')} disabled={exporting}>
              <Text className={styles.exportCardIcon}>🌍</Text>
              <Text className={styles.exportCardTitle}>各国营收</Text>
              <Text className={styles.exportCardDesc}>按国家统计</Text>
            </Button>
            <Button className={styles.exportCardBtn} onClick={() => handleExportReport('seller')} disabled={exporting}>
              <Text className={styles.exportCardIcon}>👤</Text>
              <Text className={styles.exportCardTitle}>卖家绩效</Text>
              <Text className={styles.exportCardDesc}>卖家排名统计</Text>
            </Button>
            <Button className={styles.exportCardBtn} onClick={() => handleExportReport('return')} disabled={exporting}>
              <Text className={styles.exportCardIcon}>↩️</Text>
              <Text className={styles.exportCardTitle}>退货分析</Text>
              <Text className={styles.exportCardDesc}>退货原因统计</Text>
            </Button>
            <Button className={styles.exportCardBtn} onClick={() => handleExportReport('logistics')} disabled={exporting}>
              <Text className={styles.exportCardIcon}>🚚</Text>
              <Text className={styles.exportCardTitle}>物流时效</Text>
              <Text className={styles.exportCardDesc}>物流商统计</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminPage;
