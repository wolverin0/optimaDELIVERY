import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Order, MenuItem, CustomerData, OrderStatus, MenuCategory } from '@/types/order';
import { menuItems as defaultMenuItems } from '@/data/menuItems';

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, weight?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateWeight: (itemId: string, weight: number) => void;
  clearCart: () => void;
  submitOrder: (customer: CustomerData) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleSoldOut: (itemId: string) => void;
  cartTotal: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);

  const addToCart = useCallback((item: MenuItem, weight?: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (item.soldByWeight && weight) {
          return prev.map(i => 
            i.id === item.id ? { ...i, weight: (i.weight || 0) + weight } : i
          );
        }
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, weight: weight || undefined }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i => 
      i.id === itemId ? { ...i, quantity } : i
    ));
  }, [removeFromCart]);

  const updateWeight = useCallback((itemId: string, weight: number) => {
    if (weight <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i => 
      i.id === itemId ? { ...i, weight } : i
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => {
    if (item.soldByWeight && item.weight) {
      return sum + item.price * item.weight;
    }
    return sum + item.price * item.quantity;
  }, 0);

  const submitOrder = useCallback((customer: CustomerData) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      customer,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      createdAt: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  }, [cart, cartTotal, clearCart]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' as OrderStatus } : order
    ));
  }, []);

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  }, []);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const toggleSoldOut = useCallback((itemId: string) => {
    setMenuItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, soldOut: !i.soldOut } : i
    ));
  }, []);

  return (
    <OrderContext.Provider value={{
      cart,
      orders,
      menuItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateWeight,
      clearCart,
      submitOrder,
      updateOrderStatus,
      cancelOrder,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleSoldOut,
      cartTotal,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
