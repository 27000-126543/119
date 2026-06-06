import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Input,
  Button
} from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProductCard from '@/components/ProductCard';
import { mockCategories } from '@/data/categories';
import { mockProducts, getProductsByCategory } from '@/data/products';
import { useTranslation, useLocaleStore } from '@/store/useLocaleStore';
import type { Product } from '@/types/product';

type SortType = 'default' | 'sales' | 'price_asc' | 'price_desc' | 'new';
type PriceType = 'retail' | 'wholesale';

const MarketPage: React.FC = () => {
  const t = useTranslation();
  const { language } = useLocaleStore();
  const [activeCategory, setActiveCategory] = useState('cat001');
  const [sortType, setSortType] = useState<SortType>('default');
  const [priceType, setPriceType] = useState<PriceType>('retail');
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[MarketPage] Mounted, category:', activeCategory);
    loadProducts();
  }, [activeCategory]);

  usePullDownRefresh(() => {
    console.log('[MarketPage] Pull down refresh');
    loadProducts();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadProducts = () => {
    setLoading(true);
    try {
      const categoryProducts = getProductsByCategory(activeCategory);
      setProducts(categoryProducts.length > 0 ? categoryProducts : mockProducts.slice(0, 8));
      console.log('[MarketPage] Products loaded:', products.length);
    } catch (e) {
      console.error('[MarketPage] Load products error:', e);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = useMemo(() => {
    let result = [...products];
    
    if (keyword) {
      result = result.filter(
        (p) => p.name.includes(keyword) || p.nameEn.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    switch (sortType) {
      case 'sales':
        result.sort((a, b) => b.sales - a.sales);
        break;
      case 'price_asc':
        result.sort((a, b) => (priceType === 'wholesale' ? a.wholesalePrice - b.wholesalePrice : a.price - b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => (priceType === 'wholesale' ? b.wholesalePrice - a.wholesalePrice : b.price - a.price));
        break;
      case 'new':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [products, sortType, keyword, priceType]);

  const handleCategoryClick = (categoryId: string) => {
    console.log('[MarketPage] Category clicked:', categoryId);
    setActiveCategory(categoryId);
  };

  const handleSortClick = (sort: SortType) => {
    console.log('[MarketPage] Sort changed:', sort);
    if (sortType === sort && (sort === 'price_asc' || sort === 'price_desc')) {
      setSortType(sort === 'price_asc' ? 'price_desc' : 'price_asc');
    } else {
      setSortType(sort);
    }
  };

  const handleSearch = () => {
    console.log('[MarketPage] Search:', keyword);
    loadProducts();
  };

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'default', label: '综合' },
    { value: 'sales', label: '销量' },
    { value: 'price_asc', label: sortType === 'price_asc' ? '价格↑' : '价格' },
    { value: 'new', label: '新品' }
  ];

  return (
    <View className={styles.marketPage}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder={t('search')}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
        <View className={styles.priceToggle}>
          <Button
            className={classnames(styles.priceToggleBtn, priceType === 'retail' && styles.active)}
            onClick={() => setPriceType('retail')}
          >
            {t('retail')}
          </Button>
          <Button
            className={classnames(styles.priceToggleBtn, priceType === 'wholesale' && styles.active)}
            onClick={() => setPriceType('wholesale')}
          >
            {t('wholesale')}
          </Button>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {sortOptions.map((option) => (
          <View
            key={option.value}
            className={classnames(styles.filterItem, sortType === option.value && styles.active)}
            onClick={() => handleSortClick(option.value)}
          >
            <Text>{option.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <ScrollView scrollY className={styles.categorySidebar}>
          {mockCategories.map((category) => (
            <View
              key={category.id}
              className={classnames(styles.categoryItem, activeCategory === category.id && styles.active)}
              onClick={() => handleCategoryClick(category.id)}
            >
              <Text className={styles.categoryIcon}>{category.icon}</Text>
              <Text>{language === 'en' ? category.nameEn : category.name}</Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView scrollY className={styles.productsContainer}>
          {sortedProducts.length > 0 ? (
            <View>
              <View className={styles.productGrid}>
                {sortedProducts.map((product) => (
                  <View key={product.id} className={styles.productGridItem}>
                    <ProductCard product={product} showWholesale={priceType === 'wholesale'} />
                  </View>
                ))}
              </View>
              {loading && (
                <View className={styles.loadingMore}>
                  <Text>加载中...</Text>
                </View>
              )}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无相关商品</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default MarketPage;
