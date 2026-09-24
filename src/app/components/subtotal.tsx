import { Flex, Box, Text } from '@mantine/core';
import { CurrencyFormatter } from '../utils';
import { useCart } from '../use-cart';

const Subtotal = () => {
  const { cart } = useCart();

  return (
    <Box
      sx={theme => ({
        marginTop: 'auto',
        padding: '8px 24px',
        backgroundColor: theme.colors.brand[0],
        borderRadius: 8
      })}>
      <Flex justify='space-between' align='center'>
        <Text weight={600} size={18} color='brand.9' className='cart-subtotal'>
          Subtotal
        </Text>

        <Flex gap={12} align='center'>
          {cart?.totalAmount !== cart?.baseAmount && (
            <Text weight={400} strikethrough size={20} pt={4} color='gray' className='cart-subtotal-strikethrough'>
              {CurrencyFormatter.format(cart?.baseAmount)}
            </Text>
          )}

          <Text weight={700} size={24} color='brand.9' className='cart-total'>
            {CurrencyFormatter.format(cart?.totalAmount)}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Subtotal;
