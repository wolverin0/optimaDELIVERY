export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'dispatched';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CustomerData {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  customer: CustomerData;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}
