/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { getCurrentUserId, Goal, useGoals } from "@/hooks/useGoals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Calendar, 
  ArrowRight,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  // const { getAllGoals } = useGoals();
  const navigate = useNavigate();
  const { userDetails, user } = useAuth();

  useLayoutEffect(() => {
    const fetchGoals = async () => {
      try {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        // Map Supabase data structure to Goal interface
        const mappedGoals: any[] = (data || []).map(goal => ({
          id: goal.goal_id,
          title: goal.title,
          description: goal.description,
          startDate: goal.created_at,
          targetDate: goal.duration ? new Date(new Date(goal.created_at).getTime() + goal.duration * 24 * 60 * 60 * 1000).toISOString() : null,
          timeframe: goal.frequency,
          checkInType: goal.check_in_type,
          motivator: goal.motivator,
          celebration: goal.celebration_plan,
          duration: goal.duration,
          progress: goal.progress || 0,
          isCompleted: !goal.is_active,
          checkInCount: goal.check_in_count || 0,
          lastCheckIn: goal.last_check_in || ''
        }))?.filter(Boolean);

        setCompletedGoals(mappedGoals.filter(goal => goal.isCompleted));
        setActiveGoals(mappedGoals.filter(goal => !goal.isCompleted));
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchGoals();
  }, [navigate]);
  

  const getTotalCheckIns = () => {
    let total = 0;
    [...completedGoals, ...activeGoals].forEach(goal => {
      total += goal.checkInCount;
    });
    return total;
  };
  console.log(completedGoals, activeGoals, getTotalCheckIns())
  
  const getCompletionRate = () => {
    const totalGoals = completedGoals.length + activeGoals.length;
    if (totalGoals === 0) return 0;
    return Math.round((completedGoals.length / totalGoals) * 100);
  };

  const handleViewGoal = (goalId: string) => {
    navigate(`/goal/${goalId}`);
  };
  
  // Generate avatar fallback from username
  const getAvatarFallback = (username: string): string => {
    if (!username) return "U";
    const nameParts = username.split(/[_\s-]/);
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your achievements</p>
      </div>
      
      {/* User Info Card */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="text-xl">
                {userDetails ? getAvatarFallback(userDetails.username) : user?.email?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{userDetails?.username || user?.email?.split('@')[0] || "User"}</h2>
              <p className="text-muted-foreground text-sm">{userDetails?.email || user?.email || "email@example.com"}</p>
              <p className="text-muted-foreground text-sm mt-1">
                Member since {userDetails?.joinDate || new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="history">
            <Trophy className="h-4 w-4 mr-2" />
            Goal History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-4">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 mt-4">
          {/* Stats Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Your Goal Statistics</CardTitle>
              <CardDescription>Overview of your progress and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-1 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Goal Completion Rate</span>
                  <span className="text-sm font-medium">{getCompletionRate()}%</span>
                </div>
                <Progress value={getCompletionRate()} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-primary/5">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{completedGoals.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Goals Completed</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{activeGoals.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active Goals</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{getTotalCheckIns()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Check-ins</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Goals in Progress
              </h2>
              
              {activeGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle>{goal.title}</CardTitle>
                          <CardDescription>Started on {new Date(goal.startDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-700 border-none flex items-center">
                          <Target className="mr-1 h-3 w-3" /> In Progress
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Timeframe</p>
                            <p className="font-medium capitalize">{goal.timeframe}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Check-ins</p>
                            <p className="font-medium">{goal.checkInCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{goal.duration} days</p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => handleViewGoal(goal.id)}
                        >
                          View Details
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          {completedGoals.length > 0 ? (
            <div className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                Completed Goals
              </h2>
              
              {completedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle>{goal.title}</CardTitle>
                          <CardDescription>Completed on {new Date(goal.lastCheckIn).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-none flex items-center">
                          <Trophy className="mr-1 h-3 w-3" /> Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Timeframe</p>
                          <p className="font-medium capitalize">{goal.timeframe}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Check-ins</p>
                          <p className="font-medium">{goal.checkInCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{goal.duration} days</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => handleViewGoal(goal.id)}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Completed Goals Yet</h3>
                <p className="text-muted-foreground">
                  Complete your active goal to see it here in your achievement history.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
