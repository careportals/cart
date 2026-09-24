/**
 * Shapes returned by the CarePortals public API, narrowed to what the cart
 * reads. Kept local so this app builds standalone; the API is the source of
 * truth, so treat anything here as a consumer-side contract, not a schema.
 */

export type CartTheme = {
  fontFamily?: string;
  primaryColor?: string;
  cartSummarySection?: string;
};

export type ProductV2Status = 'active' | 'disabled';

export class ProductV2Image {
  imageUrl: string;
  name?: string;
  isThumbnail?: boolean;
  sortOrder?: number;
  description?: string;
}

export class IProductV2Option {
  type: string;
  choices: {
    label: string;
    value: string;
    default: boolean;
    selected?: boolean;
  }[];
}

export type RelatedProductType =
  | 'variant'
  | 'crossSell'
  | 'upsell'
  | 'contraindication';

export class RelatedProductImages {
  thumbnailUrl: string;
  description: string;
}

export class RelatedProduct {
  productId: string;
  relationType: RelatedProductType;
  displayName: string;
  images?: RelatedProductImages[];
  price: number;
  listPrice: number;
  variantId: string | number;
  url?: string;
}

export class ILineItemDiscount {
  amount: number;
  reductionAmount: number;
  reductionType: 'percent' | 'dollar';
  type: 'coupon' | 'promotion' | 'manual';
  referenceId: string;
  name?: string;
}

/** v2 cart line item. */
export class ICartV2LineItem {
  id: string;
  name: string;
  description: string;
  productId: string | number;
  variantId: number | string;
  sku: string;
  quantity: number;
  /** final price after discounts */
  price: number;
  /** original price before discounts */
  listPrice: number;
  productStatus: ProductV2Status;
  isSubscription: boolean;
  type: 'physical' | 'digital';
  extras: Record<string, unknown>;
  optionId?: number | string;
  optionType?: number;
  optionLabel?: string;
  options?: IProductV2Option[];
  images?: ProductV2Image[];
  thumbnailUrl?: string;
  imageUrl?: string;
  subLabel?: string;
  url?: string;
  discount?: ILineItemDiscount;
  relatedProducts?: RelatedProduct[];
}

/** Known cart `extras` keys the cart UI reads. */
export interface ICartV2Extras {
  /** Comma-separated product ids the API dropped because they went unavailable. */
  removedDisabledLineItems?: string;
  [key: string]: unknown;
}

/** v2 cart. */
export class ICartV2 {
  _id?: string;
  organization?: string;
  customer?: unknown;
  lineItems: ICartV2LineItem[];
  /** positive integer representing the total discount amount */
  discountAmount: number;
  /** total based on item list prices */
  baseAmount: number;
  /** total before discounts (promotions + coupons) */
  subTotalAmount?: number;
  /** payable amount (baseAmount - discountAmount) */
  totalAmount: number;
  postPurchaseCredit?: number;
  extras?: ICartV2Extras;
  meta?: unknown;
  discountType?: 'cart' | 'product';
  createdAt?: Date;
  updatedAt?: Date;
}

/** v1 cart line item (BigCommerce-shaped). */
export class ICartLineItem {
  id?: string;
  sku?: string;
  quantity: number;
  product_id?: number;
  /** optional price override */
  list_price?: number;
  variant_id?: number;
  name?: string;
  description?: string;
}

/** v1 cart (BigCommerce-shaped). */
export class ICart {
  _id?: string;
  id: string;
  customer: any;
  customer_id?: number;
  email?: string;
  currency?: { code: string };
  base_amount: number;
  discount_amount: number;
  cart_amount: number;
  coupons?: any[];
  line_items: {
    physical_items: ICartLineItem[];
    digital_items: ICartLineItem[];
    gift_certificates?: any[];
    custom_items?: any[];
  };
  created_time?: Date;
  updated_time?: Date;
}
