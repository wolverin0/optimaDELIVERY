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
}

export interface CartItem extends MenuItem {
  quantity: number;
  weight?: number;
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
