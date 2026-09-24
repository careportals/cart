import { ICartV2, ICartV2LineItem } from './api-types';

export type Cart = {} & ICartV2;

export type CartLineItem = ICartV2LineItem;
