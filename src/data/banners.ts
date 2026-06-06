import type { Banner } from '@/types/product';

export const mockBanners: Banner[] = [
  {
    id: 'b001',
    image: 'https://picsum.photos/id/1036/750/400',
    title: '618全球购物节',
    titleEn: '618 Global Shopping Festival',
    linkType: 'category',
    linkValue: 'cat001',
    country: 'CN'
  },
  {
    id: 'b002',
    image: 'https://picsum.photos/id/1039/750/400',
    title: '数码新品首发',
    titleEn: 'New Electronics Launch',
    linkType: 'category',
    linkValue: 'cat001',
    country: 'CN'
  },
  {
    id: 'b003',
    image: 'https://picsum.photos/id/1018/750/400',
    title: '跨境优品 限时特惠',
    titleEn: 'Cross-Border Limited Deals',
    linkType: 'product',
    linkValue: 'p006',
    country: 'CN'
  },
  {
    id: 'b004',
    image: 'https://picsum.photos/id/1015/750/400',
    title: '会员专享折扣',
    titleEn: 'Member Exclusive Discounts',
    linkType: 'page',
    linkValue: '/pages/member/index',
    country: 'CN'
  }
];
