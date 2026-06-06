import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Input,
  Image,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';
import type { RealnameStatus } from '@/types/user';

const RealnameAuthPage: React.FC = () => {
  const t = useTranslation();
  const { user, setUser } = useUserStore();
  const [name, setName] = useState('');
  const [idCardNo, setIdCardNo] = useState('');
  const [idCardFront, setIdCardFront] = useState('');
  const [idCardBack, setIdCardBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('[RealnameAuthPage] Mounted, realnameStatus:', user?.realnameStatus);
    if (user) {
      setName(user.realname || '');
      setIdCardNo(user.idCardNo || '');
      setIdCardFront(user.idCardFront || '');
      setIdCardBack(user.idCardBack || '');
    }
  }, [user]);

  useDidShow(() => {
    console.log('[RealnameAuthPage] Page show');
  });

  const getStatusInfo = (status: RealnameStatus) => {
    const info: Record<RealnameStatus, { text: string; desc: string; icon: string; className: string }> = {
      approved: {
        text: '已认证',
        desc: '您的实名认证已通过',
        icon: '✓',
        className: 'approved'
      },
      pending: {
        text: '审核中',
        desc: '您的实名认证正在审核中，请耐心等待',
        icon: '⏳',
        className: 'pending'
      },
      rejected: {
        text: '认证失败',
        desc: '您的实名认证未通过，请重新提交',
        icon: '✕',
        className: 'rejected'
      },
      not_submitted: {
        text: '未认证',
        desc: '请完成实名认证以使用更多功能',
        icon: '📝',
        className: 'not_submitted'
      }
    };
    return info[status] || info.not_submitted;
  };

  const handleChooseImage = (type: 'front' | 'back') => {
    console.log('[RealnameAuthPage] Choose image:', type);
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        console.log('[RealnameAuthPage] Image selected:', type, tempFilePath);
        if (type === 'front') {
          setIdCardFront(tempFilePath);
        } else {
          setIdCardBack(tempFilePath);
        }
      },
      fail: (err) => {
        console.error('[RealnameAuthPage] Choose image failed:', err);
      }
    });
  };

  const handleRemoveImage = (type: 'front' | 'back') => {
    console.log('[RealnameAuthPage] Remove image:', type);
    if (type === 'front') {
      setIdCardFront('');
    } else {
      setIdCardBack('');
    }
  };

  const handleIdCardInput = (e: any) => {
    const value = e.detail.value.toUpperCase().replace(/[^0-9X]/g, '');
    setIdCardNo(value);
    console.log('[RealnameAuthPage] IdCard input:', value);
  };

  const handleNameInput = (e: any) => {
    const value = e.detail.value;
    setName(value);
    console.log('[RealnameAuthPage] Name input:', value);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      console.log('[RealnameAuthPage] Validation failed: name empty');
      return false;
    }
    if (name.length < 2) {
      Taro.showToast({ title: '请输入真实姓名', icon: 'none' });
      console.log('[RealnameAuthPage] Validation failed: name too short');
      return false;
    }
    if (!idCardNo || idCardNo.length !== 18) {
      Taro.showToast({ title: '请输入正确的身份证号', icon: 'none' });
      console.log('[RealnameAuthPage] Validation failed: invalid idCardNo');
      return false;
    }
    if (!idCardFront) {
      Taro.showToast({ title: '请上传身份证正面', icon: 'none' });
      console.log('[RealnameAuthPage] Validation failed: no front image');
      return false;
    }
    if (!idCardBack) {
      Taro.showToast({ title: '请上传身份证反面', icon: 'none' });
      console.log('[RealnameAuthPage] Validation failed: no back image');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    console.log('[RealnameAuthPage] Submit clicked');
    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log('[RealnameAuthPage] Submitting auth request:', { name, idCardNo, idCardFront, idCardBack });

    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          realname: name,
          idCardNo: idCardNo,
          idCardFront,
          idCardBack,
          realnameStatus: 'pending'
        });
      }
      setIsSubmitting(false);
      Taro.showToast({ title: '提交成功，等待审核', icon: 'success' });
      console.log('[RealnameAuthPage] Submit success, status: pending');
    }, 1500);
  };

  const handleReapply = () => {
    console.log('[RealnameAuthPage] Reapply clicked');
    if (user) {
      setUser({
        ...user,
        realnameStatus: 'not_submitted'
      });
    }
  };

  if (!user) {
    return (
      <View className={styles.realnameAuthPage}>
        <ScrollView scrollY>
          <View className={styles.tipCard}>
            <Text className={styles.tipTitle}>
              <Text>🔒</Text>
              请先登录
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const statusInfo = getStatusInfo(user.realnameStatus);
  const isReadOnly = user.realnameStatus === 'approved' || user.realnameStatus === 'pending';

  return (
    <View className={styles.realnameAuthPage}>
      <ScrollView scrollY>
        <View className={styles.statusCard}>
          <View className={styles.statusHeader}>
            <View className={classnames(styles.statusIcon, styles[statusInfo.className])}>
              <Text>{statusInfo.icon}</Text>
            </View>
            <View className={styles.statusInfo}>
              <Text className={styles.statusTitle}>{statusInfo.text}</Text>
              <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
            </View>
          </View>
          {user.realnameStatus === 'rejected' && (
            <View className={styles.rejectedReason}>
              <Text>失败原因：身份证照片不清晰，请重新上传</Text>
            </View>
          )}
        </View>

        <View className={classnames(styles.formCard, isReadOnly && styles.disabledForm)}>
          <Text className={styles.sectionTitle}>身份证照片</Text>
          <View className={styles.uploadSection}>
            <View className={styles.uploadRow}>
              <View className={styles.uploadItem}>
                <Text className={styles.uploadLabel}>身份证正面</Text>
                <View
                  className={styles.uploadBox}
                  onClick={() => !isReadOnly && handleChooseImage('front')}
                >
                  {idCardFront ? (
                    <>
                      <Image className={styles.uploadPreview} src={idCardFront} mode="aspectFill" />
                      {!isReadOnly && (
                        <View
                          className={styles.uploadRemove}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage('front');
                          }}
                        >
                          <Text>✕</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <View className={styles.uploadPlaceholder}>
                      <Text className={styles.uploadIcon}>📷</Text>
                      <Text className={styles.uploadText}>点击上传</Text>
                    </View>
                  )}
                </View>
              </View>

              <View className={styles.uploadItem}>
                <Text className={styles.uploadLabel}>身份证反面</Text>
                <View
                  className={styles.uploadBox}
                  onClick={() => !isReadOnly && handleChooseImage('back')}
                >
                  {idCardBack ? (
                    <>
                      <Image className={styles.uploadPreview} src={idCardBack} mode="aspectFill" />
                      {!isReadOnly && (
                        <View
                          className={styles.uploadRemove}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage('back');
                          }}
                        >
                          <Text>✕</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <View className={styles.uploadPlaceholder}>
                      <Text className={styles.uploadIcon}>📷</Text>
                      <Text className={styles.uploadText}>点击上传</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <Text className={styles.sectionTitle}>身份信息</Text>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>真实姓名</Text>
            <Input
              className={classnames(styles.formInput, isReadOnly && styles.inputDisabled)}
              placeholder="请输入真实姓名"
              value={name}
              onInput={handleNameInput}
              disabled={isReadOnly}
              maxlength={20}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>身份证号码</Text>
            <Input
              className={classnames(styles.formInput, isReadOnly && styles.inputDisabled)}
              placeholder="请输入18位身份证号码"
              value={idCardNo}
              onInput={handleIdCardInput}
              disabled={isReadOnly}
              maxlength={18}
            />
          </View>
        </View>

        <View className={styles.tipCard}>
          <View className={styles.tipTitle}>
            <Text>🔒</Text>
            <Text>信息安全保障</Text>
          </View>
          <View className={styles.tipList}>
            <Text className={styles.tipItem}>• 您的个人信息将严格保密</Text>
            <Text className={styles.tipItem}>• 仅用于身份验证，不作其他用途</Text>
            <Text className={styles.tipItem}>• 支持身份证、护照等多种证件</Text>
            <Text className={styles.tipItem}>• 审核时间通常为1-3个工作日</Text>
          </View>
        </View>

        {user.realnameStatus === 'rejected' ? (
          <Button
            className={styles.submitBtn}
            onClick={handleReapply}
          >
            重新申请
          </Button>
        ) : !isReadOnly && (
          <Button
            className={classnames(styles.submitBtn, isSubmitting && styles.disabled)}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交认证'}
          </Button>
        )}
      </ScrollView>
    </View>
  );
};

export default RealnameAuthPage;
