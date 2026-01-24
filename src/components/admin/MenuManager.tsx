import { useState, useRef } from 'react';
import { Plus, Trash2, Edit, Save, Image, Camera, PackageX, Package, Loader2, FolderPlus, GripVertical } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { supabaseFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MenuItem as DBMenuItem, Category } from '@/lib/supabase';
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

export const MenuManager = () => {
    const { tenant, menuItems = [], categories = [], isLoading, refreshMenu } = useTenant();
    const { session } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('products');

    // Product form state
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingItem, setEditingItem] = useState<DBMenuItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [productFormData, setProductFormData] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: '',
    });

    // Category form state
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        icon: '🍽️',
    });

    const token = session?.access_token || '';

    // ============ PRODUCT HANDLERS ============

    const resetProductForm = () => {
        setProductFormData({
            name: '',
            description: '',
            price: '',
            image_url: '',
            category_id: categories[0]?.id || '',
        });
        setEditingItem(null);
    };

    const handleEditProduct = (item: DBMenuItem) => {
        setEditingItem(item);
        setProductFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            image_url: item.image_url || '',
            category_id: item.category_id,
        });
        setShowProductForm(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tenant) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast({ title: 'Formato no válido', description: 'Usa JPG, PNG, WebP o GIF', variant: 'destructive' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Imagen muy grande', description: 'Máximo 5MB', variant: 'destructive' });
            return;
        }

        setIsUploadingImage(true);
        try {
            // Generate unique filename
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `${tenant.id}/menu/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('tenant-assets')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(fileName);

            setProductFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
            toast({ title: 'Imagen subida' });
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error uploading image:', error);
            toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productFormData.name || !productFormData.price || !tenant) {
            toast({ title: 'Datos incompletos', description: 'Completa nombre y precio', variant: 'destructive' });
            return;
        }

        setIsSaving(true);

        try {
            const itemData = {
                name: productFormData.name,
                description: productFormData.description,
                price: parseFloat(productFormData.price),
                image_url: productFormData.image_url || '/placeholder.svg',
                category_id: productFormData.category_id || categories[0]?.id,
                tenant_id: tenant.id,
            };

            if (editingItem) {
                const res = await supabaseFetch(`menu_items?id=eq.${editingItem.id}`, token, {
                    method: 'PATCH',
                    body: JSON.stringify(itemData),
                });
                if (!res.ok) throw new Error('Failed to update');
                toast({ title: 'Producto actualizado' });
            } else {
                const res = await supabaseFetch('menu_items', token, {
                    method: 'POST',
                    body: JSON.stringify(itemData),
                });
                if (!res.ok) throw new Error('Failed to create');
                toast({ title: 'Producto agregado' });
            }

            await refreshMenu();
            setShowProductForm(false);
            resetProductForm();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error saving item:', error);
            toast({ title: 'Error', description: 'No se pudo guardar el producto', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            const res = await supabaseFetch(`menu_items?id=eq.${id}`, token, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast({ title: 'Producto eliminado' });
            await refreshMenu();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error deleting item:', error);
            toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
    };

    const handleToggleAvailable = async (item: DBMenuItem) => {
        try {
            const res = await supabaseFetch(`menu_items?id=eq.${item.id}`, token, {
                method: 'PATCH',
                body: JSON.stringify({ is_available: !item.is_available }),
            });
            if (!res.ok) throw new Error('Failed to toggle');
            toast({ title: item.is_available ? 'Producto agotado' : 'Producto disponible' });
            await refreshMenu();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error toggling availability:', error);
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    // ============ CATEGORY HANDLERS ============

    const resetCategoryForm = () => {
        setCategoryFormData({ name: '', icon: '🍽️' });
        setEditingCategory(null);
    };

    const handleEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryFormData({ name: cat.name, icon: cat.icon || '🍽️' });
        setShowCategoryForm(true);
    };

    const handleSubmitCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryFormData.name || !tenant) {
            toast({ title: 'Nombre requerido', variant: 'destructive' });
            return;
        }

        setIsSavingCategory(true);

        try {
            // Generate slug from name (lowercase, replace spaces with dashes, remove special chars)
            const generateSlug = (name: string) =>
                name.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
                    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
                    .replace(/\s+/g, '-') // spaces to dashes
                    .replace(/-+/g, '-'); // multiple dashes to single

            const catData = {
                name: categoryFormData.name,
                slug: generateSlug(categoryFormData.name),
                icon: categoryFormData.icon,
                tenant_id: tenant.id,
                sort_order: categories.length,
            };

            if (editingCategory) {
                const res = await supabaseFetch(`categories?id=eq.${editingCategory.id}`, token, {
                    method: 'PATCH',
                    body: JSON.stringify({ name: catData.name, icon: catData.icon }),
                });
                if (!res.ok) throw new Error('Failed to update');
                toast({ title: 'Categoría actualizada' });
            } else {
                const res = await supabaseFetch('categories', token, {
                    method: 'POST',
                    body: JSON.stringify(catData),
                });
                if (!res.ok) throw new Error('Failed to create');
                toast({ title: 'Categoría creada' });
            }

            await refreshMenu();
            setShowCategoryForm(false);
            resetCategoryForm();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error saving category:', error);
            toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        // Check if category has products
        const productsInCategory = menuItems.filter(item => item.category_id === id);
        if (productsInCategory.length > 0) {
            toast({
                title: 'No se puede eliminar',
                description: `Esta categoría tiene ${productsInCategory.length} productos. Muévelos primero.`,
                variant: 'destructive'
            });
            return;
        }

        try {
            const res = await supabaseFetch(`categories?id=eq.${id}`, token, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast({ title: 'Categoría eliminada' });
            await refreshMenu();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error deleting category:', error);
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Sin categoría';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Gestión del Menú</h2>
                <p className="text-muted-foreground">Administra tus productos y categorías.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="products">Productos ({menuItems.length})</TabsTrigger>
                    <TabsTrigger value="categories">Categorías ({categories.length})</TabsTrigger>
                </TabsList>

                {/* ============ PRODUCTS TAB ============ */}
                <TabsContent value="products" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Producto
                        </Button>
                    </div>

                    {menuItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                            <Image className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium">No hay productos</h3>
                            {categories.length === 0 ? (
                                <>
                                    <p className="text-muted-foreground mb-4 max-w-sm">
                                        Primero crea una categoría para organizar tus productos (ej: Hamburguesas, Bebidas, Postres).
                                    </p>
                                    <Button onClick={() => { setActiveTab('categories'); }} variant="outline">
                                        <FolderPlus className="h-4 w-4 mr-2" />
                                        Ir a Categorías
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="text-muted-foreground mb-4">Agrega tu primer producto al menú.</p>
                                    <Button onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Producto
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {menuItems.map(item => (
                                <Card key={item.id} className={`overflow-hidden flex flex-col ${!item.is_available ? 'opacity-60' : ''}`}>
                                    <div className="aspect-video relative shrink-0">
                                        <img
                                            src={item.image_url || '/placeholder.svg'}
                                            alt={item.name}
                                            className={`w-full h-full object-cover ${!item.is_available ? 'grayscale' : ''}`}
                                            loading="lazy"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                                        />
                                        <Badge className="absolute top-2 left-2">
                                            {getCategoryName(item.category_id)}
                                        </Badge>
                                        {!item.is_available && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                <Badge variant="destructive" className="text-lg px-4 py-2">
                                                    <PackageX className="h-5 w-5 mr-2" />
                                                    AGOTADO
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                                            <p className="text-primary font-bold text-xl">${item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <Button
                                                variant={!item.is_available ? 'default' : 'outline'}
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleToggleAvailable(item)}
                                            >
                                                {!item.is_available ? <><Package className="h-4 w-4 mr-2" />Disponible</> : <><PackageX className="h-4 w-4 mr-2" />Agotado</>}
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(item)}>
                                                    <Edit className="h-4 w-4 mr-1" />Editar
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-destructive px-3">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction className="bg-destructive" onClick={() => handleDeleteProduct(item.id)}>Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ============ CATEGORIES TAB ============ */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }}>
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Nueva Categoría
                        </Button>
                    </div>

                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                            <FolderPlus className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium">No hay categorías</h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                                Las categorías organizan tu menú. Ejemplos: Hamburguesas, Bebidas, Postres, Combos.
                            </p>
                            <Button onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                Crear Primera Categoría
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((cat, index) => (
                                <div key={cat.id} className="flex items-center gap-4 p-4 bg-card border rounded-lg">
                                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                                    <div className="text-2xl">{cat.icon || '🍽️'}</div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{cat.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {menuItems.filter(i => i.category_id === cat.id).length} productos
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditCategory(cat)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {menuItems.filter(i => i.category_id === cat.id).length > 0
                                                            ? 'Esta categoría tiene productos. Muévelos primero.'
                                                            : 'Esta acción no se puede deshacer.'}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* ============ PRODUCT FORM DIALOG ============ */}
            <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitProduct} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Imagen</Label>
                            <div className="flex gap-4 items-start">
                                {isUploadingImage ? (
                                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border">
                                        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                                    </div>
                                ) : productFormData.image_url ? (
                                    <img src={productFormData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
                                ) : (
                                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-dashed border">
                                        <Image className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingImage}
                                    >
                                        {isUploadingImage ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Camera className="h-4 w-4 mr-2" />
                                        )}
                                        {isUploadingImage ? 'Subiendo...' : 'Subir'}
                                    </Button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <Input
                                        placeholder="O pegar URL"
                                        value={productFormData.image_url}
                                        onChange={e => setProductFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                        className="h-8 text-xs"
                                        disabled={isUploadingImage}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input
                                value={productFormData.name}
                                onChange={e => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                                maxLength={100}
                                required
                                placeholder="Nombre del producto"
                            />
                            <p className="text-xs text-muted-foreground text-right">{productFormData.name.length}/100</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                                value={productFormData.description}
                                onChange={e => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                                maxLength={500}
                                placeholder="Describe el producto..."
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground text-right">{productFormData.description.length}/500</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Precio *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        value={productFormData.price}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setProductFormData(prev => ({ ...prev, price: val }));
                                            }
                                        }}
                                        className="pl-7"
                                        min="0"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select value={productFormData.category_id} onValueChange={(v) => setProductFormData(prev => ({ ...prev, category_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowProductForm(false)}>Cancelar</Button>
                            <Button type="submit" className="flex-1" disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {editingItem ? 'Guardar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============ CATEGORY FORM DIALOG ============ */}
            <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input
                                placeholder="Ej: Hamburguesas, Bebidas, Postres"
                                value={categoryFormData.name}
                                onChange={e => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                                maxLength={50}
                                required
                            />
                            <p className="text-xs text-muted-foreground text-right">{categoryFormData.name.length}/50</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Icono (emoji)</Label>
                            <Input
                                placeholder="🍔"
                                value={categoryFormData.icon}
                                maxLength={4}
                                onChange={e => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                                className="text-2xl text-center w-20"
                            />
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCategoryForm(false)}>Cancelar</Button>
                            <Button type="submit" className="flex-1" disabled={isSavingCategory}>
                                {isSavingCategory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {editingCategory ? 'Guardar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
