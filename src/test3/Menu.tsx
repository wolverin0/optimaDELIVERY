/**
 * TEST 3 - PREMIUM GOLD ACCENT (High-End Restaurant)
 * Champagne/cream background with gold accents
 * Elegant serif typography and sophisticated palette
 */

import { useState } from 'react';
import { Utensils, Cake, Coffee, Scale, Plus, ShoppingCart, PackageX, Crown } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { MenuCategory, MenuItem } from '@/types/order';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import './styles.css';

// Category configuration
const categories: { id: MenuCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Menu', icon: <Crown size={16} /> },
  { id: 'comida', label: 'Entrees', icon: <Utensils size={16} /> },
  { id: 'postre', label: 'Desserts', icon: <Cake size={16} /> },
  { id: 'bebidas', label: 'Drinks', icon: <Coffee size={16} /> },
];

// Menu Card Component
const MenuCardT3 = ({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`t3-card ${item.soldOut ? 'sold-out' : ''}`}>
      <div className="t3-card-image">
        <img src={item.image} alt={item.name} loading="lazy" />

        {item.soldByWeight && !item.soldOut && (
          <div className="t3-card-badge">
            <Scale size={10} />
            Por {item.weightUnit}
          </div>
        )}

        {item.soldOut && (
          <div className="t3-sold-out-overlay">
            <div className="t3-sold-out-badge">
              <PackageX size={12} />
              Agotado
            </div>
          </div>
        )}
      </div>

      <div className="t3-card-content">
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
        <div className="t3-card-footer">
          <div className="t3-card-price">
            {formatPrice(item.price)}
            {item.soldByWeight && <span>/{item.weightUnit}</span>}
          </div>
          {!item.soldOut && (
            <button className="t3-card-add" onClick={() => onAdd(item)}>
              <Plus size={20} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItemT3 = ({
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
    <div className="t3-cart-item">
      <div className="t3-cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="t3-cart-item-info">
        <h4>{item.name}</h4>
        <div className="t3-cart-item-price">
          {formatPrice(item.price * item.quantity)}
        </div>
        <div className="t3-quantity-controls">
          <button
            className="t3-qty-btn"
            onClick={() => item.quantity > 1 ? onUpdateQty(item.id, item.quantity - 1) : onRemove(item.id)}
          >
            -
          </button>
          <span className="t3-qty-value">{item.quantity}</span>
          <button className="t3-qty-btn" onClick={() => onUpdateQty(item.id, item.quantity + 1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Menu Component
const MenuTest3 = () => {
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
    <div className="test3-container">
      {/* Header */}
      <header className="t3-header">
        <div className="t3-header-inner">
          <div className="t3-logo">
            <div className="t3-logo-icon">
              <Crown size={24} strokeWidth={1.5} />
            </div>
            <div className="t3-logo-text">
              <h1>El Nuevo Braserito</h1>
              <span>Fine Dining</span>
            </div>
          </div>
          <div className="t3-header-actions">
            <button className="t3-icon-btn">
              <Utensils size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="t3-hero">
        <div className="t3-hero-decoration">
          <div className="t3-hero-line"></div>
          <div className="t3-hero-diamond"></div>
          <div className="t3-hero-line"></div>
        </div>
        <h2>La Carta</h2>
        <p>Sabores artesanales que cuentan una historia en cada bocado</p>
      </section>

      {/* Categories */}
      <nav className="t3-categories">
        <div className="t3-categories-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`t3-category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Grid */}
      <main className="t3-menu-section">
        {filteredAvailable.length === 0 && filteredSoldOut.length === 0 ? (
          <div className="t3-empty-state">
            <Utensils size={72} />
            <p>No hay platos disponibles en esta categoria</p>
          </div>
        ) : (
          <>
            {filteredAvailable.length > 0 && (
              <div className="t3-menu-grid">
                {filteredAvailable.map(item => (
                  <MenuCardT3 key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}

            {filteredSoldOut.length > 0 && (
              <>
                <h3 className="t3-section-title">No Disponible</h3>
                <div className="t3-menu-grid">
                  {filteredSoldOut.map(item => (
                    <MenuCardT3 key={item.id} item={item} onAdd={addToCart} />
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
          <button className="t3-cart-fab">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="t3-cart-count">{cart.length}</span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="t3-cart-sheet p-0">
          <div className="t3-cart-header">
            <h2>
              <ShoppingCart size={24} />
              Su Seleccion
            </h2>
          </div>

          {cart.length === 0 ? (
            <div className="t3-empty-state">
              <ShoppingCart size={72} />
              <p>Su mesa esta esperando...</p>
            </div>
          ) : (
            <>
              <div className="t3-cart-items">
                {cart.map(item => (
                  <CartItemT3
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              <div className="t3-cart-footer">
                <div className="t3-cart-total">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <button className="t3-checkout-btn">
                  Confirmar Reserva
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuTest3;
