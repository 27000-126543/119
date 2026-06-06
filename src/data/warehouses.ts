import type { Warehouse, WarehouseStock } from '@/types/warehouse';

export const mockWarehouses: Warehouse[] = [
  {
    id: 'WH_CN_SH',
    name: '中国上海仓',
    country: '中国',
    province: '上海市',
    city: '上海市',
    address: '浦东新区洋山保税港区',
    postalCode: '201306',
    latitude: 30.9155,
    longitude: 121.9608,
    capacity: 100000,
    currentStock: 85600,
    isActive: true
  },
  {
    id: 'WH_US_LA',
    name: '美国洛杉矶仓',
    country: '美国',
    province: '加利福尼亚州',
    city: '洛杉矶',
    address: 'Los Angeles Port District',
    postalCode: '90731',
    latitude: 33.7361,
    longitude: -118.2685,
    capacity: 80000,
    currentStock: 62300,
    isActive: true
  },
  {
    id: 'WH_DE_HH',
    name: '德国汉堡仓',
    country: '德国',
    province: '汉堡',
    city: '汉堡',
    address: 'Hamburg Free Port',
    postalCode: '20354',
    latitude: 53.5461,
    longitude: 9.9696,
    capacity: 60000,
    currentStock: 45200,
    isActive: true
  },
  {
    id: 'WH_JP_TY',
    name: '日本东京仓',
    country: '日本',
    province: '东京都',
    city: '东京',
    address: '东京湾物流园区',
    postalCode: '1350061',
    latitude: 35.6528,
    longitude: 139.8395,
    capacity: 50000,
    currentStock: 38900,
    isActive: true
  },
  {
    id: 'WH_AU_SY',
    name: '澳大利亚悉尼仓',
    country: '澳大利亚',
    province: '新南威尔士州',
    city: '悉尼',
    address: 'Sydney Port Logistics',
    postalCode: '2000',
    latitude: -33.8688,
    longitude: 151.2093,
    capacity: 40000,
    currentStock: 31500,
    isActive: true
  },
  {
    id: 'WH_BR_SP',
    name: '巴西圣保罗仓',
    country: '巴西',
    province: '圣保罗州',
    city: '圣保罗',
    address: 'Porto de Santos Logistics',
    postalCode: '01000-000',
    latitude: -23.5505,
    longitude: -46.6333,
    capacity: 35000,
    currentStock: 28700,
    isActive: true
  }
];

export const mockWarehouseStocks: WarehouseStock[] = [
  { warehouseId: 'WH_CN_SH', warehouseName: '中国上海仓', productId: '1', skuId: 'SKU1-1', quantity: 500, reservedQuantity: 23, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_CN_SH', warehouseName: '中国上海仓', productId: '1', skuId: 'SKU1-2', quantity: 300, reservedQuantity: 15, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_CN_SH', warehouseName: '中国上海仓', productId: '2', skuId: 'SKU2-1', quantity: 800, reservedQuantity: 45, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_US_LA', warehouseName: '美国洛杉矶仓', productId: '1', skuId: 'SKU1-1', quantity: 200, reservedQuantity: 8, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_US_LA', warehouseName: '美国洛杉矶仓', productId: '3', skuId: 'SKU3-1', quantity: 150, reservedQuantity: 5, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_DE_HH', warehouseName: '德国汉堡仓', productId: '1', skuId: 'SKU1-1', quantity: 180, reservedQuantity: 12, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_DE_HH', warehouseName: '德国汉堡仓', productId: '4', skuId: 'SKU4-1', quantity: 250, reservedQuantity: 18, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_JP_TY', warehouseName: '日本东京仓', productId: '2', skuId: 'SKU2-1', quantity: 300, reservedQuantity: 20, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_JP_TY', warehouseName: '日本东京仓', productId: '5', skuId: 'SKU5-1', quantity: 400, reservedQuantity: 25, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_AU_SY', warehouseName: '澳大利亚悉尼仓', productId: '3', skuId: 'SKU3-1', quantity: 120, reservedQuantity: 6, updatedAt: new Date().toISOString() },
  { warehouseId: 'WH_BR_SP', warehouseName: '巴西圣保罗仓', productId: '4', skuId: 'SKU4-1', quantity: 100, reservedQuantity: 3, updatedAt: new Date().toISOString() }
];
