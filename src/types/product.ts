export interface ProductSku {
  id: string;
  spec: string;
  price: number;
  wholesalePrice: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  images: string[];
  categoryId: string;
  categoryName: string;
  price: number;
  wholesalePrice: number;
  minWholesaleQty: number;
  stock: number;
  sales: number;
  rating: number;
  reviewCount: number;
  skus: ProductSku[];
  tags: string[];
  sellerId: string;
  sellerName: string;
  shopName: string;
  shippingTemplateId: string;
  originCountry: string;
  weight: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  parentId: string;
  level: number;
  children?: Category[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  titleEn: string;
  linkType: string;
  linkValue: string;
  country: string;
}
