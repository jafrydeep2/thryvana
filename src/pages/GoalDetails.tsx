/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Target, Award, CheckCircle, FileText, MessageSquare, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/hooks/useGoals";
import Swal from 'sweetalert2'
// Define the Goal type
interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  timeframe: string;
  progress: number;
  motivator: string;
  celebration: string;
  isCompleted: boolean;
  checkInCount: number;
  checkInType: string;
  lastCheckIn: string;
  duration: number;
  created_at?: string
}

const GoalDetails = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const { width, height } = useWindowSize();

  console.log(goalId, 'goalId')
  // Function to get days since start
  const getDaysSinceStart = (goal: Goal) => {
    const startDate = new Date(goal.startDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to get days until completion
  const getDaysUntilCompletion = (goal: Goal) => {
    const targetDate = new Date(goal.targetDate);
    const currentDate = new Date();
    const diffTime = Math.abs(targetDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fetch a single goal by ID from Supabase
  const fetchGoalById = async (id: string) => {
    if (!id) return
    const userId = await getCurrentUserId();
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', id) // Changed from 'id' to 'goal_id'
        .single();

      if (error) {
        throw error;
      }

      const goal = data;
      const targetDate = goal.duration ?
        new Date(new Date(goal.created_at).getTime() + goal.duration * 24 * 60 * 60 * 1000).toISOString() :
        null;

      // Map the database fields to our Goal interface
      const mappedGoal: any = {
        id: data.goal_id,
        title: data.title,
        description: data.description,
        startDate: data.created_at,
        targetDate: targetDate,
        timeframe: data.frequency,
        checkInType: data.check_in_type,
        motivator: data.motivator,
        celebration: data.celebration_plan,
        duration: data.duration,
        progress: data.progress || 0,
        isCompleted: !data.is_active,
        checkInCount: data.check_in_count || 0,
        lastCheckIn: data.last_check_in || 'Never'
      };
      return mappedGoal;
    } catch (error) {
      console.error("Error fetching goal:", error);
      // toast.error("Failed to fetch goal details");
      return null;
    }
  };

  // Fetch all goals from Supabase
  const fetchAllGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Map the database fields to our Goal interface
        const mappedGoals: any[] = data.map(goalData => ({
          id: goalData.goal_id,
          title: goalData.title,
          description: goalData.description,
          startDate: goalData.created_at,
          targetDate: goal.duration ? new Date(new Date(goal.created_at).getTime() + goal.duration * 24 * 60 * 60 * 1000).toISOString() : null,
          timeframe: goalData.frequency,
          checkInType: goalData.check_in_type,
          motivator: goalData.motivator,
          celebration: goalData.celebration_plan,
          duration: goalData.duration,
          progress: goalData.progress || 0,
          isCompleted: !goalData.is_active,
          checkInCount: goalData.check_in_count || 0,
          lastCheckIn: goalData.last_check_in || 'Never'
        }));
        return mappedGoals;
      }
      return [];
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to fetch goals");
      return [];
    }
  };

  // Mark a goal as complete in Supabase
  const completeGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ is_active: false }) // Changed from isCompleted to is_active
        .eq('goal_id', id); // Changed from 'id' to 'goal_id'

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error completing goal:", error);
      return false;
    }
  };

  // Delete a goal from Supabase
  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('goal_id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  };

  useEffect(() => {
    const loadGoals = async () => {
      // Fetch all goals first (for debugging/future use)
      // const allGoals = await fetchAllGoals();
      // setGoals(allGoals);
      // console.log("All goals:", allGoals);

      if (!goalId) {
        navigate("/dashboard");
        return;
      }

      const fetchedGoal = await fetchGoalById(goalId);
      // console.log( await fetchGoalById(goalId), 'fetchedGoal')
      if (!fetchedGoal) {
        toast.error("Goal not found");
        // navigate("/dashboard");
        return;
      }

      setGoal(fetchedGoal);
      setDaysSinceStart(getDaysSinceStart(fetchedGoal));
      setDaysRemaining(getDaysUntilCompletion(fetchedGoal));
      setLoading(false);
    };

    loadGoals();
  }, [goalId]);

  const handleMarkComplete = async () => {
    if (!goal) return;

    const success = await completeGoal(goal.id);
    if (success) {
      setShowConfetti(true);
      setGoal({ ...goal, isCompleted: true });
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } else {
      toast.error("Failed to mark goal as complete");
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to recover this goal!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    // If user confirms deletion
    if (result.isConfirmed) {
      const success = await deleteGoal(goal.id);
      if (success) {
        toast.success('Goal deleted successfully')
        navigate('/dashboard')
      } else {
        toast.error("Failed to mark goal as complete");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1 left-1 w-14 h-14 border-4 border-t-transparent border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading goal details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{goal.title}</h1>
          <p className="text-muted-foreground mt-1">View your goal details and progress</p>
        </div>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>

      {goal.isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6 pb-4 px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-800 p-2">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Goal Completed!</h3>
                  <p className="text-green-600 dark:text-green-500">
                    Congratulations on achieving your goal!
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Your celebration:</h4>
                <p className="italic">{goal.celebration}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Goal Details</CardTitle>
                <Badge variant="outline">
                  {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)} Check-ins
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p>{goal.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                <Progress value={goal.progress} className="h-3" />
                <div className="flex flex-wrap md:flex-nowrap justify-between text-sm">
                  <span>Started: {formatDate(goal.startDate)}</span>
                  <span>{goal.progress}% Complete</span>
                  <span>Target: {formatDate(goal.targetDate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Motivator</h3>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <p className="italic text-sm break-words whitespace-normal">{goal.motivator}</p>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Celebration Plan</h3>
                  <Card className="bg-secondary/5 border-secondary/20">
                    <CardContent className="p-4">
                      <p className="italic text-sm break-words whitespace-normal">{goal.celebration}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            {!goal.isCompleted && (
              <CardFooter className="justify-between gap-2 flex-col md:flex-row">
                <Button
                  variant="outline"
                  onClick={() => navigate("/checkin/" + goal.id)}
                  className="w-full md:w-fit"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Check In
                </Button>

                <div className="flex items-center gap-2 w-full md:w-fit">
                 
                  <Button
                    onClick={handleMarkComplete}
                    className="bg-green-600 hover:bg-green-700 w-full md:w-fit"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>

                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 w-full md:w-fit"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>

                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader className="pb-2">
              <div className="flex items-center text-primary">
                <Target className="mr-2 h-5 w-5" />
                <CardTitle className="text-lg">Check-in Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Check-ins:</span>
                <span className="font-semibold">{goal.checkInCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-in Type:</span>
                <Badge variant="outline" className="capitalize">
                  {goal.checkInType === "both" ? "Text & Photo" : goal.checkInType}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Check-in:</span>
                <span className="font-semibold">
                  {goal.lastCheckIn === "Never"
                    ? "Never"
                    : formatDate(goal.lastCheckIn)
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <div className="flex items-center text-accent">
                <Calendar className="mr-2 h-5 w-5" />
                <CardTitle className="text-lg">Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Since Start:</span>
                <span className="font-semibold">{daysSinceStart} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Remaining:</span>
                <span className="font-semibold">{goal.isCompleted ? "0" : daysRemaining} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Duration:</span>
                <span className="font-semibold">{goal.duration} days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoalDetails;