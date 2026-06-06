import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ScrollView,
  Input
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';
import type { OrderItem } from '@/types/order';

interface PaymentMethod {
  id: string;
  name: string;
  desc: string;
  icon: string;
  iconClass: string;
  badge?: string;
}

const PaymentPage: React.FC = () => {
  useTranslation();
  const router = useRouter();
  const { createPaymentOrder, processPayment, isProcessing } = usePaymentStore();
  const { getOrderDetail } = useOrderStore();
  const { user } = useUserStore();
  const cartItems = useCartStore((state) => state.getSelectedItems());
  const clearSelected = useCartStore((state) => state.clearSelected);

  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<string>('alipay');
  const [orderNote, setOrderNote] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'alipay',
      name: '支付宝',
      desc: '推荐使用，安全快捷',
      icon: '💳',
      iconClass: styles.methodIconAlipay,
      badge: '推荐'
    },
    {
      id: 'wechat',
      name: '微信支付',
      desc: '微信扫码支付',
      icon: '💬',
      iconClass: styles.methodIconWechat
    },
    {
      id: 'card',
      name: '银行卡',
      desc: '信用卡/借记卡支付',
      icon: '🏦',
      iconClass: styles.methodIconCard
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      desc: 'Touch ID 快速支付',
      icon: '🍎',
      iconClass: styles.methodIconApple
    }
  ];

  const address = {
    name: '张三',
    phone: '138****8888',
    country: '中国',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区高新南一道8号创维大厦A座1801室',
    postalCode: '518000'
  };

  const shippingFee = 25;
  const taxRate = 0.13;

  const displayItems = useMemo(() => {
    if (orders.length > 0) {
      return orders.flatMap(order => order.items.map((item: OrderItem) => ({
        ...item,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        skuId: item.skuId,
        skuSpec: item.skuSpec,
        price: item.price,
        quantity: item.quantity
      })));
    }
    return cartItems;
  }, [orders, cartItems]);

  const calculations = useMemo(() => {
    if (orders.length > 0 && totalAmount > 0) {
      const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
      const totalShipping = orders.reduce((sum, order) => sum + order.shippingFee, 0);
      const totalTax = orders.reduce((sum, order) => sum + order.tax, 0);
      const discount = subtotal > 1000 ? 50 : 0;
      const total = totalAmount;
      return { subtotal, discount, tax: totalTax, total, shippingFee: totalShipping };
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal > 1000 ? 50 : 0;
    const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
    const total = subtotal - discount + shippingFee + tax;
    return { subtotal, discount, tax, total, shippingFee };
  }, [orders, cartItems, totalAmount]);

  useEffect(() => {
    const loadOrders = async () => {
      console.log('[PaymentPage] Mounted');
      
      const { orderIds: orderIdsParam, totalAmount: totalAmountParam } = router.params;
      
      if (orderIdsParam) {
        try {
          const parsedOrderIds = JSON.parse(decodeURIComponent(orderIdsParam));
          setOrderIds(parsedOrderIds);
          console.log('[PaymentPage] Parsed orderIds:', parsedOrderIds);
          
          const loadedOrdersPromises = parsedOrderIds.map((id: string) => getOrderDetail(id));
          const loadedOrders = (await Promise.all(loadedOrdersPromises)).filter(Boolean);
          setOrders(loadedOrders);
          console.log('[PaymentPage] Loaded orders:', loadedOrders.length);
        } catch (e) {
          console.error('[PaymentPage] Failed to parse orderIds:', e);
        }
      }
      
      if (totalAmountParam) {
        const parsedAmount = parseFloat(decodeURIComponent(totalAmountParam));
        setTotalAmount(parsedAmount);
        console.log('[PaymentPage] Parsed totalAmount:', parsedAmount);
      }
      
      console.log('[PaymentPage] Cart items count:', cartItems.length);
      if (cartItems.length === 0 && orders.length === 0) {
        console.warn('[PaymentPage] No items selected for payment');
      }
    };
    
    loadOrders();
  }, [router.params, getOrderDetail, cartItems.length, orders.length]);

  const handleAddressClick = () => {
    console.log('[PaymentPage] Address clicked');
    Taro.showToast({ title: '选择收货地址', icon: 'none' });
  };

  const handleProductClick = (productId: string) => {
    console.log('[PaymentPage] Product clicked:', productId);
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const handleMethodSelect = (methodId: string) => {
    console.log('[PaymentPage] Payment method selected:', methodId);
    setSelectedMethod(methodId);
  };

  const handleCouponClick = () => {
    console.log('[PaymentPage] Coupon clicked');
    Taro.showToast({ title: '选择优惠券', icon: 'none' });
  };

  const handlePay = async () => {
    if (displayItems.length === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    console.log('[PaymentPage] Pay clicked');
    console.log('[PaymentPage] Payment method:', selectedMethod);
    console.log('[PaymentPage] Order amount:', calculations.total);

    Taro.showLoading({ title: '支付中...', mask: true });

    try {
      let finalOrderIds = orderIds;
      let finalTotalAmount = totalAmount > 0 ? totalAmount : calculations.total;

      if (finalOrderIds.length === 0) {
        console.log('[PaymentPage] No orderIds from route, using cart flow');
        Taro.showToast({ title: '请先创建订单', icon: 'none' });
        Taro.hideLoading();
        return;
      }

      console.log('[PaymentPage] Creating payment order for orders:', finalOrderIds);
      const paymentOrder = await createPaymentOrder(finalOrderIds, finalTotalAmount, 'CNY');
      
      if (!paymentOrder) {
        throw new Error('创建支付订单失败');
      }

      console.log('[PaymentPage] Payment order created:', paymentOrder.id);

      const paymentMethodMap: Record<string, 'alipay' | 'wechat' | 'card' | 'apple_pay'> = {
        alipay: 'alipay',
        wechat: 'wechat',
        card: 'card',
        apple: 'apple_pay'
      };

      const method = paymentMethodMap[selectedMethod] || 'alipay';
      console.log('[PaymentPage] Processing payment with method:', method);
      
      const paymentResult = await processPayment(paymentOrder.id, method);
      
      if (!paymentResult || !paymentResult.success) {
        throw new Error(paymentResult?.message || '支付失败');
      }

      console.log('[PaymentPage] Payment successful:', paymentResult.transactionId);
      Taro.hideLoading();
      Taro.showToast({ title: '支付成功', icon: 'success' });

      clearSelected();
      console.log('[PaymentPage] Cart cleared');

      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/orders/index' });
      }, 1500);
    } catch (e: any) {
      console.error('[PaymentPage] Payment error:', e);
      Taro.hideLoading();
      Taro.showToast({ title: e.message || '支付失败，请重试', icon: 'none' });
    }
  };

  const handleNoteChange = (e: any) => {
    setOrderNote(e.detail.value);
    console.log('[PaymentPage] Order note changed:', e.detail.value);
  };

  const getMethodName = () => {
    return paymentMethods.find(m => m.id === selectedMethod)?.name || '';
  };

  return (
    <View className={styles.paymentPage}>
      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📍</Text>
            <Text className={styles.sectionTitle}>收货地址</Text>
          </View>
          <View className={styles.addressCard} onClick={handleAddressClick}>
            <Text className={styles.addressIcon}>📍</Text>
            <View className={styles.addressInfo}>
              <View className={styles.addressTop}>
                <Text className={styles.addressName}>{address.name}</Text>
                <Text className={styles.addressPhone}>{address.phone}</Text>
              </View>
              <Text className={styles.addressDetail}>
                {address.country} {address.province} {address.city} {address.district} {address.detail}
              </Text>
            </View>
            <Text className={styles.addressArrow}>›</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📦</Text>
            <Text className={styles.sectionTitle}>商品清单</Text>
          </View>
          <View className={styles.productList}>
            {displayItems.map((item: any, index: number) => (
              <View
                key={`${item.productId}-${item.skuId}-${index}`}
                className={styles.productItem}
                onClick={() => handleProductClick(item.productId)}
              >
                <Image
                  className={styles.productImage}
                  src={item.productImage}
                  mode="aspectFill"
                  onError={(e) => console.error('[PaymentPage] Product image error:', e)}
                />
                <View className={styles.productInfo}>
                  <View>
                    <Text className={styles.productName}>{item.productName}</Text>
                    <Text className={styles.productSpec}>{item.skuSpec}</Text>
                  </View>
                  <View className={styles.productBottom}>
                    <Text className={styles.productPrice}>{formatPrice(item.price)}</Text>
                    <Text className={styles.productQuantity}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>💰</Text>
            <Text className={styles.sectionTitle}>费用明细</Text>
          </View>
          <View className={styles.costList}>
            <View className={styles.costItem}>
              <Text className={styles.costLabel}>
                <Text className={styles.costLabelIcon}>🛒</Text>
                商品金额
              </Text>
              <Text className={styles.costValue}>{formatPrice(calculations.subtotal)}</Text>
            </View>
            <View className={styles.costItem}>
              <Text className={styles.costLabel}>
                <Text className={styles.costLabelIcon}>🚚</Text>
                运费
              </Text>
              <Text className={styles.costValue}>{formatPrice(calculations.shippingFee)}</Text>
            </View>
            <View className={styles.costItem}>
              <Text className={styles.costLabel}>
                <Text className={styles.costLabelIcon}>📊</Text>
                税费 (13%)
              </Text>
              <Text className={styles.costValue}>{formatPrice(calculations.tax)}</Text>
            </View>
            {calculations.discount > 0 && (
              <View className={styles.costItem}>
                <Text className={styles.costLabel}>
                  <Text className={styles.costLabelIcon}>🎁</Text>
                  优惠
                </Text>
                <Text className={`${styles.costValue} ${styles.costValueDiscount}`}>
                  -{formatPrice(calculations.discount)}
                </Text>
              </View>
            )}
            <View className={styles.costDivider} />
            <View className={styles.totalRow}>
              <Text className={styles.totalLabel}>合计</Text>
              <Text className={styles.totalValue}>{formatPrice(calculations.total)}</Text>
            </View>
          </View>
        </View>

        {calculations.discount > 0 && (
          <View className={styles.section} onClick={handleCouponClick}>
            <View className={styles.couponCard}>
              <View className={styles.couponInfo}>
                <Text className={styles.couponIcon}>🎫</Text>
                <Text className={styles.couponText}>已使用满1000减50优惠券</Text>
              </View>
              <Text className={styles.couponAmount}>-{formatPrice(calculations.discount)}</Text>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>💳</Text>
            <Text className={styles.sectionTitle}>支付方式</Text>
          </View>
          <View className={styles.paymentMethodList}>
            {paymentMethods.map((method) => (
              <View
                key={method.id}
                className={classnames(
                  styles.paymentMethodItem,
                  selectedMethod === method.id && styles.active
                )}
                onClick={() => handleMethodSelect(method.id)}
              >
                <View className={`${styles.methodIcon} ${method.iconClass}`}>
                  <Text>{method.icon}</Text>
                </View>
                <View className={styles.methodInfo}>
                  <Text className={styles.methodName}>
                    {method.name}
                    {method.badge && (
                      <Text className={styles.methodBadge}>{method.badge}</Text>
                    )}
                  </Text>
                  <Text className={styles.methodDesc}>{method.desc}</Text>
                </View>
                <View
                  className={classnames(
                    styles.radioIcon,
                    selectedMethod === method.id && styles.active
                  )}
                >
                  {selectedMethod === method.id && (
                    <View className={styles.radioInner} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitle}>订单备注</Text>
          </View>
          <Input
            className={styles.orderNote}
            placeholder="选填，请输入订单备注..."
            value={orderNote}
            onInput={handleNoteChange}
            maxlength={200}
          />
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.footerTotal}>
          <Text className={styles.footerTotalLabel}>实付金额</Text>
          <Text className={styles.footerTotalValue}>{formatPrice(calculations.total)}</Text>
        </View>
        <Button
          className={classnames(styles.payBtn, isProcessing && styles.disabled)}
          onClick={handlePay}
          disabled={isProcessing || displayItems.length === 0}
        >
          <Text className={styles.secureIcon}>🔒</Text>
          <Text>{isProcessing ? '支付中...' : `立即支付(${getMethodName()})`}</Text>
        </Button>
      </View>
    </View>
  );
};

export default PaymentPage;
