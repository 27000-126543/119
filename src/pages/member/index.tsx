import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import type { MemberBenefit, Coupon, MemberLevel } from '@/types/user';

const MemberPage: React.FC = () => {
  const t = useTranslation();
  const { user } = useUserStore();
  const [benefits, setBenefits] = useState<MemberBenefit[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [records, setRecords] = useState<{ date: string; amount: number; type: string }[]>([]);

  useEffect(() => {
    console.log('[MemberPage] Mounted, memberLevel:', user?.memberLevel);
    loadMemberData();
  }, [user]);

  useDidShow(() => {
    console.log('[MemberPage] Page show');
  });

  usePullDownRefresh(() => {
    console.log('[MemberPage] Pull down refresh');
    setTimeout(() => {
      loadMemberData();
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadMemberData = () => {
    console.log('[MemberPage] Loading member data');

    const mockBenefits: MemberBenefit[] = [
      { id: 'b1', name: '专属折扣', description: '最高95折', icon: '🏷️', levels: ['normal', 'silver', 'gold', 'diamond'] },
      { id: 'b2', name: '免费退货', description: '每年3次', icon: '↩️', levels: ['silver', 'gold', 'diamond'] },
      { id: 'b3', name: '专属客服', description: '优先响应', icon: '🎧', levels: ['gold', 'diamond'] },
      { id: 'b4', name: '生日礼包', description: '神秘礼物', icon: '🎁', levels: ['diamond'] },
      { id: 'b5', name: '优先发货', description: '极速配送', icon: '🚚', levels: ['silver', 'gold', 'diamond'] },
      { id: 'b6', name: '积分加倍', description: '最高2倍', icon: '⭐', levels: ['gold', 'diamond'] },
      { id: 'b7', name: '专属活动', description: 'VIP专场', icon: '🎉', levels: ['diamond'] },
      { id: 'b8', name: '专属顾问', description: '1对1服务', icon: '👨‍💼', levels: ['diamond'] }
    ];

    const mockCoupons: Coupon[] = [
      { id: 'c1', name: '新人专享券', discountType: 'fixed', discountValue: 50, minAmount: 299, currency: 'CNY', startDate: '2024-01-01', endDate: '2024-12-31', status: 'available' },
      { id: 'c2', name: '会员专属折扣券', discountType: 'percentage', discountValue: 10, minAmount: 500, currency: 'CNY', startDate: '2024-01-01', endDate: '2024-12-31', status: 'available' },
      { id: 'c3', name: '满减优惠券', discountType: 'fixed', discountValue: 100, minAmount: 999, currency: 'CNY', startDate: '2024-01-01', endDate: '2024-06-30', status: 'available' },
      { id: 'c4', name: '品类优惠券', discountType: 'fixed', discountValue: 30, minAmount: 199, currency: 'CNY', startDate: '2024-01-01', endDate: '2024-03-31', status: 'used' },
      { id: 'c5', name: '节日优惠券', discountType: 'percentage', discountValue: 15, minAmount: 399, currency: 'CNY', startDate: '2023-12-01', endDate: '2023-12-25', status: 'expired' }
    ];

    const mockRecords = [
      { date: '2024-06-01', amount: 1299, type: '购物消费' },
      { date: '2024-05-28', amount: 899, type: '购物消费' },
      { date: '2024-05-20', amount: 2599, type: '购物消费' },
      { date: '2024-05-15', amount: 599, type: '购物消费' },
      { date: '2024-05-01', amount: 3299, type: '购物消费' }
    ];

    setBenefits(mockBenefits);
    setCoupons(mockCoupons.filter(c => c.status === 'available'));
    setRecords(mockRecords);
    console.log('[MemberPage] Member data loaded:', { benefits: mockBenefits.length, coupons: mockCoupons.length, records: mockRecords.length });
  };

  const levelIcons: Record<string, string> = {
    normal: '🥉',
    silver: '🥈',
    gold: '🥇',
    diamond: '💎'
  };

  const levels: MemberLevel[] = ['normal', 'silver', 'gold', 'diamond'];
  const levelNames: Record<MemberLevel, string> = {
    normal: '普通',
    silver: '银卡',
    gold: '金卡',
    diamond: '钻石'
  };

  const handleBenefitClick = (benefit: MemberBenefit) => {
    console.log('[MemberPage] Benefit clicked:', benefit.id, benefit.name);
    Taro.showToast({ title: benefit.description, icon: 'none' });
  };

  const handleCouponClick = (coupon: Coupon) => {
    console.log('[MemberPage] Coupon clicked:', coupon.id, coupon.name);
    if (coupon.status === 'available') {
      Taro.showToast({ title: '已领取', icon: 'success' });
    }
  };

  const handleViewAllCoupons = () => {
    console.log('[MemberPage] View all coupons clicked');
    Taro.showToast({ title: '查看全部优惠券', icon: 'none' });
  };

  const handleViewAllRecords = () => {
    console.log('[MemberPage] View all records clicked');
    Taro.showToast({ title: '查看全部消费记录', icon: 'none' });
  };

  const getCouponDisplayValue = (coupon: Coupon): string => {
    if (coupon.discountType === 'fixed') {
      return formatPrice(coupon.discountValue);
    }
    return `${coupon.discountValue}%`;
  };

  const getCouponStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      available: '可使用',
      used: '已使用',
      expired: '已过期'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <View className={styles.memberPage}>
        <ScrollView scrollY>
          <View className={styles.header}>
            <View className={styles.decoration} />
            <View className={styles.decoration2} />
            <View className={styles.memberCard}>
              <Text className={styles.levelTitle}>请先登录查看会员权益</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const availableBenefits = benefits.filter(b => b.levels.includes(user.memberLevel));

  return (
    <View className={styles.memberPage}>
      <View className={styles.header}>
        <View className={styles.decoration} />
        <View className={styles.decoration2} />

        <View className={styles.memberCard}>
          <View className={styles.levelHeader}>
            <View className={styles.levelBadge}>
              <View className={styles.levelIcon}>
                <Text>{levelIcons[user.memberLevel]}</Text>
              </View>
              <Text className={styles.levelTitle}>{user.memberLevelText}</Text>
            </View>
            <Text className={styles.levelPoints}>成长值 {user.totalTradeAmount}</Text>
          </View>

          <View className={styles.userInfo}>
            <Image className={styles.avatar} src={user.avatar} mode="aspectFill" />
            <View className={styles.userText}>
              <Text className={styles.nickname}>{user.nickname}</Text>
              <Text className={styles.tradeAmount}>
                累计交易 {formatPrice(user.totalTradeAmount)}
              </Text>
            </View>
          </View>

          {user.memberLevel !== 'diamond' ? (
            <View className={styles.progressSection}>
              <View className={styles.progressHeader}>
                <Text>{t('upgradeProgress')}</Text>
                <Text>
                  {formatPrice(user.totalTradeAmount)} / {formatPrice(user.nextLevelAmount)}
                </Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${Math.min(user.levelProgress, 100)}%` }}
                />
              </View>
              <Text className={styles.progressText}>
                再交易 {formatPrice(user.nextLevelAmount - user.totalTradeAmount)} 即可升级
              </Text>
            </View>
          ) : (
            <View className={styles.diamondBadge}>
              <Text>✨ 恭喜您已达到最高等级 ✨</Text>
            </View>
          )}

          <View className={styles.levelLevels}>
            {levels.map((level) => (
              <View
                key={level}
                className={classnames(styles.levelTag, user.memberLevel === level && styles.active)}
              >
                <Text>{levelIcons[level]} {levelNames[level]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>🎯</Text>
              会员数据
            </Text>
          </View>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{coupons.length}</Text>
              <Text className={styles.statLabel}>{t('coupons')}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{user.freeReturnCount}</Text>
              <Text className={styles.statLabel}>{t('freeReturn')}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{availableBenefits.length}</Text>
              <Text className={styles.statLabel}>可用权益</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>🎁</Text>
              {t('benefits')}
            </Text>
            <View className={styles.sectionMore} onClick={() => console.log('[MemberPage] View all benefits')}>
              <Text>全部权益</Text>
              <Text>›</Text>
            </View>
          </View>
          <View className={styles.benefitsGrid}>
            {benefits.map((benefit) => {
              const isAvailable = benefit.levels.includes(user.memberLevel);
              return (
                <View
                  key={benefit.id}
                  className={styles.benefitItem}
                  onClick={() => handleBenefitClick(benefit)}
                  style={{ opacity: isAvailable ? 1 : 0.4 }}
                >
                  <View className={styles.benefitIcon}>
                    <Text>{benefit.icon}</Text>
                  </View>
                  <Text className={styles.benefitName}>{benefit.name}</Text>
                  <Text className={styles.benefitDesc}>{benefit.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>🎫</Text>
              {t('coupons')}
            </Text>
            <View className={styles.sectionMore} onClick={handleViewAllCoupons}>
              <Text>查看全部</Text>
              <Text>›</Text>
            </View>
          </View>
          <View className={styles.couponList}>
            {coupons.slice(0, 3).map((coupon) => (
              <View
                key={coupon.id}
                className={classnames(styles.couponItem, styles[coupon.status])}
                onClick={() => handleCouponClick(coupon)}
              >
                <View className={styles.couponLeft}>
                  <Text className={styles.couponValue}>{getCouponDisplayValue(coupon)}</Text>
                  <Text className={styles.couponCondition}>满{formatPrice(coupon.minAmount)}可用</Text>
                </View>
                <View className={styles.couponRight}>
                  <View>
                    <Text className={styles.couponName}>{coupon.name}</Text>
                    <Text className={styles.couponDate}>{coupon.startDate} 至 {coupon.endDate}</Text>
                  </View>
                  {coupon.status !== 'available' && (
                    <Text className={styles.couponStatus}>{getCouponStatusText(coupon.status)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text>📊</Text>
              消费记录
            </Text>
            <View className={styles.sectionMore} onClick={handleViewAllRecords}>
              <Text>查看全部</Text>
              <Text>›</Text>
            </View>
          </View>
          <View className={styles.couponList}>
            {records.map((record, index) => (
              <View
                key={index}
                className={styles.couponItem}
                style={{ padding: 0, border: 'none' }}
              >
                <View style={{ flex: 1, padding: '24rpx' }}>
                  <Text className={styles.couponName}>{record.type}</Text>
                  <Text className={styles.couponDate}>{record.date}</Text>
                </View>
                <View style={{ padding: '24rpx', alignSelf: 'center' }}>
                  <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#ef4444' }}>
                    - {formatPrice(record.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MemberPage;
