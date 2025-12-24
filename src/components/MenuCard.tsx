import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard = ({ item }: MenuCardProps) => {
  const { addToCart } = useOrders();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 touch-manipulation">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          onClick={() => addToCart(item)}
          size="lg"
          className="absolute bottom-3 right-3 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
        <p className="text-primary font-bold text-xl mt-2">{formatPrice(item.price)}</p>
      </CardContent>
    </Card>
  );
};
