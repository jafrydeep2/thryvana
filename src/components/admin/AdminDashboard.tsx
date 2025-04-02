
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/admin/AdminStats";
import UserManagement from "@/components/admin/UserManagement";
import TribeManagement from "@/components/admin/TribeManagement";
import TribeActivity from "@/components/admin/TribeActivity";

interface AdminMetrics {
  deletedGoals: number;
  deletedCheckIns: number;
  deletedUsers: number;
  lastMetricsUpdate: string;
}

interface AdminDashboardProps {
  adminMetrics?: AdminMetrics | null;
}

const AdminDashboard = ({ adminMetrics }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("stats");

  return (
    <div className="container py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid grid-cols-4 w-[400px]">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tribes">Tribes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <AdminStats adminMetrics={adminMetrics} />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="tribes">
          <TribeManagement />
        </TabsContent>
        
        <TabsContent value="activity">
          <TribeActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
