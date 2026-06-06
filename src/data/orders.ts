import type { Order } from '@/types/order';

export const mockOrders: Order[] = [
  {
    id: 'o001',
    orderNo: 'GS202406060001',
    status: 'pending_payment',
    statusText: '待付款',
    items: [
      {
        productId: 'p001',
        productName: '高端智能无线蓝牙耳机 Pro',
        productImage: 'https://picsum.photos/id/3/200/200',
        skuId: 'sku001',
        skuSpec: '黑色 / 256GB',
        price: 599,
        quantity: 2,
        sellerId: 's001',
        shopName: '全球优品专营店'
      }
    ],
    subtotal: 1198,
    shippingFee: 0,
    tax: 71.88,
    total: 1269.88,
    currency: 'CNY',
    buyerId: 'u001',
    buyerName: '张三',
    shippingAddress: {
      name: '张三',
      phone: '138****8888',
      country: 'CN',
      province: '浙江省',
      city: '杭州市',
      address: '西湖区文三路123号',
      postalCode: '310000'
    },
    warehouseId: 'wh001',
    paymentMethod: '',
    paymentStatus: 'unpaid',
    trackingNumber: '',
    trackingCompany: '',
    commission: 59.9,
    sellerAmount: 1138.1,
    createdAt: '2024-06-06T10:30:00Z',
    paidAt: '',
    shippedAt: '',
    completedAt: ''
  },
  {
    id: 'o002',
    orderNo: 'GS202406050002',
    status: 'pending_shipment',
    statusText: '待发货',
    items: [
      {
        productId: 'p002',
        productName: '轻奢时尚女士手提包',
        productImage: 'https://picsum.photos/id/220/200/200',
        skuId: 'sku003',
        skuSpec: '棕色 / 大号',
        price: 899,
        quantity: 1,
        sellerId: 's002',
        shopName: '精品箱包旗舰店'
      }
    ],
    subtotal: 899,
    shippingFee: 20,
    tax: 55.14,
    total: 974.14,
    currency: 'CNY',
    buyerId: 'u001',
    buyerName: '张三',
    shippingAddress: {
      name: '张三',
      phone: '138****8888',
      country: 'CN',
      province: '浙江省',
      city: '杭州市',
      address: '西湖区文三路123号',
      postalCode: '310000'
    },
    warehouseId: 'wh002',
    paymentMethod: 'alipay',
    paymentStatus: 'paid',
    trackingNumber: '',
    trackingCompany: '',
    commission: 44.95,
    sellerAmount: 854.05,
    createdAt: '2024-06-05T14:20:00Z',
    paidAt: '2024-06-05T14:25:00Z',
    shippedAt: '',
    completedAt: ''
  },
  {
    id: 'o003',
    orderNo: 'GS202406030003',
    status: 'shipped',
    statusText: '待收货',
    items: [
      {
        productId: 'p003',
        productName: '智能手表运动版',
        productImage: 'https://picsum.photos/id/1/200/200',
        skuId: 'sku005',
        skuSpec: '黑色硅胶带',
        price: 1299,
        quantity: 1,
        sellerId: 's001',
        shopName: '全球优品专营店'
      }
    ],
    subtotal: 1299,
    shippingFee: 0,
    tax: 77.94,
    total: 1376.94,
    currency: 'CNY',
    buyerId: 'u001',
    buyerName: '张三',
    shippingAddress: {
      name: '张三',
      phone: '138****8888',
      country: 'CN',
      province: '浙江省',
      city: '杭州市',
      address: '西湖区文三路123号',
      postalCode: '310000'
    },
    warehouseId: 'wh001',
    paymentMethod: 'wechat',
    paymentStatus: 'paid',
    trackingNumber: 'SF1234567890',
    trackingCompany: '顺丰速运',
    commission: 64.95,
    sellerAmount: 1234.05,
    createdAt: '2024-06-03T09:15:00Z',
    paidAt: '2024-06-03T09:20:00Z',
    shippedAt: '2024-06-04T10:00:00Z',
    completedAt: ''
  },
  {
    id: 'o004',
    orderNo: 'GS202405280004',
    status: 'completed',
    statusText: '已完成',
    items: [
      {
        productId: 'p005',
        productName: '婴幼儿纯棉连体衣套装',
        productImage: 'https://picsum.photos/id/237/200/200',
        skuId: 'sku009',
        skuSpec: '粉色 6-12个月',
        price: 199,
        quantity: 3,
        sellerId: 's004',
        shopName: '爱婴坊母婴店'
      }
    ],
    subtotal: 597,
    shippingFee: 0,
    tax: 35.82,
    total: 632.82,
    currency: 'CNY',
    buyerId: 'u001',
    buyerName: '张三',
    shippingAddress: {
      name: '张三',
      phone: '138****8888',
      country: 'CN',
      province: '浙江省',
      city: '杭州市',
      address: '西湖区文三路123号',
      postalCode: '310000'
    },
    warehouseId: 'wh003',
    paymentMethod: 'alipay',
    paymentStatus: 'paid',
    trackingNumber: 'YT9876543210',
    trackingCompany: '圆通速递',
    commission: 29.85,
    sellerAmount: 567.15,
    createdAt: '2024-05-28T16:45:00Z',
    paidAt: '2024-05-28T16:50:00Z',
    shippedAt: '2024-05-29T08:30:00Z',
    completedAt: '2024-06-01T11:20:00Z'
  },
  {
    id: 'o005',
    orderNo: 'GS202405200005',
    status: 'completed',
    statusText: '已完成',
    items: [
      {
        productId: 'p009',
        productName: '高端护肤套装礼盒',
        productImage: 'https://picsum.photos/id/312/200/200',
        skuId: 'sku019',
        skuSpec: '补水保湿款',
        price: 1288,
        quantity: 1,
        sellerId: 's007',
        shopName: '美颜馆美妆旗舰店'
      }
    ],
    subtotal: 1288,
    shippingFee: 0,
    tax: 77.28,
    total: 1365.28,
    currency: 'CNY',
    buyerId: 'u001',
    buyerName: '张三',
    shippingAddress: {
      name: '张三',
      phone: '138****8888',
      country: 'CN',
      province: '浙江省',
      city: '杭州市',
      address: '西湖区文三路123号',
      postalCode: '310000'
    },
    warehouseId: 'wh004',
    paymentMethod: 'alipay',
    paymentStatus: 'paid',
    trackingNumber: 'ZT5678901234',
    trackingCompany: '中通快递',
    commission: 64.4,
    sellerAmount: 1223.6,
    createdAt: '2024-05-20T11:30:00Z',
    paidAt: '2024-05-20T11:35:00Z',
    shippedAt: '2024-05-21T09:00:00Z',
    completedAt: '2024-05-25T15:40:00Z'
  }
];

export const getOrdersByStatus = (status?: string) => {
  if (!status || status === 'all') return mockOrders;
  return mockOrders.filter(o => o.status === status);
};
