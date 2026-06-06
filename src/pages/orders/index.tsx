import React, { useState, useEffect, useMemo } from 'react';
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
import OrderItem from '@/components/OrderItem';
import { mockOrders, getOrdersByStatus } from '@/data/orders';
import { useTranslation } from '@/store/useLocaleStore';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import { formatPrice } from '@/utils/format';
import type { Order } from '@/types/order';
import type { CartItem } from '@/types/order';

type TabType = 'cart' | 'orders';
type OrderStatus = 'all' | 'pending_payment' | 'pending_shipment' | 'shipped' | 'completed';

const OrdersPage: React.FC = () => {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('cart');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    items: cartItems,
    toggleSelect,
    toggleSelectAll,
    updateQuantity,
    removeItem,
    getSelectedItems,
    getSelectedTotal,
    getSelectedCount,
    getTotalCount
  } = useCartStore();

  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    console.log('[OrdersPage] Mounted, activeTab:', activeTab);
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, orderStatus]);

  usePullDownRefresh(() => {
    console.log('[OrdersPage] Pull down refresh');
    if (activeTab === 'orders') {
      loadOrders();
    }
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadOrders = () => {
    setLoading(true);
    try {
      setOrders(getOrdersByStatus(orderStatus === 'all' ? undefined : orderStatus));
      console.log('[OrdersPage] Orders loaded:', orders.length);
    } catch (e) {
      console.error('[OrdersPage] Load orders error:', e);
    } finally {
      setLoading(false);
    }
  };

  const groupedCartItems = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    cartItems.forEach((item) => {
      if (!groups[item.sellerId]) {
        groups[item.sellerId] = [];
      }
      groups[item.sellerId].push(item);
    });
    return groups;
  }, [cartItems]);

  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
  const selectedTotal = getSelectedTotal();
  const selectedCount = getSelectedCount();
  const totalCount = getTotalCount();

  const handleQuantityChange = (productId: string, skuId: string, delta: number) => {
    const item = cartItems.find((i) => i.productId === productId && i.skuId === skuId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1 || newQuantity > item.stock) return;
    updateQuantity(productId, skuId, newQuantity);
    console.log('[OrdersPage] Quantity changed:', productId, skuId, newQuantity);
  };

  const handleRemoveItem = (productId: string, skuId: string) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          removeItem(productId, skuId);
          Taro.showToast({ title: '已删除', icon: 'success' });
          console.log('[OrdersPage] Item removed:', productId, skuId);
        }
      }
    });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    if (selectedCount === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    console.log('[OrdersPage] Checkout, items:', selectedCount, 'total:', selectedTotal);
    Taro.navigateTo({ url: '/pages/payment/index' });
  };

  const handleConfirmReceive = (orderId: string) => {
    Taro.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, status: 'completed', statusText: '已完成' } : o
            )
          );
          Taro.showToast({ title: '已确认收货', icon: 'success' });
          console.log('[OrdersPage] Order confirmed:', orderId);
        }
      }
    });
  };

  const handleCancelOrder = (orderId: string) => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, status: 'cancelled', statusText: '已取消' } : o
            )
          );
          Taro.showToast({ title: '订单已取消', icon: 'success' });
          console.log('[OrdersPage] Order cancelled:', orderId);
        }
      }
    });
  };

  const handlePay = (orderId: string) => {
    console.log('[OrdersPage] Pay order:', orderId);
    Taro.navigateTo({ url: `/pages/payment/index?orderId=${orderId}` });
  };

  const handleReturn = (orderId: string) => {
    console.log('[OrdersPage] Return order:', orderId);
    Taro.navigateTo({ url: `/pages/return/index?orderId=${orderId}` });
  };

  const handleGoShopping = () => {
    Taro.switchTab({ url: '/pages/market/index' });
  };

  const orderTabs: { value: OrderStatus; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending_payment', label: t('pendingPayment') },
    { value: 'pending_shipment', label: t('pendingShipment') },
    { value: 'shipped', label: t('shipped') },
    { value: 'completed', label: t('completed') }
  ];

  return (
    <View className={styles.ordersPage}>
      <View className={styles.tabHeader}>
        <View
          className={classnames(styles.tabItem, activeTab === 'cart' && styles.active)}
          onClick={() => setActiveTab('cart')}
        >
          <Text>{t('cart')}</Text>
          {totalCount > 0 && <Text className={styles.cartBadge}>{totalCount}</Text>}
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'orders' && styles.active)}
          onClick={() => setActiveTab('orders')}
        >
          <Text>我的订单</Text>
        </View>
      </View>

      {activeTab === 'orders' && (
        <ScrollView scrollX className={styles.orderTabs}>
          {orderTabs.map((tab) => (
            <View
              key={tab.value}
              className={classnames(styles.orderTabItem, orderStatus === tab.value && styles.active)}
              onClick={() => setOrderStatus(tab.value)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <ScrollView scrollY className={styles.content}>
        {activeTab === 'cart' ? (
          cartItems.length > 0 ? (
            <View className={styles.cartList}>
              {Object.entries(groupedCartItems).map(([sellerId, items]) => (
                <View key={sellerId} className={styles.cartItemGroup}>
                  <View className={styles.cartShopHeader}>
                    <View
                      className={classnames(
                        styles.shopCheckbox,
                        items.every((i) => i.selected) && styles.checked
                      )}
                      onClick={() => {
                        const allSelected = items.every((i) => i.selected);
                        items.forEach((item) => {
                          if (item.selected !== !allSelected) {
                            toggleSelect(item.productId, item.skuId);
                          }
                        });
                      }}
                    >
                      {items.every((i) => i.selected) && <Text>✓</Text>}
                    </View>
                    <Text className={styles.shopName}>{items[0]?.shopName}</Text>
                  </View>
                  {items.map((item) => (
                    <View key={`${item.productId}-${item.skuId}`} className={styles.cartItem}>
                      <View
                        className={classnames(styles.itemCheckbox, item.selected && styles.checked)}
                        onClick={() => toggleSelect(item.productId, item.skuId)}
                      >
                        {item.selected && <Text>✓</Text>}
                      </View>
                      <Image
                        className={styles.itemImage}
                        src={item.productImage}
                        mode="aspectFill"
                      />
                      <View className={styles.itemInfo}>
                        <View>
                          <Text className={styles.itemName}>{item.productName}</Text>
                          <Text className={styles.itemSpec}>{item.skuSpec}</Text>
                        </View>
                        <View className={styles.itemBottom}>
                          <Text className={styles.itemPrice}>{formatPrice(item.price)}</Text>
                          <View style={{ display: 'flex', alignItems: 'center' }}>
                            <View className={styles.quantityControl}>
                              <Button
                                className={classnames(
                                  styles.quantityBtn,
                                  item.quantity <= 1 && styles.disabled
                                )}
                                onClick={() => handleQuantityChange(item.productId, item.skuId, -1)}
                              >
                                -
                              </Button>
                              <Text className={styles.quantityValue}>{item.quantity}</Text>
                              <Button
                                className={classnames(
                                  styles.quantityBtn,
                                  item.quantity >= item.stock && styles.disabled
                                )}
                                onClick={() => handleQuantityChange(item.productId, item.skuId, 1)}
                              >
                                +
                              </Button>
                            </View>
                            <Button
                              className={styles.deleteBtn}
                              onClick={() => handleRemoveItem(item.productId, item.skuId)}
                            >
                              删除
                            </Button>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🛒</Text>
              <Text className={styles.emptyText}>购物车是空的，快去选购吧~</Text>
              <Button className={styles.emptyBtn} onClick={handleGoShopping}>
                去逛逛
              </Button>
            </View>
          )
        ) : orders.length > 0 ? (
          <View className={styles.orderList}>
            {orders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onConfirmReceive={handleConfirmReceive}
                onCancel={handleCancelOrder}
                onPay={handlePay}
                onReturn={handleReturn}
              />
            ))}
            {loading && (
              <View className={styles.loadingMore}>
                <Text>加载中...</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📦</Text>
            <Text className={styles.emptyText}>暂无相关订单</Text>
            <Button className={styles.emptyBtn} onClick={handleGoShopping}>
              去逛逛
            </Button>
          </View>
        )}
      </ScrollView>

      {activeTab === 'cart' && cartItems.length > 0 && (
        <View className={styles.cartFooter}>
          <View className={styles.selectAll} onClick={() => toggleSelectAll(!allSelected)}>
            <View className={classnames(styles.selectAllCheckbox, allSelected && styles.checked)}>
              {allSelected && <Text>✓</Text>}
            </View>
            <Text className={styles.selectAllText}>{t('selectAll')}</Text>
          </View>
          <View className={styles.totalInfo}>
            <Text className={styles.totalLabel}>{t('total')}:</Text>
            <Text className={styles.totalPrice}>{formatPrice(selectedTotal)}</Text>
          </View>
          <Button
            className={classnames(styles.checkoutBtn, selectedCount === 0 && styles.disabled)}
            onClick={handleCheckout}
          >
            {t('checkout')}({selectedCount})
          </Button>
        </View>
      )}
    </View>
  );
};

export default OrdersPage;
