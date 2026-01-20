import { useOrders } from '@/context/OrderContext';
import { ChefHat, Clock, CheckCircle, Timer, AlertTriangle, Bell, Scale, Store, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export const KDSManager = () => {
    const { orders, updateOrderStatus, isLoadingOrders } = useOrders();

    // Only show active orders for kitchen (pending and preparing)
    // We also show 'ready' orders so they can be marked as dispatched or just viewed
    const kdsOrders = orders.filter(o =>
        ['pending', 'preparing', 'ready'].includes(o.status)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (isLoadingOrders && orders.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <ChefHat className="w-12 h-12 animate-bounce text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">Kitchen Display System</h2>
                    <p className="text-muted-foreground font-medium">Control de pedidos en tiempo real.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
                        <ChefHat className="w-5 h-5" />
                        {kdsOrders.filter(o => o.status === 'preparing').length} PREPARANDO
                    </div>
                </div>
            </div>

            {kdsOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50 border-2 border-dashed rounded-3xl">
                    <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                    <h3 className="text-2xl font-bold">¡Cocina al día!</h3>
                    <p className="text-muted-foreground">No hay pedidos pendientes en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {kdsOrders.map(order => (
                        <KDSCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                    ))}
                </div>
            )}
        </div>
    );
};

const KDSCard = ({ order, onUpdateStatus }: { order: any, onUpdateStatus: any }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const statusTime = new Date(order.statusChangedAt || order.createdAt).getTime();
            setElapsed(Math.floor((Date.now() - statusTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [order.statusChangedAt, order.createdAt]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const isLate = minutes >= 10; // High alert after 10 mins in any kitchen state

    return (
        <Card className={`border-2 flex flex-col h-full shadow-lg transition-all ${order.status === 'preparing' ? 'border-yellow-400 bg-yellow-50/30' :
                order.status === 'ready' ? 'border-green-400 bg-green-50/30' :
                    'border-slate-200'
            } ${isLate ? 'ring-4 ring-red-500 ring-opacity-30' : ''}`}>

            <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-white/50">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-mono">#{order.id.slice(-4)}</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${order.customer.deliveryType === 'pickup'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                        {order.customer.deliveryType === 'pickup' ? <Store className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                        {order.customer.deliveryType === 'pickup' ? 'Retira' : 'Envio'}
                    </div>
                </div>
                <div className={`flex items-center gap-2 font-mono font-bold text-lg ${isLate ? 'text-red-600' : 'text-slate-600'}`}>
                    <Timer className={`h-5 w-5 ${isLate ? 'animate-pulse' : ''}`} />
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col gap-4">
                <div className="space-y-3">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shrink-0">
                                {item.quantity}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xl font-bold leading-tight uppercase truncate">{item.name}</p>
                                {item.weight && (
                                    <Badge variant="outline" className="mt-1 font-bold text-slate-600">
                                        <Scale className="w-3 h-3 mr-1" /> {item.weight}kg
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {order.customer.notes && (
                    <div className="bg-red-100 p-3 rounded-xl border-l-4 border-red-500">
                        <p className="text-red-700 font-black text-sm uppercase flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> NOTA:
                        </p>
                        <p className="text-red-900 font-bold">{order.customer.notes}</p>
                    </div>
                )}

                <div className="mt-auto pt-4 flex flex-col gap-3">
                    {order.status === 'pending' && (
                        <Button
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black h-16 text-xl uppercase rounded-2xl shadow-md active:scale-95"
                            onClick={() => onUpdateStatus(order.id, 'preparing')}
                        >
                            <ChefHat className="w-6 h-6 mr-2" /> Empezar a Cocinar
                        </Button>
                    )}

                    {order.status === 'preparing' && (
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white font-black h-16 text-xl uppercase rounded-2xl shadow-md active:scale-95"
                            onClick={() => onUpdateStatus(order.id, 'ready')}
                        >
                            <CheckCircle className="w-6 h-6 mr-2" /> ¡TERMINADO!
                        </Button>
                    )}

                    {order.status === 'ready' && (
                        <div className="flex flex-col gap-2">
                            <Badge className="bg-green-100 text-green-700 py-2 justify-center text-sm font-black border-none">
                                LISTO PARA {order.customer.deliveryType === 'pickup' ? 'RETIRAR' : 'DESPACHAR'}
                            </Badge>
                            <Button
                                variant="outline"
                                className="border-slate-300 font-black h-12 uppercase rounded-xl active:scale-95"
                                onClick={() => onUpdateStatus(order.id, 'dispatched')}
                            >
                                {order.customer.deliveryType === 'pickup' ? 'Entregado' : 'Despachado'}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
