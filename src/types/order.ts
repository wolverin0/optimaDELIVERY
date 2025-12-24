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
  address: string;
  notes?: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
}

export interface Order {
  id: string;
  customer: CustomerData;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  statusChangedAt: Date;
  snoozedUntil?: Date;
}
