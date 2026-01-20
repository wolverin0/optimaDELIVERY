import { TemplateProps } from './types';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';

export const TemplateVisual = ({ tenant, menuItems }: TemplateProps) => {
    const { addToCart } = useOrders();

    return (
        <div className="h-full relative bg-black text-white font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
            {/* Header: Transparent absolute */}
            <header className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <img
                        src={tenant.logo_url || '/braseritologo.jpeg'}
                        className="w-12 h-12 rounded-full border-2 border-white/20 shadow-2xl"
                        alt={tenant.name}
                    />
                    <div>
                        <h1 className="font-bold text-xl tracking-tight drop-shadow-md leading-none">{tenant.name}</h1>
                        <span className="text-xs text-white/60 font-medium uppercase tracking-widest">Premium Menu</span>
                    </div>
                </div>
            </header>

            {/* Immersive List */}
            <main className="snap-y snap-mandatory h-full overflow-y-auto scroll-smooth pb-24">
                {/* Intro Slide */}
                <section className="h-full w-full relative snap-start flex items-center justify-center bg-zinc-900">
                    <div className="absolute inset-0 opacity-40">
                        <img src="https://images.unsplash.com/photo-1544025162-d76690b6d029?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="relative z-10 text-center p-8">
                        <h2 className="text-5xl font-black mb-6 tracking-tighter">THE<br />EXPERIENCE</h2>
                        <p className="text-xl text-zinc-300 max-w-md mx-auto mb-8 font-light">Culinary excellence curated for your senses.</p>
                        <ChevronDown className="w-8 h-8 mx-auto animate-bounce text-emerald-500" />
                    </div>
                </section>

                {menuItems.map((item) => (
                    <section key={item.id} className="h-full w-full relative snap-start flex items-end md:items-center">
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/40 md:to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-8 md:p-20 w-full md:max-w-2xl bg-gradient-to-t from-black md:from-transparent">
                            <Badge className="mb-4 bg-emerald-500 hover:bg-emerald-600 border-none text-black font-bold px-3 py-1">
                                Signature Dish
                            </Badge>
                            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{item.name}</h2>
                            <p className="text-white/80 text-lg mb-6 leading-relaxed md:w-3/4 font-light">{item.description}</p>

                            <div className="flex items-center gap-6">
                                <span className="text-3xl font-bold text-white tracking-tight">
                                    ${item.price?.toLocaleString()}
                                </span>
                                <Button
                                    onClick={() => addToCart(item)}
                                    size="lg"
                                    className="rounded-full h-14 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-wide transition-all hover:scale-105"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add to Order
                                </Button>
                            </div>
                        </div>
                    </section>
                ))}

                {/* Social Footer Section */}
                {tenant && (
                    <section className="min-h-[40vh] w-full relative snap-start flex items-center justify-center bg-zinc-900">
                        <div className="text-center p-8">
                            <h3 className="text-2xl font-bold mb-6 text-white/80">Follow Us</h3>
                            <SocialLinksBar tenant={tenant} variant="footer" />
                            <p className="mt-8 text-xs text-zinc-500">
                                Powered by optimaDELIVERY
                            </p>
                        </div>
                    </section>
                )}

            </main>

            {/* Floating Cart */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative">
                    <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                    <CartDrawer />
                </div>
            </div>
        </div>
    );
};
