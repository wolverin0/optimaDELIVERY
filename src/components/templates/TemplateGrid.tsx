import { TemplateProps } from './types';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Flame, Clock, Sparkles } from 'lucide-react';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { useOrders } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';

export const TemplateGrid = ({ tenant, menuItems, categories, isPreview }: TemplateProps) => {
    const { addToCart } = useOrders();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter available items
    const availableItems = menuItems.filter(item => item.is_available);
    // Mock "Popular" items (first 2)
    const popularItems = availableItems.slice(0, 2);
    // Filter by category
    const displayedItems = activeCategory
        ? availableItems.filter(item => item.category_id === activeCategory)
        : availableItems;

    const handleAddToCart = (item: any) => {
        addToCart(item);
        toast.success(`${item.name} agregado`, {
            position: 'bottom-center',
            duration: 2000
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Modern Header - Sticky & Blurred */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
                    <div className="flex items-center gap-3">
                        {tenant.logo_url ? (
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-orange-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img
                                    src={tenant.logo_url}
                                    alt={tenant.name}
                                    className="w-11 h-11 rounded-2xl object-cover shadow-lg relative transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        ) : (
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                {tenant.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none block">{tenant.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Menú Digital</span>
                        </div>
                    </div>
                </div>

                {/* Category Pills - Enhanced */}
                <div className="container mx-auto px-4 pb-4 pt-2 overflow-x-auto no-scrollbar flex gap-2 max-w-5xl">
                    <Button
                        variant={activeCategory === null ? "default" : "secondary"}
                        size="sm"
                        className={`rounded-full px-5 font-semibold whitespace-nowrap transition-all ${activeCategory === null
                            ? 'shadow-md shadow-primary/20'
                            : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                            }`}
                        onClick={() => setActiveCategory(null)}
                    >
                        Todos
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "default" : "secondary"}
                            size="sm"
                            className={`rounded-full px-5 font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'shadow-md shadow-primary/20'
                                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                                }`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </header>

            {/* Content Area */}
            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-10">

                {/* Hero / Promo Banner - Enhanced */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-52 md:h-64 shadow-2xl shadow-slate-900/10">
                    <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        alt="Promo"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex flex-col justify-center p-8 md:p-12">
                        <Badge className="w-fit mb-4 bg-orange-500 text-white border-none px-3 py-1 rounded-full shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            NUEVO
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">Winter Special</h2>
                        <p className="text-slate-300 font-medium max-w-sm text-sm md:text-base">
                            Ordena ahora y obtén 20% de descuento en pedidos superiores a $5000.
                        </p>
                    </div>
                </div>

                {/* Popular Section - Only show when no category filter */}
                {activeCategory === null && popularItems.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">Más Populares</h3>
                        </div>
                        <div className={`grid gap-5 ${isPreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {popularItems.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                    onClick={() => handleAddToCart(item)}
                                >
                                    <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden shadow-sm">
                                        <img
                                            src={item.image_url || '/placeholder.png'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3 leading-relaxed">{item.description}</p>
                                        <div className="mt-auto flex justify-between items-center">
                                            <span className="font-bold text-slate-900 text-lg">${item.price?.toLocaleString()}</span>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-9 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(item);
                                                }}
                                            >
                                                Agregar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* All Items Grid - Enhanced */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800">
                            {activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'Menú Completo'}
                        </h3>
                        <span className="ml-2 text-sm text-slate-400 font-medium">
                            ({displayedItems.length} productos)
                        </span>
                    </div>
                    <div className={`grid gap-4 md:gap-5 ${isPreview ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                        {displayedItems.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                onClick={() => handleAddToCart(item)}
                            >
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {(item.image_url && item.image_url !== '') ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                            <ShoppingBag className="w-8 h-8 opacity-50" />
                                        </div>
                                    )}
                                    {/* Quick Add Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(item);
                                            }}
                                            variant="secondary"
                                            className="rounded-full shadow-xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            Agregar
                                        </Button>
                                    </div>
                                    {item.price && (
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                                            ${item.price.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-bold text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 my-1.5">
                                        <Clock className="w-3 h-3" /> 15 min
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Social Links Footer - Enhanced */}
            {tenant && (
                <footer className="py-10 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <SocialLinksBar tenant={tenant} variant="default" className="mb-6" />
                        <p className="text-center text-xs text-slate-400">
                            Powered by <span className="font-medium text-primary/70">optimaDELIVERY</span>
                        </p>
                    </div>
                </footer>
            )}

            {/* Floating Cart Button - Enhanced */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="relative group">
                    <div className="absolute -inset-2 bg-primary/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CartDrawer />
                </div>
            </div>
        </div>
    );
};
