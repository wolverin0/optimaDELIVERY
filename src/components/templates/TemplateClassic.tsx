import { Utensils, Sparkles } from 'lucide-react';
import { MenuCard } from '@/components/MenuCard';
import { CartDrawer } from '@/components/CartDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TemplateProps } from './types';
import { toast } from 'sonner';

export const TemplateClassic = ({ tenant, menuItems }: TemplateProps) => {
    const availableItems = menuItems.filter(item => item.is_available);
    const soldOutItems = menuItems.filter(item => !item.is_available);

    return (
        <div className="min-h-screen bg-background relative z-10 transition-colors duration-500">
            {/* Luxury Header with improved styling */}
            <header className="luxury-header sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img
                                src={tenant?.logo_url || "/braseritologo.jpeg"}
                                alt={tenant?.name || "Restaurant"}
                                className="w-[52px] h-[52px] rounded-full object-cover shadow-lg ring-2 ring-primary/10 relative transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-wide">{tenant?.name || 'Restaurant'}</h1>
                            <p className="text-xs text-muted-foreground/70 font-medium tracking-wider uppercase">Menú Digital</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full px-4"
                            onClick={() => toast.info("Inicio de sesión (Demo)", { description: "Esta es una simulación de acceso para clientes." })}
                        >
                            <Utensils className="h-4 w-4 mr-2" />
                            Ingresar
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section with Enhanced Decorations */}
            <section className="py-16 text-center max-w-[700px] mx-auto px-6">
                <div className="hero-decoration mb-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
                        <Sparkles className="w-5 h-5 text-primary/60" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
                    </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-semibold tracking-wide mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    La Carta
                </h2>
                <p className="text-muted-foreground text-base tracking-wide leading-relaxed max-w-md mx-auto">
                    Sabores artesanales que cuentan una historia en cada bocado
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {availableItems.length} platos disponibles
                    </span>
                </div>
            </section>

            {/* Menu Grid with improved spacing */}
            <main className="container mx-auto px-6 py-10 pb-32">
                {availableItems.length === 0 && soldOutItems.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Utensils className="w-10 h-10 text-primary/50" />
                        </div>
                        <p className="text-lg font-medium text-foreground/80 mb-2">No hay platos disponibles</p>
                        <p className="text-sm text-muted-foreground">Agrega productos desde el panel de administración</p>
                    </div>
                ) : (
                    <>
                        {availableItems.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                {availableItems.map((item, index) => (
                                    <MenuCard key={item.id} item={item} index={index} />
                                ))}
                            </div>
                        )}

                        {soldOutItems.length > 0 && (
                            <div className="mt-16">
                                <h3 className="text-xl font-medium text-muted-foreground mb-8 text-center relative">
                                    <span className="relative z-10 bg-background px-6 py-2">No Disponible</span>
                                    <span className="absolute left-0 right-0 top-1/2 h-px bg-border/50 -z-0" />
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 opacity-60">
                                    {soldOutItems.map((item, index) => (
                                        <MenuCard key={item.id} item={item} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Social Links Footer - Enhanced */}
            {tenant && (
                <footer className="py-10 border-t border-border/30 bg-muted/20">
                    <div className="container mx-auto px-6">
                        <SocialLinksBar tenant={tenant} variant="default" className="mb-6" />
                        <p className="text-center text-xs text-muted-foreground/60">
                            Powered by{' '}
                            <span className="font-medium text-primary/70">optimaDELIVERY</span>
                        </p>
                    </div>
                </footer>
            )}

            {/* Cart FAB */}
            <CartDrawer />
        </div>
    );
};
