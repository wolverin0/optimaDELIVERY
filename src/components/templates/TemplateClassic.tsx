import { Utensils } from 'lucide-react';
import { MenuCard } from '@/components/MenuCard';
import { CartDrawer } from '@/components/CartDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TemplateProps } from './types';
import { toast } from 'sonner';

export const TemplateClassic = ({ tenant, menuItems }: TemplateProps) => {
    // Map DB field names: is_available instead of soldOut
    const availableItems = menuItems.filter(item => item.is_available);
    const soldOutItems = menuItems.filter(item => !item.is_available);

    return (
        <div className="min-h-screen bg-background relative z-10 transition-colors duration-500">
            {/* Luxury Header */}
            <header className="luxury-header">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={tenant?.logo_url || "/braseritologo.jpeg"}
                            alt={tenant?.name || "Restaurant"}
                            className="w-[52px] h-[52px] rounded-full object-cover shadow-gold"
                        />
                        <h1 className="text-2xl font-semibold tracking-wide">{tenant?.name || 'Restaurant'}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/30 text-primary hover:bg-primary hover:text-white"
                            onClick={() => toast.info("Inicio de sesión (Demo)", { description: "Esta es una simulación de acceso para clientes." })}
                        >
                            <Utensils className="h-4 w-4 mr-2" />
                            Ingresar
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section with Decorations */}
            <section className="py-14 text-center max-w-[700px] mx-auto px-6">
                <div className="hero-decoration">
                    <div className="decorative-line"></div>
                    <div className="decorative-diamond"></div>
                    <div className="decorative-line"></div>
                </div>
                <h2 className="text-5xl font-semibold tracking-wide mb-3">La Carta</h2>
                <p className="text-muted-foreground text-[15px] tracking-wide">
                    Sabores artesanales que cuentan una historia en cada bocado
                </p>
            </section>

            {/* Menu Grid */}
            <main className="container mx-auto px-6 py-10 pb-32">
                {availableItems.length === 0 && soldOutItems.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Utensils className="w-[72px] h-[72px] mx-auto mb-5 opacity-25 text-primary" />
                        <p className="text-[15px] italic">No hay platos disponibles</p>
                        <p className="text-sm mt-2">Agrega productos desde el panel de administración</p>
                    </div>
                ) : (
                    <>
                        {availableItems.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {availableItems.map((item, index) => (
                                    <MenuCard key={item.id} item={item} index={index} />
                                ))}
                            </div>
                        )}

                        {soldOutItems.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-xl font-medium text-muted-foreground mb-6 text-center relative">
                                    <span className="relative z-10 bg-background px-6">No Disponible</span>
                                    <span className="absolute left-0 right-0 top-1/2 h-px bg-border -z-0"></span>
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {soldOutItems.map((item, index) => (
                                        <MenuCard key={item.id} item={item} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Social Links Footer */}
            {tenant && (
                <footer className="py-6 border-t border-border/50">
                    <SocialLinksBar tenant={tenant} variant="default" className="mb-4" />
                    <p className="text-center text-xs text-muted-foreground">
                        Powered by optimaDELIVERY
                    </p>
                </footer>
            )}

            {/* Cart FAB */}
            <CartDrawer />
        </div>
    );
};
