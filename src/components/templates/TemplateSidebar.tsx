import { useState, useMemo } from 'react';
import { TemplateProps } from './types';
import { MenuItem } from '@/lib/supabase';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock, MapPin, Star, Plus, ChefHat, X, Utensils } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { toast } from 'sonner';

export const TemplateSidebar = ({ tenant, menuItems, categories, isPreview }: TemplateProps) => {
    const { addToCart } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter menu items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const query = searchQuery.toLowerCase().trim();
        return menuItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
    }, [menuItems, searchQuery]);

    const handleScrollToCategory = (catId: string) => {
        const el = document.getElementById(`cat-${catId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
        toast.success(`${item.name} agregado`, {
            position: 'bottom-center',
            duration: 2000
        });
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Left Sidebar Navigation - Hidden in preview mode or mobile */}
            <aside className={`flex-col w-72 bg-white border-r border-slate-100 h-full shadow-sm z-20 ${isPreview ? 'hidden' : 'hidden lg:flex'}`}>
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                            {tenant.logo_url ? (
                                <img
                                    src={tenant.logo_url}
                                    className="w-12 h-12 rounded-xl shadow-md object-cover relative transition-transform duration-300 group-hover:scale-105"
                                    alt="Logo"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-xl shadow-md bg-primary/10 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
                                    <Utensils className="w-6 h-6 text-primary" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none tracking-tight">{tenant.name}</h1>
                            <span className="text-xs text-slate-400 font-medium">Delivery & Takeout</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 h-12 mb-6 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <input
                            className="bg-transparent w-full text-sm outline-none placeholder:text-slate-400 font-medium"
                            placeholder="Buscar platos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Categorías</p>
                </div>

                <ScrollArea className="flex-1 px-3">
                    <nav className="space-y-1 pb-8">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleScrollToCategory(cat.id)}
                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all flex justify-between items-center group cursor-pointer"
                            >
                                <span>{cat.name}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-primary transition-opacity">→</span>
                            </button>
                        ))}
                    </nav>
                </ScrollArea>

                <div className="p-5 border-t border-slate-100 bg-gradient-to-t from-slate-50 to-white">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Abierto ahora
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto relative scroll-smooth bg-slate-50">
                {/* Hero Banner - Enhanced */}
                <div className="h-72 md:h-80 w-full relative overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                        className="w-full h-full object-cover"
                        alt="Cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">{tenant.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium">
                            <span className="bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.8 (500+)
                            </span>
                            <span className="flex items-center gap-2 opacity-90">
                                <Clock className="w-4 h-4" /> 20-30 min
                            </span>
                            <span className="flex items-center gap-2 opacity-90">
                                <MapPin className="w-4 h-4" /> 1.2 km
                            </span>
                            <span className="bg-emerald-500 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/30">
                                Delivery Gratis
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Feed - Enhanced */}
                <div className="max-w-5xl mx-auto p-6 md:p-10 pb-32">
                    {/* Search Results */}
                    {filteredItems !== null ? (
                        <div className="mb-14">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                                    Resultados para "{searchQuery}"
                                    <span className="ml-3 text-sm font-normal text-slate-500">
                                        ({filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'})
                                    </span>
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            </div>
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No se encontraron platos</p>
                                    <p className="text-slate-400 text-sm mt-1">Intenta con otro término de búsqueda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                    {filteredItems.map(item => (
                                        <div
                                            key={item.id}
                                            className="group bg-white rounded-2xl border border-slate-100 p-5 flex gap-5 hover:shadow-xl hover:border-slate-200 transition-all duration-300 cursor-pointer"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">
                                                        {item.name}
                                                    </h4>
                                                    <span className="font-bold text-slate-900 text-lg">
                                                        ${item.price?.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                                    {item.description}
                                                </p>
                                                <div className="mt-auto">
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(item);
                                                        }}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-primary hover:text-primary hover:bg-primary/5 -ml-3 font-semibold min-h-[44px]"
                                                        aria-label={`Agregar ${item.name} al pedido`}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Agregar al pedido
                                                    </Button>
                                                </div>
                                            </div>
                                            {item.image_url && (
                                                <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative shadow-md">
                                                    <img
                                                        src={item.image_url}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        alt={item.name}
                                                        loading="lazy"
                                                    />
                                                    {!item.is_available && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">Agotado</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Regular Category Display */
                        categories.map(cat => {
                            const categoryItems = menuItems.filter(item => item.category_id === cat.id);
                            if (categoryItems.length === 0) return null;

                            return (
                                <div key={cat.id} id={`cat-${cat.id}`} className="mb-14 scroll-mt-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                        {cat.name}
                                        <span className="ml-4 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                                    </h3>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                        {categoryItems.map(item => (
                                            <div
                                                key={item.id}
                                                className="group bg-white rounded-2xl border border-slate-100 p-5 flex gap-5 hover:shadow-xl hover:border-slate-200 transition-all duration-300 cursor-pointer"
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">
                                                            {item.name}
                                                        </h4>
                                                        <span className="font-bold text-slate-900 text-lg">
                                                            ${item.price?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                    <div className="mt-auto">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddToCart(item);
                                                            }}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-primary hover:text-primary hover:bg-primary/5 -ml-3 font-semibold"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Agregar al pedido
                                                        </Button>
                                                    </div>
                                                </div>
                                                {item.image_url && (
                                                    <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative shadow-md">
                                                        <img
                                                            src={item.image_url}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            alt={item.name}
                                                        />
                                                        {!item.is_available && (
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold">Agotado</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Social Links Footer - Enhanced */}
                    {tenant && (
                        <footer className="py-10 mt-8 border-t border-slate-200 bg-white/50 rounded-2xl">
                            <SocialLinksBar tenant={tenant} variant="default" className="mb-6" />
                            <p className="text-center text-xs text-slate-400">
                                Powered by <span className="font-medium text-primary/70">optimaDELIVERY</span>
                            </p>
                        </footer>
                    )}
                </div>
            </main>

            {/* Cart Trigger - Enhanced */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative group">
                    <div className="absolute -inset-2 bg-primary/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CartDrawer />
                </div>
            </div>
        </div>
    );
};
