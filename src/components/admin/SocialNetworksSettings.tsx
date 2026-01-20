import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Instagram, Facebook, MessageCircle, Music2, Twitter, Share2, ExternalLink } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SocialNetwork {
    key: 'social_instagram' | 'social_facebook' | 'social_whatsapp' | 'social_tiktok' | 'social_twitter';
    label: string;
    icon: React.ElementType;
    placeholder: string;
    prefix?: string;
    color: string;
    bgColor: string;
}

const SOCIAL_NETWORKS: SocialNetwork[] = [
    {
        key: 'social_instagram',
        label: 'Instagram',
        icon: Instagram,
        placeholder: 'tu_usuario',
        prefix: '@',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
    },
    {
        key: 'social_facebook',
        label: 'Facebook',
        icon: Facebook,
        placeholder: 'tu.pagina',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        key: 'social_whatsapp',
        label: 'WhatsApp',
        icon: MessageCircle,
        placeholder: '+54 9 11 1234-5678',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
    },
    {
        key: 'social_tiktok',
        label: 'TikTok',
        icon: Music2,
        placeholder: '@tu_usuario',
        prefix: '@',
        color: 'text-slate-800',
        bgColor: 'bg-slate-100',
    },
    {
        key: 'social_twitter',
        label: 'X (Twitter)',
        icon: Twitter,
        placeholder: '@tu_usuario',
        prefix: '@',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50',
    },
];

export const SocialNetworksSettings = () => {
    const { tenant, refreshTenant } = useTenant();
    const { session } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [socialValues, setSocialValues] = useState<Record<string, string>>({
        social_instagram: '',
        social_facebook: '',
        social_whatsapp: '',
        social_tiktok: '',
        social_twitter: '',
    });

    const token = session?.access_token || '';

    useEffect(() => {
        if (tenant) {
            setSocialValues({
                social_instagram: tenant.social_instagram || '',
                social_facebook: tenant.social_facebook || '',
                social_whatsapp: tenant.social_whatsapp || '',
                social_tiktok: tenant.social_tiktok || '',
                social_twitter: tenant.social_twitter || '',
            });
        }
    }, [tenant]);

    const handleChange = (key: string, value: string) => {
        setSocialValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!tenant?.id) return;

        setIsLoading(true);
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
                    body: JSON.stringify({
                        social_instagram: socialValues.social_instagram || null,
                        social_facebook: socialValues.social_facebook || null,
                        social_whatsapp: socialValues.social_whatsapp || null,
                        social_tiktok: socialValues.social_tiktok || null,
                        social_twitter: socialValues.social_twitter || null,
                    }),
                }
            );

            if (!res.ok) throw new Error('Failed to save social networks');

            await refreshTenant();
            toast({ title: 'Redes sociales guardadas', description: 'Tus clientes ahora pueden encontrarte en redes.' });
        } catch (error) {
            console.error('Error saving social networks:', error);
            toast({ title: 'Error', description: 'No se pudieron guardar las redes sociales.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = SOCIAL_NETWORKS.some(
        sn => socialValues[sn.key] !== (tenant?.[sn.key] || '')
    );

    const filledCount = SOCIAL_NETWORKS.filter(sn => socialValues[sn.key]).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Redes Sociales
                </CardTitle>
                <CardDescription>
                    Agrega tus redes sociales para que aparezcan como botones en tu menu digital.
                    Los clientes podran seguirte y contactarte facilmente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {SOCIAL_NETWORKS.map((network) => {
                    const Icon = network.icon;
                    const value = socialValues[network.key];
                    return (
                        <div key={network.key} className="space-y-2">
                            <Label htmlFor={network.key} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${network.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-4 h-4 ${network.color}`} />
                                </div>
                                <span className="font-medium">{network.label}</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id={network.key}
                                    value={value}
                                    onChange={(e) => handleChange(network.key, e.target.value)}
                                    placeholder={network.placeholder}
                                    className="flex-1"
                                />
                                {value && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            let url = '';
                                            if (network.key === 'social_instagram') {
                                                url = `https://instagram.com/${value.replace('@', '')}`;
                                            } else if (network.key === 'social_facebook') {
                                                url = `https://facebook.com/${value}`;
                                            } else if (network.key === 'social_whatsapp') {
                                                url = `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
                                            } else if (network.key === 'social_tiktok') {
                                                url = `https://tiktok.com/@${value.replace('@', '')}`;
                                            } else if (network.key === 'social_twitter') {
                                                url = `https://x.com/${value.replace('@', '')}`;
                                            }
                                            window.open(url, '_blank');
                                        }}
                                        title="Probar link"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filledCount > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-800">
                            <strong>{filledCount} red{filledCount > 1 ? 'es' : ''} social{filledCount > 1 ? 'es' : ''}</strong> apareceran como botones en tu menu digital.
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/20 border-t flex justify-end p-4">
                <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Guardar Cambios
                </Button>
            </CardFooter>
        </Card>
    );
};
