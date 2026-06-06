import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Product } from '@/types/product';
import { formatPrice, formatNumber } from '@/utils/format';
import { useTranslation } from '@/store/useLocaleStore';

interface ProductCardProps {
  product: Product;
  showWholesale?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showWholesale = true }) => {
  const t = useTranslation();

  const handleClick = () => {
    console.log('[ProductCard] Click product:', product.id);
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${product.id}`
    });
  };

  const getTagClass = (tag: string) => {
    if (tag === '热销') return styles.hotTag;
    if (tag === '新品') return styles.newTag;
    return '';
  };

  return (
    <View className={styles.productCard} onClick={handleClick}>
      <View className={styles.imageWrapper}>
        <Image
          className={styles.productImage}
          src={product.images[0]}
          mode="aspectFill"
          onError={(e) => console.error('[ProductCard] Image load error:', e)}
        />
        {product.tags && product.tags.length > 0 && (
          <View className={styles.tagList}>
            {product.tags.slice(0, 2).map((tag) => (
              <Text
                key={tag}
                className={classnames(styles.tag, getTagClass(tag))}
              >
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View className={styles.content}>
        <Text className={styles.productName}>{product.name}</Text>
        <Text className={styles.shopName}>{product.shopName}</Text>
        <View className={styles.priceRow}>
          <Text className={styles.price}>{formatPrice(product.price)}</Text>
          {showWholesale && (
            <Text className={styles.originalPrice}>
              {t('wholesale')}: {formatPrice(product.wholesalePrice)}
            </Text>
          )}
        </View>
        <View className={styles.metaRow}>
          <View className={styles.rating}>
            <Text>★</Text>
            <Text>{product.rating}</Text>
          </View>
          <Text className={styles.sales}>{formatNumber(product.sales)} 已售</Text>
        </View>
        {showWholesale && product.minWholesaleQty > 1 && (
          <Text className={styles.wholesaleTip}>
            {product.minWholesaleQty}件起批
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProductCard;
