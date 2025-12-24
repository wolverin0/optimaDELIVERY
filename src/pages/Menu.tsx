import { useState } from 'react';
import { Utensils } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { MenuCard } from '@/components/MenuCard';
import { CartDrawer } from '@/components/CartDrawer';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MenuCategory } from '@/types/order';

const Menu = () => {
  const { menuItems } = useOrders();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');

  const availableItems = menuItems.filter(item => !item.soldOut);
  const soldOutItems = menuItems.filter(item => item.soldOut);

  const filteredAvailable = selectedCategory === 'all'
    ? availableItems
    : availableItems.filter(item => item.category === selectedCategory);

  const filteredSoldOut = selectedCategory === 'all'
    ? soldOutItems
    : soldOutItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background relative z-10">
      {/* Luxury Header */}
      <header className="luxury-header">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/braseritologo.jpeg"
              alt="El Nuevo Braserito"
              className="w-[52px] h-[52px] rounded-full object-cover shadow-gold"
            />
            <h1 className="text-2xl font-semibold tracking-wide">El Nuevo Braserito</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/cocina">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
                <Utensils className="h-4 w-4 mr-2" />
                Cocina
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Decorations */}
      <section className="py-14 text-center max-w-[700px] mx-auto px-6">
        <div className="hero-decoration">
          <div className="decorative-line"></div>
          <div className="decorative-diamond"></div>
          <div className="decorative-line"></div>
        </div>
        <h2 className="text-5xl font-semibold tracking-wide mb-3">La Carta</h2>
        <p className="text-muted-foreground text-[15px] tracking-wide">
          Sabores artesanales que cuentan una historia en cada bocado
        </p>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[85px] z-30 bg-secondary/90 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-5">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
      </section>

      {/* Menu Grid */}
      <main className="container mx-auto px-6 py-10 pb-32">
        {filteredAvailable.length === 0 && filteredSoldOut.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Utensils className="w-[72px] h-[72px] mx-auto mb-5 opacity-25 text-primary" />
            <p className="text-[15px] italic">No hay platos disponibles en esta categoria</p>
          </div>
        ) : (
          <>
            {filteredAvailable.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredAvailable.map((item, index) => (
                  <MenuCard key={item.id} item={item} index={index} />
                ))}
              </div>
            )}

            {filteredSoldOut.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-medium text-muted-foreground mb-6 text-center relative">
                  <span className="relative z-10 bg-background px-6">No Disponible</span>
                  <span className="absolute left-0 right-0 top-1/2 h-px bg-border -z-0"></span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredSoldOut.map((item, index) => (
                    <MenuCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Cart FAB */}
      <CartDrawer />
    </div>
  );
};

export default Menu;
