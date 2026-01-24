import { Link } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Check, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';

const TrialExpired = () => {
  const { tenant } = useTenant();

  // Determine if this was a subscription expiration or trial expiration
  const wasSubscribed = tenant?.subscription_status === 'active' ||
    (tenant?.subscription_started_at !== null && tenant?.subscription_started_at !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-6">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative z-10 max-w-2xl w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            {wasSubscribed ? <RefreshCw className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            {wasSubscribed ? 'Tu suscripción ha expirado' : 'Tu período de prueba ha terminado'}
          </CardTitle>
          <p className="text-lg text-slate-600">
            {tenant?.name && (
              <>
                {wasSubscribed ? (
                  <>Gracias por usar <span className="font-semibold">{tenant.name}</span> con optimaDELIVERY.</>
                ) : (
                  <>Gracias por probar <span className="font-semibold">{tenant.name}</span> con optimaDELIVERY.</>
                )}
                <br />
              </>
            )}
            {wasSubscribed
              ? 'Renová tu plan para seguir recibiendo pedidos online.'
              : 'Para seguir vendiendo online, elegí un plan que se adapte a tu negocio.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* What you're missing */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              Qué estás perdiendo sin suscribirte
            </h3>
            <ul className="space-y-3">
              {[
                'Menú Digital QR Ilimitado',
                'Pedidos automáticos por WhatsApp',
                'Cobros con MercadoPago integrado',
                'Panel de Cocina en tiempo real',
                '5 Plantillas Premium personalizables',
                'Soporte técnico por WhatsApp',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/checkout" className="flex-1">
              <Button className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg font-bold rounded-xl shadow-lg">
                {wasSubscribed ? <RefreshCw className="w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {wasSubscribed ? 'Renovar Suscripción' : 'Ver Planes y Precios'}
              </Button>
            </Link>
            <a
              href={wasSubscribed
                ? "https://wa.me/5491162095432?text=Hola%2C%20mi%20suscripción%20expiró%20y%20necesito%20ayuda%20para%20renovarla"
                : "https://wa.me/5491162095432?text=Hola%2C%20mi%20prueba%20gratis%20terminó%20y%20necesito%20ayuda%20para%20suscribirme"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 text-lg font-bold rounded-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contactar Soporte
              </Button>
            </a>
          </div>

          {/* Plans summary */}
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Pago Mensual</p>
              <p className="text-3xl font-bold text-slate-900">$25.000</p>
              <p className="text-xs text-slate-500 mt-1">Sin compromiso</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white border-2 border-orange-400">
              <p className="text-sm text-white/80 mb-1">Pago Anual</p>
              <p className="text-3xl font-bold">$20.000/mes</p>
              <p className="text-xs text-white/80 mt-1">Ahorrá $60.000/año</p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 pt-2">
            ¿Dudas? Escribinos a{' '}
            <a href="mailto:soporte@optimadelivery.com" className="text-orange-600 hover:underline font-medium">
              soporte@optimadelivery.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialExpired;
