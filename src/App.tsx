import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";
import Menu from "./pages/Menu";
import Kitchen from "./pages/Kitchen";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Luxury Design Variants
import MenuTest1 from "./test1/Menu";
import MenuTest2 from "./test2/Menu";
import MenuTest3 from "./test3/Menu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OrderProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/cocina" element={<Kitchen />} />
            <Route path="/admin" element={<Admin />} />

            {/* Luxury Design Test Variants */}
            <Route path="/test1" element={<MenuTest1 />} />
            <Route path="/test2" element={<MenuTest2 />} />
            <Route path="/test3" element={<MenuTest3 />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OrderProvider>
  </QueryClientProvider>
);

export default App;
