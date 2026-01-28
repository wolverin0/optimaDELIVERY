import { useState } from 'react';
import { TemplateProps } from './types';
import { MenuItem } from '@/lib/supabase';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Button } from '@/components/ui/button';
import { Plus, Utensils } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { toast } from 'sonner';

export const TemplateSidebar = ({ tenant, menuItems, categories, isPreview }: TemplateProps) => {
    const { addToCart } = useOrders();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter available items
    const availableItems = menuItems.filter(item => item.is_available);
    // Filter by category
    const displayedItems = activeCategory
        ? availableItems.filter(item => item.category_id === activeCategory)
        : availableItems;

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
        toast.success(`${item.name} agregado`, {
            position: 'bottom-center',
            duration: 2000
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 overflow-x-hidden">
            {/* Compact Header with Logo and Category Pills */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-3">
                        {tenant.logo_url ? (
                            <img
                                src={tenant.logo_url}
                                alt={tenant.name}
                                className="w-10 h-10 rounded-xl object-cover shadow-md"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-md">
                                <Utensils className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-lg leading-tight tracking-tight">{tenant.name}</h1>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Menú Digital</span>
                        </div>
                    </div>

                    {/* Category Pills - Horizontal scroll */}
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
                        <Button
                            variant={activeCategory === null ? "default" : "secondary"}
                            size="sm"
                            className={`rounded-full px-4 font-medium whitespace-nowrap text-xs h-8 ${
                                activeCategory === null ? 'shadow-md' : 'bg-white border border-slate-200'
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
                                className={`rounded-full px-4 font-medium whitespace-nowrap text-xs h-8 ${
                                    activeCategory === cat.id ? 'shadow-md' : 'bg-white border border-slate-200'
                                }`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content - Card Grid Layout */}
            <main className="px-4 py-4">
                {/* Items Grid - Single column for preview, responsive for full view */}
                <div className={`grid gap-3 ${isPreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {displayedItems.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex gap-3 p-3 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleAddToCart(item)}
                        >
                            {/* Image */}
                            {item.image_url && (
                                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-sm text-slate-900">
                                        ${item.price?.toLocaleString()}
                                    </span>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(item);
                                        }}
                                        size="sm"
                                        className="h-7 px-3 text-xs rounded-full"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Agregar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Social Links Footer */}
                {tenant && (
                    <footer className="py-6 mt-6 border-t border-slate-200">
                        <SocialLinksBar tenant={tenant} variant="default" className="mb-4" />
                        <p className="text-center text-xs text-slate-400">
                            Powered by <span className="font-medium text-primary/70">optimaDELIVERY</span>
                        </p>
                    </footer>
                )}
            </main>

            {/* Cart Trigger */}
            <div className="fixed bottom-6 right-6 z-50">
                <CartDrawer />
            </div>
        </div>
    );
};
