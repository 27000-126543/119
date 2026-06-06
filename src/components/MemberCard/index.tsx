import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { User } from '@/types/user';
import { formatPrice, getMemberLevelColor } from '@/utils/format';
import { useTranslation } from '@/store/useLocaleStore';

interface MemberCardProps {
  user: User;
  showBenefits?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ user, showBenefits = true }) => {
  const t = useTranslation();

  const levelIcons: Record<string, string> = {
    normal: '🥉',
    silver: '🥈',
    gold: '🥇',
    diamond: '💎'
  };

  const handleClick = () => {
    console.log('[MemberCard] Click member center');
    Taro.navigateTo({ url: '/pages/member/index' });
  };

  return (
    <View
      className={classnames(styles.memberCard, styles[user.memberLevel])}
      onClick={handleClick}
    >
      <View className={styles.decoration} />
      <View className={styles.decoration2} />

      <View className={styles.header}>
        <View className={styles.levelBadge}>
          <View className={styles.levelIcon}>
            <Text>{levelIcons[user.memberLevel] || '🥉'}</Text>
          </View>
          <Text className={styles.levelText}>{user.memberLevelText}</Text>
        </View>
        <Text className={styles.levelTag}>{t('memberCenter')} ›</Text>
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

      {user.memberLevel !== 'diamond' && (
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
      )}

      {showBenefits && (
        <View className={styles.benefitsRow}>
          <View className={styles.benefitItem}>
            <Text className={styles.benefitValue}>{user.couponCount}</Text>
            <Text className={styles.benefitLabel}>{t('coupons')}</Text>
          </View>
          <View className={styles.benefitItem}>
            <Text className={styles.benefitValue}>{user.freeReturnCount}</Text>
            <Text className={styles.benefitLabel}>{t('freeReturn')}</Text>
          </View>
          <View className={styles.benefitItem}>
            <Text className={styles.benefitValue}>★★★</Text>
            <Text className={styles.benefitLabel}>{t('exclusiveService')}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MemberCard;
