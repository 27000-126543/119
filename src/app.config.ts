export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/market/index',
    'pages/orders/index',
    'pages/mine/index',
    'pages/product-detail/index',
    'pages/cart/index',
    'pages/login/index',
    'pages/realname-auth/index',
    'pages/member/index',
    'pages/seller/index',
    'pages/admin/index',
    'pages/search/index',
    'pages/address/index',
    'pages/payment/index',
    'pages/return/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'GlobalShop',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/market/index',
        text: '市场'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
