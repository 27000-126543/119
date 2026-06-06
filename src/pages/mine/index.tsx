import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Button
} from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import MemberCard from '@/components/MemberCard';
import { useTranslation } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import { useTranslation as useT } from '@/store/useLocaleStore';

const MinePage: React.FC = () => {
  const t = useTranslation();
  const { user, isLoggedIn, logout } = useUserStore();
  const [orderCounts, setOrderCounts] = useState({
    pending_payment: 1,
    pending_shipment: 1,
    shipped: 1,
    completed: 0
  });

  useEffect(() => {
    console.log('[MinePage] Mounted, isLoggedIn:', isLoggedIn);
  }, [isLoggedIn]);

  usePullDownRefresh(() => {
    console.log('[MinePage] Pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
          console.log('[MinePage] User logged out');
        }
      }
    });
  };

  const handleLogin = () => {
    console.log('[MinePage] Navigate to login');
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleOrderClick = (status: string) => {
    console.log('[MinePage] Order clicked:', status);
    Taro.switchTab({ url: '/pages/orders/index' });
  };

  const handleMenuClick = (page: string) => {
    console.log('[MinePage] Menu clicked:', page);
    Taro.navigateTo({ url: `/pages/${page}/index` });
  };

  const getAuthStatusInfo = (status: string) => {
    const info: Record<string, { text: string; icon: string; className: string }> = {
      approved: { text: '已认证', icon: '✓', className: styles.authApproved },
      pending: { text: '审核中', icon: '⏳', className: styles.authPending },
      rejected: { text: '认证失败', icon: '✕', className: styles.authRejected },
      not_submitted: { text: '未认证', icon: '📝', className: '' }
    };
    return info[status] || info.not_submitted;
  };

  const orderQuickAccess = [
    { status: 'pending_payment', icon: '💳', label: t('pendingPayment'), count: orderCounts.pending_payment },
    { status: 'pending_shipment', icon: '📦', label: t('pendingShipment'), count: orderCounts.pending_shipment },
    { status: 'shipped', icon: '🚚', label: t('shipped'), count: orderCounts.shipped },
    { status: 'completed', icon: '⭐', label: t('completed'), count: orderCounts.completed }
  ];

  const menuItems = [
    { id: 'realname-auth', icon: '🪪', label: t('realnameAuth'), badge: user?.realnameStatus !== 'approved' ? '去认证' : '' },
    { id: 'member', icon: '👑', label: t('memberCenter') },
    { id: 'seller', icon: '🏪', label: t('myShop'), badge: user?.hasShop ? '已入驻' : '去开店' },
    { id: 'address', icon: '📍', label: '地址管理' },
    { id: 'admin', icon: '📊', label: t('adminDashboard'), show: user?.isAdmin }
  ];

  const menuItems2 = [
    { id: 'settings', icon: '⚙️', label: t('settings') }
  ];

  if (!isLoggedIn || !user) {
    return (
      <View className={styles.minePage}>
        <ScrollView scrollY>
          <View className={styles.loginTip}>
            <Text className={styles.emptyIcon}>👤</Text>
            <Text className={styles.loginTipText}>登录后查看更多功能</Text>
            <Button className={styles.loginBtn} onClick={handleLogin}>
              {t('login')} / {t('register')}
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  const authInfo = getAuthStatusInfo(user.realnameStatus);

  return (
    <View className={styles.minePage}>
      <View className={styles.header}>
        <View className={styles.decoration} />
        <View className={styles.decoration2} />

        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={user.avatar} mode="aspectFill" />
          <View className={styles.userText}>
            <Text className={styles.nickname}>{user.nickname}</Text>
            <Text className={styles.phone}>{user.phone}</Text>
            <View className={classnames(styles.authStatus, authInfo.className)}>
              <Text className={styles.authIcon}>{authInfo.icon}</Text>
              <Text>{authInfo.text}</Text>
            </View>
          </View>
          <Button className={styles.logoutBtn} onClick={handleLogout}>
            {t('logout')}
          </Button>
        </View>

        <View className={styles.memberSection}>
          <MemberCard user={user} />
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.orderSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>📋</Text>
              我的订单
            </Text>
            <View className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
              <Text>全部订单</Text>
              <Text>›</Text>
            </View>
          </View>
          <View className={styles.orderQuickAccess}>
            {orderQuickAccess.map((item) => (
              <View
                key={item.status}
                className={styles.orderItem}
                onClick={() => handleOrderClick(item.status)}
              >
                <View className={styles.orderIcon}>
                  <Text>{item.icon}</Text>
                </View>
                {item.count > 0 && (
                  <Text className={styles.orderBadge}>{item.count}</Text>
                )}
                <Text className={styles.orderLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.menuSection}>
          {menuItems.filter(item => item.show !== false).map((item) => (
            <View
              key={item.id}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.id)}
            >
              <View className={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.label}</Text>
              {item.badge && (
                <Text className={styles.menuBadge}>{item.badge}</Text>
              )}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.menuSection}>
          {menuItems2.map((item) => (
            <View
              key={item.id}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.id)}
            >
              <View className={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.label}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MinePage;
