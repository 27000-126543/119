import type { CountryTaxRate } from '@/types/tax';

export const mockTaxRates: CountryTaxRate[] = [
  {
    countryCode: 'CN',
    countryName: '中国',
    standardRate: 0.13,
    reducedRates: [
      { category: '食品饮料', rate: 0.09, description: '食品、饮料、农产品' },
      { category: '图书文具', rate: 0.09, description: '图书、报纸、杂志' },
      { category: '母婴用品', rate: 0.09, description: '婴儿食品、用品' },
      { category: '美妆个护', rate: 0.13, description: '化妆品、护肤品' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'US',
    countryName: '美国',
    standardRate: 0.08,
    reducedRates: [
      { category: '食品饮料', rate: 0.00, description: '大部分食品免税' },
      { category: '母婴用品', rate: 0.00, description: '婴儿用品免税' },
      { category: '图书文具', rate: 0.00, description: '教育用品免税' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'DE',
    countryName: '德国',
    standardRate: 0.19,
    reducedRates: [
      { category: '食品饮料', rate: 0.07, description: '食品、饮料' },
      { category: '图书文具', rate: 0.07, description: '图书、报刊' },
      { category: '母婴用品', rate: 0.07, description: '婴儿用品' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'JP',
    countryName: '日本',
    standardRate: 0.10,
    reducedRates: [
      { category: '食品饮料', rate: 0.08, description: '食品、饮料（轻减税率）' },
      { category: '图书文具', rate: 0.08, description: '图书、报纸' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'GB',
    countryName: '英国',
    standardRate: 0.20,
    reducedRates: [
      { category: '食品饮料', rate: 0.00, description: '大部分食品免税' },
      { category: '母婴用品', rate: 0.00, description: '婴儿用品免税' },
      { category: '图书文具', rate: 0.00, description: '图书免税' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'FR',
    countryName: '法国',
    standardRate: 0.20,
    reducedRates: [
      { category: '食品饮料', rate: 0.055, description: '食品、饮料' },
      { category: '图书文具', rate: 0.055, description: '图书' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'AU',
    countryName: '澳大利亚',
    standardRate: 0.10,
    reducedRates: [
      { category: '食品饮料', rate: 0.00, description: '大部分食品免税' },
      { category: '母婴用品', rate: 0.00, description: '婴儿用品免税' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'BR',
    countryName: '巴西',
    standardRate: 0.17,
    reducedRates: [
      { category: '食品饮料', rate: 0.12, description: '基础食品' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  },
  {
    countryCode: 'KR',
    countryName: '韩国',
    standardRate: 0.10,
    reducedRates: [
      { category: '食品饮料', rate: 0.00, description: '基础食品免税' }
    ],
    categories: ['数码电子', '服饰鞋包', '家居生活', '母婴用品', '食品饮料', '美妆个护', '运动户外', '图书文具']
  }
];

export const getTaxRate = (countryCode: string, category: string): number => {
  const countryTax = mockTaxRates.find(t => t.countryCode === countryCode);
  if (!countryTax) return 0.1;
  
  const reducedRate = countryTax.reducedRates.find(r => r.category === category);
  if (reducedRate) return reducedRate.rate;
  
  return countryTax.standardRate;
};
