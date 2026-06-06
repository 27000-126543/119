import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice, useLocaleStore } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import type { Language, Currency } from '@/types/user';

const SettingsPage: React.FC = () => {
  const t = useTranslation();
  const { user, logout } = useUserStore();
  const { language, currency, setLanguage, setCurrency } = useLocaleStore();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [notifications, setNotifications] = useState({
    order: true,
    promotion: true,
    system: false,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    location: true,
    camera: true,
    photo: true,
    contacts: false
  });

  useEffect(() => {
    console.log('[SettingsPage] Mounted, language:', language, 'currency:', currency);
  }, [language, currency]);

  useDidShow(() => {
    console.log('[SettingsPage] Page show');
  });

  const languages: { code: Language; name: string; icon: string }[] = [
    { code: 'zh', name: '简体中文', icon: '🇨🇳' },
    { code: 'en', name: 'English', icon: '🇺🇸' },
    { code: 'ja', name: '日本語', icon: '🇯🇵' },
    { code: 'ko', name: '한국어', icon: '🇰🇷' }
  ];

  const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'CNY', name: '人民币 CNY', symbol: '¥' },
    { code: 'USD', name: '美元 USD', symbol: '$' },
    { code: 'EUR', name: '欧元 EUR', symbol: '€' },
    { code: 'JPY', name: '日元 JPY', symbol: '¥' }
  ];

  const getCurrentLanguageName = (): string => {
    const lang = languages.find(l => l.code === language);
    return lang?.name || language;
  };

  const getCurrentCurrencyInfo = () => {
    const cur = currencies.find(c => c.code === currency);
    return cur || currencies[0];
  };

  const handleLanguageClick = () => {
    console.log('[SettingsPage] Language settings clicked');
    setShowLanguageModal(true);
  };

  const handleSelectLanguage = (lang: Language) => {
    console.log('[SettingsPage] Select language:', lang);
    setLanguage(lang);
    setShowLanguageModal(false);
    Taro.showToast({ title: '语言已切换', icon: 'success' });
    console.log('[SettingsPage] Language changed to:', lang);
  };

  const handleCurrencyClick = () => {
    console.log('[SettingsPage] Currency settings clicked');
    setShowCurrencyModal(true);
  };

  const handleSelectCurrency = (cur: Currency) => {
    console.log('[SettingsPage] Select currency:', cur);
    setCurrency(cur);
    setShowCurrencyModal(false);
    Taro.showToast({ title: '币种已切换', icon: 'success' });
    console.log('[SettingsPage] Currency changed to:', cur);
  };

  const handleNotificationToggle = (key: keyof typeof notifications, value: boolean) => {
    console.log('[SettingsPage] Notification toggle:', key, value);
    setNotifications(prev => ({ ...prev, [key]: value }));
    console.log('[SettingsPage] Notifications updated:', { ...notifications, [key]: value });
  };

  const handlePrivacyToggle = (key: keyof typeof privacy, value: boolean) => {
    console.log('[SettingsPage] Privacy toggle:', key, value);
    setPrivacy(prev => ({ ...prev, [key]: value }));
    console.log('[SettingsPage] Privacy updated:', { ...privacy, [key]: value });
  };

  const handleAboutClick = () => {
    console.log('[SettingsPage] About us clicked');
    Taro.showModal({
      title: '关于我们',
      content: '全球购跨境电商平台\n版本 1.0.0\n© 2024 Global Mall. All rights reserved.',
      showCancel: false,
      confirmText: '好的'
    });
  };

  const handleLogout = () => {
    console.log('[SettingsPage] Logout clicked');
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
          console.log('[SettingsPage] User logged out successfully');
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/index/index' });
          }, 1500);
        }
      }
    });
  };

  const handleClearCache = () => {
    console.log('[SettingsPage] Clear cache clicked');
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '缓存已清除', icon: 'success' });
          console.log('[SettingsPage] Cache cleared');
        }
      }
    });
  };

  const handleCheckUpdate = () => {
    console.log('[SettingsPage] Check update clicked');
    Taro.showToast({ title: '已是最新版本', icon: 'success' });
  };

  const currentCurrency = getCurrentCurrencyInfo();

  return (
    <View className={styles.settingsPage}>
      <ScrollView scrollY>
        <View className={styles.aboutCard}>
          <View className={styles.appLogo}>
            <Text>🌍</Text>
          </View>
          <Text className={styles.appName}>全球购</Text>
          <Text className={styles.appVersion}>版本 1.0.0</Text>
          <Text className={styles.appDesc}>
            全球好物，一站购齐{'\n'}
            支持多语言、多币种结算
          </Text>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>通用设置</Text>
          </View>

          <View className={styles.menuItem} onClick={handleLanguageClick}>
            <View className={classnames(styles.menuIcon, styles.iconLanguage)}>
              <Text>🌐</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>{t('language')}</Text>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className={styles.menuValue}>{getCurrentLanguageName()}</Text>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            </View>
          </View>

          <View className={styles.menuItem} onClick={handleCurrencyClick}>
            <View className={classnames(styles.menuIcon, styles.iconCurrency)}>
              <Text>💰</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>{t('currency')}</Text>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className={styles.currencySymbol}>{currentCurrency.symbol}</Text>
                <Text className={styles.menuValue}>{currentCurrency.code}</Text>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>消息通知</Text>
          </View>

          <View className={styles.menuItem}>
            <View className={classnames(styles.menuIcon, styles.iconNotification)}>
              <Text>🔔</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>订单通知</Text>
              <View
                className={classnames(styles.switchBtn, notifications.order && styles.active)}
                onClick={() => handleNotificationToggle('order', !notifications.order)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>

          <View className={classnames(styles.menuItem, styles.notificationSubItem)}>
            <View className={styles.menuContent}>
              <Text className={styles.notificationLabel}>优惠活动</Text>
              <View
                className={classnames(styles.switchBtn, notifications.promotion && styles.active)}
                onClick={() => handleNotificationToggle('promotion', !notifications.promotion)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>

          <View className={classnames(styles.menuItem, styles.notificationSubItem)}>
            <View className={styles.menuContent}>
              <Text className={styles.notificationLabel}>系统公告</Text>
              <View
                className={classnames(styles.switchBtn, notifications.system && styles.active)}
                onClick={() => handleNotificationToggle('system', !notifications.system)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>

          <View className={classnames(styles.menuItem, styles.notificationSubItem)}>
            <View className={styles.menuContent}>
              <Text className={styles.notificationLabel}>营销短信</Text>
              <View
                className={classnames(styles.switchBtn, notifications.marketing && styles.active)}
                onClick={() => handleNotificationToggle('marketing', !notifications.marketing)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>隐私设置</Text>
          </View>

          <View className={styles.menuItem}>
            <View className={classnames(styles.menuIcon, styles.iconPrivacy)}>
              <Text>🔒</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>位置信息</Text>
              <View
                className={classnames(styles.switchBtn, privacy.location && styles.active)}
                onClick={() => handlePrivacyToggle('location', !privacy.location)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>

          <View className={classnames(styles.menuItem, styles.notificationSubItem)}>
            <View className={styles.menuContent}>
              <Text className={styles.notificationLabel}>相机权限</Text>
              <View
                className={classnames(styles.switchBtn, privacy.camera && styles.active)}
                onClick={() => handlePrivacyToggle('camera', !privacy.camera)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>

          <View className={classnames(styles.menuItem, styles.notificationSubItem)}>
            <View className={styles.menuContent}>
              <Text className={styles.notificationLabel}>相册权限</Text>
              <View
                className={classnames(styles.switchBtn, privacy.photo && styles.active)}
                onClick={() => handlePrivacyToggle('photo', !privacy.photo)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>

          <View className={classnames(styles.menuItem, styles.notificationSubItem)}>
            <View className={styles.menuContent}>
              <Text className={styles.notificationLabel}>通讯录权限</Text>
              <View
                className={classnames(styles.switchBtn, privacy.contacts && styles.active)}
                onClick={() => handlePrivacyToggle('contacts', !privacy.contacts)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>其他</Text>
          </View>

          <View className={styles.menuItem} onClick={handleAboutClick}>
            <View className={classnames(styles.menuIcon, styles.iconAbout)}>
              <Text>ℹ️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>关于我们</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>

          <View className={styles.menuItem} onClick={handleCheckUpdate}>
            <View className={classnames(styles.menuIcon, styles.iconAbout)}>
              <Text>📱</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>检查更新</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>

          <View className={styles.menuItem} onClick={handleClearCache}>
            <View className={classnames(styles.menuIcon, styles.iconAbout)}>
              <Text>🗑️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>清除缓存</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        {user && (
          <View className={styles.logoutSection}>
            <Button className={styles.logoutBtn} onClick={handleLogout}>
              {t('logout')}
            </Button>
          </View>
        )}
      </ScrollView>

      {showLanguageModal && (
        <View className={styles.modalOverlay} onClick={() => setShowLanguageModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalTitle}>选择语言</View>
            <View className={styles.modalList}>
              {languages.map((lang) => (
                <View
                  key={lang.code}
                  className={styles.modalItem}
                  onClick={() => handleSelectLanguage(lang.code)}
                >
                  <View className={styles.modalItemLeft}>
                    <Text className={styles.modalItemIcon}>{lang.icon}</Text>
                    <Text className={styles.modalItemText}>{lang.name}</Text>
                  </View>
                  {language === lang.code && (
                    <Text className={styles.modalItemCheck}>✓</Text>
                  )}
                </View>
              ))}
            </View>
            <View className={styles.modalCancel} onClick={() => setShowLanguageModal(false)}>
              取消
            </View>
          </View>
        </View>
      )}

      {showCurrencyModal && (
        <View className={styles.modalOverlay} onClick={() => setShowCurrencyModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalTitle}>选择币种</View>
            <View className={styles.modalList}>
              {currencies.map((cur) => (
                <View
                  key={cur.code}
                  className={styles.modalItem}
                  onClick={() => handleSelectCurrency(cur.code)}
                >
                  <View className={styles.modalItemLeft}>
                    <Text className={styles.modalItemIcon}>{cur.symbol}</Text>
                    <Text className={styles.modalItemText}>{cur.name}</Text>
                  </View>
                  {currency === cur.code && (
                    <Text className={styles.modalItemCheck}>✓</Text>
                  )}
                </View>
              ))}
            </View>
            <View className={styles.modalCancel} onClick={() => setShowCurrencyModal(false)}>
              取消
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SettingsPage;
