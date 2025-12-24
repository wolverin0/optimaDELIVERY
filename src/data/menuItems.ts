import tortilla from '@/assets/tortilla.jpeg';
import carneAsada from '@/assets/carne-asada.jpeg';
import costillas from '@/assets/costillas.jpeg';
import noquis from '@/assets/noquis.jpeg';
import polloPapas from '@/assets/pollo-papas.jpeg';
import verduras from '@/assets/verduras.jpeg';
import lechon from '@/assets/lechon.jpeg';

import { MenuItem } from '@/types/order';

export const menuItems: MenuItem[] = [
  // COMIDA
  {
    id: '1',
    name: 'Tortilla Española',
    description: 'Tortilla casera de papas con huevo, dorada y jugosa',
    price: 2500,
    image: tortilla,
    category: 'comida',
  },
  {
    id: '2',
    name: 'Carne Asada',
    description: 'Corte de carne a la brasa con vegetales',
    price: 4500,
    image: carneAsada,
    category: 'comida',
  },
  {
    id: '3',
    name: 'Costillas BBQ',
    description: 'Costillas de cerdo con salsa BBQ casera y hierbas',
    price: 5000,
    image: costillas,
    category: 'comida',
  },
  {
    id: '4',
    name: 'Ñoquis con Salsa',
    description: 'Ñoquis caseros con salsa bolognesa y queso',
    price: 3500,
    image: noquis,
    category: 'comida',
  },
  {
    id: '5',
    name: 'Pollo con Papas',
    description: 'Pollo asado entero con papas fritas crujientes',
    price: 4000,
    image: polloPapas,
    category: 'comida',
  },
  {
    id: '6',
    name: 'Verduras Salteadas',
    description: 'Mix de brócoli, espárragos, zanahorias y pimientos',
    price: 2000,
    image: verduras,
    category: 'comida',
  },
  {
    id: '7',
    name: 'Lechón por Kilo',
    description: 'Lechón asado crocante, precio por kilo',
    price: 6500,
    image: lechon,
    category: 'comida',
    soldByWeight: true,
    weightUnit: 'kg',
  },

  // POSTRES
  {
    id: '8',
    name: 'Tiramisú',
    description: 'Clásico postre italiano con mascarpone, café y cacao',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80',
    category: 'postre',
  },
  {
    id: '9',
    name: 'Flan Casero',
    description: 'Flan de vainilla con caramelo dorado y crema',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&auto=format&fit=crop&q=80',
    category: 'postre',
  },
  {
    id: '10',
    name: 'Brownie con Helado',
    description: 'Brownie de chocolate caliente con helado de vainilla',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    category: 'postre',
  },
  {
    id: '11',
    name: 'Cheesecake de Frutos Rojos',
    description: 'Cheesecake cremoso con coulis de frutos rojos',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
    category: 'postre',
  },

  // BEBIDAS
  {
    id: '12',
    name: 'Limonada Casera',
    description: 'Limonada fresca con menta y hielo',
    price: 800,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&auto=format&fit=crop&q=80',
    category: 'bebidas',
  },
  {
    id: '13',
    name: 'Jugo de Naranja',
    description: 'Jugo natural exprimido de naranjas frescas',
    price: 900,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80',
    category: 'bebidas',
  },
  {
    id: '14',
    name: 'Café Espresso',
    description: 'Café espresso italiano de granos premium',
    price: 600,
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&auto=format&fit=crop&q=80',
    category: 'bebidas',
  },
  {
    id: '15',
    name: 'Copa de Vino Malbec',
    description: 'Vino tinto Malbec mendocino, reserva especial',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
    category: 'bebidas',
  },
];
