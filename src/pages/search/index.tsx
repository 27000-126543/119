import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Input,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, getHotProducts } from '@/data/products';
import type { Product } from '@/types/product';

interface HotKeyword {
  keyword: string;
  hot: string;
  badge?: string;
}

interface SortOption {
  key: string;
  label: string;
  icon: string;
}

const SearchPage: React.FC = () => {
  const t = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hotKeywords] = useState<HotKeyword[]>([
    { keyword: '蓝牙耳机', hot: '2.3万', badge: 'HOT' },
    { keyword: '智能手表', hot: '1.8万', badge: 'NEW' },
    { keyword: '女士手提包', hot: '1.5万' },
    { keyword: '男士运动鞋', hot: '1.2万' },
    { keyword: '护肤套装', hot: '9800' },
    { keyword: '家居用品', hot: '8500' },
    { keyword: '数码配件', hot: '7200' },
    { keyword: '户外运动', hot: '6500' }
  ]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState('default');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const sortOptions: SortOption[] = [
    { key: 'default', label: '综合', icon: '' },
    { key: 'sales', label: '销量', icon: '' },
    { key: 'price', label: '价格', icon: sortAsc ? '↑' : '↓' },
    { key: 'rating', label: '评分', icon: '' }
  ];

  useEffect(() => {
    console.log('[SearchPage] Mounted');
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const history = Taro.getStorageSync('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
        console.log('[SearchPage] History loaded:', history);
      }
    } catch (e) {
      console.error('[SearchPage] Load history error:', e);
    }
  };

  const saveHistory = (keyword: string) => {
    try {
      let newHistory = searchHistory.filter(h => h !== keyword);
      newHistory = [keyword, ...newHistory].slice(0, 10);
      setSearchHistory(newHistory);
      Taro.setStorageSync('searchHistory', JSON.stringify(newHistory));
      console.log('[SearchPage] History saved:', newHistory);
    } catch (e) {
      console.error('[SearchPage] Save history error:', e);
    }
  };

  const clearHistory = () => {
    console.log('[SearchPage] Clear history clicked');
    Taro.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setSearchHistory([]);
          Taro.removeStorageSync('searchHistory');
          Taro.showToast({ title: '已清空', icon: 'success' });
          console.log('[SearchPage] History cleared');
        }
      }
    });
  };

  const handleSearch = useCallback((keyword?: string) => {
    const text = keyword || searchText.trim();
    if (!text) {
      Taro.showToast({ title: '请输入搜索内容', icon: 'none' });
      return;
    }

    console.log('[SearchPage] Search:', text);
    setLoading(true);
    setHasSearched(true);
    saveHistory(text);
    setPage(1);

    setTimeout(() => {
      try {
        const allProducts = getAllProducts();
        const results = allProducts.filter(p =>
          p.name.toLowerCase().includes(text.toLowerCase()) ||
          p.nameEn.toLowerCase().includes(text.toLowerCase()) ||
          p.categoryName.includes(text) ||
          p.tags.some(tag => tag.includes(text))
        );

        if (results.length === 0) {
          const hot = getHotProducts();
          setSearchResults(hot.slice(0, 8));
        } else {
          setSearchResults(results);
        }

        console.log('[SearchPage] Search results count:', searchResults.length);
      } catch (e) {
        console.error('[SearchPage] Search error:', e);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [searchText, searchHistory]);

  const handleHistoryClick = (keyword: string) => {
    console.log('[SearchPage] History clicked:', keyword);
    setSearchText(keyword);
    handleSearch(keyword);
  };

  const handleHotClick = (keyword: string) => {
    console.log('[SearchPage] Hot keyword clicked:', keyword);
    setSearchText(keyword);
    handleSearch(keyword);
  };

  const handleClearInput = () => {
    console.log('[SearchPage] Clear input');
    setSearchText('');
    setHasSearched(false);
    setSearchResults([]);
  };

  const handleCancel = () => {
    console.log('[SearchPage] Cancel clicked');
    Taro.navigateBack();
  };

  const handleSort = (key: string) => {
    console.log('[SearchPage] Sort clicked:', key);
    if (key === activeSort && key === 'price') {
      setSortAsc(!sortAsc);
    } else {
      setActiveSort(key);
    }
    sortResults(key);
  };

  const sortResults = (key: string) => {
    let sorted = [...searchResults];
    switch (key) {
      case 'sales':
        sorted.sort((a, b) => b.sales - a.sales);
        break;
      case 'price':
        sorted.sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    setSearchResults(sorted);
  };

  const handleScrollToLower = () => {
    if (hasSearched && searchResults.length > 0) {
      console.log('[SearchPage] Reach bottom, loading more...');
      setLoading(true);
      setTimeout(() => {
        const hot = getHotProducts();
        const more = hot.slice(0, 4).map((p, i) => ({
          ...p,
          id: `${p.id}_more_${page}_${i}`
        }));
        setSearchResults(prev => [...prev, ...more]);
        setPage(prev => prev + 1);
        setLoading(false);
        console.log('[SearchPage] More loaded:', more.length);
      }, 800);
    }
  };

  const getRankClass = (index: number) => {
    if (index === 0) return styles.rank1;
    if (index === 1) return styles.rank2;
    if (index === 2) return styles.rank3;
    return styles.rankOther;
  };

  return (
    <View className={styles.searchPage}>
      <View className={styles.searchHeader}>
        <View className={styles.searchInputWrapper}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder={t('search')}
            value={searchText}
            focus
            confirmType="search"
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={() => handleSearch()}
          />
          {searchText && (
            <Button className={styles.clearBtn} onClick={handleClearInput}>
              <Text>×</Text>
            </Button>
          )}
        </View>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
      </View>

      {hasSearched && (
        <View className={styles.filterBar}>
          {sortOptions.map((option) => (
            <Text
              key={option.key}
              className={classnames(
                styles.filterItem,
                activeSort === option.key && styles.active
              )}
              onClick={() => handleSort(option.key)}
            >
              <Text>{option.label}</Text>
              {option.icon && (
                <Text className={styles.filterIcon}>{option.icon}</Text>
              )}
            </Text>
          ))}
        </View>
      )}

      <ScrollView scrollY className={styles.content} onScrollToLower={handleScrollToLower}>
        {!hasSearched ? (
          <>
            {searchHistory.length > 0 && (
              <View className={styles.historySection}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>
                    <Text className={styles.sectionIcon}>🕐</Text>
                    搜索历史
                  </Text>
                  <Button className={styles.clearHistoryBtn} onClick={clearHistory}>
                    <Text>🗑️</Text>
                    <Text>清空</Text>
                  </Button>
                </View>
                <View className={styles.tagList}>
                  {searchHistory.map((keyword, index) => (
                    <Button
                      key={index}
                      className={styles.tagItem}
                      onClick={() => handleHistoryClick(keyword)}
                    >
                      {keyword}
                    </Button>
                  ))}
                </View>
              </View>
            )}

            <View className={styles.hotSection}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>
                  <Text className={styles.sectionIcon}>🔥</Text>
                  热门搜索
                </Text>
              </View>
              <View className={styles.hotList}>
                {hotKeywords.map((item, index) => (
                  <View
                    key={index}
                    className={styles.hotItem}
                    onClick={() => handleHotClick(item.keyword)}
                  >
                    <View className={`${styles.hotRank} ${getRankClass(index)}`}>
                      <Text>{index + 1}</Text>
                    </View>
                    <Text className={styles.hotKeyword}>
                      {item.keyword}
                      {item.badge && (
                        <Text className={styles.hotBadge}>{item.badge}</Text>
                      )}
                    </Text>
                    <Text className={styles.hotMeta}>{item.hot}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View className={styles.resultsSection}>
            <View className={styles.resultsHeader}>
              <Text className={styles.resultsCount}>
                找到 {searchResults.length} 个相关商品
              </Text>
              <Text className={styles.resultsCount}>
                {formatPrice.name}
              </Text>
            </View>
            {searchResults.length > 0 ? (
              <>
                <View className={styles.productGrid}>
                  {searchResults.map((product) => (
                    <View key={product.id} className={styles.productGridItem}>
                      <ProductCard product={product} />
                    </View>
                  ))}
                </View>
                {loading && (
                  <View className={styles.loadingMore}>
                    <Text>加载中...</Text>
                  </View>
                )}
              </>
            ) : (
              !loading && (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyIcon}>🔍</Text>
                  <Text className={styles.emptyText}>暂无相关商品</Text>
                  <Text className={styles.emptyTip}>换个关键词试试吧</Text>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchPage;
