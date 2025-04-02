/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trophy, CheckSquare, Calendar, Info, Clock, AlertTriangle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GoalCard from "@/components/goals/GoalCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId, getDaysSinceStart, getDaysUntilCompletion, Goal, useGoals } from "@/hooks/useGoals";
import NextCheckInCard from "@/components/goals/NextCheckInCard";
import { supabase } from "@/integrations/supabase/client";
import { boolean } from "zod";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getActiveGoal, hasCompletedGoal } = useGoals();
  const { toast } = useToast();
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [daysSinceStart, setDaysSinceStart] = useState<number>(0);
  const [daysUntilCompletion, setDaysUntilCompletion] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useLayoutEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        // Map Supabase data structure to your Goal interface
        const mappedGoals: any[] = (data || []).map(goal => goal.is_active === true && ({
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

        console.log(mappedGoals, 'mapp');
        const goal = mappedGoals[0];
        localStorage.setItem('activeGoal', goal.id)
        setActiveGoal(goal);
        setHasCompleted(hasCompletedGoal());

        if (goal) {
          setDaysSinceStart(getDaysSinceStart(goal));
          setDaysUntilCompletion(getDaysUntilCompletion(goal));
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [navigate]);

  const handleCheckIn = (goalId: string) => {
    navigate("/checkin/" + goalId);
  };

  const handleViewDetails = (goalId: string) => {
    navigate(`/goal/${goalId}`);
  };

  // Calculate progress as percentage of days completed
  const calculateDaysProgress = (goal: Goal | null): number => {
    if (!goal) return 0;

    const totalDurationDays = goal.duration;
    const daysPassed = getDaysSinceStart(goal);

    // Calculate progress as percentage of days completed out of total duration
    const progressPercentage = Math.min(Math.round((daysPassed / totalDurationDays) * 100), 100);

    return progressPercentage;
  };

  const getNextCheckInDate = (goal: Goal) => {
    if (!goal) return null;

    const startDate = new Date(goal.startDate);
    const today = new Date();

    const nextDate = new Date(startDate);

    switch (goal.timeframe) {
      case "daily":
        // Set to tomorrow if last check-in was today
        nextDate.setDate(today.getDate() + 1);
        break;
      case "weekly":
        // Set to next week from today
        nextDate.setDate(today.getDate() + 7);
        break;
      case "monthly":
        // Set to next month from today
        nextDate.setMonth(today.getMonth() + 1);
        break;
    }

    return nextDate;
  };

  // Loading state UI
  if (isLoading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your progress and stay motivated</p>
        </div>
        <Button
          onClick={() => navigate("/goal/create")}
          className="group"
          disabled={!!activeGoal}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>{hasCompleted ? "Start a New Goal" : (activeGoal ? "Goal in Progress" : "New Goal")}</span>
        </Button>
      </div>

      {/* No active goal state */}
      {!activeGoal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl">
                {hasCompleted ? "Ready for a New Challenge?" : "No Active Goal"}
              </CardTitle>
              <CardDescription>
                {hasCompleted
                  ? "Great job completing your previous goal! Set a new one to continue your growth journey."
                  : "You don't have an active goal yet. Set one to start your journey."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/goal/create")}
                className="w-full group"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>{hasCompleted ? "Start a New Goal" : "Create Your First Goal"}</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active goal state */}
      {activeGoal && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Current goal section */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Current Goal</h2>
            <GoalCard
              goal={activeGoal}
              onCheckIn={handleCheckIn}
              onViewDetails={handleViewDetails}
            />

            {/* Next check-in */}
            <NextCheckInCard
              goal={activeGoal}
              nextCheckIn={getNextCheckInDate(activeGoal)}
              onCheckIn={() => handleCheckIn(activeGoal.id)}
            />
          </div>

          {/* Stats section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Goal Progress</h2>

            {activeGoal && (
              <>
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <div className="flex items-center text-blue-700">
                      <Calendar className="mr-2 h-5 w-5" />
                      <CardTitle className="text-lg">Days Since Start</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">{daysSinceStart}</div>
                    <p className="text-muted-foreground text-sm mt-1">
                      Started on {new Date(activeGoal.startDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="pb-2">
                    <div className="flex items-center text-primary">
                      <Clock className="mr-2 h-5 w-5" />
                      <CardTitle className="text-lg">Days Remaining</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">{getDaysUntilCompletion(activeGoal)}</div>
                    <p className="text-muted-foreground text-sm mt-1">
                      Target completion: {new Date(activeGoal.targetDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="pb-2">
                    <div className="flex items-center text-secondary">
                      <CheckSquare className="mr-2 h-5 w-5" />
                      <CardTitle className="text-lg">Check-ins</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">{activeGoal.checkInCount || 0}</div>
                    <p className="text-muted-foreground text-sm mt-1">Total check-ins recorded</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tips/Info section */}
      <Alert className="glass">
        <Info className="h-4 w-4" />
        <AlertTitle>Quick Tip</AlertTitle>
        <AlertDescription>
          Regular check-ins with your tribe increase your chances of achieving your goals by up to 95%.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Dashboard;
