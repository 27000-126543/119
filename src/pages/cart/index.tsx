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
import { useOrderStore } from '@/store/useOrderStore';
import ProductCard from '@/components/ProductCard';
import { mockProducts as products } from '@/data/products';
import type { SplitOrderResult } from '@/types/warehouse';

const CartPage: React.FC = () => {
  const t = useTranslation();
  const { items, toggleItem, updateQuantity, removeItem, toggleAll, getSelectedItems, clearSelected } = useCartStore();
  const { user } = useUserStore();
  const { previewSplitOrder, clearSplitResults, isLoading } = useOrderStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  const [splitResults, setSplitResults] = useState<SplitOrderResult[]>([]);

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
    
    console.log('[CartPage] Previewing order split...');
    const results = previewSplitOrder(selectedItems, user.country || 'CN');
    setSplitResults(results);
    setShowSplitPreview(true);
    
    console.log('[CartPage] Split preview:', results.length, 'orders');
  };

  const handleProceedToPayment = async () => {
    console.log('[CartPage] Proceeding to payment...');
    Taro.showLoading({ title: '创建订单中...' });
    
    try {
      const { createOrdersFromCart } = useOrderStore.getState();
      const address = {
        name: user?.nickname || '买家',
        phone: user?.phone || '',
        country: user?.country || 'CN',
        province: '浙江省',
        city: '杭州市',
        address: '西湖区文三路123号',
        postalCode: '310000'
      };
      
      const orders = await createOrdersFromCart(
        user?.country || 'CN',
        address,
        'standard'
      );
      
      Taro.hideLoading();
      
      if (orders.length > 0) {
        Taro.showToast({ title: '订单创建成功', icon: 'success' });
        const orderIds = orders.map(o => o.id).join(',');
        const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);
        
        setTimeout(() => {
          Taro.navigateTo({ 
            url: `/pages/payment/index?orderIds=${orderIds}&totalAmount=${totalAmount}` 
          });
        }, 800);
      }
    } catch (error: any) {
      Taro.hideLoading();
      Taro.showToast({ title: error.message || '创建订单失败', icon: 'none' });
    }
  };

  const handleCloseSplitPreview = () => {
    setShowSplitPreview(false);
    clearSplitResults();
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
              disabled={selectedItems.length === 0 || isLoading}
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

      {showSplitPreview && (
        <View className={styles.modalOverlay} onClick={handleCloseSplitPreview}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>订单拆单预览</Text>
              <Text className={styles.modalClose} onClick={handleCloseSplitPreview}>×</Text>
            </View>
            
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.splitInfo}>
                <Text className={styles.splitInfoText}>
                  根据商品库存和收货地址，系统将自动拆分为 <Text className={styles.splitInfoHighlight}>{splitResults.length}</Text> 个订单发货
                </Text>
              </View>

              {splitResults.map((split, index) => (
                <View key={index} className={styles.splitOrderCard}>
                  <View className={styles.splitOrderHeader}>
                    <Text className={styles.splitOrderTitle}>子订单 {index + 1}</Text>
                    <Text className={styles.splitOrderWarehouse}>
                      📦 {split.warehouseName}
                    </Text>
                  </View>
                  
                  {split.items.map((item, itemIndex) => (
                    <View key={itemIndex} className={styles.splitOrderItem}>
                      <Image className={styles.splitItemImage} src={item.image} mode="aspectFill" />
                      <View className={styles.splitItemInfo}>
                        <Text className={styles.splitItemName}>{item.name}</Text>
                        <Text className={styles.splitItemSpec}>{Object.values(item.specs).join(' / ')}</Text>
                        <Text className={styles.splitItemPrice}>
                          {formatPrice(item.price)} × {item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View className={styles.splitOrderSummary}>
                    <View className={styles.summaryRow}>
                      <Text className={styles.summaryLabel}>商品金额</Text>
                      <Text className={styles.summaryValue}>{formatPrice(split.subtotal)}</Text>
                    </View>
                    <View className={styles.summaryRow}>
                      <Text className={styles.summaryLabel}>运费</Text>
                      <Text className={styles.summaryValue}>{formatPrice(split.shippingFee)}</Text>
                    </View>
                    <View className={styles.summaryRow}>
                      <Text className={styles.summaryLabel}>税费</Text>
                      <Text className={styles.summaryValue}>{formatPrice(split.tax)}</Text>
                    </View>
                    <View className={styles.summaryRow}>
                      <Text className={styles.summaryLabel}>小计</Text>
                      <Text className={styles.summaryValueHighlight}>{formatPrice(split.total)}</Text>
                    </View>
                  </View>
                </View>
              ))}

              <View className={styles.splitTotal}>
                <Text className={styles.splitTotalLabel}>订单总计</Text>
                <Text className={styles.splitTotalValue}>
                  {formatPrice(splitResults.reduce((sum, s) => sum + s.total, 0))}
                </Text>
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={handleCloseSplitPreview}>
                取消
              </Button>
              <Button 
                className={styles.confirmBtn} 
                onClick={handleProceedToPayment}
                disabled={isLoading}
              >
                {isLoading ? '创建中...' : '确认并支付'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CartPage;
