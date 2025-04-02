/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals, ReactionType, getCurrentUserId, Goal } from "@/hooks/useGoals";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Loader from "../Loader";
import TribeHeader from "./TribeHeader";
import ActiveGoalCard from "./ActiveGoalCard";
import TribeTabs from "./TribeTabs";
import TribeGuidelines from "./TribeGuidelines";

interface TribeViewProps {
  isLoading?: boolean;
}

interface User {
  username: string;
  avatar_url: string;
}

interface TribeMember {
  user_id: string;
  users: User | null;
}


const TribeView = ({ isLoading: initialLoading = false }: TribeViewProps) => {
  // Start with "check-ins" tab
  const [activeTab, setActiveTab] = useState("check-ins");
  const [hasActiveGoal, setHasActiveGoal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(initialLoading);
  const { getNextCheckInDate } = useGoals();
  const navigate = useNavigate();
  const [isLoadingPage, setIsLoading] = useState<boolean>(true);

  const [tribeMembers, setTribeMembers] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [nextCheckIn, setNextCheckIn] = useState<Date | null>(null);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [defaultReactions, setDefaultReactions] = useState({
    star: { count: 0, reactions: [] },
    heart: { count: 0, reactions: [] },
    clap: { count: 0, reactions: [] },
    fire: { count: 0, reactions: [] },
  });


  const userId = getCurrentUserId();

  const getTribeMembersFromSupabase = async (tribeId: string): Promise<{ id: string; name: string; avatar: string }[]> => {
    if(tribeMembers?.length === 0){
      setIsLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from("tribes")
        .select("tribe_id, users(username, email)")
        .eq("tribe_id", tribeId) as any;

      if (error) throw error;
      return data?.map((member: TribeMember) => ({
        ...member.users[0],
        id: member.user_id,
        name: member.users[0]?.username || "Unknown",
        avatar: member.users[0]?.avatar_url || "",
      }));
    } catch (error) {
      setIsLoading(false);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTribeCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from("check_ins")
        .select("*, users(username, email), reactions(*)")
        .order("check_in_time", { ascending: false });

      if (error) throw error;

      if (data.length > 0) {
        // Extract unique tribe_ids from check-ins
        const tribeIds = [...new Set(data.map((item) => item.tribe_id))];

        // Fetch members for each tribe
        const membersPromises = tribeIds.map(getTribeMembersFromSupabase);
        const tribeMembers = await Promise.all(membersPromises);
        console.log(tribeMembers, 'tribeMembers')
        setTribeMembers(tribeMembers.flat()); // Flatten in case of multiple tribes
      }
      // Process the data to include check-ins with additional properties such as media
      const enhancedCheckIns = data.map((checkIn) => ({
        ...checkIn,
        username: checkIn?.users?.username || "Unknown",
        lastActive: checkIn.check_in_time,
        createdAt: checkIn.check_in_time,
        media: checkIn.media_url || [], // Ensure media is always an array (default empty array if not present)
        content: checkIn.content || 'No content available', // Default content if not available
        photo: checkIn.photo_url || '', // Default photo if not available
        reactions: checkIn.reactions
        //defaultReactions
      }));
      setIsLoading(false)

      return enhancedCheckIns;
    } catch (error) {
      console.error("Error fetching check-ins:", error.message);
      setIsLoading(false)
      return [];
    } finally{
      setIsLoading(false)
    }
  };


  // Function to refresh check-ins data
  const refreshCheckIns = async () => {
    if (hasActiveGoal) {
      try {
        setIsRefreshing(true);

        const updatedCheckIns = await getTribeCheckIns();
        setCheckIns(updatedCheckIns);

        toast.success(`Loaded ${updatedCheckIns.length} check-ins`);
      } catch (error) {
        console.error("Error refreshing check-ins:", error);
        toast.error("Failed to refresh check-ins");
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // const fetchReactions = async (checkInId: string) => {
  //   const { data, error } = await supabase
  //     .from('check_ins')
  //     .select('reactions')
  //     .eq('id', checkInId)
  //     .single();

  //   if (error) {
  //     console.error("Error fetching reactions:", error.message);
  //     return;
  //   }

  //   if (data?.reactions) {
  //     setDefaultReactions(data.reactions);
  //   } else {
  //     setDefaultReactions(defaultReactions);

  //   }
  // };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    toast.info("Refreshing check-ins...");
    refreshCheckIns();
  };

  useEffect(() => {
    const fetchActiveGoal = async () => {
      try {
        setIsRefreshing(true);
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          return;
        }

        if (data) {
          const mappedGoal: any = {
            id: data.goal_id,
            title: data.title,
            description: data.description,
            startDate: data.created_at,
            targetDate: data.duration ? new Date(new Date(data.created_at).getTime() + data.duration * 86400000).toISOString() : null,
            timeframe: data.frequency,
            checkInType: data.check_in_type,
            motivator: data.motivator,
            celebration: data.celebration_plan,
            duration: data.duration,
            progress: data.progress || 0,
            isCompleted: !data.is_active,
            checkInCount: data.check_in_count || 0,
            lastCheckIn: data.last_check_in || "Never",
          };

          setHasActiveGoal(true);
          setActiveGoal(mappedGoal);
          setCheckIns(await getTribeCheckIns());
          setNextCheckIn(getNextCheckInDate(mappedGoal));


        } else {
          console.log("No active goal, redirecting to dashboard");
          setHasActiveGoal(false);
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching active goal:", err.message);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchActiveGoal();
  }, []);


  const handleReaction = async (checkInId: string, reactionType: ReactionType) => {
    const userId = await getCurrentUserId(); // User's ID
    const userReacted = await checkUserReaction(checkInId, userId, reactionType)
    try {
      if (userReacted) {
        // Remove reaction from the backend
        await removeReaction(checkInId, userId, reactionType);
        // Update local state to reflect the removal
        updateLocalState(checkInId, reactionType, false);
      } else {
        // Add reaction to the backend
        await addReaction(checkInId, userId, reactionType);
        // Update local state to reflect the addition
        updateLocalState(checkInId, reactionType, true);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }finally{
      const updatedCheckIns = await getTribeCheckIns();
      setCheckIns(updatedCheckIns);
    }
  };

  const checkUserReaction = async (checkInId: string, userId: string, reactionType: ReactionType) => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('check_in_id', checkInId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);

    if (error) throw error;
    return data && data.length > 0;
  };

  const removeReaction = async (checkInId: string, userId: string, reactionType: ReactionType) => {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('check_in_id', checkInId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);

    if (error) throw error;
    console.log('Reaction removed successfully');
  };

  const addReaction = async (checkInId: string, userId: string, reactionType: ReactionType) => {
    const { error } = await supabase
      .from('reactions')
      .insert([
        {
          check_in_id: checkInId,
          user_id: userId,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log('Reaction added successfully');
  };

  const updateLocalState = (checkInId: string, reactionType: ReactionType, isAdding: boolean) => {
    setCheckIns(prevCheckIns => {
      return prevCheckIns.map(checkIn => {
        if (checkIn.id === checkInId) {
          // Create a copy of the check-in's reactions
          const updatedReactions = { ...checkIn.reactions };
          
          // Ensure the reaction type exists
          if (!updatedReactions[reactionType]) {
            updatedReactions[reactionType] = { count: 0, reactions: [] };
          }
          
          // Update the reaction count and user list
          if (isAdding) {
            // Only add if the user hasn't already reacted
            if (!updatedReactions[reactionType].reactions.some(r => r.user_id === userId)) {
              updatedReactions[reactionType].count += 1;
              updatedReactions[reactionType].reactions.push({ user_id: userId });
            }
          } else {
            // Remove the user's reaction
            const userIndex = updatedReactions[reactionType].reactions.findIndex(r => r.user_id === userId);
            if (userIndex !== -1) {
              updatedReactions[reactionType].count = Math.max(0, updatedReactions[reactionType].count - 1);
              updatedReactions[reactionType].reactions.splice(userIndex, 1);
            }
          }
          
          return { ...checkIn, reactions: updatedReactions };
        }
        return checkIn;
      });
    });
  };
  const formatNextCheckIn = () => {
    if (!nextCheckIn) return "Not scheduled";

    // Add validation to ensure nextCheckIn is a valid Date object
    if (!(nextCheckIn instanceof Date) || isNaN(nextCheckIn.getTime())) {
      return "Not scheduled";
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (nextCheckIn.toDateString() === today.toDateString()) {
      return "Today";
    } else if (nextCheckIn.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }).format(nextCheckIn);
    }
  };

  const userAssignedToTribe = tribeMembers.length > 0;

  // Loading state UI
  if (isLoadingPage) {
    return (
      <Loader text='Loading Tribes ...' />
    );
  }

  if (!userAssignedToTribe) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Tribe</h1>
          <p className="text-muted-foreground mt-1">Support your tribe members and share your journey</p>
        </div>

        <Card className="glass p-6">
          <div className="text-center py-8 space-y-4">
            <Info className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Waiting for Tribe Assignment</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You're not assigned to a tribe yet. We'll match you with tribe members with the same check-in frequency to help keep you accountable.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <TribeHeader handleManualRefresh={handleManualRefresh} isRefreshing={isRefreshing} />

      {hasActiveGoal && <ActiveGoalCard formatNextCheckIn={formatNextCheckIn} navigate={navigate} activeGoal={activeGoal} />}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Accountability Tribe</CardTitle>
              <CardDescription>{tribeMembers.length} members · Same check-in frequency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TribeTabs activeTab={activeTab}
            setActiveTab={setActiveTab}
            tribeMembers={tribeMembers}
            checkIns={checkIns}
            isRefreshing={isRefreshing}
            userId={userId}
            handleReaction={handleReaction}
            defaultReactions={defaultReactions}
            navigate={navigate}
            hasActiveGoal={hasActiveGoal}
            activeGoal={activeGoal} />
        </CardContent>
      </Card>
      <TribeGuidelines />
    </div>
  );
};

export default TribeView;
