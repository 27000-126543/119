import type { Category } from '@/types/product';

export const mockCategories: Category[] = [
  {
    id: 'cat001',
    name: '数码电子',
    nameEn: 'Electronics',
    icon: '📱',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat001-01', name: '手机', nameEn: 'Mobile Phones', icon: '', parentId: 'cat001', level: 2 },
      { id: 'cat001-02', name: '电脑', nameEn: 'Computers', icon: '', parentId: 'cat001', level: 2 },
      { id: 'cat001-03', name: '耳机音响', nameEn: 'Audio', icon: '', parentId: 'cat001', level: 2 },
      { id: 'cat001-04', name: '智能穿戴', nameEn: 'Wearables', icon: '', parentId: 'cat001', level: 2 }
    ]
  },
  {
    id: 'cat002',
    name: '服饰鞋包',
    nameEn: 'Fashion',
    icon: '👔',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat002-01', name: '男装', nameEn: 'Men', icon: '', parentId: 'cat002', level: 2 },
      { id: 'cat002-02', name: '女装', nameEn: 'Women', icon: '', parentId: 'cat002', level: 2 },
      { id: 'cat002-03', name: '鞋靴', nameEn: 'Shoes', icon: '', parentId: 'cat002', level: 2 },
      { id: 'cat002-04', name: '箱包', nameEn: 'Bags', icon: '', parentId: 'cat002', level: 2 }
    ]
  },
  {
    id: 'cat003',
    name: '家居生活',
    nameEn: 'Home & Living',
    icon: '🏠',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat003-01', name: '家具', nameEn: 'Furniture', icon: '', parentId: 'cat003', level: 2 },
      { id: 'cat003-02', name: '家纺', nameEn: 'Bedding', icon: '', parentId: 'cat003', level: 2 },
      { id: 'cat003-03', name: '家电', nameEn: 'Appliances', icon: '', parentId: 'cat003', level: 2 },
      { id: 'cat003-04', name: '厨房用品', nameEn: 'Kitchen', icon: '', parentId: 'cat003', level: 2 }
    ]
  },
  {
    id: 'cat004',
    name: '母婴用品',
    nameEn: 'Baby & Kids',
    icon: '👶',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat004-01', name: '奶粉辅食', nameEn: 'Food', icon: '', parentId: 'cat004', level: 2 },
      { id: 'cat004-02', name: '尿裤湿巾', nameEn: 'Diapers', icon: '', parentId: 'cat004', level: 2 },
      { id: 'cat004-03', name: '童装', nameEn: 'Clothes', icon: '', parentId: 'cat004', level: 2 },
      { id: 'cat004-04', name: '玩具', nameEn: 'Toys', icon: '', parentId: 'cat004', level: 2 }
    ]
  },
  {
    id: 'cat005',
    name: '食品饮料',
    nameEn: 'Food & Beverage',
    icon: '🍷',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat005-01', name: '进口食品', nameEn: 'Imported', icon: '', parentId: 'cat005', level: 2 },
      { id: 'cat005-02', name: '酒水饮料', nameEn: 'Drinks', icon: '', parentId: 'cat005', level: 2 },
      { id: 'cat005-03', name: '休闲零食', nameEn: 'Snacks', icon: '', parentId: 'cat005', level: 2 }
    ]
  },
  {
    id: 'cat006',
    name: '美妆个护',
    nameEn: 'Beauty',
    icon: '💄',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat006-01', name: '护肤', nameEn: 'Skincare', icon: '', parentId: 'cat006', level: 2 },
      { id: 'cat006-02', name: '彩妆', nameEn: 'Makeup', icon: '', parentId: 'cat006', level: 2 },
      { id: 'cat006-03', name: '个人护理', nameEn: 'Personal Care', icon: '', parentId: 'cat006', level: 2 }
    ]
  },
  {
    id: 'cat007',
    name: '运动户外',
    nameEn: 'Sports',
    icon: '⚽',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat007-01', name: '运动服饰', nameEn: 'Sportswear', icon: '', parentId: 'cat007', level: 2 },
      { id: 'cat007-02', name: '健身器材', nameEn: 'Fitness', icon: '', parentId: 'cat007', level: 2 },
      { id: 'cat007-03', name: '户外装备', nameEn: 'Outdoor', icon: '', parentId: 'cat007', level: 2 }
    ]
  },
  {
    id: 'cat008',
    name: '图书文具',
    nameEn: 'Books',
    icon: '📚',
    parentId: '',
    level: 1,
    children: [
      { id: 'cat008-01', name: '图书', nameEn: 'Books', icon: '', parentId: 'cat008', level: 2 },
      { id: 'cat008-02', name: '文具', nameEn: 'Stationery', icon: '', parentId: 'cat008', level: 2 }
    ]
  }
];
