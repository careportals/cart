import {
  Box,
  Flex,
  Image,
  Space,
  Title,
  Text,
  Button,
  Anchor
} from '@mantine/core';
import { CurrencyFormatter } from '../utils';
import { useCart } from '../use-cart';
import { RelatedProduct } from '../api-types';
import { TbExternalLink } from 'react-icons/tb';

type Props = {
  product: RelatedProduct;
};
function PopularItem(props: Props) {
  const { addCartItem } = useCart();
  return (
    <Box
      sx={theme => ({
        backgroundColor: theme.colors.brand[0],
        padding: '18px 40px',
        boxShadow: '8px 8px 20px rgba(126, 104, 125, 0.04)',
        borderRadius: 16,
        margin: '0 2px'
      })}>
      <Flex gap={15}>
        {props.product.images?.[0] && (
          <Image
            maw={70}
            h={'100%'}
            fit='cover'
            radius='md'
            src={props.product.images[0].thumbnailUrl}
            alt={props.product.images[0].description}
          />
        )}

        <Box sx={{ flex: 1 }}>
          <Title weight={500} size={20}>
            {props.product.url ? (
              <Anchor
                href={props.product.url}
                color='dark'
                target='_blank'
                rel='noopener noreferrer'>
                <Flex align='center' gap={4}>
                  {props.product.displayName}
                  <TbExternalLink size={16} />
                </Flex>
              </Anchor>
            ) : (
              props.product.displayName
            )}
          </Title>
          <Space h={8} />
          <Flex align={'center'} justify={'space-between'}>
            <Text weight={500} size={18} color='#3A2638'>
              {props.product.price
                ? CurrencyFormatter.format(props.product.price)
                : 'Free'}
            </Text>
            <Button
              compact
              variant='outline'
              size='sm'
              mr='xl'
              onClick={() =>
                addCartItem([
                  {
                    quantity: 1,
                    productId: props.product.productId,
                    variantId: props.product.variantId
                  }
                ])
              }>
              Add To Cart
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default PopularItem;
