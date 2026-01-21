import { useState, useMemo, useRef } from 'react';
import { Check, Palette, Smartphone, Sparkles, Monitor, Layout, Crown, Eye, Upload, ImagePlus, X, Loader2 } from 'lucide-react';
import { useTenant, TenantContext } from '@/context/TenantContext';
import { OrderContext } from '@/context/OrderContext';
import Menu from '@/pages/Menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase, Category, MenuItem, Tenant } from '@/lib/supabase';

const TEMPLATES = [
    { id: 'classic', name: 'Clásico Dorado', description: 'Lista elegante con detalles premium.', icon: Layout },
    { id: 'modern', name: 'Cuadrícula Moderna', description: 'Diseño en grilla con fotos destacadas.', icon: Monitor },
    { id: 'rustic', name: 'Minimalista', description: 'Tipografía elegante, sin distracciones.', icon: Sparkles },
    { id: 'dark', name: 'Visual Inmersivo', description: 'Enfoque total en las fotos de tus platos.', icon: Smartphone },
    { id: 'vibrant', name: 'App Sidebar', description: 'Estilo de aplicación con navegación lateral.', icon: Palette },
];

const COLORS = [
    { name: 'Naranja Fuego', value: '#f97316' },
    { name: 'Rojo Pasión', value: '#ef4444' },
    { name: 'Negro Carbón', value: '#1f2937' },
    { name: 'Verde Fresco', value: '#22c55e' },
    { name: 'Azul Océano', value: '#3b82f6' },
    { name: 'Rosa Vibrante', value: '#ec4899' },
    { name: 'Dorado Lujo', value: '#eab308' },
];

// Preview mock data
const PREVIEW_CATEGORIES: Category[] = [
    { id: 'p1', tenant_id: 'preview', name: 'Recomendados', slug: 'recomendados', sort_order: 1, is_active: true, created_at: '', updated_at: '', description: '', image_url: '', icon: '⭐' },
    { id: 'p2', tenant_id: 'preview', name: 'Hamburguesas', slug: 'hamburguesas', sort_order: 2, is_active: true, created_at: '', updated_at: '', description: '', image_url: '', icon: '🍔' },
    { id: 'p3', tenant_id: 'preview', name: 'Bebidas', slug: 'bebidas', sort_order: 3, is_active: true, created_at: '', updated_at: '', description: '', image_url: '', icon: '🥤' },
];

const PREVIEW_ITEMS: MenuItem[] = [
    { id: 'i1', tenant_id: 'preview', category_id: 'p1', name: 'Grand Double Burger', description: 'Doble carne, cheddar, bacon y salsa especial.', price: 12500, is_available: true, sort_order: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'i2', tenant_id: 'preview', category_id: 'p2', name: 'Papas Cheddar', description: 'Papas bastón con cheddar fundido.', price: 5500, is_available: true, sort_order: 2, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'i3', tenant_id: 'preview', category_id: 'p3', name: 'Limonada', description: 'Limonada casera refrescante.', price: 2500, is_available: true, sort_order: 3, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
];

// Mock order context for preview
const MockOrderProvider = ({ children }: { children: React.ReactNode }) => (
    <OrderContext.Provider value={{
        cart: [],
        orders: [],
        isLoadingOrders: false,
        addToCart: () => { },
        removeFromCart: () => { },
        updateQuantity: () => { },
        updateWeight: () => { },
        clearCart: () => { },
        submitOrder: async () => ({ success: true, orderNumber: 123 }),
        updateOrderStatus: async () => { },
        cancelOrder: async () => { },
        refreshOrders: async () => { },
        snoozeOrder: async () => { },
        cartTotal: 0
    }}>
        {children}
    </OrderContext.Provider>
);

export const ThemeSettings = () => {
    const { tenant, refreshTenant } = useTenant();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for immediate feedback before saving
    const [selectedTemplate, setSelectedTemplate] = useState(tenant?.theme.templateId || 'classic');
    const [selectedColor, setSelectedColor] = useState(tenant?.theme.primaryColor || '#f97316');
    const [currentLogo, setCurrentLogo] = useState(tenant?.logo_url || null);

    // Create preview tenant with live updates
    const previewTenant: Tenant | null = useMemo(() => {
        if (!tenant) return null;
        return {
            ...tenant,
            logo_url: currentLogo,
            theme: {
                ...tenant.theme,
                templateId: selectedTemplate as Tenant['theme']['templateId'],
                primaryColor: selectedColor,
            }
        };
    }, [tenant, selectedTemplate, selectedColor, currentLogo]);

    const handleSave = async () => {
        if (!tenant) return;
        setIsLoading(true);
        try {
            const updatedTheme = {
                ...tenant.theme,
                templateId: selectedTemplate,
                primaryColor: selectedColor,
            };

            const { error, data } = await supabase
                .from('tenants')
                .update({ theme: updatedTheme })
                .eq('id', tenant.id)
                .select();

            if (error) throw error;

            // Check if update actually affected any rows (RLS may silently block)
            if (!data || data.length === 0) {
                throw new Error('No se pudo actualizar. Verifica que tienes permisos.');
            }

            await refreshTenant();
            toast({ title: 'Configuración guardada', description: 'Tu tienda se ha actualizado correctamente.' });
        } catch (error) {
            console.error('Error saving theme:', error);
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'No se pudo guardar la configuración.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const [isRequestingDesign, setIsRequestingDesign] = useState(false);

    const handleCustomRequest = async () => {
        if (!tenant) return;

        setIsRequestingDesign(true);
        try {
            const { error } = await supabase
                .from('design_requests')
                .insert({
                    tenant_id: tenant.id,
                    tenant_name: tenant.name,
                    tenant_slug: tenant.slug,
                    contact_email: tenant.business_email,
                    contact_phone: tenant.business_phone,
                    price: 49000,
                    status: 'pending'
                });

            if (error) throw error;

            toast({
                title: '¡Solicitud Enviada!',
                description: 'Nuestro equipo de diseño se pondrá en contacto contigo pronto.',
            });
        } catch (error) {
            console.error('Error creating design request:', error);
            toast({
                title: 'Error',
                description: 'No se pudo enviar la solicitud. Intenta nuevamente.',
                variant: 'destructive'
            });
        } finally {
            setIsRequestingDesign(false);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !tenant) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast({ title: 'Error', description: 'Formato no válido. Usa JPG, PNG, WebP, GIF o SVG.', variant: 'destructive' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Error', description: 'El archivo es muy grande. Máximo 5MB.', variant: 'destructive' });
            return;
        }

        setIsUploadingLogo(true);
        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${tenant.id}/logo-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('tenant-assets')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(fileName);

            const logoUrl = urlData.publicUrl;

            // Update tenant with new logo URL
            const { error: updateError, data } = await supabase
                .from('tenants')
                .update({ logo_url: logoUrl })
                .eq('id', tenant.id)
                .select();

            if (updateError) throw updateError;
            if (!data || data.length === 0) {
                throw new Error('No se pudo actualizar. Verifica que tienes permisos.');
            }

            setCurrentLogo(logoUrl);
            await refreshTenant();
            toast({ title: 'Logo actualizado', description: 'Tu logo se ha subido correctamente.' });
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'No se pudo subir el logo.', variant: 'destructive' });
        } finally {
            setIsUploadingLogo(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleLogoDelete = async () => {
        if (!tenant || !currentLogo) return;

        setIsUploadingLogo(true);
        try {
            // Extract file path from URL
            const urlParts = currentLogo.split('/tenant-assets/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1];
                // Delete from storage
                await supabase.storage.from('tenant-assets').remove([filePath]);
            }

            // Update tenant to remove logo URL
            const { error, data } = await supabase
                .from('tenants')
                .update({ logo_url: null })
                .eq('id', tenant.id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error('No se pudo actualizar. Verifica que tienes permisos.');
            }

            setCurrentLogo(null);
            await refreshTenant();
            toast({ title: 'Logo eliminado', description: 'Tu logo ha sido eliminado.' });
        } catch (error) {
            console.error('Error deleting logo:', error);
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'No se pudo eliminar el logo.', variant: 'destructive' });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-10">
            {/* MOBILE: Phone Preview at Top */}
            <div className="lg:hidden flex flex-col items-center mb-4">
                <div className="bg-slate-100 rounded-2xl p-4 w-full max-w-[340px]">
                    <div className="text-center text-xs text-slate-500 mb-3 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        Vista Previa
                    </div>
                    <div className="w-[300px] h-[600px] mx-auto bg-white rounded-[2rem] shadow-xl border-[5px] border-slate-900 relative overflow-hidden">
                        {/* Mini Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-xl z-30"></div>
                        {/* Screen Content */}
                        <div className="w-full h-full overflow-hidden bg-white pt-5">
                            {previewTenant && (
                                <TenantContext.Provider value={{
                                    tenant: previewTenant,
                                    categories: PREVIEW_CATEGORIES,
                                    menuItems: PREVIEW_ITEMS,
                                    isLoading: false,
                                    error: null,
                                    tenantSlug: 'preview',
                                    refreshTenant: async () => { },
                                    refreshMenu: async () => { }
                                }}>
                                    <MockOrderProvider>
                                        <Menu isPreview={true} />
                                    </MockOrderProvider>
                                </TenantContext.Provider>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* LEFT SIDE: Settings */}
            <div className="flex-1 space-y-8 max-w-2xl">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Personalización</h2>
                    <p className="text-muted-foreground">Define la apariencia de tu tienda online.</p>
                </div>

                {/* Logo Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Logo de tu Negocio</CardTitle>
                        <CardDescription>Sube el logo que aparecerá en tu menú digital. Formatos: JPG, PNG, WebP, GIF, SVG (máx. 5MB)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            {/* Logo Preview */}
                            <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/30 overflow-hidden group">
                                {currentLogo ? (
                                    <>
                                        <img
                                            src={currentLogo}
                                            alt="Logo"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <button
                                            onClick={handleLogoDelete}
                                            disabled={isUploadingLogo}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                    </>
                                ) : (
                                    <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
                                )}
                                {isUploadingLogo && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1 space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingLogo}
                                    className="w-full sm:w-auto"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {currentLogo ? 'Cambiar Logo' : 'Subir Logo'}
                                </Button>
                                {currentLogo && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogoDelete}
                                        disabled={isUploadingLogo}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Template Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plantilla de Diseño</CardTitle>
                        <CardDescription>Elige la estructura base de tu menú digital.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {TEMPLATES.map((t) => (
                                <div key={t.id}>
                                    <RadioGroupItem value={t.id} id={t.id} className="peer sr-only" />
                                    <Label
                                        htmlFor={t.id}
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                                    >
                                        <t.icon className="mb-3 h-8 w-8 text-muted-foreground peer-data-[state=checked]:text-primary" />
                                        <div className="text-center space-y-1">
                                            <div className="font-semibold text-lg">{t.name}</div>
                                            <div className="text-xs text-muted-foreground font-normal leading-snug">{t.description}</div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Color Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Color de Marca</CardTitle>
                        <CardDescription>Este color se usará en botones, encabezados y destacados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ring-offset-2 ${selectedColor === color.value ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {selectedColor === color.value && <Check className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                            <div className="flex items-center gap-2 ml-4 border-l pl-4">
                                <Label htmlFor="custom-color" className="whitespace-nowrap">Personalizado:</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="custom-color"
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="w-10 h-10 p-1 rounded-md cursor-pointer"
                                    />
                                    <Input
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="w-24 font-mono uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 border-t flex justify-end p-4">
                        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Upsell Card */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-md">
                    <CardHeader>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                            <Crown className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-indigo-900">Diseño Premium</CardTitle>
                        <CardDescription className="text-indigo-700/80">
                            ¿Necesitas algo único? Nuestro equipo de diseñadores puede crear un tema exclusivo para tu marca.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm text-indigo-800">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-indigo-600" /> Icons y tipografías a medida
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-indigo-600" /> Animaciones personalizadas
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-indigo-600" /> CSS avanzado y Branding
                            </li>
                        </ul>
                        <div className="pt-4">
                            <span className="text-2xl font-bold text-indigo-900">$49.000</span>
                            <span className="text-indigo-600 text-sm"> / pago único</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-lg"
                            onClick={handleCustomRequest}
                            disabled={isRequestingDesign}
                        >
                            {isRequestingDesign ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Solicitar Diseño'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT SIDE: Phone Preview */}
            <div className="hidden lg:flex flex-col w-[420px] bg-slate-100 rounded-2xl relative overflow-hidden min-h-[700px]">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium backdrop-blur">
                    <Eye className="w-4 h-4" />
                    Vista Previa
                </div>

                {/* Mobile Device Frame */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                    <div className="w-[320px] h-[640px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-slate-900 relative overflow-hidden ring-4 ring-slate-900/10">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-30"></div>

                        {/* Screen Content - Scaled to fit phone frame */}
                        <div className="w-full h-full overflow-hidden bg-white relative">
                            <div
                                className="origin-top-left overflow-y-auto overflow-x-hidden scrollbar-hide pt-6"
                                style={{
                                    width: '308px',
                                    height: '640px',
                                }}
                            >
                                {previewTenant && (
                                    <TenantContext.Provider value={{
                                        tenant: previewTenant,
                                        categories: PREVIEW_CATEGORIES,
                                        menuItems: PREVIEW_ITEMS,
                                        isLoading: false,
                                        error: null,
                                        tenantSlug: 'preview',
                                        refreshTenant: async () => { },
                                        refreshMenu: async () => { }
                                    }}>
                                        <MockOrderProvider>
                                            <Menu isPreview={true} />
                                        </MockOrderProvider>
                                    </TenantContext.Provider>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center text-slate-500 text-xs">
                    Vista previa en tiempo real
                </div>
            </div>
        </div>
    );
};
