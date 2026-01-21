import { TemplateProps } from './types';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Plus, Scale, Minus, Utensils } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TemplateMinimal = ({ tenant, menuItems }: TemplateProps) => {
    const { addToCart } = useOrders();
    const { toast } = useToast();
    const [weightDialog, setWeightDialog] = useState<{ open: boolean; item: any }>({ open: false, item: null });
    const [weight, setWeight] = useState('1');

    const handleAddItem = (item: any) => {
        if (!item.is_available) return;
        if (item.sold_by_weight) {
            setWeightDialog({ open: true, item });
        } else {
            addToCart(item);
            toast({ title: "Agregado", description: item.name, duration: 2000 });
        }
    };

    const handleWeightConfirm = () => {
        const weightNum = parseFloat(weight);
        if (weightNum > 0 && weightDialog.item) {
            addToCart(weightDialog.item, weightNum);
            toast({ title: "Agregado", description: weightDialog.item.name, duration: 2000 });
            setWeightDialog({ open: false, item: null });
            setWeight('1');
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] font-serif selection:bg-stone-200">
            {/* Header: Centered & Minimal with enhanced styling */}
            <header className="py-16 md:py-20 text-center px-6">
                <div className="mb-8 mx-auto w-24 h-24 rounded-full border border-stone-200 p-1.5 group cursor-pointer">
                    {tenant.logo_url ? (
                        <img
                            src={tenant.logo_url}
                            className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                            alt={tenant.name}
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center">
                            <Utensils className="w-10 h-10 text-stone-400" />
                        </div>
                    )}
                </div>
                <h1 className="text-4xl md:text-5xl font-normal tracking-wide mb-4 text-stone-800">
                    {tenant.name}
                </h1>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-stone-800 to-transparent mx-auto mb-6" />
                <p className="text-stone-400 italic font-sans text-xs tracking-[0.2em] uppercase">
                    Est. 2024
                </p>
            </header>

            {/* Menu List with improved item styling */}
            <main className="max-w-2xl mx-auto px-6 md:px-8 pb-32">
                <div className="space-y-16">
                    <section>
                        <h2 className="text-2xl italic text-stone-300 mb-10 text-center font-light tracking-wide">
                            — Menu —
                        </h2>
                        <div className="space-y-0">
                            {menuItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`group py-6 border-b border-stone-100 last:border-b-0 ${item.is_available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                    onClick={() => item.is_available && handleAddItem(item)}
                                >
                                    <div className="flex items-baseline justify-between mb-2 relative">
                                        <h3 className={`text-xl font-medium pr-4 transition-colors duration-300 ${item.is_available ? 'group-hover:text-stone-500' : 'line-through text-stone-400'}`}>
                                            {item.name}
                                            {item.sold_by_weight && (
                                                <span className="ml-3 text-xs text-stone-400 font-sans inline-flex items-center">
                                                    <Scale className="w-3 h-3 mr-1" />
                                                    por {item.weight_unit}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-sans font-semibold text-stone-500 tracking-tight">
                                                ${item.price?.toLocaleString()}
                                                {item.sold_by_weight && <span className="text-xs font-normal text-stone-400">/{item.weight_unit}</span>}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="text-stone-400 font-sans text-sm leading-relaxed max-w-[80%]">
                                            {item.description}
                                            {!item.is_available && <span className="ml-2 text-red-400 font-medium">(Agotado)</span>}
                                        </p>
                                        {item.is_available && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddItem(item);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-stone-800 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-stone-700 hover:scale-110 shadow-lg shadow-stone-900/20"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Social Links Footer - Enhanced */}
            {tenant && (
                <footer className="py-12 border-t border-stone-100 bg-stone-50/50">
                    <SocialLinksBar tenant={tenant} variant="compact" className="justify-center mb-6" />
                    <p className="text-center text-xs text-stone-300 font-sans tracking-wider">
                        Powered by <span className="font-medium text-stone-400">optimaDELIVERY</span>
                    </p>
                </footer>
            )}

            {/* Minimal Cart Trigger (Bottom Center) */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <CartDrawer />
                </div>
            </div>

            {/* Weight Dialog with improved styling */}
            <Dialog open={weightDialog.open} onOpenChange={(open) => !open && setWeightDialog({ open: false, item: null })}>
                <DialogContent className="sm:max-w-md bg-[#fdfbf7] border-stone-200">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl text-stone-800">
                            {weightDialog.item?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <p className="text-sm text-stone-500 mb-4 text-center">
                            ¿Cuántos {weightDialog.item?.weight_unit} deseas?
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setWeight(Math.max(0.1, parseFloat(weight) - 0.5).toFixed(1))}
                                className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                            >
                                <Minus className="w-4 h-4 text-stone-600" />
                            </button>
                            <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="h-14 text-2xl text-center font-bold w-24 bg-white border-stone-200 focus:ring-stone-300"
                            />
                            <button
                                onClick={() => setWeight((parseFloat(weight) + 0.5).toFixed(1))}
                                className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                            >
                                <Plus className="w-4 h-4 text-stone-600" />
                            </button>
                        </div>
                        <p className="text-center text-stone-400 text-sm mt-4">
                            {weightDialog.item?.weight_unit}
                        </p>
                    </div>
                    <div className="text-center py-4 border-t border-stone-100">
                        <p className="text-stone-500 text-sm">
                            Total:{' '}
                            <span className="font-bold text-stone-800 text-lg">
                                ${((weightDialog.item?.price || 0) * parseFloat(weight || '0')).toLocaleString()}
                            </span>
                        </p>
                    </div>
                    <DialogFooter className="gap-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setWeightDialog({ open: false, item: null })}
                            className="border-stone-200 text-stone-600 hover:bg-stone-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleWeightConfirm}
                            className="bg-stone-800 hover:bg-stone-700 text-white"
                        >
                            Agregar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
