
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WhatIsACS from "./pages/WhatIsACS";
import TypesOfACS from "./pages/TypesOfACS";
import Screening from "./pages/Screening";
import DiagnosisTreatment from "./pages/DiagnosisTreatment";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/what-is-acs" element={<WhatIsACS />} />
              <Route path="/types-of-acs" element={<TypesOfACS />} />
              <Route path="/screening" element={<Screening />} />
              <Route path="/diagnosis-treatment" element={<DiagnosisTreatment />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
