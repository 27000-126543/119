import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import ProductCard from '@/components/ProductCard';
import { mockProducts as products } from '@/data/products';

const CartPage: React.FC = () => {
  const t = useTranslation();
  const { items, toggleItem, updateQuantity, removeItem, toggleAll, getSelectedItems, clearSelected } = useCartStore();
  const { user } = useUserStore();
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    console.log('[CartPage] Mounted, items count:', items.length);
  }, [items.length]);

  usePullDownRefresh(() => {
    console.log('[CartPage] Pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      const shopId = item.shopId || 'default';
      if (!groups[shopId]) {
        groups[shopId] = [];
      }
      groups[shopId].push(item);
    });
    return groups;
  }, [items]);

  const allSelected = useMemo(() => {
    return items.length > 0 && items.every(item => item.selected);
  }, [items]);

  const selectedItems = useMemo(() => getSelectedItems(), [items]);

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedItems]);

  const totalCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);
    updateQuantity(itemId, newQuantity);
    console.log('[CartPage] Quantity changed:', itemId, newQuantity);
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请选择要删除的商品', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '提示',
      content: `确定删除选中的 ${selectedItems.length} 件商品吗？`,
      success: (res) => {
        if (res.confirm) {
          selectedItems.forEach(item => removeItem(item.id));
          Taro.showToast({ title: '删除成功', icon: 'success' });
          console.log('[CartPage] Deleted items:', selectedItems.length);
          if (isEditMode && items.length === 0) {
            setIsEditMode(false);
          }
        }
      }
    });
  };

  const handleSettle = () => {
    if (!user?.isLoggedIn) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    console.log('[CartPage] Settle items:', selectedItems.length, 'total:', totalPrice);
    Taro.navigateTo({ url: '/pages/payment/index' });
  };

  const handleShopSelectAll = (shopId: string) => {
    const shopItems = groupedItems[shopId] || [];
    const allSelected = shopItems.every(item => item.selected);
    shopItems.forEach(item => {
      if (item.selected === allSelected) {
        toggleItem(item.id);
      }
    });
    console.log('[CartPage] Shop select all:', shopId, !allSelected);
  };

  const handleGoShopping = () => {
    console.log('[CartPage] Go shopping');
    Taro.switchTab({ url: '/pages/home/index' });
  };

  const recommendProducts = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <View className={styles.cartPage}>
        <ScrollView scrollY>
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🛒</Text>
            <Text className={styles.emptyText}>购物车空空如也，快去逛逛吧~</Text>
            <Button className={styles.goShoppingBtn} onClick={handleGoShopping}>
              去逛逛
            </Button>
          </View>

          <View className={styles.recommendSection}>
            <Text className={styles.recommendTitle}>为你推荐</Text>
            <View className={styles.recommendGrid}>
              {recommendProducts.map(product => (
                <View key={product.id} style={{ width: '50%', padding: 8 }}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className={styles.cartPage}>
      <View className={styles.header}>
        <Text className={styles.title}>购物车 ({items.length})</Text>
        <Text className={styles.editBtn} onClick={() => setIsEditMode(!isEditMode)}>
          {isEditMode ? '完成' : '编辑'}
        </Text>
      </View>

      <ScrollView scrollY className={styles.cartContent}>
        <View className={styles.couponBar}>
          <View className={styles.couponInfo}>
            <Text className={styles.couponIcon}>🎫</Text>
            <Text className={styles.couponText}>
              有 <Text className={styles.couponCount}>{user?.coupons || 0}</Text> 张优惠券可用
            </Text>
          </View>
          <Text>›</Text>
        </View>

        {Object.entries(groupedItems).map(([shopId, shopItems]) => {
          const shopName = shopItems[0]?.shopName || '商家店铺';
          const shopAllSelected = shopItems.every(item => item.selected);
          return (
            <View key={shopId} className={styles.shopGroup}>
              <View className={styles.shopHeader} onClick={() => handleShopSelectAll(shopId)}>
                <View className={classnames(styles.shopCheckbox, shopAllSelected && styles.shopCheckboxChecked)}>
                  {shopAllSelected && <Text>✓</Text>}
                </View>
                <Text className={styles.shopIcon}>🏪</Text>
                <Text className={styles.shopName}>{shopName}</Text>
                <Text className={styles.shopArrow}>›</Text>
              </View>

              {shopItems.map(item => (
                <View key={item.id} className={styles.cartItem}>
                  <View className={styles.itemCheckbox} onClick={() => toggleItem(item.id)}>
                    <View className={classnames(styles.checkbox, item.selected && styles.checkboxChecked)}>
                      {item.selected && <Text>✓</Text>}
                    </View>
                  </View>
                  <Image className={styles.itemImage} src={item.image} mode="aspectFill" />
                  <View className={styles.itemInfo}>
                    <View>
                      <Text className={styles.itemName}>{item.name}</Text>
                      <Text className={styles.itemSpecs}>
                        {Object.values(item.specs).join(' / ')}
                      </Text>
                    </View>
                    <View className={styles.itemBottom}>
                      <View>
                        <Text className={styles.itemPrice}>{formatPrice(item.price)}</Text>
                        {item.price < item.originalPrice && (
                          <Text className={styles.itemOriginalPrice}>
                            {formatPrice(item.originalPrice)}
                          </Text>
                        )}
                        {item.isWholesale && (
                          <Text className={styles.wholesaleBadge}>批发</Text>
                        )}
                      </View>
                      <View className={styles.quantityControl}>
                        <Button
                          className={classnames(styles.quantityBtn, item.quantity <= 1 && styles.quantityBtnDisabled)}
                          disabled={item.quantity <= 1}
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          -
                        </Button>
                        <Text className={styles.quantityValue}>{item.quantity}</Text>
                        <Button
                          className={styles.quantityBtn}
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          +
                        </Button>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        <View className={styles.recommendSection}>
          <Text className={styles.recommendTitle}>为你推荐</Text>
          <View className={styles.recommendGrid}>
            {recommendProducts.map(product => (
              <View key={product.id} style={{ width: '50%', padding: 8 }}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.selectAll} onClick={() => toggleAll()}>
          <View className={classnames(styles.checkbox, allSelected && styles.checkboxChecked)}>
            {allSelected && <Text>✓</Text>}
          </View>
          <Text className={styles.selectAllText}>全选</Text>
        </View>

        {!isEditMode ? (
          <>
            <View className={styles.totalInfo}>
              <Text className={styles.totalLabel}>合计:</Text>
              <Text className={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>
            <Button
              className={classnames(styles.settleBtn, selectedItems.length === 0 && styles.settleBtnDisabled)}
              disabled={selectedItems.length === 0}
              onClick={handleSettle}
            >
              去结算 ({totalCount})
            </Button>
          </>
        ) : (
          <Button className={styles.deleteBtn} onClick={handleDelete}>
            删除 ({selectedItems.length})
          </Button>
        )}
      </View>
    </View>
  );
};

export default CartPage;
