// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ActionIcon,
  Button,
  Drawer,
  Flex,
  Indicator,
  LoadingOverlay,
  Space
} from '@mantine/core';
import CartItemsList from './components/cart-items-list';
import PopularItems from './components/popular-items-carousel';
import { useEffect } from 'react';
import { useCart } from './use-cart';
import CartIcon from './components/cart-icon';
import { getVersion } from './cart-api';
import { MantineProvider } from '@mantine/core';
import Subtotal from './components/subtotal';

declare global {
  interface Window {
    carePortalsCheckoutQuery: string;
    dataLayer: any[];
    cpAddToCartListenerAttached: boolean;
    cpAddItemsToCart: Function;
    cpAddItemToCart: Function;
  }
}

export function App() {
  const {
    theme,
    cart,
    open,
    close,
    getCart,
    opened,
    loading,
    addCartItem,
    createCart,
    getCartRelatedProducts,
    checkoutUrl,
    getCartCheckoutUrl,
    resetCart,
    getCartTheme,
    cartSummarySection
  } = useCart();

  function handleAddToCartClick(cartId, products, shouldOpenCart = true) {
    if (cartId) {
      addCartItem(products);
    } else {
      createCart(products);
    }
    if (shouldOpenCart) {
      open();
    }
  }

  useEffect(() => {
    // get existing cart from local storage
    getCart();
    getCartTheme();
  }, []);

  useEffect(() => {
    getCartCheckoutUrl();

    const handler = () => {
      resetCart();
      getCartCheckoutUrl();
    };
    document.addEventListener('countryLoaded', handler);

    return () => {
      document.removeEventListener('countryLoaded', handler);
    };
  }, []);

  useEffect(() => {
    window.cpAddItemsToCart = (products, shouldOpenCart = true) =>
      handleAddToCartClick(cart?._id, products, shouldOpenCart);
    window.cpAddItemToCart = (productId, quantity = 1, shouldOpenCart = true) =>
      handleAddToCartClick(cart?._id, [{ productId, quantity }], shouldOpenCart);

    window.cpAddToCartListenerAttached = true;
  }, [cart]);

  useEffect(() => {
    const handler = event => {
      if (event.target.classList.contains('open-cart')) {
        open();
      }
      if (
        event.target.classList.contains('product-item') ||
        event.target.classList.contains('add-to-cart-btn')
      ) {
        // Skip if the element has an onclick handler (let the onclick handle it)
        if (event.target.onclick) {
          return;
        }
        
        let products = event.target.dataset.products;

        if (products) {
          try {
            products = JSON.parse(products);
            if (!Array.isArray(products)) {
              console.error('cart::products should be a valid json array');
              return;
            }
          } catch {
            console.error('cart::invalid products json when adding products');
            return;
          }
        } else if (!products) {
          products = [];

          const productId =
            event.target.dataset.product_id || event.target.dataset.productId;
          const variantId =
            event.target.dataset.variant_id || event.target.dataset.variantId;
          const quantity =
            event.target.dataset.quantity || event.target.dataset.quantity;

          if (productId) {
            const item = {
              productId,
              variantId,
              quantity: quantity ? parseInt(quantity) : 1
            };

            products.push(item);
          }
        }
        if (cart?._id) {
          addCartItem(products);
        } else {
          createCart(products);
        }
        open();
      }
    };
    document.addEventListener('click', handler);
    if (cart?._id && getVersion() === 1) {
      getCartRelatedProducts();
    }
    return () => {
      document.removeEventListener('click', handler);
    };
  }, [cart]);

  const checkout = () => {
    let url = checkoutUrl.replace(':cartId', cart._id);
    let queryParams = window.carePortalsCheckoutQuery || '';
    if (queryParams) {
      queryParams = queryParams.replace('?', '');
      if (url.includes('?')) {
        url += `&${queryParams}`;
      } else {
        url += `?${queryParams}`;
      }
    }
    window.location.href = url;
  };

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <Indicator
        inline
        disabled={!cart?.lineItems?.length}
        label={cart?.lineItems?.length}
        offset={5}
        size={18}>
        <ActionIcon
          loading={loading}
          onClick={open}
          size='xl'
          radius='xl'
          variant='light'>
          <CartIcon />
        </ActionIcon>
      </Indicator>
      <Drawer.Root
        opened={opened}
        onClose={close}
        position='right'
        zIndex={999999}>
        <Drawer.Overlay />

        <Drawer.Content style={{ height: '100%' }}>
          <Drawer.Header
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
            <Drawer.Title className='cart-drawer-title'>CART</Drawer.Title>
            <Drawer.CloseButton className='cart-drawer-close-button' />
          </Drawer.Header>

          <Drawer.Body style={{ height: 'calc(100% - 54px)' }}>
            <Flex
              direction='column'
              gap={8}
              style={{ minHeight: '100%', position: 'relative' }}>
              <LoadingOverlay visible={loading} overlayBlur={1} />

              <CartItemsList />
              <Space h={40} />
              <PopularItems />
              <Space h={40} />
              <Subtotal />

              {cartSummarySection && !!cart?.lineItems?.length && (
                <div dangerouslySetInnerHTML={{ __html: cartSummarySection }} />
              )}

              {!!cart?.lineItems?.length && (
                <div
                  style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
                    position: 'sticky',
                    bottom: 0
                  }}>
                  <Button
                    className='cart-checkout-button'
                    fullWidth
                    radius='md'
                    size='lg'
                    mt='sm'
                    onClick={checkout}>
                    Checkout
                  </Button>
                </div>
              )}
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </MantineProvider>
  );
}

export default App;
