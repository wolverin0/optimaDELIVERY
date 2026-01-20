import { TemplateProps } from './types';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Sparkles } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const TemplateVisual = ({ tenant, menuItems }: TemplateProps) => {
    const { addToCart } = useOrders();

    const handleAddToCart = (item: any) => {
        addToCart(item);
        toast.success(`${item.name} agregado`, {
            position: 'bottom-center',
            duration: 2000
        });
    };

    return (
        <div className="h-full relative bg-black text-white font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
            {/* Header: Transparent absolute with improved styling */}
            <header className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 bg-emerald-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src={tenant.logo_url || '/braseritologo.jpeg'}
                            className="w-14 h-14 rounded-full border-2 border-white/20 shadow-2xl relative transition-transform duration-300 group-hover:scale-105"
                            alt={tenant.name}
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight drop-shadow-md leading-none">{tenant.name}</h1>
                        <span className="text-xs text-white/50 font-medium uppercase tracking-[0.2em]">Premium Experience</span>
                    </div>
                </div>
            </header>

            {/* Immersive List */}
            <main className="snap-y snap-mandatory h-full overflow-y-auto scroll-smooth pb-24">
                {/* Intro Slide - Enhanced */}
                <section className="h-full w-full relative snap-start flex items-center justify-center bg-zinc-900">
                    <div className="absolute inset-0 opacity-30">
                        <img src="https://images.unsplash.com/photo-1544025162-d76690b6d029?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                    <div className="relative z-10 text-center p-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-emerald-500/20 backdrop-blur-xl rounded-full border border-emerald-500/30">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">Experiencia Culinaria</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
                            THE<br />
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">EXPERIENCE</span>
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-md mx-auto mb-10 font-light leading-relaxed">
                            Excelencia culinaria curada para tus sentidos.
                        </p>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">Desliza para explorar</span>
                            <ChevronDown className="w-8 h-8 animate-bounce text-emerald-500" />
                        </div>
                    </div>
                </section>

                {menuItems.map((item, index) => (
                    <section key={item.id} className="h-full w-full relative snap-start flex items-end md:items-center">
                        {/* Background Image with Ken Burns effect */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
                                alt={item.name}
                                className="w-full h-full object-cover scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
                                style={{
                                    animationDelay: `${index * 2}s`
                                }}
                            />
                            {/* Gradient Overlay - Enhanced */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:bg-gradient-to-r md:from-black/95 md:via-black/50 md:to-transparent" />
                        </div>

                        {/* Content - Enhanced */}
                        <div className="relative z-10 p-8 md:p-16 lg:p-24 w-full md:max-w-2xl">
                            <Badge className="mb-6 bg-emerald-500/90 hover:bg-emerald-500 border-none text-black font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                                Plato Destacado
                            </Badge>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-[0.9] tracking-tight">
                                {item.name}
                            </h2>
                            <p className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed md:w-4/5 font-light">
                                {item.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6">
                                <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                    ${item.price?.toLocaleString()}
                                </span>
                                <Button
                                    onClick={() => handleAddToCart(item)}
                                    size="lg"
                                    className="rounded-full h-14 px-10 bg-white text-black hover:bg-emerald-400 hover:text-black font-bold tracking-wide transition-all duration-300 hover:scale-105 shadow-xl shadow-white/10"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Agregar
                                </Button>
                            </div>
                        </div>

                        {/* Slide Indicator */}
                        <div className="absolute bottom-8 right-8 text-white/30 text-sm font-mono">
                            {String(index + 1).padStart(2, '0')} / {String(menuItems.length).padStart(2, '0')}
                        </div>
                    </section>
                ))}

                {/* Social Footer Section - Enhanced */}
                {tenant && (
                    <section className="min-h-[50vh] w-full relative snap-start flex items-center justify-center bg-zinc-900">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-900 to-zinc-900" />
                        <div className="relative z-10 text-center p-8">
                            <h3 className="text-3xl font-bold mb-8 text-white/90">Síguenos</h3>
                            <SocialLinksBar tenant={tenant} variant="footer" />
                            <p className="mt-10 text-xs text-zinc-600">
                                Powered by <span className="text-emerald-500/70 font-medium">optimaDELIVERY</span>
                            </p>
                        </div>
                    </section>
                )}
            </main>

            {/* Floating Cart - Enhanced with glow */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                    <CartDrawer />
                </div>
            </div>

            {/* Add Ken Burns animation */}
            <style>{`
                @keyframes kenburns {
                    0% { transform: scale(1.05) translate(0, 0); }
                    100% { transform: scale(1.15) translate(-2%, -2%); }
                }
            `}</style>
        </div>
    );
};
