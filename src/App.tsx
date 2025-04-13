
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GoalCreation from "./pages/GoalCreation";
import GoalDetails from "./pages/GoalDetails";
import Tribe from "./pages/Tribe";
import CheckIn from "./pages/CheckIn";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback"; // Add import for Feedback page
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/feedback" element={<Feedback />} /> {/* Add new route */}
              
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
              
              {/* Protected routes */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/goal/create" element={<GoalCreation />} />
                <Route path="/goal/:goalId" element={<GoalDetails />} />
                <Route path="/tribe" element={<Tribe />} />
                <Route path="/checkin/:id" element={<CheckIn />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/feedback" element={<Feedback />} /> {/* Add to protected routes as well */}
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
