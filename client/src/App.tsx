import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ModDetail from "@/pages/ModDetail";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import Versions from "@/pages/Versions";
import About from "@/pages/About";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";

function RouterContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home}/>
          <Route path="/mod/:id" component={ModDetail}/>
          <Route path="/categories" component={Categories}/>
          <Route path="/category/:name" component={CategoryDetail}/>
          <Route path="/versions" component={Versions}/>
          <Route path="/about" component={About}/>
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <RouterContent />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
