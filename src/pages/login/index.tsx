import React, { useState } from 'react';
import {
  View,
  Text,
  Input,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTranslation } from '@/store/useLocaleStore';
import { useUserStore } from '@/store/useUserStore';

const LoginPage: React.FC = () => {
  const t = useTranslation();
  const { login, register, isLoading } = useUserStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agree, setAgree] = useState(false);

  const sendCode = () => {
    if (!phone || phone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    Taro.showToast({ title: '验证码已发送', icon: 'success' });
    console.log('[LoginPage] Send code to:', phone);
  };

  const handleSubmit = async () => {
    if (!phone || phone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (mode === 'login' && !password && !code) {
      Taro.showToast({ title: '请输入密码或验证码', icon: 'none' });
      return;
    }
    if (mode === 'register' && !code) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    if (!agree) {
      Taro.showToast({ title: '请同意用户协议', icon: 'none' });
      return;
    }

    console.log('[LoginPage] Submit:', { mode, phone, code, password });
    
    Taro.showLoading({ title: mode === 'login' ? '登录中...' : '注册中...' });
    
    try {
      let success: boolean;
      if (mode === 'login') {
        success = await login(phone, password);
      } else {
        success = await register(phone, password, `用户${phone.slice(-4)}`);
      }

      Taro.hideLoading();
      
      if (success) {
        Taro.showToast({ title: mode === 'login' ? '登录成功' : '注册成功', icon: 'success' });
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }, 1000);
      } else {
        Taro.showToast({ title: mode === 'login' ? '登录失败' : '注册失败', icon: 'error' });
      }
    } catch (error: any) {
      Taro.hideLoading();
      Taro.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const canSubmit = phone.length === 11 && agree && !isLoading;

  return (
    <View className={styles.loginPage}>
      <Button className={styles.backBtn} onClick={handleBack}>
        ‹
      </Button>

      <ScrollView scrollY className={styles.container}>
        <View className={styles.logoSection}>
          <View className={styles.logo}>
            <Text>🌍</Text>
          </View>
          <Text className={styles.appName}>全球购</Text>
          <Text className={styles.appDesc}>跨境B2B2C电商平台</Text>
        </View>

        <View className={styles.formSection}>
          <View className={styles.switchTab}>
            <View
              className={classnames(styles.switchTabItem, mode === 'login' && styles.switchTabItemActive)}
              onClick={() => setMode('login')}
            >
              {t('login')}
            </View>
            <View
              className={classnames(styles.switchTabItem, mode === 'register' && styles.switchTabItemActive)}
              onClick={() => setMode('register')}
            >
              {t('register')}
            </View>
          </View>

          <Text className={styles.formTitle}>
            {mode === 'login' ? t('welcomeBack') : t('createAccount')}
          </Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>{t('phoneNumber')}</Text>
            <View className={styles.formInput}>
              <Text className={styles.inputIcon}>📱</Text>
              <Input
                className={styles.input}
                type="number"
                placeholder={t('enterPhone')}
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
                maxlength={11}
              />
            </View>
          </View>

          {mode === 'register' && (
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>{t('verificationCode')}</Text>
              <View className={styles.formInput}>
                <Text className={styles.inputIcon}>🔐</Text>
                <Input
                  className={styles.input}
                  type="number"
                  placeholder={t('enterCode')}
                  value={code}
                  onInput={(e) => setCode(e.detail.value)}
                  maxlength={6}
                />
                <Button
                  className={classnames(styles.sendCodeBtn, countdown > 0 && styles.sendCodeBtnDisabled)}
                  disabled={countdown > 0}
                  onClick={sendCode}
                >
                  {countdown > 0 ? `${countdown}s` : t('sendCode')}
                </Button>
              </View>
            </View>
          )}

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              {mode === 'login' ? t('passwordOrCode') : t('setPassword')}
            </Text>
            <View className={styles.formInput}>
              <Text className={styles.inputIcon}>🔒</Text>
              <Input
                className={styles.input}
                type="password"
                placeholder={mode === 'login' ? t('enterPassword') : t('enterNewPassword')}
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.agreement} onClick={() => setAgree(!agree)}>
            <View className={classnames(styles.checkbox, agree && styles.checkboxChecked)}>
              {agree && <Text>✓</Text>}
            </View>
            <Text>
              我已阅读并同意
              <Text className={styles.link}>《用户协议》</Text>
              和
              <Text className={styles.link}>《隐私政策》</Text>
            </Text>
          </View>

          <Button
            className={classnames(styles.submitBtn, !canSubmit && styles.submitBtnDisabled)}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {mode === 'login' ? t('login') : t('register')}
          </Button>

          <View className={styles.otherLogin}>
            <View className={styles.divider}>
              <Text className={styles.dividerText}>其他登录方式</Text>
            </View>
            <View className={styles.socialLogin}>
              <View className={styles.socialItem}>
                <Text>💚</Text>
              </View>
              <View className={styles.socialItem}>
                <Text>💙</Text>
              </View>
              <View className={styles.socialItem}>
                <Text>🟢</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginPage;
