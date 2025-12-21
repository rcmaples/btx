import type { Cart } from './index';

export interface ShippingAddress {
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutFormData {
  guestEmail?: string;
  shippingAddress: ShippingAddress;
}

export interface CreateOrderRequest {
  formData: CheckoutFormData;
  cart: Cart;
  shippingCost: number;
  userId?: string;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}
