import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Order } from '@/types/order';
import { formatPrice, getStatusColor } from '@/utils/format';
import { useTranslation } from '@/store/useLocaleStore';

interface OrderItemProps {
  order: Order;
  onConfirmReceive?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onPay?: (orderId: string) => void;
  onReturn?: (orderId: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onConfirmReceive,
  onCancel,
  onPay,
  onReturn
}) => {
  const t = useTranslation();

  const handleClick = () => {
    console.log('[OrderItem] Click order:', order.id);
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const renderActions = () => {
    const actions = [];

    switch (order.status) {
      case 'pending_payment':
        actions.push(
          <Button
            key="cancel"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.(order.id);
            }}
          >
            取消订单
          </Button>
        );
        actions.push(
          <Button
            key="pay"
            className={classnames(styles.actionBtn, styles.primaryBtn)}
            onClick={(e) => {
              e.stopPropagation();
              onPay?.(order.id);
            }}
          >
            去付款
          </Button>
        );
        break;
      case 'shipped':
        actions.push(
          <Button
            key="logistics"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              Taro.navigateTo({ url: `/pages/logistics/index?id=${order.id}` });
            }}
          >
            {t('logistics')}
          </Button>
        );
        actions.push(
          <Button
            key="confirm"
            className={classnames(styles.actionBtn, styles.primaryBtn)}
            onClick={(e) => {
              e.stopPropagation();
              onConfirmReceive?.(order.id);
            }}
          >
            {t('confirmReceive')}
          </Button>
        );
        break;
      case 'completed':
        actions.push(
          <Button
            key="return"
            className={classnames(styles.actionBtn, styles.primaryBtn)}
            onClick={(e) => {
              e.stopPropagation();
              onReturn?.(order.id);
            }}
          >
            {t('returnRequest')}
          </Button>
        );
        break;
      default:
        break;
    }

    return actions;
  };

  return (
    <View className={styles.orderItem} onClick={handleClick}>
      <View className={styles.orderHeader}>
        <Text className={styles.shopName}>{order.items[0]?.shopName}</Text>
        <Text className={styles.status} style={{ color: getStatusColor(order.status) }}>
          {order.statusText}
        </Text>
      </View>

      <View className={styles.productList}>
        {order.items.map((item) => (
          <View
            key={`${item.productId}-${item.skuId}`}
            className={styles.productItem}
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(item.productId);
            }}
          >
            <Image
              className={styles.productImage}
              src={item.productImage}
              mode="aspectFill"
            />
            <View className={styles.productInfo}>
              <View>
                <Text className={styles.productName}>{item.productName}</Text>
                <Text className={styles.productSpec}>{item.skuSpec}</Text>
              </View>
              <View className={styles.productPriceRow}>
                <Text className={styles.price}>{formatPrice(item.price)}</Text>
                <Text className={styles.quantity}>x{item.quantity}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.orderFooter}>
        <View className={styles.totalInfo}>
          共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品，
          合计 <Text className={styles.totalPrice}>{formatPrice(order.total)}</Text>
        </View>
        <View className={styles.actions}>{renderActions()}</View>
      </View>
    </View>
  );
};

export default OrderItem;
