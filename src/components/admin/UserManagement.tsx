/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { User, Pencil, Trash2, Check, X, UserPlus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type FrequencyType = "daily" | "weekly" | "monthly";

interface User {
  id: string;
  user_id: string;
  username: string;
  email: string;
  tribe: string | null;
  check_in_frequency: FrequencyType;
  activeGoal: boolean;
  checkInCount: number;
}

interface Tribe {
  id: string;
  tribe_id: string;
  name: string;
  memberCount: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    tribe: "",
    check_in_frequency: "daily" as FrequencyType
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*');

      if (userError) {
        toast.error(`Error fetching users: ${userError.message}`);
        throw userError;
      }

      // Fetch tribes
      const { data: tribeData, error: tribeError } = await supabase
        .from('tribes')
        .select('*');

      if (tribeError) {
        toast.error(`Error fetching tribes: ${tribeError.message}`);
        throw tribeError;
      }

      // Get tribe memberships
      const { data: userTribesData, error: userTribesError } = await supabase
        .from('user_tribes')
        .select('*');

      if (userTribesError) {
        toast.error(`Error fetching user-tribe relationships: ${userTribesError.message}`);
        throw userTribesError;
      }

      // Get active goals data
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('user_id, frequency, is_active, check_in_count')
        .order('created_at', { ascending: false });

      if (goalsError) {
        toast.error(`Error fetching goals: ${goalsError.message}`);
        throw goalsError;
      }

      // Calculate tribe member counts
      const tribeCounts: Record<string, number> = {};
      if (userTribesData) {
        userTribesData.forEach(relationship => {
          if (relationship.tribe_id) {
            tribeCounts[relationship.tribe_id] = (tribeCounts[relationship.tribe_id] || 0) + 1;
          }
        });
      }

      // Format tribes data
      const formattedTribes = tribeData ? tribeData.map(tribe => ({
        id: tribe.tribe_id,
        tribe_id: tribe.tribe_id,
        name: `Tribe ${tribe.tribe_id.substring(0, 4)}`,
        memberCount: tribeCounts[tribe.tribe_id] || 0
      })) : [];

      // Map user tribe memberships
      const userTribeMap: Record<string, string> = {};
      if (userTribesData) {
        userTribesData.forEach(relationship => {
          userTribeMap[relationship.user_id] = relationship.tribe_id;
        });
      }

      // Map user goal data
      const userGoalMap: Record<string, {frequency: string, active: boolean, checkInCount: number}> = {};
      if (goalsData) {
        // Process each user's most recent goal
        const processedUsers = new Set();
        goalsData.forEach(goal => {
          if (!processedUsers.has(goal.user_id)) {
            userGoalMap[goal.user_id] = {
              frequency: goal.frequency,
              active: !!goal.is_active,
              checkInCount: goal.check_in_count || 0
            };
            processedUsers.add(goal.user_id);
          }
        });
      }

      // Format users data
      const formattedUsers = userData ? userData.map(user => ({
        id: user.user_id,
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        tribe: userTribeMap[user.user_id] || null,
        check_in_frequency: userGoalMap[user.user_id]?.frequency as FrequencyType || "daily",
        activeGoal: userGoalMap[user.user_id]?.active || false,
        checkInCount: userGoalMap[user.user_id]?.checkInCount || 0
      })) : [];

      setUsers(formattedUsers);
      setTribes(formattedTribes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      // Update user information in users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          username: editingUser.username,
          email: editingUser.email
        })
        .eq('user_id', editingUser.user_id);

      if (userUpdateError) {
        throw userUpdateError;
      }

      // Handle tribe assignment
      if (editingUser.tribe) {
        // Check if user already has a tribe
        const { data: existingTribe, error: checkError } = await supabase
          .from('user_tribes')
          .select('*')
          .eq('user_id', editingUser.user_id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
          throw checkError;
        }

        if (existingTribe) {
          // Update existing tribe assignment
          if (existingTribe.tribe_id !== editingUser.tribe) {
            const { error: updateTribeError } = await supabase
              .from('user_tribes')
              .update({ tribe_id: editingUser.tribe })
              .eq('user_id', editingUser.user_id);
              
            if (updateTribeError) throw updateTribeError;
          }
        } else {
          // Create new tribe assignment
          const { error: insertTribeError } = await supabase
            .from('user_tribes')
            .insert({ 
              user_id: editingUser.user_id, 
              tribe_id: editingUser.tribe 
            });
            
          if (insertTribeError) throw insertTribeError;
        }
      } else if (editingUser.tribe === null) {
        // Remove from tribe if tribe is set to null
        const { error: deleteTribeError } = await supabase
          .from('user_tribes')
          .delete()
          .eq('user_id', editingUser.user_id);
          
        if (deleteTribeError) throw deleteTribeError;
      }

      // Fetch updated data to refresh the list
      const { data: updatedUsers, error: fetchError } = await supabase
        .from('users')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      // Get updated tribe memberships
      const { data: userTribesData, error: userTribesError } = await supabase
        .from('user_tribes')
        .select('*');
        
      if (userTribesError) throw userTribesError;
      
      // Map user tribe memberships
      const userTribeMap: Record<string, string> = {};
      if (userTribesData) {
        userTribesData.forEach(relationship => {
          userTribeMap[relationship.user_id] = relationship.tribe_id;
        });
      }
      
      // Update the users state with the new data
      const formattedUpdatedUsers = updatedUsers ? updatedUsers.map(user => ({
        id: user.user_id,
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        tribe: userTribeMap[user.user_id] || null,
        checkInCount: users[user.user_id]?.check_in_count || 0,
        check_in_frequency: users.find(u => u.user_id === user.user_id)?.check_in_frequency || "daily"
      })) : [];
      
      setUsers(formattedUpdatedUsers as any);
      // await fetchData(); 
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDelete = async (userId: string) => {
    try {
      // Note: This operation is complex and might require more careful handling
      // In a real app, you might want to:
      // 1. Archive the user instead of deleting them
      // 2. Handle cascading deletes or clean up related data
      
      // This is a simplified version
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // Update the local state by removing the deleted user
      setUsers(users.filter(user => user.user_id !== userId));
      
      // Track the deleted user in admin metrics
      const metricsData = localStorage.getItem('admin_metrics');
      let metrics = metricsData 
        ? JSON.parse(metricsData) 
        : { deletedGoals: 0, deletedCheckIns: 0, deletedUsers: 0, lastMetricsUpdate: new Date().toISOString() };
      
      metrics.deletedUsers += 1;
      metrics.lastMetricsUpdate = new Date().toISOString();
      localStorage.setItem('admin_metrics', JSON.stringify(metrics));
      
      toast.success("User removed successfully");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const handleAddUser = async () => {
    try {
      // Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("No user was created");
      }
      
      const newUserId = authData.user.id;
      
      // Handle tribe assignment if selected
      if (newUser.tribe && newUser.tribe !== "none") {
        const { error: tribeError } = await supabase
          .from('user_tribes')
          .insert({ 
            user_id: newUserId, 
            tribe_id: newUser.tribe 
          });
          
        if (tribeError) throw tribeError;
      }
      
      // Fetch the newly created user to add to our state
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', newUserId)
        .single();
        
      if (userError) throw userError;
      
      // Add the new user to our state
      const newUserObj: User = {
        id: newUserId,
        user_id: newUserId,
        username: userData.username,
        email: userData.email,
        tribe: newUser.tribe !== "none" ? newUser.tribe : null,
        check_in_frequency: newUser.check_in_frequency
      };
      
      setUsers([...users, newUserObj]);
      
      // Reset the form
      setNewUser({
        username: "",
        email: "",
        password: "",
        tribe: "",
        check_in_frequency: "daily"
      });
      
      setIsAddDialogOpen(false);
      toast.success("User added successfully");
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(`Failed to add user: ${error.message}`);
    }
  };

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and optionally assign to a tribe.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input 
                  value={newUser.username} 
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password"
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tribe (Optional)</label>
                <Select 
                  value={newUser.tribe} 
                  onValueChange={(value) => setNewUser({...newUser, tribe: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tribe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Tribe</SelectItem>
                    {tribes.map(tribe => (
                      <SelectItem key={tribe.id} value={tribe.id}>
                        {tribe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in Frequency</label>
                <Select 
                  value={newUser.check_in_frequency} 
                  onValueChange={(value: FrequencyType) => setNewUser({...newUser, check_in_frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>No users found</p>
          <p className="text-sm">Add users using the "Add User" button</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Username</TableHead>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Tribe</TableHead>
                <TableHead className="whitespace-nowrap">Check-in Frequency</TableHead>
                <TableHead className="whitespace-nowrap">Active Goal</TableHead>
                <TableHead className="whitespace-nowrap">Check-ins</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  {editingUser && editingUser.id === user.id ? (
                    <>
                      <TableCell>
                        <Input 
                          value={editingUser.username} 
                          onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={editingUser.email} 
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} 
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={editingUser.tribe || "none"} 
                          onValueChange={(value) => setEditingUser({...editingUser, tribe: value === "none" ? null : value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No Tribe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Tribe</SelectItem>
                            {tribes.map(tribe => (
                              <SelectItem key={tribe.id} value={tribe.id}>
                                {tribe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={editingUser.check_in_frequency} 
                          onValueChange={(value: FrequencyType) => setEditingUser({...editingUser, check_in_frequency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.activeGoal ? "Yes" : "No"}</TableCell>
                      <TableCell>{user.checkInCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.tribe ? tribes.find(t => t.id === user.tribe)?.name || `Tribe ${user.tribe.substring(0, 4)}` : "No Tribe"}
                      </TableCell>
                      <TableCell className="capitalize">{user.check_in_frequency}</TableCell>
                      <TableCell>{user.activeGoal ? "Yes" : "No"}</TableCell>
                      <TableCell>{user.checkInCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user
                                and remove their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
