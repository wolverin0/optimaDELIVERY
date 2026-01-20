import { Link } from 'react-router-dom';
import { ArrowLeft, Utensils } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-orange-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Utensils className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800">optimaDELIVERY</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                    Términos y Condiciones
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        Última actualización: Enero 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Aceptación de los Términos</h2>
                        <p className="text-slate-600 mb-4">
                            Al acceder y utilizar optimaDELIVERY, usted acepta estar sujeto a estos Términos y Condiciones.
                            Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Descripción del Servicio</h2>
                        <p className="text-slate-600 mb-4">
                            optimaDELIVERY es una plataforma de gestión de menús digitales y pedidos para restaurantes
                            y negocios gastronómicos. Nuestro servicio incluye:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Creación y gestión de menús digitales con código QR</li>
                            <li>Sistema de pedidos integrado con WhatsApp</li>
                            <li>Panel de cocina para gestión de pedidos</li>
                            <li>Integración con MercadoPago para pagos online</li>
                            <li>Panel de administración y estadísticas</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Registro y Cuenta</h2>
                        <p className="text-slate-600 mb-4">
                            Para utilizar nuestros servicios, debe registrar una cuenta proporcionando información
                            veraz y completa. Usted es responsable de mantener la confidencialidad de su cuenta
                            y contraseña.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Período de Prueba</h2>
                        <p className="text-slate-600 mb-4">
                            Ofrecemos un período de prueba gratuito de 7 días. Durante este período, tendrá acceso
                            completo a las funcionalidades del plan seleccionado. Al finalizar el período de prueba,
                            deberá suscribirse a un plan pago para continuar utilizando el servicio.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Pagos y Facturación</h2>
                        <p className="text-slate-600 mb-4">
                            Los pagos se procesan mensualmente. Aceptamos transferencias bancarias y MercadoPago.
                            Los precios pueden estar sujetos a cambios con previo aviso de 30 días.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Uso Aceptable</h2>
                        <p className="text-slate-600 mb-4">
                            Usted se compromete a utilizar el servicio únicamente para fines legales y de acuerdo
                            con estos términos. Está prohibido:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Usar el servicio para actividades ilegales</li>
                            <li>Intentar acceder sin autorización a sistemas o datos</li>
                            <li>Distribuir malware o código malicioso</li>
                            <li>Infringir derechos de propiedad intelectual</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">7. Propiedad Intelectual</h2>
                        <p className="text-slate-600 mb-4">
                            Todo el contenido, diseño y código de optimaDELIVERY son propiedad exclusiva de
                            la empresa. Usted conserva todos los derechos sobre el contenido que suba a la plataforma.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">8. Limitación de Responsabilidad</h2>
                        <p className="text-slate-600 mb-4">
                            optimaDELIVERY no será responsable por daños indirectos, incidentales o consecuentes
                            derivados del uso del servicio. Nuestra responsabilidad máxima estará limitada al
                            monto pagado por el servicio en los últimos 12 meses.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">9. Cancelación</h2>
                        <p className="text-slate-600 mb-4">
                            Puede cancelar su suscripción en cualquier momento. La cancelación será efectiva
                            al final del período de facturación actual. Sus datos se mantendrán por 30 días
                            después de la cancelación.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">10. Modificaciones</h2>
                        <p className="text-slate-600 mb-4">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento.
                            Los cambios serán notificados por email con al menos 15 días de anticipación.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">11. Contacto</h2>
                        <p className="text-slate-600 mb-4">
                            Para cualquier consulta sobre estos términos, puede contactarnos a través de:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Email: soporte@optimadelivery.com</li>
                            <li>WhatsApp: +54 9 2477 509998</li>
                        </ul>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-orange-100 bg-white/50">
                <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
                    © 2026 optimaDELIVERY. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
};

export default Terms;
