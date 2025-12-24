import { useState } from 'react';
import { Settings, ArrowLeft, Plus, Trash2, Edit, Save, X, Image } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, MenuCategory } from '@/types/order';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Admin = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useOrders();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'comida' as MenuCategory,
    soldByWeight: false,
    weightUnit: 'kg',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'comida',
      soldByWeight: false,
      weightUnit: 'kg',
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      soldByWeight: item.soldByWeight || false,
      weightUnit: item.weightUnit || 'kg',
    });
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: 'Datos incompletos',
        description: 'Por favor completa nombre y precio',
        variant: 'destructive',
      });
      return;
    }

    const itemData: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || '/placeholder.svg',
      category: formData.category,
      soldByWeight: formData.soldByWeight,
      weightUnit: formData.soldByWeight ? formData.weightUnit : undefined,
    };

    if (editingItem) {
      updateMenuItem(itemData);
      toast({ title: 'Producto actualizado' });
    } else {
      addMenuItem(itemData);
      toast({ title: 'Producto agregado' });
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteMenuItem(id);
    toast({ title: 'Producto eliminado' });
  };

  const categoryLabels: Record<MenuCategory, string> = {
    comida: 'Comida',
    postre: 'Postre',
    bebidas: 'Bebidas',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Administración</h1>
              <p className="text-xs text-muted-foreground">Gestión de productos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/cocina">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Add Product Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Productos ({menuItems.length})</h2>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 left-2">
                  {categoryLabels[item.category]}
                </Badge>
                {item.soldByWeight && (
                  <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                    Por {item.weightUnit}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <p className="text-primary font-bold text-xl mt-2">
                  ${item.price.toLocaleString()}
                  {item.soldByWeight && <span className="text-sm font-normal">/{item.weightUnit}</span>}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará "{item.name}" del menú.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(item.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Imagen del producto</Label>
              <div className="flex gap-4 items-start">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    O ingresa una URL:
                  </p>
                  <Input
                    placeholder="https://..."
                    value={formData.image.startsWith('data:') ? '' : formData.image}
                    onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del producto"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: MenuCategory) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comida">Comida</SelectItem>
                    <SelectItem value="postre">Postre</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <Label htmlFor="soldByWeight">Se vende por peso</Label>
                <p className="text-xs text-muted-foreground">Ej: Lechón por kilo</p>
              </div>
              <Switch
                id="soldByWeight"
                checked={formData.soldByWeight}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, soldByWeight: checked }))}
              />
            </div>

            {formData.soldByWeight && (
              <div className="space-y-2">
                <Label htmlFor="weightUnit">Unidad de peso</Label>
                <Select
                  value={formData.weightUnit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weightUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                    <SelectItem value="g">Gramos (g)</SelectItem>
                    <SelectItem value="lb">Libras (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
