import axios from 'axios';
import { environment } from '../environments/environment';
import { mapCart, mapLineItem } from './utils';
import { CartTheme, ICart, ICartV2 } from './api-types';
import { Cart } from './types';
import { LineItem } from './use-cart';

const apiUrl = environment.public_api_url;

export const getVersion = () => (apiUrl.endsWith('/v2') ? 2 : 1);

const api = axios.create({
  baseURL: apiUrl + '/carts/'
});

// window.organization might change so we need to get it every time
const getConfig = () => {
  const org = window['cart_organization'] || window['organization'];
  if (!org) {
    throw new Error('organization is not defined in window');
  }

  return {
    headers: {
      organization: org
    }
  };
};

const cartApi = {
  getCart: (cartId: string): Promise<Cart> => {
    return api
      .get<ICart | ICartV2>(`${cartId}`, getConfig())
      .then(res => mapCart(res.data, getVersion()));
  },
  createCart: (
    lineItems: {
      productId: string | number;
      variantId: number;
      quantity: number;
    }[]
  ): Promise<Cart> => {
    return api
      .post<ICart | ICartV2>(
        '',
        lineItems.map(item => mapLineItem(item, getVersion())),
        getConfig()
      )
      .then(res => mapCart(res.data, getVersion()));
  },
  addItemToCart: (cartId: string, lineItems: LineItem[]): Promise<Cart> => {
    return api
      .post<ICart | ICartV2>(
        `${cartId}/items`,
        lineItems.map(item => mapLineItem(item, getVersion())),
        getConfig()
      )
      .then(res => mapCart(res.data, getVersion()));
  },
  removeItemFromCart: (cartId: string, itemId: string): Promise<Cart> => {
    return api
      .delete<ICart | ICartV2>(`${cartId}/items/${itemId}`, getConfig())
      .then(res => mapCart(res.data, getVersion()));
  },
  updateItemInCart: (
    cartId: string,
    lineItem: LineItem & { id: string }
  ): Promise<Cart> => {
    return api
      .put<ICart | ICartV2>(
        `${cartId}/items/${lineItem.id}`,
        mapLineItem(lineItem, getVersion()),
        getConfig()
      )
      .then(res => mapCart(res.data, getVersion()));
  },
  getCartRelatedProducts: (cartId: string): Promise<any[]> => {
    return api
      .get<any[]>(`${cartId}/related`, getConfig())
      .then(res => res.data);
  },
  getCartCheckoutUrl: (): Promise<string> => {
    return api.get<string>('/checkout-url', getConfig()).then(res => res.data);
  },
  getCartTheme: (): Promise<CartTheme> => {
    return api.get<CartTheme>('/theme', getConfig()).then(res => res.data);
  }
};

export default cartApi;
