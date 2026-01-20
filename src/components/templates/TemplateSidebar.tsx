import { TemplateProps } from './types';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock, MapPin, Star, Plus } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';

export const TemplateSidebar = ({ tenant, menuItems, categories, isPreview }: TemplateProps) => {
    const { addToCart } = useOrders();

    const handleScrollToCategory = (catId: string) => {
        const el = document.getElementById(`cat-${catId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
            {/* Left Sidebar Navigation - Hidden in preview mode or mobile */}
            <aside className={`flex-col w-72 bg-white border-r border-slate-100 h-full shadow-sm z-20 ${isPreview ? 'hidden' : 'hidden lg:flex'}`}>
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <img
                            src={tenant.logo_url || '/braseritologo.jpeg'}
                            className="w-12 h-12 rounded-xl shadow-md object-cover"
                            alt="Logo"
                        />
                        <div>
                            <h1 className="font-bold text-xl leading-none tracking-tight">{tenant.name}</h1>
                            <span className="text-xs text-slate-400 font-medium">Delivery & Takeout</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 h-12 mb-6 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <input className="bg-transparent w-full text-sm outline-none placeholder:text-slate-400 font-medium" placeholder="Buscar platos..." />
                    </div>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Menú</p>
                </div>

                <ScrollArea className="flex-1 px-4">
                    <nav className="space-y-1 pb-8">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleScrollToCategory(cat.id)}
                                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-all flex justify-between group"
                            >
                                {cat.name}
                                <span className="opacity-0 group-hover:opacity-100 text-slate-300">→</span>
                            </button>
                        ))}
                    </nav>
                </ScrollArea>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Abierto ahora
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto relative scroll-smooth bg-white">
                {/* Hero Banner */}
                <div className="h-64 md:h-80 w-full relative">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                        className="w-full h-full object-cover"
                        alt="Cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">{tenant.name}</h2>
                        <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.8 (500+)
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4 opacity-80" /> 20-30 min
                            </span>
                            <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 opacity-80" /> 1.2 km
                            </span>
                            <span className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Delivery Gratis</span>
                        </div>
                    </div>
                </div>

                {/* Menu Feed */}
                <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
                    {categories.map(cat => (
                        <div key={cat.id} id={`cat-${cat.id}`} className="mb-16 scroll-mt-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center after:content-[''] after:h-px after:flex-1 after:bg-slate-100 after:ml-6">{cat.name}</h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {menuItems.filter(item => item.category_id === cat.id).map(item => (
                                    <div key={item.id} className="group bg-white rounded-xl border border-slate-100 p-4 flex gap-4 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                                                <span className="font-bold text-slate-900">${item.price?.toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                                            <div className="mt-auto">
                                                <Button
                                                    onClick={() => addToCart(item)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-primary hover:text-primary hover:bg-primary/5 -ml-3"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Agregar al pedido
                                                </Button>
                                            </div>
                                        </div>
                                        {item.image_url && (
                                            <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden relative">
                                                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Social Links Footer */}
                    {tenant && (
                        <footer className="py-8 mt-8 border-t border-slate-100">
                            <SocialLinksBar tenant={tenant} variant="default" className="mb-4" />
                            <p className="text-center text-xs text-slate-400">
                                Powered by optimaDELIVERY
                            </p>
                        </footer>
                    )}
                </div>
            </main>

            {/* Cart Trigger */}
            <div className="fixed bottom-8 right-8 z-50">
                <CartDrawer />
            </div>
        </div>
    );
};
