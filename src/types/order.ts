// src/types/order.ts

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  wilaya: string;
  address: string;
  deliveryType: 'home' | 'post';
  notes?: string;
}

export interface PlaceOrderPayload extends CheckoutFormData {
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    subtotal: number;
  }>;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: 'cod';
}
