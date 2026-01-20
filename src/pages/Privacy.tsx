import { Link } from 'react-router-dom';
import { ArrowLeft, Utensils } from 'lucide-react';

const Privacy = () => {
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
                    Políticas de Privacidad
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        Última actualización: Enero 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Introducción</h2>
                        <p className="text-slate-600 mb-4">
                            En optimaDELIVERY, nos comprometemos a proteger su privacidad. Esta política describe
                            cómo recopilamos, usamos y protegemos su información personal cuando utiliza nuestros servicios.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Información que Recopilamos</h2>
                        <p className="text-slate-600 mb-4">
                            Recopilamos los siguientes tipos de información:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Información de cuenta:</strong> Nombre, email, teléfono, nombre del negocio</li>
                            <li><strong>Información del negocio:</strong> Dirección, logo, menú, precios, horarios</li>
                            <li><strong>Datos de uso:</strong> Páginas visitadas, funciones utilizadas, tiempo de sesión</li>
                            <li><strong>Información de pedidos:</strong> Historial de pedidos, preferencias de clientes</li>
                            <li><strong>Datos de pago:</strong> Procesados de forma segura a través de MercadoPago</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Uso de la Información</h2>
                        <p className="text-slate-600 mb-4">
                            Utilizamos su información para:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Proveer y mantener nuestros servicios</li>
                            <li>Procesar transacciones y enviar notificaciones relacionadas</li>
                            <li>Mejorar y personalizar la experiencia del usuario</li>
                            <li>Enviar comunicaciones de servicio y actualizaciones</li>
                            <li>Prevenir fraude y garantizar la seguridad</li>
                            <li>Cumplir con obligaciones legales</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Compartir Información</h2>
                        <p className="text-slate-600 mb-4">
                            No vendemos su información personal. Podemos compartir datos con:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Proveedores de servicios:</strong> MercadoPago para procesamiento de pagos</li>
                            <li><strong>Clientes de su negocio:</strong> Información del menú y disponibilidad</li>
                            <li><strong>Autoridades legales:</strong> Cuando sea requerido por ley</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Seguridad de Datos</h2>
                        <p className="text-slate-600 mb-4">
                            Implementamos medidas de seguridad para proteger su información:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Encriptación SSL/TLS en todas las comunicaciones</li>
                            <li>Almacenamiento seguro en servidores protegidos</li>
                            <li>Acceso restringido a datos personales</li>
                            <li>Auditorías regulares de seguridad</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Cookies y Tecnologías Similares</h2>
                        <p className="text-slate-600 mb-4">
                            Utilizamos cookies para:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Mantener su sesión activa</li>
                            <li>Recordar sus preferencias</li>
                            <li>Analizar el uso del servicio</li>
                        </ul>
                        <p className="text-slate-600 mt-4">
                            Puede configurar su navegador para rechazar cookies, aunque esto puede afectar
                            algunas funcionalidades del servicio.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">7. Sus Derechos</h2>
                        <p className="text-slate-600 mb-4">
                            Usted tiene derecho a:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                            <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
                            <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                            <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">8. Retención de Datos</h2>
                        <p className="text-slate-600 mb-4">
                            Mantenemos sus datos mientras su cuenta esté activa. Después de la cancelación,
                            los datos se conservan por 30 días antes de ser eliminados permanentemente.
                            Algunos datos pueden retenerse más tiempo por obligaciones legales.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">9. Menores de Edad</h2>
                        <p className="text-slate-600 mb-4">
                            Nuestros servicios están dirigidos a empresas y personas mayores de 18 años.
                            No recopilamos intencionalmente información de menores.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">10. Cambios en esta Política</h2>
                        <p className="text-slate-600 mb-4">
                            Podemos actualizar esta política ocasionalmente. Los cambios significativos serán
                            notificados por email. Le recomendamos revisar esta página periódicamente.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">11. Contacto</h2>
                        <p className="text-slate-600 mb-4">
                            Para consultas sobre privacidad o ejercer sus derechos, contáctenos:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Email: privacidad@optimadelivery.com</li>
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

export default Privacy;
