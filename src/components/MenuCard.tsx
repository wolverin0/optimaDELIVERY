import { Plus, Scale } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard = ({ item }: MenuCardProps) => {
  const { addToCart } = useOrders();
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [weight, setWeight] = useState('1');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAdd = () => {
    if (item.soldByWeight) {
      setShowWeightDialog(true);
    } else {
      addToCart(item);
    }
  };

  const handleWeightConfirm = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      addToCart(item, weightNum);
      setShowWeightDialog(false);
      setWeight('1');
    }
  };

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 touch-manipulation">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {item.soldByWeight && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
              <Scale className="h-3 w-3 mr-1" />
              Por {item.weightUnit}
            </Badge>
          )}
          <Button
            onClick={handleAdd}
            size="lg"
            className="absolute bottom-3 right-3 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-7 w-7" />
          </Button>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
          <p className="text-primary font-bold text-xl mt-2">
            {formatPrice(item.price)}
            {item.soldByWeight && <span className="text-sm font-normal text-muted-foreground">/{item.weightUnit}</span>}
          </p>
        </CardContent>
      </Card>

      <Dialog open={showWeightDialog} onOpenChange={setShowWeightDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">¿Cuántos {item.weightUnit} de {item.name}?</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-14 text-2xl text-center font-bold"
            />
            <span className="text-xl font-medium">{item.weightUnit}</span>
          </div>
          <p className="text-muted-foreground text-center">
            Total: <span className="text-primary font-bold text-lg">{formatPrice(item.price * parseFloat(weight || '0'))}</span>
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowWeightDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleWeightConfirm} className="flex-1">
              Agregar al Carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
