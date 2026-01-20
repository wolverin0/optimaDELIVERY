import { TemplateProps } from './types';
import { Button } from '@/components/ui/button';
import { Search, ShoppingBag, Flame, Clock } from 'lucide-react';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { useOrders } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';

export const TemplateGrid = ({ tenant, menuItems, categories, isPreview }: TemplateProps) => {
    const { addToCart } = useOrders();
    // Filter available items
    const availableItems = menuItems.filter(item => item.is_available);
    // Mock "Popular" items (first 2)
    const popularItems = availableItems.slice(0, 2);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Modern Header - Sticky & Blurred */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
                    <div className="flex items-center gap-3">
                        {tenant.logo_url ? (
                            <img
                                src={tenant.logo_url}
                                alt={tenant.name}
                                className="w-10 h-10 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                                {tenant.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none block">{tenant.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Official Store</span>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="container mx-auto px-4 pb-4 pt-2 overflow-x-auto no-scrollbar flex gap-3 max-w-5xl">
                    <Button variant="default" size="sm" className="rounded-full px-5 shadow-md shadow-primary/20 font-semibold">
                        Todos
                    </Button>
                    {categories.map(cat => (
                        <Button key={cat.id} variant="secondary" size="sm" className="rounded-full px-5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium whitespace-nowrap">
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </header>

            {/* Content Area */}
            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12">

                {/* Hero / Promo Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-48 md:h-64 shadow-2xl shadow-slate-900/10">
                    <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        alt="Promo"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-8 md:p-12">
                        <Badge className="w-fit mb-4 bg-orange-500 text-white border-none px-3">NUEVO</Badge>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Winter Special</h2>
                        <p className="text-slate-300 font-medium max-w-xs">Ordena ahora y obten 20% de descuento en pedidos superiores a $5000.</p>
                    </div>
                </div>

                {/* Popular Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <h3 className="font-bold text-xl text-slate-800">Más Populares</h3>
                    </div>
                    <div className={`grid gap-6 ${isPreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {popularItems.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition-all">
                                <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                                    <img src={item.image_url || '/placeholder.png'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2">{item.description}</p>
                                    <div className="mt-auto flex justify-between items-center">
                                        <span className="font-bold text-slate-900">${item.price?.toLocaleString()}</span>
                                        <Button size="sm" variant="secondary" className="h-8 rounded-lg text-xs font-bold" onClick={() => addToCart(item)}>Agregar</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* All Items Grid */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <ShoppingBag className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-xl text-slate-800">Menú Completo</h3>
                    </div>
                    <div className={`grid gap-4 md:gap-6 ${isPreview ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                        {availableItems.map((item) => (
                            <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {(item.image_url && item.image_url !== '') ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                            <ShoppingBag className="w-8 h-8 opacity-50" />
                                        </div>
                                    )}
                                    {/* Quick Add Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <Button onClick={() => addToCart(item)} variant="secondary" className="rounded-full shadow-xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            Agregar al carrito
                                        </Button>
                                    </div>
                                    {item.price && (
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-2 py-1 rounded-lg shadow-sm">
                                            ${item.price.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-900 line-clamp-1 leading-tight">{item.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-2">
                                        <Clock className="w-3 h-3" /> 15m
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Social Links Footer */}
            {tenant && (
                <footer className="py-8 bg-white border-t border-slate-100">
                    <SocialLinksBar tenant={tenant} variant="default" className="mb-4" />
                    <p className="text-center text-xs text-slate-400">
                        Powered by optimaDELIVERY
                    </p>
                </footer>
            )}

            {/* Floating Cart Button (MeniuApp style) */}
            <div className="fixed bottom-6 right-6 z-50">
                <CartDrawer />
            </div>
        </div>
    );
};
