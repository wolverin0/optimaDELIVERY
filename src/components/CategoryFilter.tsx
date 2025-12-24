import { Utensils, Cake, Coffee } from 'lucide-react';
import { MenuCategory } from '@/types/order';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  selected: MenuCategory | 'all';
  onSelect: (category: MenuCategory | 'all') => void;
}

const categories: { id: MenuCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', icon: <Utensils className="h-4 w-4" /> },
  { id: 'comida', label: 'Comida', icon: <Utensils className="h-4 w-4" /> },
  { id: 'postre', label: 'Postres', icon: <Cake className="h-4 w-4" /> },
  { id: 'bebidas', label: 'Bebidas', icon: <Coffee className="h-4 w-4" /> },
];

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.id ? 'default' : 'outline'}
          size="lg"
          className="flex items-center gap-2 whitespace-nowrap"
          onClick={() => onSelect(cat.id)}
        >
          {cat.icon}
          {cat.label}
        </Button>
      ))}
    </div>
  );
};
