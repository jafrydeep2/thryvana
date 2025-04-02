
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AdminAuth from "@/components/admin/AdminAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdminMetrics {
  deletedGoals: number;
  deletedCheckIns: number;
  deletedUsers: number;
  lastMetricsUpdate: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isAdmin, isLoading, user } = useAuth();
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const navigate = useNavigate();
  
  // If the user is already logged in as admin via normal auth flow
  useEffect(() => {
    if (!isLoading) {
      if (isAdmin) {
        setIsAuthenticated(true);
        toast.success("Welcome to the admin dashboard");
        // Fetch admin metrics when authenticated as admin
        fetchAdminMetrics();
      } else if (user && !isAdmin) {
        // If logged in but not admin, redirect to dashboard with a message
        toast.error("You don't have permission to access the admin area");
        setTimeout(() => navigate('/dashboard'), 100);
      }
    }
  }, [isAdmin, isLoading, user, navigate]);

  // Function to fetch admin metrics about deleted items
  const fetchAdminMetrics = async () => {
    try {
      // First try to fetch from Supabase
      const { data: metricsData, error } = await supabase
        .from('admin_metrics')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        console.error("Error fetching admin metrics from Supabase:", error);
        
        // Fallback to localStorage if Supabase fetch fails
        const localMetrics = localStorage.getItem('admin_metrics');
        
        if (localMetrics) {
          const parsedMetrics = JSON.parse(localMetrics);
          setAdminMetrics(parsedMetrics);
          
          // Try to migrate local data to Supabase
          const { error: insertError } = await supabase
            .from('admin_metrics')
            .insert({
              deleted_goals: parsedMetrics.deletedGoals,
              deleted_check_ins: parsedMetrics.deletedCheckIns,
              deleted_users: parsedMetrics.deletedUsers,
              last_updated: parsedMetrics.lastMetricsUpdate
            });
            
          if (insertError) {
            console.error("Error migrating admin metrics to Supabase:", insertError);
          }
        } else {
          // Initialize with default values if no data exists
          const defaultMetrics: AdminMetrics = {
            deletedGoals: 0,
            deletedCheckIns: 0,
            deletedUsers: 0,
            lastMetricsUpdate: new Date().toISOString()
          };
          
          setAdminMetrics(defaultMetrics);
          
          // Try to save default metrics to Supabase
          const { error: insertError } = await supabase
            .from('admin_metrics')
            .insert({
              deleted_goals: 0,
              deleted_check_ins: 0,
              deleted_users: 0
            });
            
          if (insertError) {
            console.error("Error saving default admin metrics to Supabase:", insertError);
            // Fallback to localStorage
            localStorage.setItem('admin_metrics', JSON.stringify(defaultMetrics));
          }
        }
      } else if (metricsData) {
        // Transform Supabase data to match our AdminMetrics interface
        const formattedMetrics: AdminMetrics = {
          deletedGoals: metricsData.deleted_goals,
          deletedCheckIns: metricsData.deleted_check_ins,
          deletedUsers: metricsData.deleted_users,
          lastMetricsUpdate: metricsData.last_updated
        };
        
        setAdminMetrics(formattedMetrics);
      }
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      toast.error("Failed to load admin metrics");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying admin credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // Pass admin metrics to the dashboard
  return <AdminDashboard adminMetrics={adminMetrics} />;
};

export default Admin;
