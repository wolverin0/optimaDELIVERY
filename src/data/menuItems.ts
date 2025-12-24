import tortilla from '@/assets/tortilla.jpeg';
import carneAsada from '@/assets/carne-asada.jpeg';
import costillas from '@/assets/costillas.jpeg';
import noquis from '@/assets/noquis.jpeg';
import polloPapas from '@/assets/pollo-papas.jpeg';
import verduras from '@/assets/verduras.jpeg';
import lechon from '@/assets/lechon.jpeg';

import { MenuItem } from '@/types/order';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Tortilla Española',
    description: 'Tortilla casera de papas con huevo, dorada y jugosa',
    price: 2500,
    image: tortilla,
  },
  {
    id: '2',
    name: 'Carne Asada',
    description: 'Corte de carne a la brasa con vegetales',
    price: 4500,
    image: carneAsada,
  },
  {
    id: '3',
    name: 'Costillas BBQ',
    description: 'Costillas de cerdo con salsa BBQ casera y hierbas',
    price: 5000,
    image: costillas,
  },
  {
    id: '4',
    name: 'Ñoquis con Salsa',
    description: 'Ñoquis caseros con salsa bolognesa y queso',
    price: 3500,
    image: noquis,
  },
  {
    id: '5',
    name: 'Pollo con Papas',
    description: 'Pollo asado entero con papas fritas crujientes',
    price: 4000,
    image: polloPapas,
  },
  {
    id: '6',
    name: 'Verduras Salteadas',
    description: 'Mix de brócoli, espárragos, zanahorias y pimientos',
    price: 2000,
    image: verduras,
  },
  {
    id: '7',
    name: 'Lechón por Kilo',
    description: 'Lechón asado crocante, precio por kilo',
    price: 6500,
    image: lechon,
  },
];
