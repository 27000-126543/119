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
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useUserStore } from '@/store/useUserStore';
import { getHotProducts } from '@/data/products';
import type { CartItem } from '@/types/order';

interface ReturnReason {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

interface ProgressStep {
  title: string;
  time: string;
  desc?: string;
  status: 'done' | 'current' | 'pending';
}

interface ReturnProduct extends CartItem {
  selected: boolean;
}

const reasonMap: Record<string, string> = {
  quality: '商品质量问题',
  wrong: '发错货/漏发货',
  size: '尺码/规格不符',
  notlike: '不喜欢/不想要',
  other: '其他原因'
};

const ReturnPage: React.FC = () => {
  useTranslation();
  const router = useRouter();
  const { createReturnRequest, isLoading } = useOrderStore();
  const { user } = useUserStore();
  const cartItems = useCartStore((state) => state.getSelectedItems());
  const [products, setProducts] = useState<ReturnProduct[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [orderNo, setOrderNo] = useState('');

  const reasons: ReturnReason[] = [
    { id: 'quality', name: '商品质量问题', desc: '商品存在瑕疵、破损等质量问题', icon: '🔍' },
    { id: 'wrong', name: '发错货/漏发货', desc: '收到的商品与订单不符或缺件', icon: '📦' },
    { id: 'size', name: '尺码/规格不符', desc: '商品尺码、规格与描述不符', icon: '📏' },
    { id: 'notlike', name: '不喜欢/不想要', desc: '商品与预期不符，个人原因退货', icon: '💔' },
    { id: 'other', name: '其他原因', desc: '其他退货原因，请在备注说明', icon: '📝' }
  ];

  const progressSteps: ProgressStep[] = [
    { title: '提交退货申请', time: '2024-01-15 10:30', status: 'done' },
    { title: '商家审核中', time: '2024-01-15 10:35', desc: '商家需在24小时内处理', status: 'current' },
    { title: '平台介入（若需）', time: '', status: 'pending' },
    { title: '退款中', time: '', status: 'pending' },
    { title: '退款完成', time: '', status: 'pending' }
  ];

  useEffect(() => {
    console.log('[ReturnPage] Mounted');
    console.log('[ReturnPage] Router params:', router.params);

    const { orderId: paramOrderId, productId: paramProductId, productName: paramProductName, orderNo: paramOrderNo, productImage: paramProductImage, price: paramPrice, quantity: paramQuantity, skuId: paramSkuId, skuSpec: paramSkuSpec, sellerId: paramSellerId } = router.params;

    if (paramOrderId && paramProductId) {
      setOrderId(paramOrderId);
      setProductId(paramProductId);
      setOrderNo(paramOrderNo || '');

      const product: ReturnProduct = {
        productId: paramProductId,
        productName: paramProductName || '',
        productImage: paramProductImage || '',
        skuId: paramSkuId || `sku_${paramProductId}`,
        skuSpec: paramSkuSpec || '',
        price: paramPrice ? Number(paramPrice) : 0,
        wholesalePrice: paramPrice ? Number(paramPrice) : 0,
        quantity: paramQuantity ? Number(paramQuantity) : 1,
        stock: 0,
        sellerId: paramSellerId || 's001',
        shopName: '全球优品专营店',
        selected: true
      };
      setProducts([product]);
      console.log('[ReturnPage] Product from router params:', product);
    } else if (cartItems.length > 0) {
      const items: ReturnProduct[] = cartItems.map((item: CartItem, index: number) => ({
        ...item,
        selected: index === 0
      }));
      setProducts(items);
      console.log('[ReturnPage] Products from cart:', items.length);
    } else {
      const hot = getHotProducts();
      const mockProducts: ReturnProduct[] = hot.slice(0, 3).map((product, index) => ({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        skuId: `sku_${product.id}`,
        skuSpec: index === 0 ? '黑色 / 256GB' : index === 1 ? '棕色 / 大号' : '红色 / M码',
        price: product.price,
        wholesalePrice: product.wholesalePrice,
        quantity: 1,
        stock: product.stock,
        sellerId: product.sellerId,
        shopName: product.shopName,
        selected: index === 0
      }));
      setProducts(mockProducts);
      console.log('[ReturnPage] Mock products loaded:', mockProducts.length);
    }
  }, [cartItems, router.params]);

  const handleProductSelect = (productId: string, skuId: string) => {
    console.log('[ReturnPage] Product select:', productId, skuId);
    setProducts(prev => prev.map(p =>
      p.productId === productId && p.skuId === skuId
        ? { ...p, selected: !p.selected }
        : p
    ));
  };

  const handleSelectAll = () => {
    const allSelected = products.every(p => p.selected);
    console.log('[ReturnPage] Select all:', !allSelected);
    setProducts(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const handleReasonSelect = (reasonId: string) => {
    console.log('[ReturnPage] Reason selected:', reasonId);
    setSelectedReason(reasonId);
  };

  const handleDescriptionChange = (e: any) => {
    const value = e.detail.value.slice(0, 500);
    setDescription(value);
    console.log('[ReturnPage] Description changed, length:', value.length);
  };

  const handleUpload = async () => {
    if (uploadImages.length >= 6) {
      Taro.showToast({ title: '最多上传6张图片', icon: 'none' });
      return;
    }

    console.log('[ReturnPage] Upload image clicked');
    try {
      const res = await Taro.chooseImage({
        count: 6 - uploadImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      const newImages = res.tempFilePaths;
      setUploadImages(prev => [...prev, ...newImages]);
      console.log('[ReturnPage] Images uploaded:', newImages.length);
    } catch (e) {
      console.error('[ReturnPage] Upload error:', e);
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('[ReturnPage] Remove image:', index);
    setUploadImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageError = (index: number, e: any) => {
    console.error('[ReturnPage] Image load error:', index, e);
  };

  const handleSubmit = async () => {
    const selectedProducts = products.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      Taro.showToast({ title: '请选择退货商品', icon: 'none' });
      return;
    }
    if (!selectedReason) {
      Taro.showToast({ title: '请选择退货原因', icon: 'none' });
      return;
    }

    const product = selectedProducts[0];
    const reason = reasonMap[selectedReason] || selectedReason;
    const refundAmount = product.price * product.quantity;

    console.log('[ReturnPage] Submit clicked');
    console.log('[ReturnPage] Selected products:', selectedProducts.length);
    console.log('[ReturnPage] Reason:', reason);
    console.log('[ReturnPage] Description:', description);
    console.log('[ReturnPage] Images:', uploadImages.length);
    console.log('[ReturnPage] Refund amount:', refundAmount);

    setSubmitting(true);
    Taro.showLoading({ title: '提交中...', mask: true });

    try {
      if (!user) {
        throw new Error('请先登录');
      }

      const result = await createReturnRequest(
        orderId || product.productId,
        orderNo || `ORD${Date.now()}`,
        productId || product.productId,
        product.productName,
        product.productImage,
        product.skuId,
        product.skuSpec,
        product.quantity,
        reason,
        description,
        uploadImages,
        user.id,
        user.nickname,
        product.sellerId,
        refundAmount
      );

      if (!result) {
        throw new Error('提交失败');
      }

      console.log('[ReturnPage] Submission successful');
      Taro.hideLoading();
      Taro.showToast({ title: '提交成功', icon: 'success' });

      setShowProgress(true);

      setTimeout(() => {
        Taro.navigateBack();
      }, 3000);
    } catch (e: any) {
      console.error('[ReturnPage] Submit error:', e);
      Taro.hideLoading();
      Taro.showToast({ title: e.message || '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const refundAmount = useMemo(() => {
    return products
      .filter(p => p.selected)
      .reduce((sum, p) => sum + p.price * p.quantity, 0);
  }, [products]);

  const allSelected = products.length > 0 && products.every(p => p.selected);
  const canSubmit = products.filter(p => p.selected).length > 0 && selectedReason && !submitting && !isLoading;

  return (
    <View className={styles.returnPage}>
      <ScrollView scrollY className={styles.content}>
        {showProgress && (
          <View className={styles.progressSection}>
            <View className={styles.progressHeader}>
              <Text className={styles.progressStatus}>退货进度</Text>
              <Text className={styles.progressOrderNo}>订单号: {orderNo || 'ORD202401150001'}</Text>
            </View>
            <View className={styles.progressTimeline}>
              {progressSteps.map((step, index) => (
                <View key={index} className={styles.progressItem}>
                  <View
                    className={classnames(
                      styles.progressDot,
                      step.status === 'done' && styles.done,
                      step.status === 'current' && styles.current
                    )}
                  />
                  <View className={styles.progressContent}>
                    <Text className={styles.progressTitle}>{step.title}</Text>
                    {step.time && (
                      <Text className={styles.progressTime}>{step.time}</Text>
                    )}
                    {step.desc && (
                      <Text className={styles.progressDesc}>{step.desc}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View className={styles.refundInfo}>
              <Text className={styles.refundLabel}>预计退款金额</Text>
              <Text className={styles.refundAmount}>{formatPrice(refundAmount)}</Text>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📦</Text>
            <Text className={styles.sectionTitle}>选择退货商品</Text>
          </View>
          <Text className={styles.sectionTip}>请选择需要退货的商品（可多选）</Text>

          <View className={styles.productList} style={{ marginTop: 16 }}>
            {products.map((product) => (
              <View
                key={`${product.productId}-${product.skuId}`}
                className={classnames(
                  styles.productItem,
                  product.selected && styles.selected
                )}
                onClick={() => handleProductSelect(product.productId, product.skuId)}
              >
                <View
                  className={classnames(
                    styles.checkbox,
                    product.selected && styles.checked
                  )}
                >
                  {product.selected && <Text className={styles.checkIcon}>✓</Text>}
                </View>
                <Image
                  className={styles.productImage}
                  src={product.productImage}
                  mode="aspectFill"
                  onError={(e) => console.error('[ReturnPage] Product image error:', e)}
                />
                <View className={styles.productInfo}>
                  <View>
                    <Text className={styles.productName}>{product.productName}</Text>
                    <Text className={styles.productSpec}>{product.skuSpec}</Text>
                  </View>
                  <View className={styles.productBottom}>
                    <Text className={styles.productPrice}>{formatPrice(product.price)}</Text>
                    <Text className={styles.productQuantity}>x{product.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className={styles.selectAll} onClick={handleSelectAll}>
            <View
              className={classnames(
                styles.checkbox,
                allSelected && styles.checked
              )}
            >
              {allSelected && <Text className={styles.checkIcon}>✓</Text>}
            </View>
            <Text className={styles.selectAllText}>全选</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>❓</Text>
            <Text className={styles.sectionTitle}>退货原因</Text>
          </View>

          <View className={styles.reasonList}>
            {reasons.map((reason) => (
              <View
                key={reason.id}
                className={classnames(
                  styles.reasonItem,
                  selectedReason === reason.id && styles.active
                )}
                onClick={() => handleReasonSelect(reason.id)}
              >
                <View className={styles.reasonIcon}>
                  <Text>{reason.icon}</Text>
                </View>
                <View className={styles.reasonInfo}>
                  <Text className={styles.reasonName}>{reason.name}</Text>
                  <Text className={styles.reasonDesc}>{reason.desc}</Text>
                </View>
                <View
                  className={classnames(
                    styles.radioIcon,
                    selectedReason === reason.id && styles.active
                  )}
                >
                  {selectedReason === reason.id && (
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
            <Text className={styles.sectionTitle}>退货说明</Text>
          </View>
          <Input
            className={styles.descriptionArea}
            placeholder="请详细描述退货原因，以便我们更好地为您处理..."
            value={description}
            onInput={handleDescriptionChange}
            maxlength={500}
          />
          <Text className={styles.charCount}>{description.length}/500</Text>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📷</Text>
            <Text className={styles.sectionTitle}>上传凭证</Text>
          </View>
          <Text className={styles.sectionTip}>上传商品问题照片，最多6张（选填）</Text>

          <View className={styles.uploadSection} style={{ marginTop: 16 }}>
            {uploadImages.map((img, index) => (
              <View key={index} className={styles.uploadItem}>
                <Image
                  className={styles.uploadImage}
                  src={img}
                  mode="aspectFill"
                  onError={(e) => handleImageError(index, e)}
                />
                <View
                  className={styles.uploadRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                >
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {uploadImages.length < 6 && (
              <Button className={styles.uploadBtn} onClick={handleUpload}>
                <Text className={styles.uploadIcon}>📷</Text>
                <Text className={styles.uploadText}>上传图片</Text>
              </Button>
            )}
          </View>
        </View>

        <View className={styles.noticeBox}>
          <Text className={styles.noticeTitle}>
            <Text className={styles.noticeIcon}>⚠️</Text>
            温馨提示
          </Text>
          <Text className={styles.noticeContent}>
            1. 请保持商品完好，不影响二次销售{'\n'}
            2. 商家将在24小时内审核您的申请{'\n'}
            3. 退款将在审核通过后1-3个工作日内原路返回{'\n'}
            4. 如有疑问，请联系客服：400-888-8888
          </Text>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.footerInfo}>
          <Text className={styles.footerLabel}>退款金额</Text>
          <Text className={styles.footerAmount}>{formatPrice(refundAmount)}</Text>
        </View>
        <Button
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? '提交中...' : showProgress ? '查看详情' : '提交申请'}
        </Button>
      </View>
    </View>
  );
};

export default ReturnPage;
