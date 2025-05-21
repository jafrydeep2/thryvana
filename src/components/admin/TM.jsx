import { useState, useEffect } from "react";
import { Group, Pencil, Trash2, Check, X, UserPlus, Users } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type FrequencyType = "daily" | "weekly" | "monthly";

interface Tribe {
  id: string;
  tribe_id: string;
  name: string;
  memberCount: number;
  checkInFrequency: FrequencyType;
}

interface TribeMember {
  id: string;
  user_id: string;
  tribe_id: string; // Added this field to properly track which tribe a user belongs to
  username: string;
  email: string;
  joined_at: string;
}

const TribeManagement = () => {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [users, setUsers] = useState<TribeMember[]>([]);
  const [editingTribe, setEditingTribe] = useState<Tribe | null>(null);
  const [showMembers, setShowMembers] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTribe, setNewTribe] = useState({
    name: "",
    checkInFrequency: "daily" as FrequencyType
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tribes data
        const { data: tribesData, error: tribesError } = await supabase
          .from('tribes')
          .select('*');

        if (tribesError) {
          toast.error(`Error fetching tribes: ${tribesError.message}`);
          throw tribesError;
        }

        // Fetch user-tribe memberships
        const { data: userTribesData, error: userTribesError } = await supabase
          .from('user_tribes')
          .select(`
            tribe_id,
            user_id,
            joined_at,
            users!inner(username, email)
          `);

        if (userTribesError) {
          toast.error(`Error fetching tribe memberships: ${userTribesError.message}`);
          throw userTribesError;
        }

        // Group by tribe and count members
        const tribeMemberCounts: Record<string, number> = {};
        if (userTribesData) {
          userTribesData.forEach(membership => {
            tribeMemberCounts[membership.tribe_id] = (tribeMemberCounts[membership.tribe_id] || 0) + 1;
          });
        }

        // Format tribes data with member count
        const formattedTribes: Tribe[] = tribesData ? tribesData.map(tribe => ({
          id: tribe.tribe_id,
          tribe_id: tribe.tribe_id,
          name: `Tribe ${tribe.tribe_id.substring(0, 4)}`,
          memberCount: tribeMemberCounts[tribe.tribe_id] || 0,
          checkInFrequency: tribe.frequency as FrequencyType
        })) : [];

        // Format users data with tribe memberships
        const formattedUsers: TribeMember[] = userTribesData ? userTribesData.map(membership => ({
          id: membership.user_id,
          user_id: membership.user_id,
          tribe_id: membership.tribe_id, // Store the tribe_id to correctly filter members
          username: membership.users?.username || "Unknown User",
          email: membership.users?.email || "",
          joined_at: membership.joined_at || new Date().toISOString()
        })) : [];

        setTribes(formattedTribes);
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (tribe: Tribe) => {
    setEditingTribe({ ...tribe });
  };

  const handleSaveEdit = async () => {
    if (!editingTribe) return;
    
    try {
      // Update tribe in database
      const { error } = await supabase
        .from('tribes')
        .update({ 
          frequency: editingTribe.checkInFrequency 
        })
        .eq('tribe_id', editingTribe.tribe_id);

      if (error) throw error;

      // Update local state
      setTribes(tribes.map(tribe => 
        tribe.id === editingTribe.id 
          ? { ...editingTribe } 
          : tribe
      ));
      
      setEditingTribe(null);
      toast.success("Tribe updated successfully");
    } catch (error: any) {
      console.error("Error updating tribe:", error);
      toast.error(`Failed to update tribe: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingTribe(null);
  };

  const handleDelete = async (tribeId: string) => {
    try {
      // Delete tribe from database
      const { error: deleteError } = await supabase
        .from('tribes')
        .delete()
        .eq('tribe_id', tribeId);

      if (deleteError) throw deleteError;

      // Update users who were in this tribe
      setUsers(users.filter(user => user.tribe_id !== tribeId));
      
      // Update local tribes state
      setTribes(tribes.filter(tribe => tribe.id !== tribeId));
      
      toast.success("Tribe removed successfully");
    } catch (error: any) {
      console.error("Error deleting tribe:", error);
      toast.error(`Failed to delete tribe: ${error.message}`);
    }
  };

  const handleAddTribe = async () => {
    try {
      // Create new tribe in database
      const { data, error } = await supabase
        .from('tribes')
        .insert({ 
          frequency: newTribe.checkInFrequency
        })
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("No tribe was created");
      }

      const newTribeId = data[0].tribe_id;
      
      // Add to local state
      const newTribeObj: Tribe = {
        id: newTribeId,
        tribe_id: newTribeId,
        name: `Tribe ${newTribeId.substring(0, 4)}`,
        memberCount: 0,
        checkInFrequency: newTribe.checkInFrequency
      };
      
      setTribes([...tribes, newTribeObj]);
      
      // Reset form
      setNewTribe({
        name: "",
        checkInFrequency: "daily"
      });
      
      setIsAddDialogOpen(false);
      toast.success("Tribe created successfully");
    } catch (error: any) {
      console.error("Error creating tribe:", error);
      toast.error(`Failed to create tribe: ${error.message}`);
    }
  };

  const toggleShowMembers = (tribeId: string) => {
    setShowMembers(showMembers === tribeId ? null : tribeId);
  };

  const removeUserFromTribe = async (userId: string, tribeId: string) => {
    try {
      // Remove user-tribe relationship from database
      const { error } = await supabase
        .from('user_tribes')
        .delete()
        .eq('user_id', userId)
        .eq('tribe_id', tribeId);

      if (error) throw error;
      
      // Update local state - remove user from this tribe
      setUsers(users.filter(user => !(user.user_id === userId && user.tribe_id === tribeId)));
      
      // Update tribe member count
      setTribes(tribes.map(tribe => 
        tribe.id === tribeId 
          ? { ...tribe, memberCount: tribe.memberCount - 1 } 
          : tribe
      ));
      
      toast.success("User removed from tribe");
    } catch (error: any) {
      console.error("Error removing user from tribe:", error);
      toast.error(`Failed to remove user from tribe: ${error.message}`);
    }
  };

  // Fix: Ensure frequency values are properly typed as FrequencyType
  const frequencyOptions = [
    { value: "daily" as FrequencyType, label: "Daily" },
    { value: "weekly" as FrequencyType, label: "Weekly" },
    { value: "monthly" as FrequencyType, label: "Monthly" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading tribe data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tribe Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Group className="h-4 w-4 mr-2" /> Create Tribe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tribe</DialogTitle>
              <DialogDescription>
                Create a new tribe to group users with similar check-in patterns.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in Frequency</label>
                <Select 
                  value={newTribe.checkInFrequency} 
                  onValueChange={(value: string) => setNewTribe({
                    ...newTribe, 
                    checkInFrequency: value as FrequencyType
                  })}
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
              <Button onClick={handleAddTribe}>Create Tribe</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tribes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Group className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>No tribes found</p>
          <p className="text-sm">Create tribes using the "Create Tribe" button</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">Members</TableHead>
                <TableHead className="whitespace-nowrap">Check-in Frequency</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tribes.map((tribe) => (
                <>
                  <TableRow key={tribe.id}>
                    {editingTribe && editingTribe.id === tribe.id ? (
                      <>
                        <TableCell>{tribe.name}</TableCell>
                        <TableCell>{tribe.memberCount}</TableCell>
                        <TableCell>
                          <Select 
                            value={editingTribe.checkInFrequency}
                            onValueChange={(value: string) => setEditingTribe({
                              ...editingTribe, 
                              checkInFrequency: value as FrequencyType
                            })}
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
                        <TableCell>{tribe.name}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => toggleShowMembers(tribe.id)}
                          >
                            <Users className="h-4 w-4 mr-2" /> 
                            {tribe.memberCount} {tribe.memberCount === 1 ? "Member" : "Members"}
                          </Button>
                        </TableCell>
                        <TableCell className="capitalize">{tribe.checkInFrequency}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(tribe)}>
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
                                  This action cannot be undone. This will permanently delete the tribe
                                  and remove all user associations.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(tribe.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  {showMembers === tribe.id && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Card className="border shadow-none">
                          <CardHeader className="py-2">
                            <CardTitle className="text-sm">Tribe Members</CardTitle>
                          </CardHeader>
                          <CardContent className="py-0 pb-3">
                            {/* Fixed: Properly filter users by tribe_id */}
                            {users.filter(user => user.tribe_id === tribe.id).length === 0 ? (
                              <p className="text-sm text-muted-foreground">No members in this tribe</p>
                            ) : (
                              <div className="space-y-2">
                                {users.filter(user => user.tribe_id === tribe.id).map(user => (
                                  <div key={user.user_id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center">
                                        {user.username.charAt(0).toUpperCase()}
                                      </Badge>
                                      <div>
                                        <p className="text-sm font-medium">{user.username}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => removeUserFromTribe(user.user_id, tribe.id)}
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TribeManagement;