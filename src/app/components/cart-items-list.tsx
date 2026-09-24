import { Alert, Flex, Text, Divider, Box } from '@mantine/core';
import CartItem from './cart-item';
import { useCart } from '../use-cart';

function CartItemsList() {
  const { cart, warningMessage } = useCart();
  

  return (
    <Flex direction='column' style={{ minHeight: '100%' }}>
      {cart?.lineItems.map((item, index) => (
        <Box key={item.id}>
          <CartItem {...item} />
          {index < cart.lineItems.length - 1 && (
            <Divider my='md' color='gray.1' />
          )}
        </Box>
      ))}

      {warningMessage && (
        <Alert
          title='Warning'
          color='orange'
          mb='md'
        >
          {warningMessage}
        </Alert>
      )}

      {!cart?.lineItems?.length && (
        <Alert
          title='Your cart is empty'
          color='brand'
          sx={theme => ({
            backgroundColor: theme.colors.brand?.[0],
            border: 'none',
            borderRadius: 8,
            padding: '24px'
          })}
        >
          <Text size='md' color='brand.7'>
            Looks like you haven't added anything to your cart yet
          </Text>
        </Alert>
      )}
    </Flex>
  );
}

export default CartItemsList;
