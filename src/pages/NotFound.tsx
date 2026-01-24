import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.error("404 Error: User attempted to access non-existent route:", location.pathname);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10">
                <div className="container mx-auto px-6 py-4">
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                            <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">optimaDELIVERY</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className="text-center max-w-md">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="relative inline-block">
                            <div className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-200 to-red-200 leading-none select-none">
                                404
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-bounce">
                                    <Search className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                        Página no encontrada
                    </h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        La página que buscas no existe o fue movida.
                        <br />
                        <span className="text-sm text-slate-400 font-mono">{location.pathname}</span>
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            asChild
                            className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/25 rounded-xl"
                        >
                            <Link to="/">
                                <Home className="w-4 h-4 mr-2" />
                                Ir al inicio
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-slate-200 hover:bg-white/50"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver atrás
                        </Button>
                    </div>

                    {/* Helpful links */}
                    <div className="mt-12 pt-8 border-t border-orange-100">
                        <p className="text-sm text-slate-500 mb-4">¿Buscabas alguno de estos?</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                to="/demo"
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                            >
                                Ver Demo
                            </Link>
                            <span className="text-slate-300">•</span>
                            <Link
                                to="/login"
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                            >
                                Iniciar sesión
                            </Link>
                            <span className="text-slate-300">•</span>
                            <Link
                                to="/register"
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotFound;
