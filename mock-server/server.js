/**
 * GB2C E-commerce Platform - Mock API Server
 * 
 * 这是一个完整的Express mock server，模拟后端API
 * 支持所有前端需要的接口：用户认证、订单管理、支付、退货、管理后台等
 * 
 * 启动方式：
 *   cd mock-server
 *   npm install
 *   npm start
 * 
 * 服务器将运行在 http://localhost:3001
 * 在前端设置：window.__API_BASE_URL__ = 'http://localhost:3001'
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'gb2c-secret-key-2024';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================
// 内存数据存储
// ============================================

const db = {
  users: [
    {
      id: 'u001',
      phone: '13888888888',
      password: bcrypt.hashSync('123456', 10),
      email: 'zhangsan@example.com',
      avatar: 'https://picsum.photos/id/64/100/100',
      nickname: '张三',
      realname: '张三',
      realnameStatus: 'approved',
      idCardNo: '330102199001011234',
      idCardFront: 'https://picsum.photos/id/1/200/200',
      idCardBack: 'https://picsum.photos/id/2/200/200',
      language: 'zh',
      currency: 'CNY',
      country: 'CN',
      memberLevel: 'gold',
      memberLevelText: '黄金会员',
      totalTradeAmount: 125800,
      nextLevelAmount: 50000,
      levelProgress: 71.5,
      couponCount: 8,
      freeReturnCount: 3,
      hasShop: true,
      shopId: 'shop001',
      shopName: '全球优品专营店',
      isAdmin: true,
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'u002',
      phone: '13999999999',
      password: bcrypt.hashSync('123456', 10),
      email: 'lisi@example.com',
      avatar: 'https://picsum.photos/id/65/100/100',
      nickname: '李四',
      realname: '',
      realnameStatus: 'not_submitted',
      idCardNo: '',
      idCardFront: '',
      idCardBack: '',
      language: 'zh',
      currency: 'CNY',
      country: 'CN',
      memberLevel: 'silver',
      memberLevelText: '白银会员',
      totalTradeAmount: 25600,
      nextLevelAmount: 24400,
      levelProgress: 51.2,
      couponCount: 5,
      freeReturnCount: 1,
      hasShop: false,
      shopId: '',
      shopName: '',
      isAdmin: false,
      createdAt: '2024-03-20T00:00:00Z'
    }
  ],
  orders: [],
  payments: [],
  returns: [],
  realnameAuth: [],
  settlements: []
};

// 初始化一些示例订单
const initSampleOrders = () => {
  if (db.orders.length === 0) {
    db.orders = [
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
      }
    ];
  }
};

initSampleOrders();

// ============================================
// 工具函数
// ============================================

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateOrderNo = () => {
  const now = new Date();
  return `GS${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.random().toString().substr(2, 4).toUpperCase()}`;
};

const response = (res, data, message = 'success', code = 200) => {
  res.json({ success: true, data, message, code });
};

const errorResponse = (res, message = 'error', code = 400) => {
  res.status(code).json({ success: false, data: null, message, code });
};

const calculateMemberLevel = (totalTradeAmount) => {
  if (totalTradeAmount >= 100000) {
    return {
      level: 'diamond',
      name: '钻石会员',
      nextLevelAmount: 0,
      progress: 100,
      couponCount: 20,
      freeReturnCount: 99
    };
  } else if (totalTradeAmount >= 30000) {
    return {
      level: 'gold',
      name: '黄金会员',
      nextLevelAmount: 100000 - totalTradeAmount,
      progress: Math.round((totalTradeAmount / 100000) * 100),
      couponCount: 10,
      freeReturnCount: 5
    };
  } else if (totalTradeAmount >= 5000) {
    return {
      level: 'silver',
      name: '白银会员',
      nextLevelAmount: 30000 - totalTradeAmount,
      progress: Math.round((totalTradeAmount / 30000) * 100),
      couponCount: 5,
      freeReturnCount: 2
    };
  }
  return {
    level: 'normal',
    name: '普通会员',
    nextLevelAmount: 5000 - totalTradeAmount,
    progress: Math.round((totalTradeAmount / 5000) * 100),
    couponCount: 3,
    freeReturnCount: 1
  };
};

// ============================================
// 认证中间件
// ============================================

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, '未授权访问', 401);
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return errorResponse(res, '用户不存在', 401);
    }
    
    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Token无效或已过期', 401);
  }
};

// ============================================
// 用户认证接口
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    console.log('[API] Login attempt:', phone);
    
    if (!phone || !password) {
      return errorResponse(res, '请输入手机号和密码');
    }

    const user = db.users.find(u => u.phone === phone);
    
    if (!user) {
      return errorResponse(res, '用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // 为了方便测试，非加密密码也允许登录
      if (password !== '123456' && password !== user.phone) {
        return errorResponse(res, '密码错误');
      }
    }

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = { ...user };
    delete userResponse.password;

    console.log('[API] Login successful:', user.nickname);
    
    response(res, { user: userResponse, token }, '登录成功');
  } catch (err) {
    console.error('[API] Login error:', err);
    errorResponse(res, '登录失败，请稍后重试');
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body;
    
    console.log('[API] Register attempt:', phone, nickname);
    
    if (!phone || !password || !nickname) {
      return errorResponse(res, '请填写完整信息');
    }

    if (phone.length !== 11) {
      return errorResponse(res, '请输入正确的手机号');
    }

    const existingUser = db.users.find(u => u.phone === phone);
    
    if (existingUser) {
      return errorResponse(res, '该手机号已注册');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const levelInfo = calculateMemberLevel(0);

    const newUser = {
      id: generateId('u'),
      phone,
      password: hashedPassword,
      email: '',
      avatar: 'https://picsum.photos/id/64/100/100',
      nickname,
      realname: '',
      realnameStatus: 'not_submitted',
      idCardNo: '',
      idCardFront: '',
      idCardBack: '',
      language: 'zh',
      currency: 'CNY',
      country: 'CN',
      memberLevel: levelInfo.level,
      memberLevelText: levelInfo.name,
      totalTradeAmount: 0,
      nextLevelAmount: levelInfo.nextLevelAmount,
      levelProgress: levelInfo.progress,
      couponCount: levelInfo.couponCount,
      freeReturnCount: levelInfo.freeReturnCount,
      hasShop: false,
      shopId: '',
      shopName: '',
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    const token = jwt.sign({ userId: newUser.id, phone: newUser.phone }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = { ...newUser };
    delete userResponse.password;

    console.log('[API] Register successful:', newUser.nickname);
    
    response(res, { user: userResponse, token }, '注册成功');
  } catch (err) {
    console.error('[API] Register error:', err);
    errorResponse(res, '注册失败，请稍后重试');
  }
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  console.log('[API] Logout:', req.user.phone);
  response(res, null, '登出成功');
});

// ============================================
// 用户信息接口
// ============================================

app.get('/api/user/profile/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  
  if (req.user.id !== userId && !req.user.isAdmin) {
    return errorResponse(res, '无权限访问', 403);
  }

  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return errorResponse(res, '用户不存在');
  }

  const userResponse = { ...user };
  delete userResponse.password;
  
  response(res, userResponse, '获取成功');
});

app.post('/api/user/realname-auth', authMiddleware, (req, res) => {
  try {
    const { userId, name, idCard, idCardFront, idCardBack } = req.body;
    
    console.log('[API] Submit realname auth:', userId, name);
    
    if (req.user.id !== userId && !req.user.isAdmin) {
      return errorResponse(res, '无权限操作', 403);
    }

    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return errorResponse(res, '用户不存在');
    }

    db.users[userIndex].realname = name;
    db.users[userIndex].idCardNo = idCard;
    db.users[userIndex].idCardFront = idCardFront;
    db.users[userIndex].idCardBack = idCardBack;
    db.users[userIndex].realnameStatus = 'pending';

    db.realnameAuth.push({
      id: generateId('auth'),
      userId,
      name,
      idCard,
      idCardFront,
      idCardBack,
      status: 'pending',
      submittedAt: new Date().toISOString()
    });

    console.log('[API] Realname auth submitted successfully:', userId);
    response(res, null, '实名认证提交成功，等待审核');
  } catch (err) {
    console.error('[API] Realname auth error:', err);
    errorResponse(res, '提交失败，请稍后重试');
  }
});

app.post('/api/user/update-member-level', authMiddleware, (req, res) => {
  try {
    const { userId, tradeAmount } = req.body;
    
    console.log('[API] Update member level:', userId, tradeAmount);
    
    if (req.user.id !== userId && !req.user.isAdmin) {
      return errorResponse(res, '无权限操作', 403);
    }

    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return errorResponse(res, '用户不存在');
    }

    const newTotal = db.users[userIndex].totalTradeAmount + tradeAmount;
    const levelInfo = calculateMemberLevel(newTotal);

    db.users[userIndex].totalTradeAmount = newTotal;
    db.users[userIndex].memberLevel = levelInfo.level;
    db.users[userIndex].memberLevelText = levelInfo.name;
    db.users[userIndex].nextLevelAmount = levelInfo.nextLevelAmount;
    db.users[userIndex].levelProgress = levelInfo.progress;
    db.users[userIndex].couponCount = levelInfo.couponCount;
    db.users[userIndex].freeReturnCount = levelInfo.freeReturnCount;

    const userResponse = { ...db.users[userIndex] };
    delete userResponse.password;

    console.log('[API] Member level updated:', levelInfo.name);
    response(res, userResponse, '会员等级更新成功');
  } catch (err) {
    console.error('[API] Update member level error:', err);
    errorResponse(res, '更新失败，请稍后重试');
  }
});

// ============================================
// 订单接口
// ============================================

app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('[API] Create order:', req.user.id);

    const orderNo = generateOrderNo();
    const now = new Date();

    const newOrder = {
      id: generateId('o'),
      orderNo,
      status: 'pending_payment',
      statusText: '待付款',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee || 0,
      tax: orderData.tax || 0,
      total: orderData.total || 0,
      currency: orderData.currency || 'CNY',
      buyerId: req.user.id,
      buyerName: req.user.nickname,
      shippingAddress: orderData.shippingAddress || {
        name: req.user.nickname,
        phone: req.user.phone,
        country: 'CN',
        province: '',
        city: '',
        address: '',
        postalCode: ''
      },
      warehouseId: orderData.warehouseId || '',
      paymentMethod: '',
      paymentStatus: 'unpaid',
      trackingNumber: '',
      trackingCompany: '',
      commission: orderData.commission || Math.round(orderData.total * 0.05 * 100) / 100,
      sellerAmount: orderData.sellerAmount || Math.round(orderData.total * 0.95 * 100) / 100,
      createdAt: now.toISOString(),
      paidAt: '',
      shippedAt: '',
      completedAt: ''
    };

    db.orders.push(newOrder);

    console.log('[API] Order created:', newOrder.orderNo);
    response(res, newOrder, '订单创建成功');
  } catch (err) {
    console.error('[API] Create order error:', err);
    errorResponse(res, '订单创建失败，请稍后重试');
  }
});

app.get('/api/orders', authMiddleware, (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Get orders:', userId, 'status:', status);

    let orders = isAdmin ? [...db.orders] : db.orders.filter(o => o.buyerId === userId);

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('[API] Orders retrieved:', orders.length);
    response(res, orders, '获取成功');
  } catch (err) {
    console.error('[API] Get orders error:', err);
    errorResponse(res, '获取失败，请稍后重试');
  }
});

app.get('/api/orders/:orderId', authMiddleware, (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Get order detail:', orderId);

    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return errorResponse(res, '订单不存在');
    }

    if (!isAdmin && order.buyerId !== userId) {
      return errorResponse(res, '无权限查看', 403);
    }

    response(res, order, '获取成功');
  } catch (err) {
    console.error('[API] Get order detail error:', err);
    errorResponse(res, '获取失败，请稍后重试');
  }
});

app.post('/api/orders/:orderId/cancel', authMiddleware, (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Cancel order:', orderId);

    const orderIndex = db.orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return errorResponse(res, '订单不存在');
    }

    if (!isAdmin && db.orders[orderIndex].buyerId !== userId) {
      return errorResponse(res, '无权限操作', 403);
    }

    if (db.orders[orderIndex].status !== 'pending_payment') {
      return errorResponse(res, '当前订单状态不支持取消');
    }

    db.orders[orderIndex].status = 'cancelled';
    db.orders[orderIndex].statusText = '已取消';

    console.log('[API] Order cancelled:', orderId);
    response(res, null, '订单取消成功');
  } catch (err) {
    console.error('[API] Cancel order error:', err);
    errorResponse(res, '取消失败，请稍后重试');
  }
});

app.post('/api/orders/:orderId/confirm', authMiddleware, (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Confirm order receipt:', orderId);

    const orderIndex = db.orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return errorResponse(res, '订单不存在');
    }

    if (!isAdmin && db.orders[orderIndex].buyerId !== userId) {
      return errorResponse(res, '无权限操作', 403);
    }

    if (db.orders[orderIndex].status !== 'shipped') {
      return errorResponse(res, '当前订单状态不支持确认收货');
    }

    db.orders[orderIndex].status = 'completed';
    db.orders[orderIndex].statusText = '已完成';
    db.orders[orderIndex].completedAt = new Date().toISOString();

    // 自动结算
    const order = db.orders[orderIndex];
    const settlement = {
      id: generateId('set'),
      orderId: order.id,
      orderNo: order.orderNo,
      totalAmount: order.total,
      commissionRate: 0.05,
      commissionAmount: order.commission,
      sellerAmount: order.sellerAmount,
      sellerId: order.items[0]?.sellerId || '',
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    db.settlements.push(settlement);

    console.log('[API] Order confirmed and settled:', orderId);
    response(res, null, '确认收货成功');
  } catch (err) {
    console.error('[API] Confirm order error:', err);
    errorResponse(res, '确认失败，请稍后重试');
  }
});

// ============================================
// 支付接口
// ============================================

app.post('/api/payments', authMiddleware, (req, res) => {
  try {
    const paymentData = req.body;
    
    console.log('[API] Create payment order:', req.user.id);

    const newPayment = {
      id: generateId('pay'),
      orderIds: paymentData.orderIds || [],
      buyerId: req.user.id,
      totalAmount: paymentData.totalAmount || 0,
      currency: paymentData.currency || 'CNY',
      paymentMethod: '',
      status: 'pending',
      statusText: '待支付',
      createdAt: new Date().toISOString(),
      paidAt: ''
    };

    db.payments.push(newPayment);

    console.log('[API] Payment order created:', newPayment.id);
    response(res, newPayment, '支付订单创建成功');
  } catch (err) {
    console.error('[API] Create payment error:', err);
    errorResponse(res, '创建失败，请稍后重试');
  }
});

app.post('/api/payments/:paymentId/pay', authMiddleware, (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod } = req.body;

    console.log('[API] Process payment:', paymentId, 'method:', paymentMethod);

    const paymentIndex = db.payments.findIndex(p => p.id === paymentId);

    if (paymentIndex === -1) {
      return errorResponse(res, '支付订单不存在');
    }

    if (db.payments[paymentIndex].buyerId !== req.user.id && !req.user.isAdmin) {
      return errorResponse(res, '无权限操作', 403);
    }

    // 模拟支付成功率 95%
    const successRate = 0.95;
    const isSuccess = Math.random() < successRate;

    if (!isSuccess) {
      db.payments[paymentIndex].status = 'failed';
      db.payments[paymentIndex].statusText = '支付失败';
      return errorResponse(res, '支付失败，请重试');
    }

    db.payments[paymentIndex].status = 'paid';
    db.payments[paymentIndex].statusText = '支付成功';
    db.payments[paymentIndex].paymentMethod = paymentMethod;
    db.payments[paymentIndex].paidAt = new Date().toISOString();

    // 更新关联订单状态
    const orderIds = db.payments[paymentIndex].orderIds || [];
    orderIds.forEach(orderId => {
      const orderIndex = db.orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        db.orders[orderIndex].status = 'pending_shipment';
        db.orders[orderIndex].statusText = '待发货';
        db.orders[orderIndex].paymentMethod = paymentMethod;
        db.orders[orderIndex].paymentStatus = 'paid';
        db.orders[orderIndex].paidAt = new Date().toISOString();
      }
    });

    console.log('[API] Payment successful:', paymentId);
    response(res, null, '支付成功');
  } catch (err) {
    console.error('[API] Process payment error:', err);
    errorResponse(res, '支付失败，请稍后重试');
  }
});

app.post('/api/payments/settle/:orderId', authMiddleware, (req, res) => {
  try {
    const { orderId } = req.params;
    const { commissionRate = 0.05 } = req.body;

    console.log('[API] Settle payment for order:', orderId);

    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return errorResponse(res, '订单不存在');
    }

    if (order.status !== 'completed') {
      return errorResponse(res, '订单未完成，无法结算');
    }

    const commissionAmount = Math.round(order.total * commissionRate * 100) / 100;
    const sellerAmount = Math.round((order.total - commissionAmount) * 100) / 100;

    const settlement = {
      id: generateId('set'),
      orderId,
      orderNo: order.orderNo,
      totalAmount: order.total,
      commissionRate,
      commissionAmount,
      sellerAmount,
      sellerId: order.items[0]?.sellerId || '',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    db.settlements.push(settlement);

    console.log('[API] Settlement completed:', settlement.id);
    response(res, settlement, '结算完成');
  } catch (err) {
    console.error('[API] Settle payment error:', err);
    errorResponse(res, '结算失败，请稍后重试');
  }
});

// ============================================
// 退货接口
// ============================================

app.post('/api/returns', authMiddleware, (req, res) => {
  try {
    const returnData = req.body;
    
    console.log('[API] Create return request:', req.user.id);

    const now = new Date();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const newReturn = {
      id: generateId('ret'),
      orderId: returnData.orderId || '',
      orderNo: returnData.orderNo || '',
      productId: returnData.productId || '',
      productName: returnData.productName || '',
      productImage: returnData.productImage || '',
      skuId: returnData.skuId || '',
      skuSpec: returnData.skuSpec || '',
      quantity: returnData.quantity || 1,
      reason: returnData.reason || '',
      description: returnData.description || '',
      images: returnData.images || [],
      buyerId: req.user.id,
      buyerName: req.user.nickname,
      sellerId: returnData.sellerId || '',
      status: 'pending_seller',
      statusText: '待卖家审核',
      sellerDeadline: deadline.toISOString(),
      refundAmount: returnData.refundAmount || 0,
      returnOrderNo: '',
      trackingNumber: '',
      trackingCompany: '',
      platformReviewNote: '',
      createdAt: now.toISOString(),
      approvedAt: '',
      completedAt: ''
    };

    db.returns.push(newReturn);

    console.log('[API] Return request created:', newReturn.id);
    response(res, newReturn, '退货申请提交成功');
  } catch (err) {
    console.error('[API] Create return error:', err);
    errorResponse(res, '提交失败，请稍后重试');
  }
});

app.get('/api/returns', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Get return requests:', userId);

    let returns = isAdmin ? [...db.returns] : db.returns.filter(r => r.buyerId === userId);
    returns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('[API] Return requests retrieved:', returns.length);
    response(res, returns, '获取成功');
  } catch (err) {
    console.error('[API] Get returns error:', err);
    errorResponse(res, '获取失败，请稍后重试');
  }
});

app.post('/api/returns/:returnId/escalate', authMiddleware, (req, res) => {
  try {
    const { returnId } = req.params;
    const { note } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Escalate return to platform:', returnId);

    const returnIndex = db.returns.findIndex(r => r.id === returnId);

    if (returnIndex === -1) {
      return errorResponse(res, '退货申请不存在');
    }

    if (!isAdmin && db.returns[returnIndex].buyerId !== userId) {
      return errorResponse(res, '无权限操作', 403);
    }

    db.returns[returnIndex].status = 'pending_platform';
    db.returns[returnIndex].statusText = '待平台审核';
    db.returns[returnIndex].platformReviewNote = note || '';

    console.log('[API] Return escalated to platform:', returnId);
    response(res, null, '已升级到平台审核');
  } catch (err) {
    console.error('[API] Escalate return error:', err);
    errorResponse(res, '操作失败，请稍后重试');
  }
});

app.post('/api/returns/:returnId/approve', authMiddleware, (req, res) => {
  try {
    const { returnId } = req.params;
    const { isPlatform = false } = req.body;
    const isAdmin = req.user.isAdmin;

    console.log('[API] Approve return:', returnId, 'isPlatform:', isPlatform);

    if (!isAdmin) {
      return errorResponse(res, '无权限操作', 403);
    }

    const returnIndex = db.returns.findIndex(r => r.id === returnId);

    if (returnIndex === -1) {
      return errorResponse(res, '退货申请不存在');
    }

    const returnOrderNo = 'RTN' + Date.now();
    const trackingNumber = 'SF' + Math.random().toString().substr(2, 10).toUpperCase();

    db.returns[returnIndex].status = 'approved';
    db.returns[returnIndex].statusText = '审核通过';
    db.returns[returnIndex].approvedAt = new Date().toISOString();
    db.returns[returnIndex].returnOrderNo = returnOrderNo;
    db.returns[returnIndex].trackingNumber = trackingNumber;
    db.returns[returnIndex].trackingCompany = '顺丰速运';

    console.log('[API] Return approved:', returnId, 'tracking:', trackingNumber);
    response(res, db.returns[returnIndex], '退货申请已通过，快递将上门取件');
  } catch (err) {
    console.error('[API] Approve return error:', err);
    errorResponse(res, '审核失败，请稍后重试');
  }
});

// ============================================
// 管理后台接口
// ============================================

app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return errorResponse(res, '无权限访问', 403);
    }

    const { country, startDate, endDate } = req.query;
    
    console.log('[API] Get dashboard stats:', { country, startDate, endDate });

    const completedOrders = db.orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = db.orders.length;
    const returnRate = db.orders.length > 0 ? (db.returns.length / db.orders.length) * 100 : 0;

    const stats = {
      totalOrders,
      totalRevenue,
      activeSellers: 12,
      activeBuyers: db.users.filter(u => !u.isAdmin).length,
      returnRate: Math.round(returnRate * 100) / 100,
      avgComplaintResolutionHours: 4.5,
      categorySales: [
        { category: '数码电子', revenue: 125600, orders: 156 },
        { category: '服饰鞋包', revenue: 89500, orders: 234 },
        { category: '家居生活', revenue: 67800, orders: 89 },
        { category: '母婴用品', revenue: 45600, orders: 312 },
        { category: '食品饮料', revenue: 34200, orders: 178 }
      ],
      sellerActivity: [
        { sellerId: 's001', shopName: '全球优品专营店', ordersToday: 12, revenueToday: 15680, lastActive: new Date().toISOString() },
        { sellerId: 's002', shopName: '精品箱包旗舰店', ordersToday: 8, revenueToday: 9850, lastActive: new Date(Date.now() - 3600000).toISOString() },
        { sellerId: 's003', shopName: '北欧家居官方店', ordersToday: 5, revenueToday: 7200, lastActive: new Date(Date.now() - 7200000).toISOString() }
      ],
      hotCategories: [
        { category: '数码电子', trend: 'up', growthRate: 15.6, predictedDemand: 1250 },
        { category: '美妆个护', trend: 'up', growthRate: 22.3, predictedDemand: 980 },
        { category: '母婴用品', trend: 'stable', growthRate: 5.2, predictedDemand: 850 },
        { category: '运动户外', trend: 'down', growthRate: -3.1, predictedDemand: 420 }
      ],
      recentOrders: db.orders.slice(0, 5).map(o => ({
        id: o.id,
        orderNo: o.orderNo,
        buyer: o.buyerName,
        country: o.shippingAddress.country,
        amount: o.total,
        status: o.statusText,
        createdAt: o.createdAt
      }))
    };

    console.log('[API] Dashboard stats retrieved');
    response(res, stats, '获取成功');
  } catch (err) {
    console.error('[API] Get dashboard error:', err);
    errorResponse(res, '获取失败，请稍后重试');
  }
});

app.get('/api/admin/report/monthly', authMiddleware, (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return errorResponse(res, '无权限访问', 403);
    }

    const { month } = req.query;
    
    console.log('[API] Get monthly report:', month);

    const report = {
      month: month || new Date().toISOString().slice(0, 7),
      totalRevenue: 568900,
      totalOrders: 1256,
      avgOrderValue: 452.95,
      countryBreakdown: [
        { countryCode: 'CN', countryName: '中国', revenue: 289600, orders: 689, avgOrderValue: 420.32 },
        { countryCode: 'US', countryName: '美国', revenue: 125800, orders: 256, avgOrderValue: 491.41 },
        { countryCode: 'DE', countryName: '德国', revenue: 68900, orders: 134, avgOrderValue: 514.18 },
        { countryCode: 'JP', countryName: '日本', revenue: 52300, orders: 112, avgOrderValue: 466.96 },
        { countryCode: 'OTHER', countryName: '其他', revenue: 32300, orders: 65, avgOrderValue: 496.92 }
      ],
      sellerPerformance: [
        { sellerId: 's001', shopName: '全球优品专营店', revenue: 156800, orders: 234, returns: 8, returnRate: 3.42, rating: 4.8 },
        { sellerId: 's002', shopName: '精品箱包旗舰店', revenue: 112500, orders: 156, returns: 5, returnRate: 3.21, rating: 4.9 },
        { sellerId: 's003', shopName: '北欧家居官方店', revenue: 89600, orders: 89, returns: 3, returnRate: 3.37, rating: 4.7 }
      ],
      returnAnalysis: [
        { reason: '尺码不合适', count: 23, percentage: 35.4, avgRefundAmount: 328.5 },
        { reason: '商品质量问题', count: 18, percentage: 27.7, avgRefundAmount: 568.2 },
        { reason: '与描述不符', count: 12, percentage: 18.5, avgRefundAmount: 425.8 },
        { reason: '不想要了', count: 12, percentage: 18.5, avgRefundAmount: 289.6 }
      ],
      logisticsPerformance: [
        { provider: '顺丰速运', totalShipments: 568, avgDeliveryDays: 2.3, onTimeRate: 98.5, damageRate: 0.3 },
        { provider: '圆通速递', totalShipments: 345, avgDeliveryDays: 3.5, onTimeRate: 95.2, damageRate: 0.8 },
        { provider: '中通快递', totalShipments: 256, avgDeliveryDays: 3.8, onTimeRate: 94.8, damageRate: 0.6 }
      ],
      categorySales: [
        { category: '数码电子', revenue: 189600, orders: 256, growthRate: 15.6 },
        { category: '服饰鞋包', revenue: 145800, orders: 312, growthRate: 12.3 },
        { category: '家居生活', revenue: 98500, orders: 124, growthRate: 8.7 },
        { category: '母婴用品', revenue: 78600, orders: 289, growthRate: 18.2 },
        { category: '美妆个护', revenue: 56400, orders: 275, growthRate: 22.5 }
      ]
    };

    console.log('[API] Monthly report retrieved:', month);
    response(res, report, '获取成功');
  } catch (err) {
    console.error('[API] Get monthly report error:', err);
    errorResponse(res, '获取失败，请稍后重试');
  }
});

app.post('/api/admin/report/export', authMiddleware, (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return errorResponse(res, '无权限访问', 403);
    }

    const reportData = req.body;
    
    console.log('[API] Export report CSV');

    const headers = Object.keys(reportData[0] || {}).join(',');
    const rows = reportData.map(row =>
      Object.values(row).map(value => `"${value}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const filename = `月度报表_${new Date().toISOString().slice(0, 7)}.csv`;

    response(res, { csvContent, filename }, '导出成功');
  } catch (err) {
    console.error('[API] Export report error:', err);
    errorResponse(res, '导出失败，请稍后重试');
  }
});

// ============================================
// 健康检查
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GB2C Mock API Server is running',
    timestamp: new Date().toISOString(),
    stats: {
      users: db.users.length,
      orders: db.orders.length,
      payments: db.payments.length,
      returns: db.returns.length
    }
  });
});

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 GB2C Mock API Server is running!');
  console.log('='.repeat(60));
  console.log(`\n📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n📋 Available API Endpoints:');
  console.log('   POST /api/auth/login              - 用户登录');
  console.log('   POST /api/auth/register           - 用户注册');
  console.log('   POST /api/auth/logout             - 用户登出');
  console.log('   GET  /api/user/profile/:userId    - 获取用户信息');
  console.log('   POST /api/user/realname-auth      - 提交实名认证');
  console.log('   POST /api/user/update-member-level - 更新会员等级');
  console.log('   POST /api/orders                  - 创建订单');
  console.log('   GET  /api/orders                  - 获取订单列表');
  console.log('   GET  /api/orders/:orderId         - 获取订单详情');
  console.log('   POST /api/orders/:orderId/cancel  - 取消订单');
  console.log('   POST /api/orders/:orderId/confirm - 确认收货');
  console.log('   POST /api/payments                - 创建支付订单');
  console.log('   POST /api/payments/:paymentId/pay - 处理支付');
  console.log('   POST /api/payments/settle/:orderId - 结算货款');
  console.log('   POST /api/returns                 - 创建退货申请');
  console.log('   GET  /api/returns                 - 获取退货列表');
  console.log('   POST /api/returns/:returnId/escalate - 升级平台审核');
  console.log('   POST /api/returns/:returnId/approve - 审核通过退货');
  console.log('   GET  /api/admin/dashboard         - 管理员仪表盘');
  console.log('   GET  /api/admin/report/monthly    - 月度报表');
  console.log('   POST /api/admin/report/export     - 导出报表');
  console.log('\n👤 Test Accounts:');
  console.log('   管理员: 13888888888 / 123456');
  console.log('   普通用户: 13999999999 / 123456');
  console.log('\n💡 Usage in Frontend:');
  console.log('   window.__API_BASE_URL__ = "http://localhost:3001";');
  console.log('\n' + '='.repeat(60) + '\n');
});

module.exports = app;
