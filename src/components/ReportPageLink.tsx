import { useTenant } from '@/context/TenantContext';

export const ReportPageLink = () => {
    const { tenant } = useTenant();

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const tenantSlug = tenant?.slug || 'unknown';

    const subject = encodeURIComponent('Reporte de página sospechosa');
    const body = encodeURIComponent(
        `Hola,\n\nQuiero reportar una página que parece sospechosa.\n\n` +
        `URL: ${currentUrl}\n` +
        `Negocio: ${tenantSlug}\n\n` +
        `Descripción del problema:\n\n`
    );

    const mailtoLink = `mailto:seguridad@optimadelivery.com?subject=${subject}&body=${body}`;

    return (
        <div className="text-center py-4">
            <a
                href={mailtoLink}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                ¿Esta página parece sospechosa? Reportar
            </a>
        </div>
    );
};
