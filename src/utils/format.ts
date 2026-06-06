import { formatPrice as localeFormatPrice } from '@/store/useLocaleStore';

export const formatPrice = (amount: number): string => {
  return localeFormatPrice(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const formatDate = (dateStr: string, format = 'YYYY-MM-DD HH:mm'): string => {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  } catch (e) {
    console.error('[Format] Date format error:', e);
    return dateStr;
  }
};

export const getMemberLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    normal: '#94a3b8',
    silver: '#94a3b8',
    gold: '#f59e0b',
    diamond: '#8b5cf6'
  };
  return colors[level] || '#94a3b8';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending_payment: '#f59e0b',
    pending_shipment: '#3b82f6',
    shipped: '#2563eb',
    completed: '#10b981',
    cancelled: '#94a3b8',
    returned: '#ef4444'
  };
  return colors[status] || '#94a3b8';
};
