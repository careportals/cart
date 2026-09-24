import {
  Box,
  Title,
  Text,
  Space,
  Flex,
  Group,
  Chip,
  Button,
  Stack,
  Anchor,
  Image
} from '@mantine/core';
import { CurrencyFormatter } from '../utils';
import { useCart } from '../use-cart';
import { CartLineItem } from '../types';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { IProductV2Option } from '../api-types';
import { TbExternalLink } from 'react-icons/tb';

type Props = CartLineItem;
function CartItem(props: Props) {
  const { removeCartItem, updateCartItem, changeProductVariant } = useCart();
  const [localQuantity, setLocalQuantity] = useState(props.quantity);

  const debouncedUpdateQuantity = useCallback(
    debounce((newQuantity: number) => {
      updateCartItem({
        id: props.id,
        quantity: newQuantity,
        productId: props.productId
      }).catch(() => {
        setLocalQuantity(props.quantity);
      });
    }, 500),
    []
  );

  useEffect(() => {
    setLocalQuantity(props.quantity);
  }, [props.quantity]);

  const handleQuantityChange = (newQuantity: number) => {
    debouncedUpdateQuantity(newQuantity);
  };

  const handleOptionChange = (optionType: string, value: string) => {
    const updatedOptions = props.options?.map(option => {
      if (option.type === optionType) {
        return {
          ...option,
          choices: option.choices.map(choice => ({
            ...choice,
            selected: choice.value === value
          }))
        };
      }
      return option;
    });
    updateCartItem({
      id: props.id,
      productId: props.productId,
      options: updatedOptions,
      quantity: props.quantity
    });
  };

  const getSelectedOptionValue = (
    options: IProductV2Option[],
    optionType: string
  ) => {
    const option = options?.find(opt => opt.type === optionType);
    return (
      option?.choices.find(choice => choice.selected)?.value ||
      option?.choices.find(choice => choice.default)?.value
    );
  };

  return (
    <Box key={props.id}>
      <Flex gap={16}>
        {
          props.thumbnailUrl && (
            <Image
              maw={80}
              mih={80}
              h={80}
              fit='cover'
              radius='md'
              src={props.thumbnailUrl}
              alt={'thumbnail'}
            />
          )
        }
        <Box sx={{ flex: 1 }}>
          <Flex justify='space-between' align='center'>
            <Title weight={500} size={20} className='cart-item-title'>
              {props.url ? (
                <Anchor
                  href={props.url}
                  color='dark'
                  target='_blank'
                  rel='noopener noreferrer'>
                  <Flex align='center' gap={4}>
                    {props.name}
                    <TbExternalLink size={16} />
                  </Flex>
                </Anchor>
              ) : (
                props.name
              )}
            </Title>

            <Flex align='center' gap={8}>
              {props.price !== props.listPrice && (
                <Text
                  strikethrough
                  weight={300}
                  size={14}
                  color={'brand.7'}
                  className='cart-item-list-price'>
                  {CurrencyFormatter.format(props.listPrice * props.quantity)}
                </Text>
              )}
              <Text
                weight={600}
                size={18}
                color='brand'
                className='cart-item-price'>
                {CurrencyFormatter.format(props.price * props.quantity)}
              </Text>
            </Flex>
          </Flex>

          <Flex align='center' justify='space-between' gap={12}>
            {props.type === 'physical' && !props.isSubscription && (
              <Button.Group>
                <Button
                  variant='default'
                  radius='md'
                  size='compact-md'
                  color='brand'
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  className='cart-item-quantity-button'>
                  -
                </Button>
                <Text
                  weight={500}
                  size={16}
                  style={{
                    paddingTop: '2px',
                    borderBottom: '1px solid lightgray',
                    borderTop: '1px solid lightgray'
                  }}
                  sx={{ minWidth: '32px', textAlign: 'center' }}
                  className='cart-item-quantity'>
                  {localQuantity}
                </Text>
                <Button
                  variant='default'
                  radius='md'
                  size='compact-md'
                  color='brand'
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  className='cart-item-quantity-button'>
                  +
                </Button>
              </Button.Group>
            )}
            <Box sx={{ flex: 1 }} />
            <Button
              onClick={() => removeCartItem(props.id)}
              type='button'
              variant='transparent'
              color='dark'
              p={0}
              size='compact-sm'
              className='cart-item-remove-button'>
              <Text underline size='xs' color='gray'>
                Remove
              </Text>
            </Button>
          </Flex>
        </Box>
      </Flex>

      <Space mt={12} />
      <Chip.Group>
        <Stack spacing='xs'>
          {(props.options || []).map(option => (
            <Group key={option.type} spacing='xs' align='center'>
              <Text size='sm' weight={500}>
                {option.type}:
              </Text>
              <Chip.Group
                value={getSelectedOptionValue(props.options || [], option.type)}
                onChange={(value: string) =>
                  handleOptionChange(option.type, value)
                }>
                <Group spacing='xs'>
                  {option.choices.map(choice => (
                    <Chip
                      key={choice.value}
                      value={choice.value}
                      size='sm'
                      radius='md'>
                      {choice.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Group>
          ))}
        </Stack>
        <Space mt={12} />
        <Group spacing='xs'>
          {(props.subLabel || props.variantId) && (
            <Chip
              variant='filled'
              size='sm'
              value={props.subLabel || props.variantId}
              radius='md'
              className='cart-item-variant-chip'
              defaultChecked
              sx={{
                pointerEvents: 'none',
                cursor: 'default',
                userSelect: 'none'
              }}>
              {props.subLabel || props.name}
            </Chip>
          )}
          {(props.relatedProducts || [])
            .filter(product => product.relationType === 'variant')
            .map(product => (
              <Chip
                key={product.productId}
                variant='outline'
                size='sm'
                value={product.productId}
                radius='md'
                className='cart-item-variant-chip'
                onClick={() =>
                  changeProductVariant({
                    productId: props.productId,
                    variantId: product.productId,
                    quantity: props.quantity
                  })
                }>
                {product.displayName}
              </Chip>
            ))}
        </Group>
        <Text size={16} mb={8} color='gray' sx={{ whiteSpace: 'pre-line' }}>
          {props.description}
        </Text>
      </Chip.Group>
    </Box>
  );
}

export default CartItem;
