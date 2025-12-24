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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">El Nuevo Braserito</h1>
              <p className="text-xs text-muted-foreground">Comida casera con amor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/cocina">
              <Button variant="outline" size="sm">
                Ver Cocina
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary to-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Nuestro Menú</h2>
          <p className="text-muted-foreground">Selecciona tus platos favoritos</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
      </section>

      {/* Menu Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredAvailable.length === 0 && filteredSoldOut.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay productos en esta categoría</p>
          </div>
        ) : (
          <>
            {filteredAvailable.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredAvailable.map(item => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
            
            {filteredSoldOut.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Agotados</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredSoldOut.map(item => (
                    <MenuCard key={item.id} item={item} />
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
