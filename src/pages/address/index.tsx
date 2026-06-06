import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Input,
  Button,
  ScrollView,
  Switch
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import type { Address } from '@/types/user';

const AddressPage: React.FC = () => {
  const t = useTranslation();
  const { user } = useUserStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    country: 'CN',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    console.log('[AddressPage] Mounted, userId:', user?.id);
    loadAddresses();
  }, [user]);

  useDidShow(() => {
    console.log('[AddressPage] Page show');
  });

  const loadAddresses = () => {
    console.log('[AddressPage] Loading addresses');

    const mockAddresses: Address[] = [
      {
        id: 'a001',
        name: '张三',
        phone: '138****8888',
        country: 'CN',
        province: '浙江省',
        city: '杭州市',
        address: '西湖区文三路100号西溪大厦18楼',
        postalCode: '310000',
        isDefault: true
      },
      {
        id: 'a002',
        name: '张三',
        phone: '138****8888',
        country: 'CN',
        province: '上海市',
        city: '上海市',
        address: '浦东新区陆家嘴金融中心88号',
        postalCode: '200000',
        isDefault: false
      }
    ];

    setAddresses(mockAddresses);
    console.log('[AddressPage] Addresses loaded:', mockAddresses.length);
  };

  const getCountryFlag = (country: string): string => {
    const flags: Record<string, string> = {
      CN: '🇨🇳',
      US: '🇺🇸',
      JP: '🇯🇵',
      KR: '🇰🇷',
      UK: '🇬🇧'
    };
    return flags[country] || '🌍';
  };

  const getCountryName = (country: string): string => {
    const names: Record<string, string> = {
      CN: '中国',
      US: '美国',
      JP: '日本',
      KR: '韩国',
      UK: '英国'
    };
    return names[country] || country;
  };

  const handleAddAddress = () => {
    console.log('[AddressPage] Add address clicked');
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      country: 'CN',
      province: '',
      city: '',
      address: '',
      postalCode: '',
      isDefault: false
    });
    setShowModal(true);
  };

  const handleEditAddress = (address: Address) => {
    console.log('[AddressPage] Edit address clicked:', address.id);
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      country: address.country,
      province: address.province,
      city: address.city,
      address: address.address,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    setShowModal(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    console.log('[AddressPage] Delete address clicked:', addressId);
    Taro.showModal({
      title: '删除地址',
      content: '确定要删除这个地址吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          setAddresses(prev => prev.filter(a => a.id !== addressId));
          Taro.showToast({ title: '删除成功', icon: 'success' });
          console.log('[AddressPage] Address deleted:', addressId);
        }
      }
    });
  };

  const handleSetDefault = (addressId: string) => {
    console.log('[AddressPage] Set default address:', addressId);
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === addressId
    })));
    Taro.showToast({ title: '已设为默认', icon: 'success' });
    console.log('[AddressPage] Default address updated:', addressId);
  };

  const handleFormInput = (field: string, value: any) => {
    console.log('[AddressPage] Form input:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchDefault = (checked: boolean) => {
    console.log('[AddressPage] Switch default:', checked);
    setFormData(prev => ({ ...prev, isDefault: checked }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入收货人姓名', icon: 'none' });
      console.log('[AddressPage] Validation failed: name empty');
      return false;
    }
    if (!formData.phone.trim()) {
      Taro.showToast({ title: '请输入手机号码', icon: 'none' });
      console.log('[AddressPage] Validation failed: phone empty');
      return false;
    }
    if (!formData.province.trim()) {
      Taro.showToast({ title: '请输入省份', icon: 'none' });
      console.log('[AddressPage] Validation failed: province empty');
      return false;
    }
    if (!formData.city.trim()) {
      Taro.showToast({ title: '请输入城市', icon: 'none' });
      console.log('[AddressPage] Validation failed: city empty');
      return false;
    }
    if (!formData.address.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' });
      console.log('[AddressPage] Validation failed: address empty');
      return false;
    }
    return true;
  };

  const handleSaveAddress = () => {
    console.log('[AddressPage] Save address clicked');
    if (!validateForm()) return;

    if (editingAddress) {
      setAddresses(prev => prev.map(a =>
        a.id === editingAddress.id
          ? {
              ...a,
              ...formData,
              isDefault: formData.isDefault ? true : a.isDefault
            }
          : formData.isDefault ? { ...a, isDefault: false } : a
      ));
      Taro.showToast({ title: '修改成功', icon: 'success' });
      console.log('[AddressPage] Address updated:', editingAddress.id);
    } else {
      const newAddress: Address = {
        id: `a${Date.now()}`,
        ...formData,
        isDefault: formData.isDefault || addresses.length === 0
      };
      if (formData.isDefault) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddress));
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
      Taro.showToast({ title: '添加成功', icon: 'success' });
      console.log('[AddressPage] Address added:', newAddress.id);
    }

    setShowModal(false);
  };

  const handleCancelModal = () => {
    console.log('[AddressPage] Cancel modal');
    setShowModal(false);
  };

  const handleAddressClick = (address: Address) => {
    console.log('[AddressPage] Address clicked:', address.id);
  };

  if (!user) {
    return (
      <View className={styles.addressPage}>
        <ScrollView scrollY>
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📍</Text>
            <Text className={styles.emptyText}>请先登录查看地址</Text>
            <Button className={styles.addBtn} onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
              去登录
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className={styles.addressPage}>
      <ScrollView scrollY>
        {addresses.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📍</Text>
            <Text className={styles.emptyText}>暂无收货地址</Text>
            <Button className={styles.addBtn} onClick={handleAddAddress}>
              新增收货地址
            </Button>
          </View>
        ) : (
          <View className={styles.addressList}>
            {addresses.map((address) => (
              <View
                key={address.id}
                className={styles.addressCard}
                onClick={() => handleAddressClick(address)}
              >
                <View className={styles.addressHeader}>
                  <View className={styles.addressUser}>
                    <Text className={styles.userName}>{address.name}</Text>
                    <Text className={styles.userPhone}>{address.phone}</Text>
                    {address.isDefault && (
                      <Text className={styles.defaultTag}>默认</Text>
                    )}
                  </View>
                </View>

                <View className={styles.addressContent}>
                  <View className={styles.addressDetail}>
                    <Text className={styles.countryFlag}>{getCountryFlag(address.country)}</Text>
                    <Text>
                      {getCountryName(address.country)} {address.province} {address.city} {address.address}
                      {address.postalCode && ` (${address.postalCode})`}
                    </Text>
                  </View>
                </View>

                <View className={styles.addressActions}>
                  <View
                    className={styles.actionLeft}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(address.id);
                    }}
                  >
                    <View className={classnames(styles.defaultCheckbox, address.isDefault && styles.checked)}>
                      {address.isDefault && <Text>✓</Text>}
                    </View>
                    <Text className={styles.defaultLabel}>设为默认</Text>
                  </View>

                  <View className={styles.actionRight}>
                    <View
                      className={classnames(styles.actionBtn, styles.editBtn)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(address);
                      }}
                    >
                      <Text className={styles.actionIcon}>✏️</Text>
                      <Text>编辑</Text>
                    </View>
                    <View
                      className={classnames(styles.actionBtn, styles.deleteBtn)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                    >
                      <Text className={styles.actionIcon}>🗑️</Text>
                      <Text>删除</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {addresses.length > 0 && (
        <Button className={styles.floatingAddBtn} onClick={handleAddAddress}>
          + 新增收货地址
        </Button>
      )}

      {showModal && (
        <View className={styles.modalOverlay} onClick={handleCancelModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {editingAddress ? '编辑地址' : '新增地址'}
            </Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>收货人姓名</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入姓名"
                value={formData.name}
                onInput={(e) => handleFormInput('name', e.detail.value)}
                maxlength={20}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>手机号码</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入手机号码"
                value={formData.phone}
                onInput={(e) => handleFormInput('phone', e.detail.value)}
                maxlength={20}
                type="phone"
              />
            </View>

            <View className={styles.formRow}>
              <View className={styles.formHalf}>
                <Text className={styles.formLabel}>省份</Text>
                <Input
                  className={styles.formInput}
                  placeholder="请输入省份"
                  value={formData.province}
                  onInput={(e) => handleFormInput('province', e.detail.value)}
                  maxlength={20}
                />
              </View>
              <View className={styles.formHalf}>
                <Text className={styles.formLabel}>城市</Text>
                <Input
                  className={styles.formInput}
                  placeholder="请输入城市"
                  value={formData.city}
                  onInput={(e) => handleFormInput('city', e.detail.value)}
                  maxlength={20}
                />
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>详细地址</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入详细地址"
                value={formData.address}
                onInput={(e) => handleFormInput('address', e.detail.value)}
                maxlength={100}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>邮政编码（选填）</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入邮政编码"
                value={formData.postalCode}
                onInput={(e) => handleFormInput('postalCode', e.detail.value)}
                maxlength={10}
              />
            </View>

            <View className={styles.defaultSwitch}>
              <Text className={styles.switchLabel}>设为默认地址</Text>
              <View
                className={classnames(styles.switchBtn, formData.isDefault && styles.active)}
                onClick={() => handleSwitchDefault(!formData.isDefault)}
              >
                <View className={styles.switchDot} />
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button className={classnames(styles.modalBtn, styles.modalCancel)} onClick={handleCancelModal}>
                取消
              </Button>
              <Button className={classnames(styles.modalBtn, styles.modalConfirm)} onClick={handleSaveAddress}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AddressPage;
