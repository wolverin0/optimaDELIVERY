export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'dispatched' | 'cancelled';

export type MenuCategory = 'comida' | 'postre' | 'bebidas';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  soldByWeight?: boolean;
  weightUnit?: string;
  soldOut?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  weight?: number;
}

export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'mercadopago';

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  customer: CustomerData;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  statusChangedAt: Date;
  snoozedUntil?: Date;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  mercadopago_preference_id?: string;
  mercadopago_payment_id?: string;
}
