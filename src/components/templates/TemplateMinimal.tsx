import { TemplateProps } from './types';
import { CartDrawer } from '@/components/CartDrawer';
import { SocialLinksBar } from '@/components/SocialLinksBar';
import { Separator } from '@/components/ui/separator';
import { Plus, Scale } from 'lucide-react';
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
            {/* Header: Centered & Minimal */}
            <header className="py-20 text-center px-6">
                <div className="mb-6 mx-auto w-24 h-24 rounded-full border border-stone-200 p-1">
                    <img
                        src={tenant.logo_url || '/braseritologo.jpeg'}
                        className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        alt={tenant.name}
                    />
                </div>
                <h1 className="text-4xl md:text-5xl font-normal tracking-wide mb-4 text-stone-800">
                    {tenant.name}
                </h1>
                <div className="w-12 h-1 bg-stone-800 mx-auto mb-6"></div>
                <p className="text-stone-500 italic font-sans text-sm tracking-widest uppercase">
                    • Est. 2024 •
                </p>
            </header>

            {/* Menu List */}
            <main className="max-w-2xl mx-auto px-8 pb-32">
                <div className="space-y-16">
                    {/* Mock Category Grouping (Since we only have list, we assume one block) */}
                    <section>
                        <h2 className="text-2xl italic text-stone-400 mb-8 text-center">Menu</h2>
                        <div className="space-y-8">
                            {menuItems.map((item) => (
                                <div key={item.id} className={`group ${item.is_available ? 'cursor-pointer' : 'opacity-50'}`}>
                                    <div className="flex items-baseline justify-between mb-1 relative bg-[#fdfbf7] z-10">
                                        <h3 className={`text-xl font-medium pr-4 transition-colors ${item.is_available ? 'group-hover:text-stone-600' : 'line-through'}`}>
                                            {item.name}
                                            {item.sold_by_weight && (
                                                <span className="ml-2 text-xs text-stone-400 font-sans">
                                                    <Scale className="w-3 h-3 inline mr-1" />
                                                    por {item.weight_unit}
                                                </span>
                                            )}
                                        </h3>
                                        <span className="text-lg font-sans font-bold text-stone-400">
                                            ${item.price?.toLocaleString()}
                                            {item.sold_by_weight && <span className="text-xs">/{item.weight_unit}</span>}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="text-stone-500 font-sans text-sm leading-relaxed max-w-[85%]">
                                            {item.description}
                                            {!item.is_available && <span className="ml-2 text-red-500 font-medium">(Agotado)</span>}
                                        </p>
                                        {item.is_available && (
                                            <button
                                                onClick={() => handleAddItem(item)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-stone-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {/* Dotted Leader Line */}
                                    <div className="border-b border-stone-200 border-dotted mt-4"></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Social Links Footer */}
            {tenant && (
                <footer className="py-8 border-t border-stone-200">
                    <SocialLinksBar tenant={tenant} variant="compact" className="justify-center mb-4" />
                    <p className="text-center text-xs text-stone-400 font-sans">
                        Powered by optimaDELIVERY
                    </p>
                </footer>
            )}

            {/* Minimal Cart Trigger (Bottom Center) */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
                {/* Layout specific cart wrapper logic would go here, reusing CartDrawer for now */}
                <div className="pointer-events-auto">
                    <CartDrawer />
                </div>
            </div>

            {/* Weight Dialog for sold-by-weight items */}
            <Dialog open={weightDialog.open} onOpenChange={(open) => !open && setWeightDialog({ open: false, item: null })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            ¿Cuántos {weightDialog.item?.weight_unit} de {weightDialog.item?.name}?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4 py-4">
                        <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="h-12 text-xl text-center font-bold"
                        />
                        <span className="text-lg text-stone-500">{weightDialog.item?.weight_unit}</span>
                    </div>
                    <p className="text-center text-stone-500">
                        Total: <span className="font-bold text-stone-800">
                            ${((weightDialog.item?.price || 0) * parseFloat(weight || '0')).toLocaleString()}
                        </span>
                    </p>
                    <DialogFooter className="gap-2 mt-4">
                        <Button variant="outline" onClick={() => setWeightDialog({ open: false, item: null })}>
                            Cancelar
                        </Button>
                        <Button onClick={handleWeightConfirm} className="bg-stone-800 hover:bg-stone-700">
                            Agregar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
