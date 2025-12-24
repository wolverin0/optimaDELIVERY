import { Utensils, Cake, Coffee, Sparkles } from 'lucide-react';
import { MenuCategory } from '@/types/order';

interface CategoryFilterProps {
  selected: MenuCategory | 'all';
  onSelect: (category: MenuCategory | 'all') => void;
}

const categories: { id: MenuCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'comida', label: 'Comida', icon: <Utensils className="h-4 w-4" /> },
  { id: 'postre', label: 'Postres', icon: <Cake className="h-4 w-4" /> },
  { id: 'bebidas', label: 'Bebidas', icon: <Coffee className="h-4 w-4" /> },
];

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-center sm:gap-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-tab ${selected === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
};
