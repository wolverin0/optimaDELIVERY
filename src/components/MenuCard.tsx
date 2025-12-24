import { Plus, Scale, PackageX, Check } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
  index?: number;
}

export const MenuCard = ({ item, index = 0 }: MenuCardProps) => {
  const { addToCart } = useOrders();
  const { toast } = useToast();
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [weight, setWeight] = useState('1');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const showAddedToast = () => {
    toast({
      title: "Agregado al carrito",
      description: item.name,
      duration: 2000,
    });
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.soldOut) return;
    if (item.soldByWeight) {
      setShowWeightDialog(true);
    } else {
      addToCart(item);
      showAddedToast();
    }
  };

  const handleWeightConfirm = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      addToCart(item, weightNum);
      setShowWeightDialog(false);
      setWeight('1');
      showAddedToast();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.soldOut) {
      setShowImageModal(true);
    }
  };

  // Calculate animation delay based on index
  const animationDelay = `${index * 0.1}s`;

  return (
    <>
      {/* Luxury Horizontal Card */}
      <div
        className={`luxury-card animate-fade-in-left opacity-0 ${item.soldOut ? 'opacity-60' : ''}`}
        style={{ animationDelay }}
      >
        {/* Image Section */}
        <div
          className="relative w-40 md:w-44 shrink-0 overflow-hidden max-md:w-full max-md:h-44 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${item.soldOut ? 'grayscale' : ''}`}
            loading="lazy"
          />

          {item.soldByWeight && !item.soldOut && (
            <div className="absolute top-3 left-3 bg-card px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-primary uppercase tracking-wide shadow-sm flex items-center gap-1">
              <Scale size={10} />
              Por {item.weightUnit}
            </div>
          )}

          {item.soldOut && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="bg-destructive text-white px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <PackageX size={12} />
                Agotado
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[22px] font-semibold mb-1.5 tracking-wide">{item.name}</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-primary text-[26px] font-semibold">
              {formatPrice(item.price)}
              {item.soldByWeight && (
                <span className="text-[12px] font-normal text-muted-foreground ml-0.5">
                  /{item.weightUnit}
                </span>
              )}
            </div>

            {!item.soldOut && (
              <button onClick={handleAdd} className="add-btn">
                <Plus size={20} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal - Simple overlay with rounded image */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fade-in-up"
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={item.image}
            alt={item.name}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl cursor-pointer"
            onClick={() => setShowImageModal(false)}
          />
        </div>
      )}

      {/* Weight Dialog */}
      <Dialog open={showWeightDialog} onOpenChange={setShowWeightDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-wide">
              ¿Cuantos {item.weightUnit} de {item.name}?
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 py-6">
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-14 text-2xl text-center font-bold border-primary/30 focus:border-primary"
            />
            <span className="text-xl font-medium text-muted-foreground">{item.weightUnit}</span>
          </div>
          <p className="text-muted-foreground text-center">
            Total: <span className="text-primary font-bold text-xl">{formatPrice(item.price * parseFloat(weight || '0'))}</span>
          </p>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowWeightDialog(false)}
              className="border-border hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleWeightConfirm}
              className="flex-1 bg-gold-gradient text-white hover:opacity-90 shadow-gold"
            >
              Agregar al Carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
