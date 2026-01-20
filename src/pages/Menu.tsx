import { Utensils } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { TemplateClassic } from '@/components/templates/TemplateClassic';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { TemplateMinimal } from '@/components/templates/TemplateMinimal';
import { TemplateVisual } from '@/components/templates/TemplateVisual';
import { TemplateSidebar } from '@/components/templates/TemplateSidebar';

const getTemplate = (templateId: string = 'classic') => {
  switch (templateId) {
    case 'modern':
      return TemplateGrid;
    case 'rustic':
      return TemplateMinimal;
    case 'dark':
      return TemplateVisual;
    case 'vibrant':
      return TemplateSidebar;
    case 'classic':
    default:
      return TemplateClassic;
  }
};

const Menu = ({ isPreview = false }: { isPreview?: boolean }) => {
  const { menuItems, categories, tenant, isLoading, error } = useTenant();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando menú...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Utensils className="w-16 h-16 mx-auto mb-4 opacity-20 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Negocio no encontrado</h1>
          <p className="text-muted-foreground">{error || 'No pudimos cargar la información del negocio.'}</p>
        </div>
      </div>
    );
  }

  // Determine Layout based on tenant theme
  const Layout = getTemplate(tenant.theme?.templateId);

  return (
    <Layout
      tenant={tenant}
      menuItems={menuItems}
      categories={categories}
      isPreview={isPreview}
    />
  );
};

export default Menu;
