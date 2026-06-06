import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Swiper,
  SwiperItem,
  ScrollView,
  Input,
  Button
} from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProductCard from '@/components/ProductCard';
import { mockBanners } from '@/data/banners';
import { mockCategories } from '@/data/categories';
import { getHotProducts, getNewProducts, getRecommendProducts } from '@/data/products';
import { useTranslation, useLocaleStore, type Language, type Currency } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import type { Product } from '@/types/product';

const HomePage: React.FC = () => {
  const t = useTranslation();
  const { language, currency, setLanguage, setCurrency } = useLocaleStore();
  const user = useUserStore((state) => state.user);
  const [showLocaleModal, setShowLocaleModal] = useState(false);
  const [tempLanguage, setTempLanguage] = useState<Language>(language);
  const [tempCurrency, setTempCurrency] = useState<Currency>(currency);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('02:30:45');

  useEffect(() => {
    console.log('[HomePage] Mounted, loading data...');
    loadData();
    startCountdown();
  }, []);

  usePullDownRefresh(() => {
    console.log('[HomePage] Pull down refresh');
    loadData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  useReachBottom(() => {
    console.log('[HomePage] Reach bottom, loading more...');
    loadMore();
  });

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const [h, m, s] = prev.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s;
        if (totalSeconds > 0) {
          totalSeconds--;
          const nh = Math.floor(totalSeconds / 3600);
          const nm = Math.floor((totalSeconds % 3600) / 60);
          const ns = totalSeconds % 60;
          return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
        }
        return '00:00:00';
      });
    }, 1000);
    return () => clearInterval(timer);
  };

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      setHotProducts(getHotProducts());
      setNewProducts(getNewProducts());
      setRecommendProducts(getRecommendProducts());
      console.log('[HomePage] Data loaded successfully');
    } catch (e) {
      console.error('[HomePage] Data load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setRecommendProducts((prev) => [...prev, ...getRecommendProducts()]);
      setLoading(false);
    }, 1000);
  };

  const handleSearchClick = () => {
    console.log('[HomePage] Search clicked');
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    console.log('[HomePage] Category clicked:', categoryId, categoryName);
    Taro.switchTab({ url: '/pages/market/index' });
  };

  const handleBannerClick = (banner: typeof mockBanners[0]) => {
    console.log('[HomePage] Banner clicked:', banner.id, banner.linkType, banner.linkValue);
    if (banner.linkType === 'product') {
      Taro.navigateTo({ url: `/pages/product-detail/index?id=${banner.linkValue}` });
    } else if (banner.linkType === 'category') {
      Taro.switchTab({ url: '/pages/market/index' });
    } else if (banner.linkType === 'page') {
      Taro.navigateTo({ url: banner.linkValue });
    }
  };

  const openLocaleModal = () => {
    setTempLanguage(language);
    setTempCurrency(currency);
    setShowLocaleModal(true);
  };

  const confirmLocale = () => {
    setLanguage(tempLanguage);
    setCurrency(tempCurrency);
    setShowLocaleModal(false);
    Taro.showToast({ title: '设置已更新', icon: 'success' });
    console.log('[HomePage] Locale updated:', tempLanguage, tempCurrency);
  };

  const languages: { value: Language; label: string }[] = [
    { value: 'zh', label: '简体中文' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
  ];

  const currencies: { value: Currency; label: string }[] = [
    { value: 'CNY', label: '人民币 ¥' },
    { value: 'USD', label: '美元 $' },
    { value: 'EUR', label: '欧元 €' },
    { value: 'JPY', label: '日元 ¥' }
  ];

  return (
    <View className={styles.homePage}>
      <View className={styles.header}>
        <View className={styles.topBar}>
          <Text className={styles.logo}>🌍 GlobalShop</Text>
          <View className={styles.localeSwitch}>
            <Button className={styles.localeBtn} onClick={openLocaleModal}>
              {language.toUpperCase()} / {currency}
            </Button>
          </View>
        </View>

        <View className={styles.searchBar} onClick={handleSearchClick}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchPlaceholder}>{t('search')}</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.bannerSection}>
          <Swiper
            className={styles.bannerSwiper}
            autoplay
            circular
            indicatorDots
            indicatorColor="rgba(255,255,255,0.5)"
            indicatorActiveColor="#ffffff"
          >
            {mockBanners.map((banner) => (
              <SwiperItem key={banner.id}>
                <View
                  className={styles.bannerItem}
                  onClick={() => handleBannerClick(banner)}
                >
                  <Image
                    className={styles.bannerImage}
                    src={banner.image}
                    mode="aspectFill"
                    onError={(e) => console.error('[HomePage] Banner image error:', e)}
                  />
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        <View className={styles.categorySection}>
          <View className={styles.categoryGrid}>
            {mockCategories.map((category) => (
              <View
                key={category.id}
                className={styles.categoryItem}
                onClick={() => handleCategoryClick(category.id, category.name)}
              >
                <View className={styles.categoryIcon}>
                  <Text>{category.icon}</Text>
                </View>
                <Text className={styles.categoryName}>
                  {language === 'en' ? category.nameEn : category.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.flashSaleSection}>
          <View className={styles.flashSaleHeader}>
            <View className={styles.flashSaleTitle}>
              <Text>⚡ 限时特惠</Text>
              <Text className={styles.flashSaleBadge}>HOT</Text>
            </View>
            <View className={styles.countdown}>
              距结束 {countdown}
            </View>
          </View>
          <ScrollView scrollX className={styles.flashSaleList}>
            {newProducts.slice(0, 6).map((product) => (
              <View
                key={product.id}
                className={styles.flashSaleItem}
                onClick={() =>
                  Taro.navigateTo({ url: `/pages/product-detail/index?id=${product.id}` })
                }
              >
                <Image
                  className={styles.flashSaleImage}
                  src={product.images[0]}
                  mode="aspectFill"
                />
                <View className={styles.flashSaleContent}>
                  <Text className={styles.flashSaleName}>{product.name}</Text>
                  <View>
                    <Text className={styles.flashSalePrice}>
                      ¥{(product.price * 0.8).toFixed(2)}
                    </Text>
                    <Text className={styles.flashSaleOriginalPrice}>¥{product.price}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.hotSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>🔥</Text>
              {t('hotRecommend')}
            </Text>
            <Text className={styles.sectionMore}>查看更多 ›</Text>
          </View>
          <View className={styles.productGrid}>
            {hotProducts.slice(0, 4).map((product) => (
              <View key={product.id} className={styles.productGridItem}>
                <ProductCard product={product} showWholesale={false} />
              </View>
            ))}
          </View>
        </View>

        <View className={styles.recommendSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>✨</Text>
              {t('forYou')}
            </Text>
            <Text className={styles.sectionMore}>查看更多 ›</Text>
          </View>
          <View className={styles.productGrid}>
            {recommendProducts.map((product) => (
              <View key={product.id} className={styles.productGridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        </View>

        {loading && (
          <View className={styles.loadingMore}>
            <Text>加载中...</Text>
          </View>
        )}
      </ScrollView>

      {showLocaleModal && (
        <View className={styles.localeModal} onClick={() => setShowLocaleModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>语言 / 币种设置</Text>

            <View className={styles.modalSection}>
              <Text className={styles.modalSectionTitle}>选择语言</Text>
              <View className={styles.optionGrid}>
                {languages.map((lang) => (
                  <Button
                    key={lang.value}
                    className={classnames(styles.optionItem, tempLanguage === lang.value && styles.active)}
                    onClick={() => setTempLanguage(lang.value)}
                  >
                    {lang.label}
                  </Button>
                ))}
              </View>
            </View>

            <View className={styles.modalSection}>
              <Text className={styles.modalSectionTitle}>选择币种</Text>
              <View className={styles.optionGrid}>
                {currencies.map((cur) => (
                  <Button
                    key={cur.value}
                    className={classnames(styles.optionItem, tempCurrency === cur.value && styles.active)}
                    onClick={() => setTempCurrency(cur.value)}
                  >
                    {cur.label}
                  </Button>
                ))}
              </View>
            </View>

            <Button className={styles.closeBtn} onClick={confirmLocale}>
              确认设置
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomePage;
