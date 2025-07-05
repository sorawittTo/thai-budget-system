import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BudgetSystem from "@/pages/BudgetSystem";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BudgetSystem} />
      <Route path="/budget" component={BudgetSystem} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              ไม่พบหน้าที่ต้องการ
            </h1>
            <p className="text-gray-600">
              กรุณาตรวจสอบ URL อีกครั้ง
            </p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
