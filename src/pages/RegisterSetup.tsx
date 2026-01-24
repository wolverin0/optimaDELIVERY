import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TenantContext } from '@/context/TenantContext';
// Import OrderContext type but separate provider to mock it
import { OrderContext } from '@/context/OrderContext';
import Menu from '@/pages/Menu';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, ArrowRight, Loader2, Check, Smartphone, Eye, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { THEMES } from '@/lib/themes';
import { Tenant, Category, MenuItem } from '@/lib/supabase';

// --- MOCK DATA FOR PREVIEW ---
const PREVIEW_CATEGORIES: Category[] = [
    { id: 'p1', tenant_id: 'preview', name: 'Recomendados', slug: 'recomendados', sort_order: 1, is_active: true, created_at: '', updated_at: '', description: '', image_url: '', icon: '⭐' },
    { id: 'p2', tenant_id: 'preview', name: 'Hamburguesas', slug: 'hamburguesas', sort_order: 2, is_active: true, created_at: '', updated_at: '', description: '', image_url: '', icon: '🍔' },
];

const PREVIEW_ITEMS: MenuItem[] = [
    { id: 'i1', tenant_id: 'preview', category_id: 'p1', name: 'Grand Double Burger', description: 'Doble carne, cheddar, bacon y salsa especial.', price: 12500, is_available: true, sort_order: 1, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
    { id: 'i2', tenant_id: 'preview', category_id: 'p2', name: 'Papas Cheddar', description: 'Papas bastón con cheddar fundido.', price: 5500, is_available: true, sort_order: 2, image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80', created_at: '', updated_at: '', sold_by_weight: false, weight_unit: 'un' },
];

// Simple mock order context for the preview to avoid errors
const MockOrderProvider = ({ children }: { children: React.ReactNode }) => {
    return (
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
};

const RegisterSetup = () => {
    // @ts-ignore - session is available in updated context but maybe ts definition is lagging
    const { user, profile, refreshProfile, session } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fix: Add isMounted ref to prevent state updates on unmounted component
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
    const [formData, setFormData] = useState({
        businessName: '',
        slug: '',
        phone: '',
    });

    // Slug availability state
    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (slugCheckTimeoutRef.current) {
                clearTimeout(slugCheckTimeoutRef.current);
            }
        };
    }, []);

    // Check slug availability with debounce
    const checkSlugAvailability = useCallback(async (slug: string) => {
        if (!slug || slug.length < 2) {
            setSlugStatus('idle');
            return;
        }

        setSlugStatus('checking');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tenants?slug=eq.${encodeURIComponent(slug)}&select=id`,
                {
                    method: 'GET',
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (import.meta.env.DEV) console.error('Slug check failed:', response.status);
                setSlugStatus('idle');
                return;
            }

            const data = await response.json();

            if (isMounted.current) {
                setSlugStatus(data.length > 0 ? 'taken' : 'available');
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error checking slug availability:', error);
            if (isMounted.current) {
                setSlugStatus('idle');
            }
        }
    }, []);

    // Debounced slug check
    const debouncedSlugCheck = useCallback((slug: string) => {
        // Clear any pending timeout
        if (slugCheckTimeoutRef.current) {
            clearTimeout(slugCheckTimeoutRef.current);
        }

        if (!slug || slug.length < 2) {
            setSlugStatus('idle');
            return;
        }

        // Set a new timeout for the check
        slugCheckTimeoutRef.current = setTimeout(() => {
            checkSlugAvailability(slug);
        }, 400); // 400ms debounce
    }, [checkSlugAvailability]);

    // If user already has a tenant, redirect to dashboard
    useEffect(() => {
        let active = true;
        if (profile?.tenant_id && active) {
            navigate('/dashboard');
        }
        return () => { active = false; };
    }, [profile?.tenant_id, navigate]);

    // Generate slug from business name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (name: string) => {
        const newSlug = generateSlug(name);
        setFormData({
            ...formData,
            businessName: name,
            slug: newSlug,
        });
        // Trigger debounced slug availability check
        debouncedSlugCheck(newSlug);
    };

    // Handle direct slug input changes
    const handleSlugChange = (value: string) => {
        const newSlug = generateSlug(value);
        setFormData({ ...formData, slug: newSlug });
        // Trigger debounced slug availability check
        debouncedSlugCheck(newSlug);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.businessName || !formData.slug) {
            toast({
                title: 'Datos incompletos',
                description: 'Por favor completa el nombre de tu negocio',
                variant: 'destructive',
            });
            return;
        }

        if (!user || !session) {
            toast({
                title: 'Error de sesión',
                description: 'Por favor inicia sesión nuevamente',
                variant: 'destructive',
            });
            navigate('/login');
            return;
        }

        setIsLoading(true);

        try {
            // Use the database function to create tenant atomically
            const { data, error } = await supabase.rpc('create_tenant_for_user', {
                p_name: formData.businessName,
                p_slug: formData.slug,
                p_phone: formData.phone || null,
                p_theme: selectedTheme
            });

            if (error) {
                if (import.meta.env.DEV) console.error('RPC Error:', error);
                throw new Error(error.message || 'Error al crear el negocio');
            }

            if (!data || data.length === 0) {
                throw new Error('No se recibió respuesta del servidor');
            }

            const result = data[0];

            if (!result.success) {
                // Handle specific errors
                if (result.error_message === 'Slug already taken') {
                    toast({
                        title: 'URL no disponible',
                        description: 'Este nombre ya está en uso. Prueba con otro.',
                        variant: 'destructive',
                    });
                    if (isMounted.current) setIsLoading(false);
                    return;
                }
                if (result.error_message === 'User already has a tenant') {
                    // User already has a tenant, redirect to dashboard
                    window.location.href = '/dashboard';
                    return;
                }
                if (result.error_message === 'User not authenticated') {
                    toast({
                        title: 'Sesión expirada',
                        description: 'Por favor inicia sesión nuevamente.',
                        variant: 'destructive',
                    });
                    navigate('/login');
                    return;
                }
                throw new Error(result.error_message || 'Error al crear el negocio');
            }

            // Success!
            toast({
                title: '¡Todo listo!',
                description: 'Tu negocio ha sido creado exitosamente.',
            });

            // Hard redirect immediately
            window.location.href = '/dashboard';

        } catch (error: unknown) {
            if (import.meta.env.DEV) console.error('Error creating business:', error);
            // Ignore AbortError if it happens at the very end
            const errorObj = error as { name?: string; message?: string };
            if (errorObj?.name === 'AbortError' || errorObj?.message?.includes('AbortError')) {
                return;
            }

            const message = error instanceof Error ? error.message : 'Hubo un error al crear tu negocio';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            if (isMounted.current) setIsLoading(false); // Only if mounted
        }
    };

    // Construct preview tenant object
    const previewTenant: Tenant = {
        id: 'preview',
        name: formData.businessName || 'Tu Negocio',
        slug: formData.slug || 'tu-negocio',
        theme: selectedTheme,
        is_active: true,
        logo_url: null,
        created_at: '',
        updated_at: '',
        settings: {},
        mercadopago_access_token: null,
        mercadopago_public_key: null,
        business_phone: formData.phone || '',
        business_email: '',
        business_address: ''
    };

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
            {/* LEFT SIDE: Wizard Form */}
            <div className="w-full md:w-[600px] flex flex-col border-r border-border bg-card z-10 shadow-xl overflow-y-auto">
                {/* Header */}
                <header className="px-8 py-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            OD
                        </div>
                        <span className="font-semibold text-lg">optimaDELIVERY</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Paso {step} de 3
                    </div>
                </header>

                <div className="flex-1 px-8 py-8">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">
                            {step === 1 && "Datos del Negocio"}
                            {step === 2 && "Elige tu Diseño"}
                            {step === 3 && "Confirmación"}
                        </h1>
                        <p className="text-muted-foreground">
                            {step === 1 && "Comencemos por lo básico. ¿Cómo se llama tu emprendimiento?"}
                            {step === 2 && "Selecciona una plantilla. Podrás ver los cambios en tiempo real a la derecha."}
                            {step === 3 && "Revisa que todo esté correcto antes de lanzar tu menú."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Nombre del negocio</Label>
                                    <Input
                                        id="businessName"
                                        placeholder="Ej: Burger House"
                                        value={formData.businessName}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className="h-12 text-lg"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL de tu menú</Label>
                                    <div className={`flex items-center gap-2 bg-muted/30 rounded-md border p-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors ${
                                        slugStatus === 'available' ? 'border-green-500' :
                                        slugStatus === 'taken' ? 'border-red-500' :
                                        'border-input'
                                    }`}>
                                        <span className="text-muted-foreground pl-3 text-sm font-medium">optimadelivery.com/t/</span>
                                        <input
                                            id="slug"
                                            className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                                            placeholder="burger-house"
                                            value={formData.slug}
                                            onChange={(e) => handleSlugChange(e.target.value)}
                                        />
                                        {/* Slug availability indicator */}
                                        <div className="pr-3 flex items-center">
                                            {slugStatus === 'checking' && (
                                                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                                            )}
                                            {slugStatus === 'available' && (
                                                <Check className="h-5 w-5 text-green-500" />
                                            )}
                                            {slugStatus === 'taken' && (
                                                <X className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                    {/* Slug status message */}
                                    {slugStatus === 'taken' && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            Esta URL ya está en uso. Prueba con otra.
                                        </p>
                                    )}
                                    {slugStatus === 'available' && (
                                        <p className="text-sm text-green-500 flex items-center gap-1">
                                            <Check className="h-4 w-4" />
                                            URL disponible
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono / WhatsApp (Opcional)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+54 9 11 1234 5678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={!formData.businessName || !formData.slug || slugStatus === 'taken' || slugStatus === 'checking'}
                                        className="w-full h-12 text-lg"
                                    >
                                        Continuar
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <Label>Selecciona una Plantilla</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    {THEMES.map((theme) => (
                                        <div
                                            key={theme.templateId}
                                            onClick={() => setSelectedTheme(theme)}
                                            className={`
                                                cursor-pointer rounded-xl border-2 p-4 transition-all flex items-center justify-between
                                                ${selectedTheme.templateId === theme.templateId
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-full border shadow-sm"
                                                    style={{ backgroundColor: theme.primaryColor }}
                                                />
                                                <div>
                                                    <div className="font-semibold">{theme.name}</div>
                                                    <div className="text-xs text-muted-foreground capitalize">Estilo {theme.templateId}</div>
                                                </div>
                                            </div>

                                            {selectedTheme.templateId === theme.templateId && (
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                                        Volver
                                    </Button>
                                    <Button type="button" onClick={() => setStep(3)} className="flex-1 h-12">
                                        Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
                                    <h3 className="font-semibold text-lg border-b border-border pb-2">Resumen</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-muted-foreground">Negocio</span>
                                            <span className="font-medium">{formData.businessName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-muted-foreground">Plantilla</span>
                                            <span className="font-medium text-primary capitalize">{selectedTheme.name}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-muted-foreground">URL Pública</span>
                                            <span className="font-medium font-mono bg-muted px-2 py-1 rounded inline-block mt-1">optimadelivery.com/t/{formData.slug}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                        className="flex-1 h-12"
                                        disabled={isLoading}
                                    >
                                        Volver
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 text-lg shadow-lg shadow-primary/20"
                                        disabled={isLoading || slugStatus === 'taken' || slugStatus === 'checking'}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            'Lanzar mi Sitio 🚀'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE: Live Preview */}
            <div className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden min-h-[600px] md:min-h-0">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium backdrop-blur">
                    <Eye className="w-4 h-4" />
                    Vista Previa en Vivo
                </div>

                {/* Mobile Device Frame */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                    <div className="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-slate-900 relative overflow-hidden ring-4 ring-slate-900/10">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-30"></div>

                        {/* Screen Content */}
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-white scrollbar-hide relative transform-gpu pt-8">
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
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center text-slate-400 text-sm">
                    Así es como verán el menú tus clientes en sus teléfonos
                </div>
            </div>
        </div>
    );
};

export default RegisterSetup;
