import { atom, useAtom } from 'jotai';
import cartApi, { getVersion } from './cart-api';
import { Cart } from './types';
import { useDisclosure } from '@mantine/hooks';
import {
  RelatedProduct,
  IProductV2Option
} from './api-types';
import { MantineThemeOverride, useMantineTheme } from '@mantine/core';
import tinycolor from 'tinycolor2';

type Shades = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];
const defaultCart: Cart = {
  organization: '',
  lineItems: [],
  totalAmount: 0,
  discountAmount: 0,
  postPurchaseCredit: 0,
  baseAmount: 0,
  extras: {},
  meta: {},
  subTotalAmount: 0
};

export type LineItem = {
  productId: string | number;
  variantId?: string | number;
  quantity: number;
  options?: IProductV2Option[];
};

const defaultTheme: MantineThemeOverride = {
  fontFamily: 'inherit',
  primaryColor: 'dark'
};

const cartAtom = atom<Cart>(defaultCart);
const cartLoadingAtom = atom<boolean>(false);
const relatedProductsAtom = atom<RelatedProduct[]>([]);
const checkoutUrlAtom = atom<string>('');
const themeAtom = atom<MantineThemeOverride>(defaultTheme);
const cartSummarySectionAtom = atom<string>('');
const warningMessageAtom = atom<string>('');

export const useCart = () => {
  const mantineTheme = useMantineTheme();
  const [theme, setTheme] = useAtom(themeAtom);
  const [cartSummarySection, setCartSummarySection] = useAtom(
    cartSummarySectionAtom
  );
  const [cart, setCart] = useAtom(cartAtom);
  const [loading, setLoading] = useAtom(cartLoadingAtom);
  const [relatedProducts, setRelatedProducts] = useAtom(relatedProductsAtom);
  const [checkoutUrl, setCheckoutUrl] = useAtom(checkoutUrlAtom);
  const [opened, { open, close }] = useDisclosure(false);

  const [warningMessage, setWarningMessage] = useAtom(warningMessageAtom);

  const defaultColors = {
    dark: true,
    gray: true,
    red: true,
    pink: true,
    grape: true,
    violet: true,
    indigo: true,
    blue: true,
    cyan: true,
    green: true,
    lime: true,
    yellow: true,
    orange: true,
    teal: true
  };

  const setCartId = (id: string) => {
    localStorage.setItem('cart-id', id || '');
  };

  const handleCartPromise = (
    promise: Promise<Cart>,
    success?: (res: Cart) => void,
    failure?: (err: any) => void
  ) => {
    setLoading(true);
    return promise
      .then(res => {
        setCart(res);
        setCartId(res._id);
        if (getVersion() === 2) {
          // for v2 related products are in the cart object (cross sell)
          const relatedProducts = res.lineItems
            ?.map(item =>
              item.relatedProducts?.map(relatedProduct => {
                const itemAlreadyInCart = res.lineItems.find(
                  item => item.productId === relatedProduct.productId
                );

                if (itemAlreadyInCart) {
                  return null;
                }

                if (relatedProduct.relationType === 'crossSell') {
                  return { ...relatedProduct, variantId: null };
                }

                if (relatedProduct.relationType === 'upsell') {
                  return {
                    ...relatedProduct,
                    variantId: relatedProduct.productId,
                    productId: item.productId.toString()
                  };
                }

                return null;
              })
            )
            .flat()
            .filter(Boolean);

          setRelatedProducts(relatedProducts || []);
        }

        success?.(res);
      })
      .catch(err => {
        failure?.(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetCart = () => {
    setCart(defaultCart);
  };

  const getCart = (id?: string) => {
    if (!id) id = localStorage.getItem('cart-id');
    if (!id) return undefined;
    return handleCartPromise(cartApi.getCart(id), null, () => {
      localStorage.removeItem('cart-id');
    });
  };

  const createCart = (
    lineItems: {
      productId: string | number;
      variantId: number;
      quantity: number;
    }[]
  ) => {
    return handleCartPromise(cartApi.createCart(lineItems));
  };

  const addCartItem = (items: LineItem[]) => {
    setWarningMessage('');
    return handleCartPromise(cartApi.addItemToCart(cart._id, items), res => {
      if(res?.extras?.removedDisabledLineItems) {
        const isRemovedDisabledLineItems = res?.extras?.removedDisabledLineItems?.split(',').some(id => items.some(item => item.productId === id));

        if(isRemovedDisabledLineItems) {
          setWarningMessage('Your cart contained unavailable products and were removed from the cart.');
        }
      }

      pushToDataLayer(
        'add_to_cart',
        items.map(item => {
          const product = res.lineItems.find(
            lineItem => lineItem.productId === item.productId
          );
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            name: product?.name,
            price: product?.price,
            discount: product?.discount?.amount || 0
          };
        })
      );
    });
  };

  const removeCartItem = (itemId: string) => {
    return handleCartPromise(
      cartApi.removeItemFromCart(cart._id, itemId),
      res => {
        pushToDataLayer(
          'remove_from_cart',
          res.lineItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId.toString(),
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            discount: item.discount?.amount || 0
          }))
        );
      }
    );
  };

  const updateCartItem = (item: LineItem & { id: string }) => {
    if (item.quantity === 0) {
      return removeCartItem(item.id);
    }

    return handleCartPromise(cartApi.updateItemInCart(cart._id, item));
  };

  const changeProductVariant = (item: LineItem) => {
    return handleCartPromise(cartApi.addItemToCart(cart._id, [item]));
  };

  const getCartRelatedProducts = () => {
    cartApi.getCartRelatedProducts(cart._id).then(res => {
      setRelatedProducts(res);
    });
  };

  const getCartCheckoutUrl = () => {
    const localCheckoutUrl =
      window['portalsCheckoutUrl'] || window['carePortalsCheckoutUrl'];
    if (localCheckoutUrl) {
      setCheckoutUrl(localCheckoutUrl);
    } else {
      cartApi.getCartCheckoutUrl().then(res => {
        setCheckoutUrl(res);
      });
    }
  };

  const getCartTheme = () => {
    return cartApi.getCartTheme().then(res => {
      const theme: MantineThemeOverride = {
        ...defaultTheme
      };

      // a function that will create a 10 shades of the primary color
      const createShades = (color: string): Shades => {
        const shades = [];
        const hsl = tinycolor(color).toHsl();

        // Create 10 shades by adjusting lightness
        for (let i = 0; i < 10; i++) {
          // Lightest shade (90%) to darkest shade (10%)
          const lightness = 0.9 - i * 0.08;
          hsl.l = lightness;
          shades.push(tinycolor(hsl).toHexString());
        }

        return shades as Shades;
      };

      const primaryColor = res.primaryColor;
      if (primaryColor) {
        if (defaultColors[primaryColor]) {
          theme.primaryColor = primaryColor;
          theme.colors = { brand: mantineTheme.colors[primaryColor] };
        } else {
          theme.colors = {
            brand: createShades(primaryColor)
          };
          theme.primaryColor = 'brand';
          theme.fontFamily = res.fontFamily || 'inherit';
        }
      }

      setTheme(theme);
      setCartSummarySection(res.cartSummarySection);
    });
  };

  const pushToDataLayer = (
    event,
    items: {
      productId: string | number;
      variantId: string | number;
      quantity: number;
      name: string;
      price: number;
      discount: number;
      // currency: string;
    }[]
  ) => {
    try {
      console.debug('pushToDataLayer items>> ', event, items);
      window.dataLayer = window.dataLayer ?? [];
      const mappedItems = items.map
        ? items.map(item => ({
            item_id: item.productId,
            item_name: item.name,
            // coupon: item.coupons,
            // currency: 'CAD',
            discount: item.discount,
            item_variant: item.variantId,
            price: item.price,
            quantity: item.quantity
          }))
        : [];

      window.dataLayer.push({
        event: event,
        ecommerce: {
          items: [...mappedItems]
        }
      });
    } catch (error) {
      console.error('dataLayer push failed', error);
    }
  };

  return {
    theme,
    cart,
    warningMessage,
    resetCart,
    getCart,
    createCart,
    addCartItem,
    removeCartItem,
    loading,
    opened,
    open,
    close,
    relatedProducts,
    getCartRelatedProducts,
    checkoutUrl,
    getCartCheckoutUrl,
    updateCartItem,
    changeProductVariant,
    getCartTheme,
    cartSummarySection
  };
};
