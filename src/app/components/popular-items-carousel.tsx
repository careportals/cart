import { Carousel } from '@mantine/carousel';
import { Badge, Space, rem } from '@mantine/core';
import PopularItem from './popular-item';
import { useCart } from '../use-cart';

function PopularItemsCarousel() {
  const { relatedProducts } = useCart();
  return (
    <div>
      {!!relatedProducts?.length && (
        <>
          <Badge radius={'sm'} className='cart-related-items-badge'>Related Items</Badge>
          <Space h={10} />
          <Carousel
            mx='auto'
            withIndicators
            loop
            styles={theme => ({
              indicators: {
                top: '110%'
              },
              controls: {
                padding: '0 4px'
              },
              control: {
                boxShadow: 'unset'
              },
              indicator: {
                width: rem(12),
                height: rem(12),
                backgroundColor: theme.colors.gray[3],
                '&[data-active]': {
                  backgroundColor: theme.colors.brand[7]
                }
              }
            })}
          >
            {relatedProducts.map(product => (
              <Carousel.Slide key={product.productId}>
                <PopularItem product={product} />
              </Carousel.Slide>
            ))}
          </Carousel>
        </>
      )}
    </div>
  );
}

export default PopularItemsCarousel;
