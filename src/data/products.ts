import type { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: 'p001',
    name: '高端智能无线蓝牙耳机 Pro',
    nameEn: 'Premium Wireless Bluetooth Earbuds Pro',
    description: '采用最新蓝牙5.3技术，主动降噪，续航长达36小时，支持无线充电。',
    descriptionEn: 'Latest Bluetooth 5.3 technology, active noise cancellation, 36-hour battery life, wireless charging supported.',
    images: [
      'https://picsum.photos/id/3/300/300',
      'https://picsum.photos/id/8/300/300',
      'https://picsum.photos/id/9/300/300'
    ],
    categoryId: 'cat001',
    categoryName: '数码电子',
    price: 599,
    wholesalePrice: 450,
    minWholesaleQty: 10,
    stock: 156,
    sales: 2890,
    rating: 4.8,
    reviewCount: 1256,
    skus: [
      { id: 'sku001', spec: '黑色 / 256GB', price: 599, wholesalePrice: 450, stock: 100 },
      { id: 'sku002', spec: '白色 / 256GB', price: 599, wholesalePrice: 450, stock: 56 }
    ],
    tags: ['热销', '新品', '推荐'],
    sellerId: 's001',
    sellerName: '全球优品',
    shopName: '全球优品专营店',
    shippingTemplateId: 'ship001',
    originCountry: 'CN',
    weight: 0.15,
    createdAt: '2024-06-01T00:00:00Z'
  },
  {
    id: 'p002',
    name: '轻奢时尚女士手提包',
    nameEn: 'Luxury Fashion Women Handbag',
    description: '进口头层牛皮，精致五金配件，大容量设计，适合商务通勤。',
    descriptionEn: 'Imported top grain leather, exquisite hardware, large capacity design, perfect for business commute.',
    images: [
      'https://picsum.photos/id/220/300/300',
      'https://picsum.photos/id/225/300/300',
      'https://picsum.photos/id/230/300/300'
    ],
    categoryId: 'cat002',
    categoryName: '服饰鞋包',
    price: 899,
    wholesalePrice: 680,
    minWholesaleQty: 5,
    stock: 89,
    sales: 1560,
    rating: 4.9,
    reviewCount: 856,
    skus: [
      { id: 'sku003', spec: '棕色 / 大号', price: 899, wholesalePrice: 680, stock: 50 },
      { id: 'sku004', spec: '黑色 / 大号', price: 899, wholesalePrice: 680, stock: 39 }
    ],
    tags: ['精选', '品质'],
    sellerId: 's002',
    sellerName: '精品箱包',
    shopName: '精品箱包旗舰店',
    shippingTemplateId: 'ship002',
    originCountry: 'IT',
    weight: 0.8,
    createdAt: '2024-05-15T00:00:00Z'
  },
  {
    id: 'p003',
    name: '智能手表运动版',
    nameEn: 'Smart Watch Sports Edition',
    description: '1.4英寸AMOLED高清屏幕，心率血氧监测，50米防水，支持100+运动模式。',
    descriptionEn: '1.4-inch AMOLED HD screen, heart rate and blood oxygen monitoring, 50m waterproof, 100+ sports modes.',
    images: [
      'https://picsum.photos/id/1/300/300',
      'https://picsum.photos/id/2/300/300'
    ],
    categoryId: 'cat001',
    categoryName: '数码电子',
    price: 1299,
    wholesalePrice: 980,
    minWholesaleQty: 8,
    stock: 234,
    sales: 5680,
    rating: 4.7,
    reviewCount: 2341,
    skus: [
      { id: 'sku005', spec: '黑色硅胶带', price: 1299, wholesalePrice: 980, stock: 120 },
      { id: 'sku006', spec: '银色金属带', price: 1499, wholesalePrice: 1150, stock: 114 }
    ],
    tags: ['热销', '运动'],
    sellerId: 's001',
    sellerName: '全球优品',
    shopName: '全球优品专营店',
    shippingTemplateId: 'ship001',
    originCountry: 'CN',
    weight: 0.08,
    createdAt: '2024-04-20T00:00:00Z'
  },
  {
    id: 'p004',
    name: '北欧简约实木餐桌',
    nameEn: 'Nordic Simple Solid Wood Dining Table',
    description: '北美进口橡木，环保水性漆，可容纳6-8人，匠心工艺打造。',
    descriptionEn: 'North American imported oak, eco-friendly water-based paint, seats 6-8 people, crafted with precision.',
    images: [
      'https://picsum.photos/id/225/300/300',
      'https://picsum.photos/id/582/300/300'
    ],
    categoryId: 'cat003',
    categoryName: '家居生活',
    price: 3599,
    wholesalePrice: 2800,
    minWholesaleQty: 2,
    stock: 45,
    sales: 680,
    rating: 4.6,
    reviewCount: 324,
    skus: [
      { id: 'sku007', spec: '原木色 1.6m', price: 3599, wholesalePrice: 2800, stock: 25 },
      { id: 'sku008', spec: '胡桃色 1.8m', price: 3999, wholesalePrice: 3100, stock: 20 }
    ],
    tags: ['品质', '家居'],
    sellerId: 's003',
    sellerName: '北欧家居',
    shopName: '北欧家居官方店',
    shippingTemplateId: 'ship003',
    originCountry: 'SE',
    weight: 45,
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: 'p005',
    name: '婴幼儿纯棉连体衣套装',
    nameEn: 'Baby Pure Cotton Romper Set',
    description: '100%有机棉，柔软亲肤，无荧光剂，四季可穿，三件装。',
    descriptionEn: '100% organic cotton, soft and skin-friendly, no fluorescent agents, all-season wear, 3-piece set.',
    images: [
      'https://picsum.photos/id/237/300/300',
      'https://picsum.photos/id/659/300/300'
    ],
    categoryId: 'cat004',
    categoryName: '母婴用品',
    price: 199,
    wholesalePrice: 120,
    minWholesaleQty: 20,
    stock: 567,
    sales: 8920,
    rating: 4.9,
    reviewCount: 4521,
    skus: [
      { id: 'sku009', spec: '粉色 6-12个月', price: 199, wholesalePrice: 120, stock: 200 },
      { id: 'sku010', spec: '蓝色 12-18个月', price: 199, wholesalePrice: 120, stock: 180 },
      { id: 'sku011', spec: '黄色 18-24个月', price: 199, wholesalePrice: 120, stock: 187 }
    ],
    tags: ['热销', '母婴', '推荐'],
    sellerId: 's004',
    sellerName: '爱婴坊',
    shopName: '爱婴坊母婴店',
    shippingTemplateId: 'ship001',
    originCountry: 'CN',
    weight: 0.3,
    createdAt: '2024-06-05T00:00:00Z'
  },
  {
    id: 'p006',
    name: '专业级单反相机',
    nameEn: 'Professional DSLR Camera',
    description: '2410万像素全画幅传感器，4K视频录制，5轴防抖，11点自动对焦。',
    descriptionEn: '24.1MP full-frame sensor, 4K video recording, 5-axis image stabilization, 11-point autofocus.',
    images: [
      'https://picsum.photos/id/6/300/300',
      'https://picsum.photos/id/119/300/300'
    ],
    categoryId: 'cat001',
    categoryName: '数码电子',
    price: 12899,
    wholesalePrice: 9800,
    minWholesaleQty: 2,
    stock: 78,
    sales: 456,
    rating: 4.8,
    reviewCount: 234,
    skus: [
      { id: 'sku012', spec: '单机身', price: 12899, wholesalePrice: 9800, stock: 45 },
      { id: 'sku013', spec: '含24-70mm镜头', price: 18999, wholesalePrice: 14500, stock: 33 }
    ],
    tags: ['专业', '数码'],
    sellerId: 's001',
    sellerName: '全球优品',
    shopName: '全球优品专营店',
    shippingTemplateId: 'ship002',
    originCountry: 'JP',
    weight: 1.5,
    createdAt: '2024-02-28T00:00:00Z'
  },
  {
    id: 'p007',
    name: '法国进口红酒礼盒装',
    nameEn: 'French Imported Red Wine Gift Box',
    description: '波尔多产区AOC级，赤霞珠混酿，12个月橡木桶陈酿，双支礼盒装。',
    descriptionEn: 'Bordeaux AOC, Cabernet Sauvignon blend, 12 months oak aging, 2-bottle gift box.',
    images: [
      'https://picsum.photos/id/431/300/300',
      'https://picsum.photos/id/570/300/300'
    ],
    categoryId: 'cat005',
    categoryName: '食品饮料',
    price: 688,
    wholesalePrice: 450,
    minWholesaleQty: 6,
    stock: 345,
    sales: 2156,
    rating: 4.7,
    reviewCount: 1123,
    skus: [
      { id: 'sku014', spec: '双支礼盒装', price: 688, wholesalePrice: 450, stock: 200 },
      { id: 'sku015', spec: '六支整箱装', price: 1888, wholesalePrice: 1260, stock: 145 }
    ],
    tags: ['进口', '礼品'],
    sellerId: 's005',
    sellerName: '美酒汇',
    shopName: '美酒汇官方旗舰店',
    shippingTemplateId: 'ship002',
    originCountry: 'FR',
    weight: 3.5,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'p008',
    name: '运动休闲跑鞋',
    nameEn: 'Sports Casual Running Shoes',
    description: '透气网面，缓震中底，防滑耐磨大底，适合跑步健身日常穿搭。',
    descriptionEn: 'Breathable mesh, cushioning midsole, non-slip wear-resistant outsole, perfect for running and daily wear.',
    images: [
      'https://picsum.photos/id/103/300/300',
      'https://picsum.photos/id/250/300/300'
    ],
    categoryId: 'cat002',
    categoryName: '服饰鞋包',
    price: 459,
    wholesalePrice: 280,
    minWholesaleQty: 15,
    stock: 890,
    sales: 12560,
    rating: 4.6,
    reviewCount: 5678,
    skus: [
      { id: 'sku016', spec: '黑色 42码', price: 459, wholesalePrice: 280, stock: 150 },
      { id: 'sku017', spec: '白色 42码', price: 459, wholesalePrice: 280, stock: 140 },
      { id: 'sku018', spec: '灰色 42码', price: 459, wholesalePrice: 280, stock: 150 }
    ],
    tags: ['热销', '运动', '舒适'],
    sellerId: 's006',
    sellerName: '运动先锋',
    shopName: '运动先锋官方店',
    shippingTemplateId: 'ship001',
    originCountry: 'VN',
    weight: 0.6,
    createdAt: '2024-05-20T00:00:00Z'
  },
  {
    id: 'p009',
    name: '高端护肤套装礼盒',
    nameEn: 'Premium Skincare Set Gift Box',
    description: '水乳精华面霜四件套，深层补水，抗老紧致，适合所有肤质。',
    descriptionEn: '4-piece set: toner, serum, emulsion, cream. Deep hydration, anti-aging firming, suitable for all skin types.',
    images: [
      'https://picsum.photos/id/312/300/300',
      'https://picsum.photos/id/625/300/300'
    ],
    categoryId: 'cat006',
    categoryName: '美妆个护',
    price: 1288,
    wholesalePrice: 880,
    minWholesaleQty: 8,
    stock: 456,
    sales: 6780,
    rating: 4.8,
    reviewCount: 3456,
    skus: [
      { id: 'sku019', spec: '补水保湿款', price: 1288, wholesalePrice: 880, stock: 256 },
      { id: 'sku020', spec: '抗老紧致款', price: 1588, wholesalePrice: 1080, stock: 200 }
    ],
    tags: ['热销', '美妆', '推荐'],
    sellerId: 's007',
    sellerName: '美颜馆',
    shopName: '美颜馆美妆旗舰店',
    shippingTemplateId: 'ship001',
    originCountry: 'KR',
    weight: 0.5,
    createdAt: '2024-06-10T00:00:00Z'
  },
  {
    id: 'p010',
    name: '儿童益智积木玩具',
    nameEn: 'Children Educational Building Blocks',
    description: '200片大颗粒积木，ABS环保材质，锻炼动手能力和空间思维。',
    descriptionEn: '200 large pieces, ABS eco-friendly material, develops hands-on ability and spatial thinking.',
    images: [
      'https://picsum.photos/id/326/300/300',
      'https://picsum.photos/id/580/300/300'
    ],
    categoryId: 'cat004',
    categoryName: '母婴用品',
    price: 299,
    wholesalePrice: 180,
    minWholesaleQty: 12,
    stock: 678,
    sales: 9870,
    rating: 4.9,
    reviewCount: 4321,
    skus: [
      { id: 'sku021', spec: '基础款200片', price: 299, wholesalePrice: 180, stock: 378 },
      { id: 'sku022', spec: '豪华款500片', price: 599, wholesalePrice: 380, stock: 300 }
    ],
    tags: ['热销', '益智', '儿童'],
    sellerId: 's008',
    sellerName: '童趣坊',
    shopName: '童趣坊玩具店',
    shippingTemplateId: 'ship001',
    originCountry: 'CN',
    weight: 1.2,
    createdAt: '2024-04-15T00:00:00Z'
  },
  {
    id: 'p011',
    name: '智能扫地机器人',
    nameEn: 'Smart Robot Vacuum Cleaner',
    description: '激光导航，自动规划路线，扫拖一体，APP远程控制，自动回充。',
    descriptionEn: 'Laser navigation, auto path planning, sweep and mop in one, APP remote control, auto recharge.',
    images: [
      'https://picsum.photos/id/160/300/300',
      'https://picsum.photos/id/201/300/300'
    ],
    categoryId: 'cat003',
    categoryName: '家居生活',
    price: 2499,
    wholesalePrice: 1880,
    minWholesaleQty: 5,
    stock: 234,
    sales: 4560,
    rating: 4.7,
    reviewCount: 2134,
    skus: [
      { id: 'sku023', spec: '标准款', price: 2499, wholesalePrice: 1880, stock: 134 },
      { id: 'sku024', spec: 'Pro款（自动集尘）', price: 3999, wholesalePrice: 2980, stock: 100 }
    ],
    tags: ['智能', '家居', '新品'],
    sellerId: 's003',
    sellerName: '北欧家居',
    shopName: '北欧家居官方店',
    shippingTemplateId: 'ship002',
    originCountry: 'CN',
    weight: 3.5,
    createdAt: '2024-05-01T00:00:00Z'
  },
  {
    id: 'p012',
    name: '商务休闲男装衬衫',
    nameEn: 'Business Casual Men Dress Shirt',
    description: '免烫弹力面料，修身版型，多色可选，适合商务场合穿着。',
    descriptionEn: 'Non-iron stretch fabric, slim fit, multiple colors, suitable for business occasions.',
    images: [
      'https://picsum.photos/id/119/300/300',
      'https://picsum.photos/id/1080/300/300'
    ],
    categoryId: 'cat002',
    categoryName: '服饰鞋包',
    price: 299,
    wholesalePrice: 160,
    minWholesaleQty: 20,
    stock: 1234,
    sales: 15680,
    rating: 4.6,
    reviewCount: 6789,
    skus: [
      { id: 'sku025', spec: '白色 L码', price: 299, wholesalePrice: 160, stock: 234 },
      { id: 'sku026', spec: '蓝色 L码', price: 299, wholesalePrice: 160, stock: 234 },
      { id: 'sku027', spec: '灰色 L码', price: 299, wholesalePrice: 160, stock: 233 }
    ],
    tags: ['热销', '商务', '品质'],
    sellerId: 's009',
    sellerName: '绅士男装',
    shopName: '绅士男装旗舰店',
    shippingTemplateId: 'ship001',
    originCountry: 'IT',
    weight: 0.25,
    createdAt: '2024-03-20T00:00:00Z'
  }
];

export const getAllProducts = () => mockProducts;
export const getHotProducts = () => mockProducts.filter(p => p.tags.includes('热销'));
export const getNewProducts = () => mockProducts.filter(p => p.tags.includes('新品'));
export const getRecommendProducts = () => mockProducts.filter(p => p.tags.includes('推荐'));
export const getProductsByCategory = (categoryId: string) => mockProducts.filter(p => p.categoryId === categoryId);
export const getProductById = (id: string) => mockProducts.find(p => p.id === id);
