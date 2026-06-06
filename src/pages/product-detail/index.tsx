import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Swiper,
  SwiperItem,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation, formatPrice } from '@/store/useLocaleStore';
import { useCartStore } from '@/store/useCartStore';
import { mockProducts as products } from '@/data/products';
import type { Product, SKU } from '@/types/product';

const ProductDetailPage: React.FC = () => {
  const t = useTranslation();
  const { addItem, items } = useCartStore();
  const [productId, setProductId] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [priceMode, setPriceMode] = useState<'retail' | 'wholesale'>('retail');
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const id = (currentPage as any)?.options?.id || '1';
    setProductId(id);
    const found = products.find(p => p.id === id) || products[0];
    setProduct(found);
    console.log('[ProductDetail] Loaded product:', found?.name);
  }, []);

  const currentSKU = useMemo(() => {
    if (!product?.skus || product.skus.length === 0) return null;
    if (product.skus.length === 1) return product.skus[0];
    return product.skus.find(sku => {
      for (const key in selectedSpecs) {
        if (sku.specs[key] !== selectedSpecs[key]) return false;
      }
      return true;
    }) || product.skus[0];
  }, [product, selectedSpecs]);

  const currentPrice = useMemo(() => {
    if (!currentSKU) return product?.retailPrice || 0;
    return priceMode === 'retail' ? currentSKU.retailPrice : currentSKU.wholesalePrice;
  }, [currentSKU, priceMode, product]);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const handleSpecSelect = (specKey: string, specValue: string) => {
    setSelectedSpecs(prev => ({
      ...prev,
      [specKey]: specValue
    }));
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(currentSKU?.stock || 999, quantity + delta));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product || !currentSKU) return;
    
    addItem({
      id: `cart_${Date.now()}`,
      productId: product.id,
      skuId: currentSKU.id,
      name: product.name,
      image: product.images[0],
      price: currentPrice,
      originalPrice: currentSKU.retailPrice,
      quantity,
      specs: { ...currentSKU.specs },
      selected: true,
      shopId: product.shopId,
      shopName: product.shopName,
      isWholesale: priceMode === 'wholesale'
    });

    Taro.showToast({ title: '已加入购物车', icon: 'success' });
    console.log('[ProductDetail] Added to cart:', product.name, quantity);
  };

  const handleBuyNow = () => {
    if (!product || !currentSKU) return;
    
    addItem({
      id: `cart_${Date.now()}`,
      productId: product.id,
      skuId: currentSKU.id,
      name: product.name,
      image: product.images[0],
      price: currentPrice,
      originalPrice: currentSKU.retailPrice,
      quantity,
      specs: { ...currentSKU.specs },
      selected: true,
      shopId: product.shopId,
      shopName: product.shopName,
      isWholesale: priceMode === 'wholesale'
    });

    Taro.navigateTo({ url: '/pages/payment/index' });
    console.log('[ProductDetail] Buy now:', product.name, quantity);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({ 
      title: isFavorite ? '已取消收藏' : '已收藏', 
      icon: 'success' 
    });
    console.log('[ProductDetail] Toggle favorite:', !isFavorite);
  };

  const handleShopClick = () => {
    Taro.showToast({ title: '进入店铺', icon: 'none' });
    console.log('[ProductDetail] Enter shop:', product?.shopName);
  };

  const handleServiceClick = () => {
    Taro.showActionSheet({
      itemList: ['在线客服', '电话客服', '投诉建议'],
      success: (res) => {
        console.log('[ProductDetail] Service selected:', res.tapIndex);
      }
    });
  };

  if (!product) {
    return (
      <View className={styles.detailPage}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.detailPage}>
      <ScrollView scrollY>
        <View className={styles.imageSection}>
          <Swiper
            circular
            autoplay
            current={currentImage}
            onChange={(e) => setCurrentImage(e.detail.current)}
          >
            {product.images.map((img, idx) => (
              <SwiperItem key={idx}>
                <Image className={styles.productImage} src={img} mode="aspectFill" />
              </SwiperItem>
            ))}
          </Swiper>
          <View className={styles.imageIndicator}>
            {currentImage + 1} / {product.images.length}
          </View>
        </View>

        <View className={styles.infoSection}>
          <View className={styles.priceRow}>
            <Text className={styles.price}>{formatPrice(currentPrice)}</Text>
            {currentSKU && currentSKU.retailPrice !== currentSKU.wholesalePrice && (
              <Text className={styles.originalPrice}>
                {formatPrice(currentSKU.retailPrice)}
              </Text>
            )}
            {priceMode === 'wholesale' && (
              <View className={styles.wholesaleBadge}>批发价</View>
            )}
          </View>

          {product.hasWholesale && (
            <View className={styles.priceSwitch}>
              <View
                className={classnames(styles.switchItem, priceMode === 'retail' && styles.switchItemActive)}
                onClick={() => setPriceMode('retail')}
              >
                {t('retailPrice')}
              </View>
              <View
                className={classnames(styles.switchItem, priceMode === 'wholesale' && styles.switchItemActive)}
                onClick={() => setPriceMode('wholesale')}
              >
                {t('wholesalePrice')}
              </View>
            </View>
          )}

          <View className={styles.tagList}>
            {product.tags?.map((tag, idx) => (
              <View 
                key={idx} 
                className={classnames(
                  styles.tag,
                  tag === '热销' && styles.tagHot,
                  tag === '新品' && styles.tagNew,
                  tag === '推荐' && styles.tagRecommend,
                  tag === '促销' && styles.tagSale
                )}
              >
                {tag}
              </View>
            ))}
          </View>

          <Text className={styles.productTitle}>{product.name}</Text>
          <Text className={styles.productSubtitle}>{product.description}</Text>

          <View className={styles.productMeta}>
            <Text>销量 {product.sales}</Text>
            <Text>评价 {product.ratingCount}</Text>
            <Text>评分 {product.rating}</Text>
          </View>
        </View>

        {product.specs && product.specs.length > 0 && (
          <View className={styles.specSection}>
            <View className={styles.sectionTitle}>
              <Text>已选规格</Text>
              <Text className={styles.selectedSpec}>
                {Object.values(selectedSpecs).join(' / ') || '请选择规格'}
              </Text>
            </View>

            {product.specs.map((spec) => (
              <View key={spec.key} className={styles.specGroup}>
                <Text className={styles.specLabel}>{spec.name}</Text>
                <View className={styles.specOptions}>
                  {spec.values.map((value) => {
                    const isActive = selectedSpecs[spec.key] === value;
                    return (
                      <View
                        key={value}
                        className={classnames(
                          styles.specOption,
                          isActive && styles.specOptionActive
                        )}
                        onClick={() => handleSpecSelect(spec.key, value)}
                      >
                        {value}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <View className={styles.quantitySection}>
              <Text className={styles.quantityLabel}>购买数量</Text>
              <View className={styles.quantityControl}>
                <Button
                  className={classnames(styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled)}
                  disabled={quantity <= 1}
                  onClick={() => handleQuantityChange(-1)}
                >
                  -
                </Button>
                <Text className={styles.quantityValue}>{quantity}</Text>
                <Button
                  className={classnames(styles.quantityBtn, quantity >= (currentSKU?.stock || 999) && styles.quantityBtnDisabled)}
                  disabled={quantity >= (currentSKU?.stock || 999)}
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </Button>
              </View>
              <Text className={styles.stockInfo}>库存 {currentSKU?.stock || 0} 件</Text>
            </View>
          </View>
        )}

        <View className={styles.shopSection}>
          <View className={styles.shopAvatar}>
            <Text>🏪</Text>
          </View>
          <View className={styles.shopInfo}>
            <Text className={styles.shopName}>{product.shopName}</Text>
            <Text className={styles.shopDesc}>全球优质供应商 · 已认证</Text>
          </View>
          <Button className={styles.enterShopBtn} onClick={handleShopClick}>
            进入店铺
          </Button>
        </View>

        <View className={styles.detailSection}>
          <View className={styles.sectionTitle}>
            <Text>商品详情</Text>
          </View>
          {product.images.map((img, idx) => (
            <Image key={idx} className={styles.detailImage} src={img} mode="widthFix" />
          ))}
          <Text className={styles.detailText}>
            {product.description}
            {'\n\n'}
            【品质保证】正品保障，假一赔十
            {'\n'}
            【物流说明】全球配送，支持多种物流方式
            {'\n'}
            【售后服务】7天无理由退换，专属客服
          </Text>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.actionIcons}>
          <View className={styles.actionIcon} onClick={handleServiceClick}>
            <Text className={styles.icon}>💬</Text>
            <Text>客服</Text>
          </View>
          <View className={styles.actionIcon} onClick={toggleFavorite}>
            <Text className={styles.icon}>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text>收藏</Text>
          </View>
          <View className={styles.actionIcon} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
            <Text className={styles.icon}>🛒</Text>
            {cartCount > 0 && <Text className={styles.cartBadge}>{cartCount}</Text>}
            <Text>购物车</Text>
          </View>
        </View>

        <View className={styles.actionBtns}>
          <Button className={styles.addCartBtn} onClick={handleAddToCart}>
            加入购物车
          </Button>
          <Button className={styles.buyNowBtn} onClick={handleBuyNow}>
            立即购买
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ProductDetailPage;
