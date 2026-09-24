import {
  ICart,
  ICartLineItem,
  ICartV2,
  ICartV2LineItem,
  RelatedProduct,
  IProductV2Option,
  ProductV2Image
} from '../api-types';
import { Cart } from '../types';

export const CurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0 // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // These options are needed to round to whole numbers if that's what you want.
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export const mapCart = (cart: ICart | ICartV2, v: 1 | 2): Cart => {
  if (v === 1) {
    cart = cart as ICart;

    const mapLineItem = (
      item: ICartLineItem & { type: 'physical' | 'digital'; images?: ProductV2Image[]; thumbnailUrl?: string }
    ): ICartV2LineItem => ({
      id: item.id,
      name: item.name,
      description: item.description,
      productId: item.product_id.toString(),
      variantId: item.variant_id,
      sku: item.sku,
      price: item.list_price,
      listPrice: item.list_price,
      quantity: item.quantity,
      optionId: null,
      optionType: null,
      optionLabel: null,
      isSubscription: false,
      type: item.type,
      images: item.images,
      thumbnailUrl: item.thumbnailUrl,
      productStatus: 'active',
      extras: {}
    });

    const physicalItems: ICartV2LineItem[] = cart.line_items.physical_items.map(
      item => mapLineItem({ ...item, type: 'physical' })
    );
    const digitalItems: ICartV2LineItem[] = cart.line_items.digital_items.map(
      item => mapLineItem({ ...item, type: 'digital' })
    );

    return {
      _id: cart.id,
      customer: cart.customer,
      totalAmount: cart.cart_amount,
      discountAmount: cart.discount_amount,
      baseAmount: cart.base_amount,
      extras: {},
      meta: {},
      lineItems: [...physicalItems, ...digitalItems]
    } as ICartV2;
  }

  cart = cart as ICartV2;

  return {
    ...cart,
    lineItems: cart.lineItems.map(item => ({
      ...item,
      listPrice: item.listPrice || item.price
    }))
  };
};

// this will only be used for v1
export const mapRelatedProduct = (product: any): RelatedProduct => {
  return {
    images: product.images?.map(image => ({
      thumbnailUrl: image.url_thumbnail,
      description: image.description
    })),
    productId: product.id,
    displayName: product.name,
    price: product.price,
    variantId: product.base_variant_id || product.variants[0].id,
    relationType: undefined,
    listPrice: undefined
  };
};

export const mapLineItem = (
  item: {
    id?: string;
    productId?: string | number;
    variantId?: number | string;
    quantity?: number;
    options?: IProductV2Option[];
  },
  v: 1 | 2
):
  | {
      id?: string;
      productId?: string;
      variantId?: number | string;
      quantity?: number;
      options?: Record<string, string | number>;
    }
  | {
      id?: string;
      product_id?: number;
      variant_id?: number | string;
      quantity?: number;
      options?: Record<string, string | number>;
    } => {
  if (v === 1) {
    return {
      id: item.id,
      product_id: +item.productId,
      variant_id: +item.variantId,
      quantity: item.quantity || 1
    };
  }

  return {
    id: item.id,
    productId: item.productId.toString(),
    variantId: item.variantId,
    quantity: item.quantity || 1,
    options: (item.options || []).reduce((acc, option) => {
      acc[option.type] = option.choices.find(choice => choice.selected)?.value;

      return acc;
    }, {} as Record<string, string | number>)
  };
};
