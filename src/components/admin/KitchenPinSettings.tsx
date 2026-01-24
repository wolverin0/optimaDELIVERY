import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Copy, ChefHat, RefreshCw, Check, MessageCircle, Mail, Share2 } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const KitchenPinSettings = () => {
    const { tenant, refreshTenant } = useTenant();
    const { session } = useAuth();
    const { toast } = useToast();
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    const token = session?.access_token || '';

    useEffect(() => {
        if (tenant?.kitchen_pin) {
            setPin(tenant.kitchen_pin);
        }
    }, [tenant?.kitchen_pin]);

    const generatePin = () => {
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
        setPin(newPin);
    };

    const savePin = async () => {
        if (!tenant?.id || !pin) return;

        if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
            toast({
                title: 'PIN inválido',
                description: 'El PIN debe tener entre 4 y 6 dígitos numéricos.',
                variant: 'destructive'
            });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/tenants?id=eq.${tenant.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ kitchen_pin: pin }),
                }
            );

            if (!res.ok) throw new Error('Failed to save PIN');

            toast({ title: 'PIN guardado', description: 'El PIN de cocina ha sido actualizado.' });

            // Refresh tenant to get updated data
            if (refreshTenant) refreshTenant();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error saving PIN:', error);
            toast({ title: 'Error', description: 'No se pudo guardar el PIN.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const removePin = async () => {
        if (!tenant?.id) return;

        setIsSaving(true);
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/tenants?id=eq.${tenant.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ kitchen_pin: null }),
                }
            );

            if (!res.ok) throw new Error('Failed to remove PIN');

            setPin('');
            toast({ title: 'PIN eliminado', description: 'El acceso por PIN ha sido desactivado.' });

            if (refreshTenant) refreshTenant();
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error removing PIN:', error);
            toast({ title: 'Error', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const getKitchenUrl = () => `${window.location.origin}/cocina/${tenant?.slug}`;

    const copyLink = () => {
        navigator.clipboard.writeText(getKitchenUrl());
        setCopied(true);
        toast({ title: 'Link copiado' });
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const message = `Acceso a Cocina - ${tenant?.name}\n\nLink: ${getKitchenUrl()}\nPIN: ${tenant?.kitchen_pin}\n\nIngresa el PIN para ver los pedidos en tiempo real.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const shareEmail = () => {
        const subject = `Acceso a Cocina - ${tenant?.name}`;
        const body = `Hola,\n\nAquí están los datos para acceder a la vista de cocina:\n\nLink: ${getKitchenUrl()}\nPIN: ${tenant?.kitchen_pin}\n\nSolo ingresa el PIN para ver los pedidos en tiempo real.\n\nSaludos`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    };

    const copyWithPin = () => {
        const text = `Acceso Cocina\nLink: ${getKitchenUrl()}\nPIN: ${tenant?.kitchen_pin}`;
        navigator.clipboard.writeText(text);
        toast({ title: 'Link y PIN copiados' });
    };

    const hasExistingPin = !!tenant?.kitchen_pin;
    const pinChanged = pin !== (tenant?.kitchen_pin || '');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    PIN de Cocina
                </CardTitle>
                <CardDescription>
                    Permite que el personal de cocina acceda a los pedidos sin necesidad de crear una cuenta.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* PIN Input */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">PIN de acceso</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1 max-w-[200px]">
                            <Input
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Ej: 1234"
                                className="text-2xl tracking-[0.5em] font-mono text-center pr-10"
                                maxLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={generatePin}
                            title="Generar PIN aleatorio"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                        Entre 4 y 6 dígitos. Solo números.
                    </p>
                </div>

                {/* Save / Remove Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={savePin}
                        disabled={isSaving || !pin || !pinChanged}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {hasExistingPin ? 'Actualizar PIN' : 'Activar PIN'}
                    </Button>
                    {hasExistingPin && (
                        <Button
                            variant="outline"
                            onClick={removePin}
                            disabled={isSaving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Desactivar
                        </Button>
                    )}
                </div>

                {/* Kitchen Link & Sharing */}
                {hasExistingPin && (
                    <div className="pt-4 border-t space-y-4">
                        <label className="text-sm font-medium text-slate-700">Link para cocina</label>
                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                            <code className="flex-1 text-sm text-slate-600 truncate">
                                {getKitchenUrl()}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyLink}
                                className="shrink-0"
                                title="Copiar link"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Share Buttons */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Compartir acceso</label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={shareWhatsApp}
                                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={shareEmail}
                                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyWithPin}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Copiar con PIN
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                Envía el link y PIN directamente a tu equipo de cocina.
                            </p>
                        </div>
                    </div>
                )}

                {/* How it works */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-blue-900 text-sm">¿Cómo funciona?</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Configura un PIN arriba</li>
                        <li>Comparte el link con tu cocinero</li>
                        <li>El cocinero ingresa el PIN y ve los pedidos en tiempo real</li>
                        <li>No necesita email, cuenta ni contraseña</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
};
