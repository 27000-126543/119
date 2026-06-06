import type { ReturnRequest } from '@/types/order';
import { returnService, API_CONFIG } from '@/services/apiService';

const SELLER_TIMEOUT_HOURS = 72;

const generateReturnId = (): string => {
  return 'ret_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const createReturnRequest = async (
  orderId: string,
  orderNo: string,
  productId: string,
  productName: string,
  productImage: string,
  skuId: string,
  skuSpec: string,
  quantity: number,
  reason: string,
  description: string,
  images: string[],
  buyerId: string,
  buyerName: string,
  sellerId: string,
  refundAmount: number
): Promise<ReturnRequest> => {
  console.log('[ReturnEngine] Creating return request:', { orderId, orderNo, productId, productName, reason, refundAmount });

  if (!API_CONFIG.isMockMode) {
    const result = await returnService.createReturnRequest({
      orderId,
      orderNo,
      productId,
      productName,
      productImage,
      skuId,
      skuSpec,
      quantity,
      reason,
      description,
      images,
      buyerId,
      buyerName,
      sellerId,
      refundAmount
    });
    
    if (result.success && result.returnRequest) {
      return result.returnRequest;
    }
    throw new Error(result.message || '创建退货申请失败');
  }

  const now = new Date();
  const sellerDeadline = new Date(now.getTime() + SELLER_TIMEOUT_HOURS * 60 * 60 * 1000);

  const returnRequest: ReturnRequest = {
    id: generateReturnId(),
    orderId,
    orderNo,
    productId,
    productName,
    productImage,
    reason,
    description,
    images: images || [],
    status: 'pending_seller',
    sellerDeadline: sellerDeadline.toISOString(),
    trackingNumber: '',
    refundAmount,
    createdAt: now.toISOString()
  };

  console.log('[ReturnEngine] Return request created successfully (mock mode):', returnRequest);
  return returnRequest;
};

export const checkSellerTimeout = (returnId: string): boolean => {
  console.log('[ReturnEngine] Checking seller timeout for return:', returnId);

  const returns = loadReturns();
  const returnRequest = returns.find(r => r.id === returnId);

  if (!returnRequest) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  if (returnRequest.status !== 'pending_seller') {
    console.log('[ReturnEngine] Return is not in pending_seller status, current status:', returnRequest.status);
    return false;
  }

  const now = new Date();
  const deadline = new Date(returnRequest.sellerDeadline);
  const isTimeout = now > deadline;

  console.log('[ReturnEngine] Timeout check result:', {
    returnId,
    currentStatus: returnRequest.status,
    sellerDeadline: returnRequest.sellerDeadline,
    currentTime: now.toISOString(),
    isTimeout
  });

  return isTimeout;
};

export const escalateToPlatform = (returnId: string): ReturnRequest => {
  console.log('[ReturnEngine] Escalating return to platform review:', returnId);

  const returns = loadReturns();
  const returnIndex = returns.findIndex(r => r.id === returnId);

  if (returnIndex === -1) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  const returnRequest = returns[returnIndex];

  if (returnRequest.status !== 'pending_seller') {
    console.error('[ReturnEngine] Cannot escalate return with status:', returnRequest.status);
    throw new Error('当前退货状态不支持升级审核');
  }

  returnRequest.status = 'pending_platform';
  returns[returnIndex] = returnRequest;
  saveReturns(returns);

  console.log('[ReturnEngine] Return escalated to platform successfully:', returnRequest);
  return returnRequest;
};

export const approveReturn = (returnId: string): ReturnRequest => {
  console.log('[ReturnEngine] Approving return request:', returnId);

  const returns = loadReturns();
  const returnIndex = returns.findIndex(r => r.id === returnId);

  if (returnIndex === -1) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  const returnRequest = returns[returnIndex];

  if (returnRequest.status !== 'pending_platform') {
    console.error('[ReturnEngine] Cannot approve return with status:', returnRequest.status);
    throw new Error('当前退货状态不支持审核通过');
  }

  returnRequest.status = 'approved';
  returns[returnIndex] = returnRequest;
  saveReturns(returns);

  console.log('[ReturnEngine] Return approved successfully:', returnRequest);
  return returnRequest;
};

export const generateReturnOrder = (returnId: string): { returnId: string; returnOrderNo: string; pickupAddress: string; returnDeadline: string } => {
  console.log('[ReturnEngine] Generating return order for:', returnId);

  const returns = loadReturns();
  const returnRequest = returns.find(r => r.id === returnId);

  if (!returnRequest) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  if (returnRequest.status !== 'approved') {
    console.error('[ReturnEngine] Cannot generate return order with status:', returnRequest.status);
    throw new Error('当前退货状态不支持生成退货单');
  }

  const returnOrderNo = 'RO' + Date.now();
  const pickupAddress = '浙江省杭州市西湖区文三路123号';
  const returnDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const returnOrder = {
    returnId,
    returnOrderNo,
    pickupAddress,
    returnDeadline
  };

  console.log('[ReturnEngine] Return order generated successfully:', returnOrder);
  return returnOrder;
};

export const notifyCourierPickup = (returnId: string): { trackingNumber: string; courierCompany: string; estimatedPickupTime: string } => {
  console.log('[ReturnEngine] Notifying courier for pickup:', returnId);

  const returns = loadReturns();
  const returnIndex = returns.findIndex(r => r.id === returnId);

  if (returnIndex === -1) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  const returnRequest = returns[returnIndex];

  if (returnRequest.status !== 'approved') {
    console.error('[ReturnEngine] Cannot notify courier with status:', returnRequest.status);
    throw new Error('当前退货状态不支持通知快递');
  }

  const trackingNumber = 'SF' + Date.now();
  const courierCompany = '顺丰速运';
  const estimatedPickupTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  returnRequest.trackingNumber = trackingNumber;
  returns[returnIndex] = returnRequest;
  saveReturns(returns);

  const pickupInfo = {
    trackingNumber,
    courierCompany,
    estimatedPickupTime
  };

  console.log('[ReturnEngine] Courier pickup notified successfully:', pickupInfo);
  return pickupInfo;
};

export const processRefund = (returnId: string): { refundId: string; amount: number; status: string; completedAt: string } => {
  console.log('[ReturnEngine] Processing refund for return:', returnId);

  const returns = loadReturns();
  const returnIndex = returns.findIndex(r => r.id === returnId);

  if (returnIndex === -1) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  const returnRequest = returns[returnIndex];

  if (returnRequest.status !== 'approved') {
    console.error('[ReturnEngine] Cannot process refund with status:', returnRequest.status);
    throw new Error('当前退货状态不支持退款');
  }

  returnRequest.status = 'completed';
  returns[returnIndex] = returnRequest;
  saveReturns(returns);

  const refundId = 'ref_' + Date.now();
  const completedAt = new Date().toISOString();

  const refundResult = {
    refundId,
    amount: returnRequest.refundAmount,
    status: 'success',
    completedAt
  };

  console.log('[ReturnEngine] Refund processed successfully:', refundResult);
  return refundResult;
};

export const getReturnRequest = (returnId: string): ReturnRequest | null => {
  console.log('[ReturnEngine] Getting return request:', returnId);

  const returns = loadReturns();
  const returnRequest = returns.find(r => r.id === returnId) || null;

  console.log('[ReturnEngine] Return request retrieved:', returnRequest);
  return returnRequest;
};

export const getReturnRequestsByOrder = (orderId: string): ReturnRequest[] => {
  console.log('[ReturnEngine] Getting return requests for order:', orderId);

  const returns = loadReturns();
  const orderReturns = returns.filter(r => r.orderId === orderId);

  console.log('[ReturnEngine] Return requests for order found:', orderReturns.length);
  return orderReturns;
};

export const getAllReturnRequests = (status?: string): ReturnRequest[] => {
  console.log('[ReturnEngine] Getting all return requests, status filter:', status);

  const returns = loadReturns();
  const result = status ? returns.filter(r => r.status === status) : returns;

  console.log('[ReturnEngine] Return requests found:', result.length);
  return result;
};

export const rejectReturn = (returnId: string, reason: string): ReturnRequest => {
  console.log('[ReturnEngine] Rejecting return request:', { returnId, reason });

  const returns = loadReturns();
  const returnIndex = returns.findIndex(r => r.id === returnId);

  if (returnIndex === -1) {
    console.error('[ReturnEngine] Return request not found:', returnId);
    throw new Error('退货申请不存在');
  }

  const returnRequest = returns[returnIndex];

  if (returnRequest.status !== 'pending_platform') {
    console.error('[ReturnEngine] Cannot reject return with status:', returnRequest.status);
    throw new Error('当前退货状态不支持审核拒绝');
  }

  returnRequest.status = 'rejected';
  returns[returnIndex] = returnRequest;
  saveReturns(returns);

  console.log('[ReturnEngine] Return rejected successfully:', returnRequest);
  return returnRequest;
};
