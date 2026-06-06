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

  const stats: StatData[] = [
    {
      title: t('globalOrders'),
      value: '128,456',
      change: '+12.5%',
      isUp: true,
      icon: '📦',
      iconClass: styles.statIconBlue
    },
    {
      title: '总销售额',
      value: formatPrice(2568900),
      change: '+8.3%',
      isUp: true,
      icon: '💰',
      iconClass: styles.statIconGreen
    },
    {
      title: t('returnRate'),
      value: '3.2%',
      change: '-0.5%',
      isUp: true,
      icon: '↩️',
      iconClass: styles.statIconOrange
    },
    {
      title: t('complaintTime'),
      value: '4.2h',
      change: '-15.3%',
      isUp: true,
      icon: '⏱️',
      iconClass: styles.statIconRed
    }
  ];

  const categoryData: CategoryData[] = [
    { name: '电子产品', nameEn: 'Electronics', sales: 856000, orders: 12500 },
    { name: '服装配饰', nameEn: 'Fashion', sales: 625000, orders: 18300 },
    { name: '家居用品', nameEn: 'Home', sales: 489000, orders: 9600 },
    { name: '美妆护肤', nameEn: 'Beauty', sales: 412000, orders: 7800 },
    { name: '食品饮料', nameEn: 'Food', sales: 356000, orders: 11200 },
    { name: '运动户外', nameEn: 'Sports', sales: 289000, orders: 5400 }
  ];

  const sellerActivities: SellerActivity[] = [
    { name: '张三', shopName: '全球优品专营店', orders: 1256, activity: 95 },
    { name: '李四', shopName: '精品箱包旗舰店', orders: 987, activity: 88 },
    { name: '王五', shopName: '数码之家', orders: 856, activity: 82 },
    { name: '赵六', shopName: '美妆小铺', orders: 723, activity: 76 },
    { name: '孙七', shopName: '户外装备店', orders: 612, activity: 68 }
  ];

  const predictions: PredictionItem[] = [
    { rank: 1, product: getHotProducts()[0], score: 98.5, trend: '上升' },
    { rank: 2, product: getHotProducts()[1], score: 92.3, trend: '上升' },
    { rank: 3, product: getHotProducts()[2], score: 87.6, trend: '稳定' },
    { rank: 4, product: getHotProducts()[3], score: 82.1, trend: '上升' },
    { rank: 5, product: getHotProducts()[4], score: 78.9, trend: '下降' }
  ];

  useEffect(() => {
    console.log('[AdminPage] Mounted, loading dashboard data...');
    loadData();
  }, []);

  const loadData = useCallback(() => {
    try {
      console.log('[AdminPage] Dashboard data loaded successfully');
    } catch (e) {
      console.error('[AdminPage] Data load error:', e);
    }
  }, []);

  const handleCountryChange = (e: any) => {
    const index = e.detail.value;
    setSelectedCountry(countries[index].value);
    console.log('[AdminPage] Country changed:', countries[index].value);
    loadData();
  };

  const handleTimeChange = (e: any) => {
    const index = e.detail.value;
    setSelectedTime(timeRanges[index].value);
    console.log('[AdminPage] Time range changed:', timeRanges[index].value);
    loadData();
  };

  const handleExport = () => {
    console.log('[AdminPage] Export report clicked');
    Taro.showLoading({ title: '正在导出...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '导出成功', icon: 'success' });
      console.log('[AdminPage] Report exported successfully');
    }, 1500);
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

  const maxSales = Math.max(...categoryData.map(c => c.sales));
  const maxOrders = Math.max(...categoryData.map(c => c.orders));

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
          {stats.map((stat, index) => (
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
          ))}
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
            {sellerActivities.map((item, index) => (
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
            ))}
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
              <Text className={`${styles.metricValue} ${styles.metricValueWarning}`}>3.2%</Text>
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

        <Button className={styles.exportBtn} onClick={handleExport}>
          <Text className={styles.exportIcon}>📥</Text>
          <Text>{t('export')} {t('monthlyReport')}</Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default AdminPage;
