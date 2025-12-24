import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Order, MenuItem, CustomerData, OrderStatus } from '@/types/order';

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  submitOrder: (customer: CustomerData) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cartTotal: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
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

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  return (
    <OrderContext.Provider value={{
      cart,
      orders,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      submitOrder,
      updateOrderStatus,
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
