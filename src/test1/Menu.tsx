/**
 * TEST 1 - MINIMALIST LUXURY (Apple iOS Style)
 * Ultra-clean design with rose gold accents
 * Inspired by Apple's design language
 */

import { useState } from 'react';
import { Utensils, Cake, Coffee, Scale, Plus, ShoppingCart, PackageX, ChefHat } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { MenuCategory, MenuItem } from '@/types/order';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import './styles.css';

// Category configuration
const categories: { id: MenuCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', icon: <ChefHat size={16} /> },
  { id: 'comida', label: 'Comida', icon: <Utensils size={16} /> },
  { id: 'postre', label: 'Postres', icon: <Cake size={16} /> },
  { id: 'bebidas', label: 'Bebidas', icon: <Coffee size={16} /> },
];

// Menu Card Component
const MenuCardT1 = ({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`t1-card ${item.soldOut ? 'sold-out' : ''}`}>
      <div className="t1-card-image">
        <img src={item.image} alt={item.name} loading="lazy" />

        {item.soldByWeight && !item.soldOut && (
          <div className="t1-card-badge">
            <Scale size={12} />
            Por {item.weightUnit}
          </div>
        )}

        {item.soldOut ? (
          <div className="t1-sold-out-overlay">
            <div className="t1-sold-out-badge">
              <PackageX size={16} />
              AGOTADO
            </div>
          </div>
        ) : (
          <button className="t1-card-add" onClick={() => onAdd(item)}>
            <Plus size={22} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="t1-card-content">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="t1-card-price">
          {formatPrice(item.price)}
          {item.soldByWeight && <span>/{item.weightUnit}</span>}
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItemT1 = ({
  item,
  onUpdateQty,
  onRemove
}: {
  item: any;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="t1-cart-item">
      <div className="t1-cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="t1-cart-item-info">
        <h4>{item.name}</h4>
        <div className="t1-cart-item-price">
          {formatPrice(item.price * item.quantity)}
        </div>
        <div className="t1-quantity-controls">
          <button
            className="t1-qty-btn"
            onClick={() => item.quantity > 1 ? onUpdateQty(item.id, item.quantity - 1) : onRemove(item.id)}
          >
            -
          </button>
          <span className="t1-qty-value">{item.quantity}</span>
          <button className="t1-qty-btn" onClick={() => onUpdateQty(item.id, item.quantity + 1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Menu Component
const MenuTest1 = () => {
  const { menuItems, cart, cartTotal, addToCart, updateQuantity, removeFromCart } = useOrders();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');

  const availableItems = menuItems.filter(item => !item.soldOut);
  const soldOutItems = menuItems.filter(item => item.soldOut);

  const filteredAvailable = selectedCategory === 'all'
    ? availableItems
    : availableItems.filter(item => item.category === selectedCategory);

  const filteredSoldOut = selectedCategory === 'all'
    ? soldOutItems
    : soldOutItems.filter(item => item.category === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="test1-container">
      {/* Header */}
      <header className="t1-header">
        <div className="t1-header-inner">
          <div className="t1-logo">
            <div className="t1-logo-icon">
              <Utensils size={22} strokeWidth={2} />
            </div>
            <div className="t1-logo-text">
              <h1>El Nuevo Braserito</h1>
              <span>Comida casera con amor</span>
            </div>
          </div>
          <div className="t1-header-actions">
            <button className="t1-icon-btn">
              <ChefHat size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="t1-hero">
        <h2>Nuestro Menu</h2>
        <p>Selecciona tus platos favoritos y disfruta</p>
      </section>

      {/* Categories */}
      <nav className="t1-categories">
        <div className="t1-categories-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`t1-category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Grid */}
      <main className="t1-menu-section">
        {filteredAvailable.length === 0 && filteredSoldOut.length === 0 ? (
          <div className="t1-empty-state">
            <Utensils size={64} />
            <p>No hay productos en esta categoria</p>
          </div>
        ) : (
          <>
            {filteredAvailable.length > 0 && (
              <div className="t1-menu-grid">
                {filteredAvailable.map(item => (
                  <MenuCardT1 key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}

            {filteredSoldOut.length > 0 && (
              <>
                <h3 className="t1-section-title">Agotados</h3>
                <div className="t1-menu-grid">
                  {filteredSoldOut.map(item => (
                    <MenuCardT1 key={item.id} item={item} onAdd={addToCart} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Cart FAB with Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="t1-cart-fab">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="t1-cart-count">{cart.length}</span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="t1-cart-sheet p-0" side="bottom">
          <div className="t1-cart-header">
            <h2>Tu Carrito</h2>
          </div>

          {cart.length === 0 ? (
            <div className="t1-empty-state">
              <ShoppingCart size={64} />
              <p>Tu carrito esta vacio</p>
            </div>
          ) : (
            <>
              <div className="t1-cart-items">
                {cart.map(item => (
                  <CartItemT1
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              <div className="t1-cart-footer">
                <div className="t1-cart-total">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <button className="t1-checkout-btn">
                  Continuar al Checkout
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuTest1;
