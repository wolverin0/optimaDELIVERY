import { Minus, Plus, ShoppingBag, Trash2, Scale, Crown, ArrowLeft, Send, MapPin, Store, Truck, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { useTenant } from '@/context/TenantContext';
import { DeliveryType, PaymentMethod } from '@/types/order';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

type CheckoutStep = 'cart' | 'delivery-type' | 'customer-info' | 'payment' | 'success';

export const CartDrawer = () => {
  const { cart, cartTotal, updateQuantity, updateWeight, removeFromCart, submitOrder } = useOrders();
  const { tenant } = useTenant();
  const { toast } = useToast();

  // Check if tenant has MercadoPago connected
  const hasMercadoPago = Boolean(tenant?.mercadopago_access_token);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const resetCheckout = () => {
    setStep('cart');
    setDeliveryType(null);
    setPaymentMethod(null);
    setCustomerData({ name: '', phone: '', address: '', notes: '' });
  };

  const handleSelectDeliveryType = (type: DeliveryType) => {
    setDeliveryType(type);
    setStep('customer-info');
  };

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name || !customerData.phone) {
      toast({
        title: 'Datos incompletos',
        description: 'Por favor completa nombre y teléfono',
        variant: 'destructive',
      });
      return;
    }
    if (deliveryType === 'delivery' && !customerData.address) {
      toast({
        title: 'Dirección requerida',
        description: 'Por favor ingresa tu dirección de entrega',
        variant: 'destructive',
      });
      return;
    }
    setStep('payment');
  };

  const [orderResult, setOrderResult] = useState<{ paymentUrl?: string; isDemo?: boolean; orderNumber?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPayment = async (method: PaymentMethod) => {
    setPaymentMethod(method);

    if (!deliveryType) return;

    setIsSubmitting(true);

    // Submit order
    const result = await submitOrder({
      ...customerData,
      address: deliveryType === 'pickup' ? 'Retira en sucursal' : customerData.address,
      deliveryType,
      paymentMethod: method,
    });

    setIsSubmitting(false);

    // For MercadoPago with real payment URL, redirect IMMEDIATELY without showing success
    if (method === 'mercadopago' && result.paymentUrl && !result.isDemo) {
      // Redirect to MercadoPago immediately - don't show success yet
      window.location.href = result.paymentUrl;
      return;
    }

    // For cash or demo MercadoPago, show success
    setOrderResult(result);
    setStep('success');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(resetCheckout, 300);
  };

  const getItemTotal = (item: typeof cart[0]) => {
    if (item.soldByWeight && item.weight) {
      return item.price * item.weight;
    }
    return item.price * item.quantity;
  };

  const getStepTitle = () => {
    switch (step) {
      case 'cart': return 'Tu Carrito';
      case 'delivery-type': return '¿Cómo lo querés?';
      case 'customer-info': return 'Tus Datos';
      case 'payment': return 'Método de Pago';
      case 'success': return '¡Pedido Confirmado!';
      default: return 'Checkout';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setTimeout(resetCheckout, 300);
    }}>
      <SheetTrigger asChild>
        <button className="gold-fab">
          <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center border-2 border-primary shadow-md">
              {cart.reduce((total, item) => total + (item.soldByWeight ? 1 : item.quantity), 0)}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-background border-l border-border">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-3xl tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center text-white">
              {step === 'success' ? (
                <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              )}
            </div>
            {getStepTitle()}
          </SheetTitle>
        </SheetHeader>

        {/* CART STEP */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-luxury">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ShoppingBag className="h-20 w-20 mb-5 opacity-20 text-primary" />
                  <p className="text-[15px] italic">Tu carrito esta vacio</p>
                  <p className="text-[13px] mt-1">Agrega platos deliciosos del menu</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm animate-fade-in-up">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-lg tracking-wide">{item.name}</h4>
                        <button
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-primary font-bold text-lg mt-0.5">
                        {formatPrice(item.price)}
                        {item.soldByWeight && (
                          <span className="text-muted-foreground font-normal text-sm ml-0.5">/{item.weightUnit}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        {item.soldByWeight ? (
                          <>
                            <Scale className="h-4 w-4 text-primary" />
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={item.weight || 1}
                              onChange={(e) => updateWeight(item.id, parseFloat(e.target.value) || 0)}
                              className="h-9 w-20 text-center border-primary/30 focus:border-primary font-semibold"
                            />
                            <span className="text-sm text-muted-foreground">{item.weightUnit}</span>
                          </>
                        ) : (
                          <>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Subtotal: <span className="text-foreground font-semibold">{formatPrice(getItemTotal(item))}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border pt-6 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-muted-foreground">Total</span>
                  <span className="text-3xl font-bold text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  className="checkout-btn flex items-center justify-center gap-3"
                  onClick={() => setStep('delivery-type')}
                >
                  <Crown className="h-5 w-5" />
                  Continuar al Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* DELIVERY TYPE STEP */}
        {step === 'delivery-type' && (
          <div className="flex-1 flex flex-col py-6">
            <div className="flex-1 space-y-4">
              {/* Pickup Option */}
              <button
                className="w-full p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all flex items-center gap-5 group"
                onClick={() => handleSelectDeliveryType('pickup')}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-xl font-semibold tracking-wide">PARA RETIRAR</h3>
                  <p className="text-muted-foreground text-sm mt-1">Retirá tu pedido en nuestra sucursal</p>
                </div>
              </button>

              {/* Delivery Option */}
              <button
                className="w-full p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all flex items-center gap-5 group"
                onClick={() => handleSelectDeliveryType('delivery')}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-xl font-semibold tracking-wide">PARA ENVÍO</h3>
                  <p className="text-muted-foreground text-sm mt-1">Te lo llevamos a tu domicilio</p>
                </div>
              </button>
            </div>

            <div className="border-t border-border pt-6">
              <button
                type="button"
                className="w-full h-14 rounded-xl border-2 border-border bg-transparent text-foreground font-semibold tracking-wide uppercase text-sm flex items-center justify-center gap-2 transition-all hover:border-primary hover:text-primary"
                onClick={() => setStep('cart')}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Carrito
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMER INFO STEP */}
        {step === 'customer-info' && (
          <form onSubmit={handleCustomerInfoSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto py-6 space-y-5 scrollbar-luxury">
              {/* Delivery type badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                deliveryType === 'pickup'
                  ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                  : 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
              }`}>
                {deliveryType === 'pickup' ? <Store className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                {deliveryType === 'pickup' ? 'Retiro en Sucursal' : 'Envío a Domicilio'}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  placeholder="Tu nombre completo"
                  className="h-12 text-base border-primary/20 focus:border-primary bg-card"
                  value={customerData.name}
                  onChange={e => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                  Telefono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Tu numero de telefono"
                  className="h-12 text-base border-primary/20 focus:border-primary bg-card"
                  value={customerData.phone}
                  onChange={e => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                    Direccion de Entrega *
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Calle, numero, piso, depto..."
                    className="min-h-24 text-base border-primary/20 focus:border-primary bg-card resize-none"
                    value={customerData.address}
                    onChange={e => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                  Notas Adicionales
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones especiales, alergias, etc."
                  className="min-h-20 text-base border-primary/20 focus:border-primary bg-card resize-none"
                  value={customerData.notes}
                  onChange={e => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-lg text-muted-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 h-14 rounded-xl border-2 border-border bg-transparent text-foreground font-semibold tracking-wide uppercase text-sm flex items-center justify-center gap-2 transition-all hover:border-primary hover:text-primary"
                  onClick={() => setStep('delivery-type')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
                <button type="submit" className="checkout-btn flex-1 flex items-center justify-center gap-2">
                  Continuar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* PAYMENT STEP */}
        {step === 'payment' && (
          <div className="flex-1 flex flex-col py-6 relative">
            {/* Loading overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                <div className="w-16 h-16 bg-[#009ee3]/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <CreditCard className="h-8 w-8 text-[#009ee3]" />
                </div>
                <p className="text-lg font-semibold">Procesando...</p>
                <p className="text-sm text-muted-foreground mt-1">Preparando tu pago</p>
              </div>
            )}

            <div className="flex-1 space-y-4">
              <p className="text-muted-foreground text-center mb-6">Seleccioná cómo querés pagar</p>

              {/* MercadoPago Option - Only show if tenant has it connected */}
              {hasMercadoPago && (
                <button
                  className="w-full p-6 bg-card rounded-xl border-2 border-border hover:border-[#009ee3] transition-all flex items-center gap-5 group disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSelectPayment('mercadopago')}
                  disabled={isSubmitting}
                >
                  <div className="w-16 h-16 bg-[#009ee3]/10 rounded-full flex items-center justify-center group-hover:bg-[#009ee3]/20 transition-colors">
                    <CreditCard className="h-8 w-8 text-[#009ee3]" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-semibold tracking-wide">MercadoPago</h3>
                    <p className="text-muted-foreground text-sm mt-1">Tarjeta de crédito, débito o dinero en cuenta</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-[#009ee3]/10 text-[#009ee3] rounded">Visa</span>
                      <span className="text-xs px-2 py-1 bg-[#009ee3]/10 text-[#009ee3] rounded">Mastercard</span>
                      <span className="text-xs px-2 py-1 bg-[#009ee3]/10 text-[#009ee3] rounded">Mercado Crédito</span>
                    </div>
                  </div>
                </button>
              )}

              {/* Cash Option - For pickup, or always if MP not connected */}
              {(deliveryType === 'pickup' || !hasMercadoPago) && (
                <button
                  className="w-full p-6 bg-card rounded-xl border-2 border-border hover:border-green-500 transition-all flex items-center gap-5 group disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSelectPayment('cash')}
                  disabled={isSubmitting}
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <Banknote className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-semibold tracking-wide">
                      {deliveryType === 'pickup' ? 'Pago en Sucursal' : 'Pago contra Entrega'}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {deliveryType === 'pickup'
                        ? 'Pagás en efectivo cuando retirás tu pedido'
                        : 'Pagás en efectivo cuando recibís tu pedido'}
                    </p>
                  </div>
                </button>
              )}

              {/* Order Summary */}
              <div className="mt-6 p-4 bg-secondary/50 rounded-xl space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Resumen</h4>
                <div className="flex justify-between text-sm">
                  <span>Entrega:</span>
                  <span className="font-medium">
                    {deliveryType === 'pickup' ? 'Retiro en sucursal' : customerData.address}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cliente:</span>
                  <span className="font-medium">{customerData.name}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <button
                type="button"
                className="w-full h-14 rounded-xl border-2 border-border bg-transparent text-foreground font-semibold tracking-wide uppercase text-sm flex items-center justify-center gap-2 transition-all hover:border-primary hover:text-primary"
                onClick={() => setStep('customer-info')}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-fade-in-up">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">¡Gracias por tu pedido!</h2>
            {orderResult?.orderNumber && (
              <p className="text-lg font-bold text-primary mb-2">Pedido #{orderResult.orderNumber}</p>
            )}
            <p className="text-muted-foreground mb-6 max-w-sm">
              {paymentMethod === 'mercadopago' && orderResult?.isDemo
                ? 'El negocio aún no tiene MercadoPago conectado. Tu pedido fue registrado.'
                : deliveryType === 'pickup'
                  ? 'Tu pedido está siendo preparado. Te esperamos en nuestra sucursal.'
                  : 'Tu pedido está siendo preparado y te lo enviaremos pronto.'
              }
            </p>

            {paymentMethod === 'mercadopago' && orderResult?.isDemo && (
              <div className="w-full max-w-xs mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <p className="text-sm text-amber-600 font-medium">Pago pendiente</p>
                <p className="text-xs text-muted-foreground mt-1">Coordina el pago directamente con el negocio</p>
              </div>
            )}

            <div className="flex gap-3 w-full max-w-sm">
              <button
                className="checkout-btn flex-1 flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
