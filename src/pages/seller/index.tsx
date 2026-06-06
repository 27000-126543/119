import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Button
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import type { Shop } from '@/types/user';

const SellerPage: React.FC = () => {
  const t = useTranslation();
  const { user } = useUserStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [todayStats, setTodayStats] = useState({ orders: 0, sales: 0, visitors: 0 });
  const [orderStatusCounts, setOrderStatusCounts] = useState({
    pendingPayment: 2,
    pendingShipment: 3,
    shipped: 1,
    completed: 0
  });
  const [recentOrders, setRecentOrders] = useState<{
    id: string;
    productName: string;
    productImage: string;
    amount: number;
    date: string;
    status: 'pending' | 'processing' | 'completed';
  }[]>([]);

  useEffect(() => {
    console.log('[SellerPage] Mounted, hasShop:', user?.hasShop);
    if (user?.hasShop) {
      loadSellerData();
    }
  }, [user]);

  useDidShow(() => {
    console.log('[SellerPage] Page show');
  });

  usePullDownRefresh(() => {
    console.log('[SellerPage] Pull down refresh');
    setTimeout(() => {
      if (user?.hasShop) {
        loadSellerData();
      }
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadSellerData = () => {
    console.log('[SellerPage] Loading seller data');

    const mockShop: Shop = {
      id: 's001',
      name: '全球优品专营店',
      logo: 'https://picsum.photos/seed/shop/200/200',
      description: '专注全球优质商品，品质保障',
      sellerId: 'u001',
      sellerName: '张三',
      country: 'CN',
      rating: 4.8,
      reviewCount: 2568,
      productCount: 156,
      orderCount: 8956,
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z'
    };

    const mockStats = { orders: 28, sales: 15680, visitors: 356 };

    const mockOrders = [
      { id: 'o001', productName: '进口红酒礼盒装', productImage: 'https://picsum.photos/seed/p1/200/200', amount: 599, date: '2024-06-06 14:30', status: 'pending' as const },
      { id: 'o002', productName: '有机橄榄油套装', productImage: 'https://picsum.photos/seed/p2/200/200', amount: 299, date: '2024-06-06 12:15', status: 'processing' as const },
      { id: 'o003', productName: '进口奶粉3罐装', productImage: 'https://picsum.photos/seed/p3/200/200', amount: 899, date: '2024-06-06 10:20', status: 'completed' as const }
    ];

    setShop(mockShop);
    setTodayStats(mockStats);
    setRecentOrders(mockOrders);
    console.log('[SellerPage] Seller data loaded:', { shop: mockShop.name, stats: mockStats });
  };

  const handleOpenShop = () => {
    console.log('[SellerPage] Open shop clicked');
    Taro.showModal({
      title: '开店须知',
      content: '开通店铺需要完成实名认证，并缴纳保证金2000元',
      confirmText: '去开通',
      success: (res) => {
        if (res.confirm) {
          console.log('[SellerPage] Confirm open shop');
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      }
    });
  };

  const handleQuickAction = (action: string) => {
    console.log('[SellerPage] Quick action clicked:', action);
    const actions: Record<string, { title: string; url: string }> = {
      products: { title: '商品管理', url: '' },
      orders: { title: '订单管理', url: '' },
      settlement: { title: '结算管理', url: '' },
      settings: { title: '店铺设置', url: '' }
    };
    Taro.showToast({ title: `${actions[action]?.title || action} 开发中`, icon: 'none' });
  };

  const handleStatClick = (stat: string) => {
    console.log('[SellerPage] Stat clicked:', stat);
    Taro.showToast({ title: `查看${stat}详情`, icon: 'none' });
  };

  const handleOrderStatusClick = (status: string) => {
    console.log('[SellerPage] Order status clicked:', status);
    Taro.showToast({ title: `查看${status}订单`, icon: 'none' });
  };

  const handleOrderClick = (orderId: string) => {
    console.log('[SellerPage] Order clicked:', orderId);
    Taro.showToast({ title: '订单详情开发中', icon: 'none' });
  };

  const handleShopSettings = () => {
    console.log('[SellerPage] Shop settings clicked');
    Taro.showToast({ title: '店铺设置开发中', icon: 'none' });
  };

  const handleViewAllOrders = () => {
    console.log('[SellerPage] View all orders clicked');
    Taro.showToast({ title: '全部订单开发中', icon: 'none' });
  };

  const quickActions = [
    { id: 'products', icon: '📦', name: '商品管理', className: 'iconProducts' },
    { id: 'orders', icon: '📋', name: '订单管理', className: 'iconOrders' },
    { id: 'settlement', icon: '💰', name: '结算管理', className: 'iconSettlement' },
    { id: 'settings', icon: '⚙️', name: '店铺设置', className: 'iconSettings' }
  ];

  const orderStatusList = [
    { id: 'pendingPayment', icon: '💳', name: '待付款', count: orderStatusCounts.pendingPayment },
    { id: 'pendingShipment', icon: '📦', name: '待发货', count: orderStatusCounts.pendingShipment },
    { id: 'shipped', icon: '🚚', name: '已发货', count: orderStatusCounts.shipped },
    { id: 'completed', icon: '⭐', name: '已完成', count: orderStatusCounts.completed }
  ];

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <View className={styles.sellerPage}>
        <ScrollView scrollY>
          <View className={styles.noShopCard}>
            <Text className={styles.noShopIcon}>🏪</Text>
            <Text className={styles.noShopTitle}>请先登录</Text>
            <Text className={styles.noShopDesc}>登录后即可管理您的店铺</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!user.hasShop || !shop) {
    return (
      <View className={styles.sellerPage}>
        <ScrollView scrollY>
          <View className={styles.noShopCard}>
            <Text className={styles.noShopIcon}>🏪</Text>
            <Text className={styles.noShopTitle}>您还没有开通店铺</Text>
            <Text className={styles.noShopDesc}>
              开通店铺即可开始销售您的商品{'\n'}
              支持全球多币种结算，助力您的跨境生意
            </Text>
            <Button className={styles.openShopBtn} onClick={handleOpenShop}>
              立即开通店铺
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className={styles.sellerPage}>
      <View className={styles.header}>
        <View className={styles.decoration} />
        <View className={styles.decoration2} />

        <View className={styles.shopInfo}>
          <Image className={styles.shopLogo} src={shop.logo} mode="aspectFill" />
          <View className={styles.shopText}>
            <Text className={styles.shopName}>{shop.name}</Text>
            <Text className={styles.shopDesc}>{shop.description}</Text>
            <View className={styles.shopRating}>
              <Text className={styles.star}>★</Text>
              <Text>{shop.rating}</Text>
              <Text style={{ opacity: 0.6 }}>·</Text>
              <Text>{shop.reviewCount}条评价</Text>
              <Text style={{ opacity: 0.6 }}>·</Text>
              <Text>{shop.productCount}件商品</Text>
            </View>
          </View>
          <Button className={styles.shopSettingBtn} onClick={handleShopSettings}>
            管理
          </Button>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.statsCard}>
          <Text className={styles.statsTitle}>
            <Text>📊</Text>
            今日数据
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem} onClick={() => handleStatClick('orders')}>
              <Text className={styles.statValue}>{todayStats.orders}</Text>
              <Text className={styles.statLabel}>订单数</Text>
              <Text className={styles.statUnit}>笔</Text>
            </View>
            <View className={styles.statItem} onClick={() => handleStatClick('sales')}>
              <Text className={styles.statValue}>{formatPrice(todayStats.sales)}</Text>
              <Text className={styles.statLabel}>销售额</Text>
              <Text className={styles.statUnit}>元</Text>
            </View>
            <View className={styles.statItem} onClick={() => handleStatClick('visitors')}>
              <Text className={styles.statValue}>{todayStats.visitors}</Text>
              <Text className={styles.statLabel}>访客数</Text>
              <Text className={styles.statUnit}>人</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>📋</Text>
              订单管理
            </Text>
            <View className={styles.sectionMore} onClick={handleViewAllOrders}>
              <Text>查看全部</Text>
              <Text>›</Text>
            </View>
          </View>
          <View className={styles.orderStatusRow}>
            {orderStatusList.map((item) => (
              <View
                key={item.id}
                className={styles.orderStatusItem}
                onClick={() => handleOrderStatusClick(item.id)}
              >
                <View className={styles.orderStatusIcon}>
                  <Text>{item.icon}</Text>
                </View>
                {item.count > 0 && (
                  <Text className={styles.orderStatusBadge}>{item.count}</Text>
                )}
                <Text className={styles.orderStatusName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>⚡</Text>
            快捷入口
          </Text>
          <View className={styles.quickGrid}>
            {quickActions.map((action) => (
              <View
                key={action.id}
                className={styles.quickItem}
                onClick={() => handleQuickAction(action.id)}
              >
                <View className={classnames(styles.quickIcon, styles[action.className])}>
                  <Text>{action.icon}</Text>
                </View>
                <Text className={styles.quickName}>{action.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>🕐</Text>
              最近订单
            </Text>
            <View className={styles.sectionMore} onClick={handleViewAllOrders}>
              <Text>更多</Text>
              <Text>›</Text>
            </View>
          </View>
          <View className={styles.recentOrders}>
            {recentOrders.map((order) => (
              <View
                key={order.id}
                className={styles.recentOrderItem}
                onClick={() => handleOrderClick(order.id)}
              >
                <Image className={styles.orderProductImg} src={order.productImage} mode="aspectFill" />
                <View className={styles.orderInfo}>
                  <Text className={styles.orderTitle}>{order.productName}</Text>
                  <Text className={styles.orderDate}>{order.date}</Text>
                  <View className={styles.orderMeta}>
                    <Text className={classnames(styles.orderStatusTag, styles[order.status])}>
                      {getStatusText(order.status)}
                    </Text>
                    <Text className={styles.orderAmount}>+ {formatPrice(order.amount)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SellerPage;
