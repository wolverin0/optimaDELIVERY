/**
 * TEST 2 - DARK ELEGANCE (Premium Night Mode)
 * Rich dark backgrounds with purple/burgundy accents
 * Glassmorphism effects and elegant typography
 */

import { useState } from 'react';
import { Utensils, Cake, Coffee, Scale, Plus, ShoppingCart, PackageX, Sparkles } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { MenuCategory, MenuItem } from '@/types/order';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import './styles.css';

// Category configuration
const categories: { id: MenuCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todo', icon: <Sparkles size={16} /> },
  { id: 'comida', label: 'Platos', icon: <Utensils size={16} /> },
  { id: 'postre', label: 'Dulces', icon: <Cake size={16} /> },
  { id: 'bebidas', label: 'Bebidas', icon: <Coffee size={16} /> },
];

// Menu Card Component
const MenuCardT2 = ({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`t2-card ${item.soldOut ? 'sold-out' : ''}`}>
      <div className="t2-card-image">
        <img src={item.image} alt={item.name} loading="lazy" />

        {item.soldByWeight && !item.soldOut && (
          <div className="t2-card-badge">
            <Scale size={12} />
            Por {item.weightUnit}
          </div>
        )}

        {item.soldOut ? (
          <div className="t2-sold-out-overlay">
            <div className="t2-sold-out-badge">
              <PackageX size={16} />
              AGOTADO
            </div>
          </div>
        ) : (
          <button className="t2-card-add" onClick={() => onAdd(item)}>
            <Plus size={24} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="t2-card-content">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="t2-card-footer">
          <div className="t2-card-price">
            {formatPrice(item.price)}
            {item.soldByWeight && <span>/{item.weightUnit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItemT2 = ({
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
    <div className="t2-cart-item">
      <div className="t2-cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="t2-cart-item-info">
        <h4>{item.name}</h4>
        <div className="t2-cart-item-price">
          {formatPrice(item.price * item.quantity)}
        </div>
        <div className="t2-quantity-controls">
          <button
            className="t2-qty-btn"
            onClick={() => item.quantity > 1 ? onUpdateQty(item.id, item.quantity - 1) : onRemove(item.id)}
          >
            -
          </button>
          <span className="t2-qty-value">{item.quantity}</span>
          <button className="t2-qty-btn" onClick={() => onUpdateQty(item.id, item.quantity + 1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Menu Component
const MenuTest2 = () => {
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
    <div className="test2-container">
      {/* Header */}
      <header className="t2-header">
        <div className="t2-header-inner">
          <div className="t2-logo">
            <div className="t2-logo-icon">
              <Utensils size={24} strokeWidth={1.5} />
            </div>
            <div className="t2-logo-text">
              <h1>El Nuevo Braserito</h1>
              <span>Experiencia Culinaria</span>
            </div>
          </div>
          <div className="t2-header-actions">
            <button className="t2-icon-btn">
              <Sparkles size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="t2-hero">
        <h2>Descubre el Sabor</h2>
        <p>Platos artesanales preparados con pasion y los mejores ingredientes</p>
      </section>

      {/* Categories */}
      <nav className="t2-categories">
        <div className="t2-categories-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`t2-category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Grid */}
      <main className="t2-menu-section">
        {filteredAvailable.length === 0 && filteredSoldOut.length === 0 ? (
          <div className="t2-empty-state">
            <Utensils size={72} />
            <p>No hay productos en esta categoria</p>
          </div>
        ) : (
          <>
            {filteredAvailable.length > 0 && (
              <div className="t2-menu-grid">
                {filteredAvailable.map(item => (
                  <MenuCardT2 key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}

            {filteredSoldOut.length > 0 && (
              <>
                <h3 className="t2-section-title">Temporalmente Agotados</h3>
                <div className="t2-menu-grid">
                  {filteredSoldOut.map(item => (
                    <MenuCardT2 key={item.id} item={item} onAdd={addToCart} />
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
          <button className="t2-cart-fab">
            <ShoppingCart size={26} />
            {cart.length > 0 && (
              <span className="t2-cart-count">{cart.length}</span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="t2-cart-sheet p-0">
          <div className="t2-cart-header">
            <h2>
              <ShoppingCart size={24} />
              Tu Orden
            </h2>
          </div>

          {cart.length === 0 ? (
            <div className="t2-empty-state">
              <ShoppingCart size={72} />
              <p>Tu carrito esta vacio</p>
            </div>
          ) : (
            <>
              <div className="t2-cart-items">
                {cart.map(item => (
                  <CartItemT2
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              <div className="t2-cart-footer">
                <div className="t2-cart-total">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <button className="t2-checkout-btn">
                  Confirmar Pedido
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuTest2;
