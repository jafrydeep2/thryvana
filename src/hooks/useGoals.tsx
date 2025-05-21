/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";

export type CheckInType = "text" | "photo" | "both";
export type ReactionType = "star" | "heart" | "clap" | "fire";

export interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  timeframe: "daily" | "weekly" | "monthly";
  checkInType: CheckInType;
  motivator: string;
  celebration: string;
  duration: number;
  progress: number;
  isCompleted: boolean;
  checkInCount: number;
  lastCheckIn: string;
  created_at?: string
}

export interface GoalFormValues {
  title: string;
  description: string;
  motivator: string;
  timeframe: "daily" | "weekly" | "monthly";
  celebration: string;
  checkInType: CheckInType;
  duration: string;
}

export interface TribeMember {
  id: string;
  username: string;
  avatar?: string | null | any;
  profile_details?: null | any;
  checkInCount: number;
  lastActive: string;
}

export interface Tribe {
  tribe_id: string;
  frequency: "daily" | "weekly" | "monthly";
  created_at: string;
}

export interface UserTribe {
  user_id: string;
  tribe_id: string;
  joined_at: string;
}

export interface Reaction {
  type: ReactionType;
  count: number;
  userReacted: boolean;
}

export interface CheckIn {
  id: string;
  username: string;
  createdAt: string;
  content: string;
  photo?: string;
  reactions: Reaction[];
}

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  // Implement your auth logic here to get the current user ID
  // For example, using Supabase auth:
  const user: any = await supabase.auth.getUser();
  console.log(user)
  return user?.data?.user?.id || 'guest-user';
};

export const getDaysSinceStart = (goal: Goal): number => {
  const startDate = new Date(goal.startDate);
  const today = new Date();
  const diffInTime = today.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  return diffInDays;
};


export const getDaysUntilCompletion = (goal: any): number => {

  // Ensure targetDate exists, otherwise return 0
  if (!goal.targetDate) return 0;

  // Parse the targetDate from the goal object
  const targetDate = new Date(goal.targetDate);

  // Get today's date
  const today = new Date();

  // Calculate the time difference
  const diffInTime = targetDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

  // Ensure the result is not negative
  return Math.max(diffInDays, 0);
};


export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const storedGoals = localStorage.getItem("goals");
    return storedGoals ? JSON.parse(storedGoals) : [];
  });

  // Improve the check-ins initialization logic
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    try {
      const storedCheckIns = localStorage.getItem("check-ins");
      console.log("Initializing check-ins from localStorage:", storedCheckIns);

      if (storedCheckIns && storedCheckIns !== "null" && storedCheckIns !== "undefined") {
        const parsedCheckIns = JSON.parse(storedCheckIns);
        console.log("Successfully parsed check-ins:", parsedCheckIns);
        return Array.isArray(parsedCheckIns) ? parsedCheckIns : [];
      } else {
        console.log("No valid check-ins in localStorage, initializing empty array");
        return [];
      }
    } catch (error) {
      console.error("Error parsing check-ins from localStorage:", error);
      return [];
    }
  });

  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [userTribes, setUserTribes] = useState<UserTribe[]>([]);
  const [tribeMembers, setTribeMembers] = useState<TribeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace localStorage initialization with Supabase fetch
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        // Map Supabase data structure to your Goal interface
        const mappedGoals: any = (data || []).map(goal => ({
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
        }));

        setGoals(mappedGoals);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Fetch tribes data from Supabase
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        setLoading(true);

        // Fetch tribes
        const { data: tribesData, error: tribesError } = await supabase
          .from('tribes')
          .select('*');

        if (tribesError) throw tribesError;

        if (tribesData) {
          setTribes(tribesData);
        }

        // Fetch current user's tribes
        const currentUserId = await getCurrentUserId(); // Implement this function to get user ID from auth

        const { data: userTribesData, error: userTribesError } = await supabase
          .from('user_tribes')
          .select('*')
          .eq('user_id', currentUserId);

        if (userTribesError) throw userTribesError;

        if (userTribesData) {
          setUserTribes(userTribesData);
          console.log('User tribes fetched successfully:', userTribesData);
        }

      } catch (err) {
        console.error('Error fetching tribes data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTribes();
  }, []);


  const getDefaultTribe = async (frequency: "daily" | "weekly" | "monthly") => {
    try {
      // First, check if the default tribe for this frequency already exists
      const { data, error } = await supabase
        .from('tribes')
        .select('*')
        .eq('frequency', frequency)
        .limit(1);

      if (error) throw error;

      // If found, return the existing tribe
      if (data && data.length > 0) {
        return data[0];
      }

      // If not found, create a new default tribe for this frequency
      const { data: newTribe, error: createError } = await supabase
        .from('tribes')
        .insert([{ frequency }])
        .select();

      if (createError) throw createError;

      if (newTribe && newTribe.length > 0) {
        // Update tribes state
        setTribes(prevTribes => [...prevTribes, newTribe[0]]);
        return newTribe[0];
      }

      return null;
    } catch (error) {
      console.error(`Error getting/creating default ${frequency} tribe:`, error);
      return null;
    }
  };

  const assignUserToDefaultTribe = async (userId: string, frequency: "daily" | "weekly" | "monthly") => {
    try {
      // Get the default tribe for this frequency
      const defaultTribe = await getDefaultTribe(frequency);
      if (!defaultTribe) {
        console.error(`Failed to get/create default ${frequency} tribe`);
        return false;
      }

      // Check if user is already in this tribe
      const { data: existingMembership, error: checkError } = await supabase
        .from('user_tribes')
        .select('*')
        .eq('user_id', userId)
        .eq('tribe_id', defaultTribe.tribe_id);

      if (checkError) throw checkError;

      // If already a member, no need to add again
      if (existingMembership && existingMembership.length > 0) {
        return true;
      }

      // Add user to the default tribe
      const { data, error } = await supabase
        .from('user_tribes')
        .insert([{
          user_id: userId,
          tribe_id: defaultTribe.tribe_id,
          joined_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      if (data) {
        // Update userTribes state
        setUserTribes(prevUserTribes => [...prevUserTribes, data[0]]);
        console.log(`User automatically assigned to ${frequency} tribe`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error assigning user to default ${frequency} tribe:`, error);
      return false;
    }
  };

  const createGoal = async (goalFormValues: GoalFormValues) => {
    try {
      const userId = await getCurrentUserId();
      const now = new Date();
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + parseInt(goalFormValues.duration));

      const newGoal = {
        user_id: userId,
        title: goalFormValues.title,
        description: goalFormValues.description,
        motivator: goalFormValues.motivator,
        time_frame: now.toISOString(),  // This is likely the issue
        frequency: goalFormValues.timeframe,  // This is likely the issue
        celebration_plan: goalFormValues.celebration,
        check_in_type: goalFormValues.checkInType,
        duration: parseInt(goalFormValues.duration),
        created_at: now.toISOString(),
        progress: 0,
        is_active: true,
        check_in_count: 0
      };
      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newMappedGoal = {
          id: data[0].goal_id,
          title: data[0].title,
          description: data[0].description,
          startDate: data[0].created_at,
          targetDate: data[0].duration ? new Date(new Date(data[0].created_at).getTime() + data[0].duration * 24 * 60 * 60 * 1000).toISOString() : null,
          timeframe: data[0].frequency,
          checkInType: data[0].check_in_type,
          motivator: data[0].motivator,
          celebration: data[0].celebration_plan,
          duration: data[0].duration,
          progress: data[0].progress || 0,
          isCompleted: !data[0].is_active,
          checkInCount: data[0].check_in_count || 0,
          lastCheckIn: data[0].last_check_in || ''
        };

        setGoals((prevGoals: any) => [...prevGoals, newMappedGoal]);

        // Create tribe with the same timeframe if needed
        // await createTribe(goalFormValues.timeframe);

        // Automatically assign user to the appropriate tribe based on goal frequency
        await assignUserToDefaultTribe(userId, goalFormValues.timeframe);
        
        return data[0];
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      setError(error.message);
    }
  };
  const getGoalById = (id: string): Goal | undefined => {
    console.log(goals, id)
    return goals.find((goal) => goal.id === id);
  };

  const getAllGoals = (): Goal[] => {
    return goals;
  };

  const getActiveGoal = (): Goal | null => {
    const activeGoal = goals.find((goal) => !goal.isCompleted);
    return activeGoal || null;
  };

  const completeGoal = (id: string): boolean => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, isCompleted: true, progress: 100 } : goal
    );
    setGoals(updatedGoals);
    return true;
  };

  // Add function to track deleted goals for admin stats
  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      // First delete all check-ins related to this goal
      const { error: checkInsError } = await supabase
        .from('check_ins')
        .delete()
        .eq('goal_id', id);

      if (checkInsError) throw checkInsError;

      // Then delete the goal
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('goal_id', id);

      if (error) throw error;

      // Update admin metrics
      const { error: metricsError } = await supabase
        .from('admin_metrics')
        .update({
          deleted_goals: supabase.rpc('increment', { row_id: 1, increment_by: 1 }),
          last_updated: new Date().toISOString()
        })
        .eq('id', 1);

      if (metricsError) console.error("Error updating metrics:", metricsError);

      // Update local state
      setGoals(prevGoals => prevGoals.filter(goal => goal.goal_id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  };

  const updateGoalProgress = (
    id: string,
    progress: number,
    lastCheckIn: string
  ): boolean => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, progress, lastCheckIn, checkInCount: goal.checkInCount + 1 } : goal
    );
    setGoals(updatedGoals);
    return true;
  };

  const hasCompletedGoal = (): boolean => {
    const goalsFromStorage = localStorage.getItem("goals");
    if (!goalsFromStorage) return false;

    const parsedGoals = JSON.parse(goalsFromStorage);
    return parsedGoals.some((goal: Goal) => goal.isCompleted);
  };

  // New Supabase tribe-related functions
  const createTribe = async (frequency: "daily" | "weekly" | "monthly") => {
    try {
      const { data, error } = await supabase
        .from('tribes')
        .insert([
          { frequency }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        console.log('Tribe created successfully:', data[0]);

        // Add the current user to the new tribe
        const userId = await getCurrentUserId();
        const tribeId = data[0].tribe_id;

        await joinTribe(userId, tribeId);

        // Update local state
        setTribes(prevTribes => [...prevTribes, data[0]]);
        return data[0];
      }
    } catch (error) {
      console.error('Error creating tribe:', error);
      return null;
    }
  };

  const joinTribe = async (userId: string, tribeId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_tribes')
        .insert([
          {
            user_id: userId,
            tribe_id: tribeId,
            joined_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        console.log('Joined tribe successfully:', data);

        // Update local state
        setUserTribes(prevUserTribes => [...prevUserTribes, data[0]]);
        return true;
      }
    } catch (error) {
      console.error('Error joining tribe:', error);
      return false;
    }
  };

  const leaveTribe = async (userId: string, tribeId: string) => {
    try {
      const { error } = await supabase
        .from('user_tribes')
        .delete()
        .eq('user_id', userId)
        .eq('tribe_id', tribeId);

      if (error) throw error;

      // Update local state
      setUserTribes(prevUserTribes =>
        prevUserTribes.filter(ut => !(ut.user_id === userId && ut.tribe_id === tribeId))
      );

      console.log('Left tribe successfully');
      return true;
    } catch (error) {
      console.error('Error leaving tribe:', error);
      return false;
    }
  };

  const deleteTribe = async (tribeId: string) => {
    try {
      // First delete all user_tribe associations
      const { error: userTribeError } = await supabase
        .from('user_tribes')
        .delete()
        .eq('tribe_id', tribeId);

      if (userTribeError) throw userTribeError;

      // Then delete the tribe
      const { error } = await supabase
        .from('tribes')
        .delete()
        .eq('tribe_id', tribeId);

      if (error) throw error;

      // Update local state
      setTribes(prevTribes => prevTribes.filter(t => t.tribe_id !== tribeId));
      setUserTribes(prevUserTribes => prevUserTribes.filter(ut => ut.tribe_id !== tribeId));

      console.log('Tribe deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting tribe:', error);
      return false;
    }
  };

  const getUserTribes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_tribes')
        .select(`
          *,
          tribes:tribe_id(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user tribes:', error);
      return [];
    }
  };

  const getTribeMembersFromSupabase = async (tribeId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_tribes')
        .select(`
          users:user_id(
            user_id,
            username,
            profile_details
          )
        `)
        .eq('tribe_id', tribeId);

      if (error) throw error;

      if (data) {
        // Transform data to match TribeMember interface
        const members: TribeMember[] = data.map(item => {
          const user = item.users;
          return {
            id: user.user_id,
            username: user.username,
            avatar: user.profile_details?.avatar || null,
            checkInCount: 0, // You'll need to fetch this separately from check_ins table
            lastActive: new Date().toISOString(), // You'll need to calculate this
          };
        });

        // Update local state
        setTribeMembers(members);
        return members;
      }

      return [];
    } catch (error) {
      console.error('Error fetching tribe members:', error);
      return [];
    }
  };

  const getTribeMembers = (): TribeMember[] => {
    const activeGoal = getActiveGoal();
    if (!activeGoal) return [];

    // If we have tribe members in state, return them
    if (tribeMembers.length > 0) {
      return tribeMembers;
    }

    // Otherwise, return mock tribe members as fallback
    return [
      {
        id: "member1",
        username: "Anonymous1",
        avatar: null,
        checkInCount: 12,
        lastActive: "2 days ago",
      },
      {
        id: "member2",
        username: "Anonymous2",
        avatar: null,
        checkInCount: 8,
        lastActive: "5 days ago",
      },
    ];
  };

  // Fix the addCheckIn function to properly update state
  const addCheckIn = useCallback(async (goalId: string, content: string, photoContent?: string): Promise<boolean> => {
    try {
      // const goal = getActiveGoal();
      if (!goalId) return false;

      const userId = await getCurrentUserId();
      const tribeId = userTribes.length > 0 ? userTribes[0].tribe_id : null;

      const checkInData = {
        user_id: userId,
        goal_id: goalId, // Adjusted to match schema
        tribe_id: tribeId,
        check_in_time: new Date().toISOString(),
        content: content || "",
        photo_url: photoContent || null,
        media_url: null
      };

      const { data, error } = await supabase
        .from('check_ins')
        .insert([checkInData])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch the current goal to get its existing progress and check-in count
        const { data: goalData, error: fetchError } = await supabase
          .from('goals')
          .select('progress, check_in_count')
          .eq('goal_id', goalId)
          .single();

        if (fetchError) throw fetchError;
        if (!goalData) return false;

        // Calculate new progress and check-in count
        const newProgress = Math.min((goalData.progress || 0) + 10, 100);
        const newCheckInCount = (goalData.check_in_count || 0) + 1;

        // Update goal progress in database
        const { error: updateError } = await supabase
          .from('goals')
          .update({
            progress: newProgress,
            check_in_count: newCheckInCount,
            last_check_in: new Date().toISOString()
          })
          .eq('goal_id', goalId);

        if (updateError) throw updateError;

        // Update local state
        setGoals(prevGoals =>
          prevGoals.map(g => g.goal_id === goalId ? {
            ...g,
            progress: newProgress,
            check_in_count: newCheckInCount,
            last_check_in: new Date().toISOString()
          } : g)
        );

        // Refresh check-ins
        getTribeCheckIns();

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding check-in:", error);
      return false;
    }
  }, [goals, userTribes]);
  // Update getTribeCheckIns to fetch from Supabase first, then fall back to local
  const getTribeCheckIns = useCallback(async (): Promise<CheckIn[]> => {
    try {
      setLoading(true);
      const tribeId = userTribes.length > 0 ? userTribes[0].tribe_id : null;

      if (!tribeId) {
        setCheckIns([]);
        return [];
      }

      const { data, error } = await supabase
        .from('check_ins')
        .select(`
          *,
          users:user_id(username)
        `)
        .eq('tribe_id', tribeId)
        .order('check_in_time', { ascending: false });

      if (error) throw error;

      const userId = await getCurrentUserId();
      const formattedCheckIns: CheckIn[] = await Promise.all((data || []).map(async item => {
        // Get reaction counts for each check-in
        const { data: reactionsData } = await supabase
          .from('reactions')
          .select('reaction_type, count(*)')
          .eq('check_in_id', item.check_in_id)
          .group('reaction_type');

        // Get user reactions
        const { data: userReactions } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('check_in_id', item.check_in_id)
          .eq('user_id', userId);

        // Format reactions
        const reactions: Reaction[] = [
          { type: "star", count: 0, userReacted: false },
          { type: "heart", count: 0, userReacted: false },
          { type: "clap", count: 0, userReacted: false },
          { type: "fire", count: 0, userReacted: false }
        ];

        // Update reaction counts
        if (reactionsData) {
          reactionsData.forEach(reaction => {
            const reactionObj = reactions.find(r => r.type === reaction.reaction_type);
            if (reactionObj) {
              reactionObj.count = reaction.count;
            }
          });
        }

        // Update user reactions
        if (userReactions) {
          userReactions.forEach(reaction => {
            const reactionObj = reactions.find(r => r.type === reaction.reaction_type);
            if (reactionObj) {
              reactionObj.userReacted = true;
            }
          });
        }

        return {
          id: item.check_in_id,
          username: item.users?.username || 'Anonymous',
          createdAt: item.check_in_time,
          content: item.content || '',
          photo: item.photo_url,
          reactions
        };
      }));

      setCheckIns(formattedCheckIns);
      return formattedCheckIns;
    } catch (error) {
      console.error("Error getting check-ins:", error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userTribes]);

  // Update addReaction to use Supabase
  const addReaction = async (checkInId: string, reactionType: ReactionType): Promise<void> => {
    try {
      const userId = await getCurrentUserId();

      // Check if the user has already reacted with this reaction type
      const { data: existingReaction, error: checkError } = await supabase
        .from('reactions')
        .select('*')
        .eq('check_in_id', checkInId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType);

      if (checkError) throw checkError;

      if (existingReaction && existingReaction.length > 0) {
        // User already reacted - remove the reaction
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('check_in_id', checkInId)
          .eq('user_id', userId)
          .eq('reaction_type', reactionType);

        if (deleteError) throw deleteError;

        console.log('Reaction removed successfully');
      } else {
        // User hasn't reacted yet - add the reaction
        const { error: insertError } = await supabase
          .from('reactions')
          .insert([
            {
              check_in_id: checkInId,
              user_id: userId,
              reaction_type: reactionType,
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) throw insertError;

        console.log('Reaction added successfully');
      }

      // Update local state
      setCheckIns(prevCheckIns => {
        const updatedCheckIns = prevCheckIns.map(checkIn => {
          if (checkIn.id === checkInId) {
            const updatedReactions = checkIn.reactions.map(reaction => {
              if (reaction.type === reactionType) {
                return {
                  ...reaction,
                  count: reaction.userReacted ? reaction.count - 1 : reaction.count + 1,
                  userReacted: !reaction.userReacted
                };
              }
              return reaction;
            });

            return { ...checkIn, reactions: updatedReactions };
          }
          return checkIn;
        });

        return updatedCheckIns;
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const getNextCheckInDate = (goal: Goal): Date | null => {
    if (!goal) return null;

    try {
      let nextDate = new Date();

      // Check if lastCheckIn exists and is a valid date string
      if (goal.lastCheckIn && goal.lastCheckIn.trim() !== '') {
        const lastCheckInDate = new Date(goal.lastCheckIn);

        // Verify that the parsed date is valid
        if (!isNaN(lastCheckInDate.getTime())) {
          switch (goal.timeframe) {
            case "daily":
              // Next day
              nextDate = new Date(lastCheckInDate);
              nextDate.setDate(lastCheckInDate.getDate() + 1);
              break;
            case "weekly":
              // Next week
              nextDate = new Date(lastCheckInDate);
              nextDate.setDate(lastCheckInDate.getDate() + 7);
              break;
            case "monthly":
              // Next month
              nextDate = new Date(lastCheckInDate);
              nextDate.setMonth(lastCheckInDate.getMonth() + 1);
              break;
          }
          return nextDate;
        }
      }

      // If lastCheckIn doesn't exist or is invalid, use startDate
      const startDate = new Date(goal.startDate);
      if (!isNaN(startDate.getTime())) {
        switch (goal.timeframe) {
          case "daily":
            nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + 1);
            break;
          case "weekly":
            nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + 7);
            break;
          case "monthly":
            nextDate = new Date(startDate);
            nextDate.setMonth(startDate.getMonth() + 1);
            break;
        }
        return nextDate;
      }

      return null; // Return null if no valid date could be calculated
    } catch (error) {
      console.error("Error calculating next check-in date:", error);
      return null;
    }
  };
  // Add function for tracking deleted check-ins
  const deleteCheckIn = async (checkInId: string): Promise<boolean> => {
    try {
      // Remove from Supabase database
      const { error } = await supabase
        .from('check_ins') // Replace with your actual table name
        .delete()
        .eq('id', checkInId);

      if (error) {
        console.error('Error deleting check-in:', error.message);
        return false;
      }

      // Remove from check-ins state
      setCheckIns(prevCheckIns => prevCheckIns.filter(checkIn => checkIn.id !== checkInId));

      // Track deletion in admin metrics
      const metricsData: any = localStorage.getItem('admin_metrics');
      if (metricsData) {
        const metrics = JSON.parse(metricsData);
        metrics.deletedCheckIns += 1;
        metrics.lastMetricsUpdate = new Date().toISOString();
        localStorage.setItem('admin_metrics', JSON.stringify(metrics));
      }

      return true;
    } catch (err) {
      console.error('Unexpected error deleting check-in:', err);
      return false;
    }
  };

  return {
    goals,
    createGoal,
    getGoalById,
    getAllGoals,
    getActiveGoal,
    completeGoal,
    deleteGoal, // Add new function
    getDaysSinceStart,
    getDaysUntilCompletion,
    updateGoalProgress,
    hasCompletedGoal,
    getTribeMembers,
    getTribeCheckIns,
    addReaction,
    getNextCheckInDate,
    addCheckIn,
    deleteCheckIn, // Add new function
    getTribeMembersFromSupabase,
    // For debugging
    checkIns,
  };
};
