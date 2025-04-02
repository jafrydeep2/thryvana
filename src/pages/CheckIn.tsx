/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import CheckInForm from "@/components/checkins/CheckInForm";
import { getCurrentUserId, Goal, useGoals } from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";

const CheckIn = () => {
  const { getNextCheckInDate } = useGoals();
  const navigate = useNavigate();
  const [nextCheckInDate, setNextCheckInDate] = useState<Date | null>(null);
  const { id } = useParams()
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const fetchActiveGoal = async () => {
      if (!id) return;
      const goal: any = await getActiveGoalDetails(id); // Await the async function
      if (goal) {
        setActiveGoal(goal);
        console.log("Active goal found:", goal.title);
        setNextCheckInDate(getNextCheckInDate(goal));
      } else {
        console.log("No active goal found, redirecting to dashboard");
        setActiveGoal(null);
        navigate("/dashboard");
      }
    };

    fetchActiveGoal()
  }, [id]);


  const getActiveGoalDetails = async (goalId: string) => {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', goalId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!data) {
        return null;
      }

      // Map Supabase data structure to your Goal interface
      return {
        id: data.goal_id,
        title: data.title,
        description: data.description,
        startDate: data.created_at,
        targetDate: data.time_frame,
        timeframe: data.frequency,
        checkInType: data.check_in_type,
        motivator: data.motivator,
        celebration: data.celebration_plan,
        duration: data.duration,
        progress: data.progress || 0,
        isCompleted: !data.is_active,
        checkInCount: data.check_in_count || 0,
        lastCheckIn: data.last_check_in || '',
      };
    } catch (err) {
      console.error("Error fetching active goal:", err);
      return null;
    }
  };


  const formatDate = (date: Date | null) => {
    if (!date) return "";

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Check In</h1>
        <p className="text-muted-foreground mt-1">Share your progress with your tribe</p>
      </div>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Your check-in will be visible to your tribe members. This helps with accountability!
        </AlertDescription>
      </Alert>

      <Card className="glass shadow-lg">
        <CardHeader>
          <CardTitle>Accountability Check-in</CardTitle>
          <CardDescription>
            Your tribe members will see this update. Focus on what you accomplished and what you learned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nextCheckInDate && (
            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                After this check-in, your next update will be due on {formatDate(nextCheckInDate)}.
              </AlertDescription>
            </Alert>
          )}

          <CheckInForm activeGoal={activeGoal} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckIn;
