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
  avatar: string | null;
  checkInCount: number;
  lastActive: string;
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

  // Persist goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);
  
  // Improve the check-ins saving logic with better error handling
  useEffect(() => {
    try {
      console.log("Saving check-ins to localStorage:", checkIns);
      if (Array.isArray(checkIns)) {
        localStorage.setItem("check-ins", JSON.stringify(checkIns));
      } else {
        console.error("Attempted to save non-array check-ins:", checkIns);
      }
    } catch (error) {
      console.error("Error saving check-ins to localStorage:", error);
    }
  }, [checkIns]);

  const createGoal = (goalFormValues: GoalFormValues) => {
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + parseInt(goalFormValues.duration));
    
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: goalFormValues.title,
      description: goalFormValues.description,
      startDate: now.toISOString(),
      targetDate: targetDate.toISOString(),
      timeframe: goalFormValues.timeframe,
      checkInType: goalFormValues.checkInType,
      motivator: goalFormValues.motivator,
      celebration: goalFormValues.celebration,
      duration: parseInt(goalFormValues.duration),
      progress: 0,
      isCompleted: false,
      checkInCount: 0,
      lastCheckIn: "",
    };
    
    setGoals((prevGoals) => [...prevGoals, newGoal]);
    return newGoal;
  };

  const getGoalById = (id: string): Goal | undefined => {
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
  const deleteGoal = (id: string): boolean => {
    // Remove from goals state
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    
    // Track deletion in admin metrics
    const metricsData = localStorage.getItem('admin_metrics');
    if (metricsData) {
      const metrics = JSON.parse(metricsData);
      metrics.deletedGoals += 1;
      metrics.lastMetricsUpdate = new Date().toISOString();
      localStorage.setItem('admin_metrics', JSON.stringify(metrics));
    }
    
    return true;
  };

  const getDaysSinceStart = (goal: Goal): number => {
    const startDate = new Date(goal.startDate);
    const today = new Date();
    const diffInTime = today.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

    return diffInDays;
  };

  const getDaysUntilCompletion = (goal: Goal): number => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const diffInTime = targetDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

    return diffInDays > 0 ? diffInDays : 0;
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

  const getTribeMembers = (): TribeMember[] => {
    const activeGoal = getActiveGoal();
    if (!activeGoal) return [];

    // Generate mock tribe members based on the active goal's timeframe
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
  const addCheckIn = useCallback((content: string, photoContent?: string): boolean => {
    try {
      console.log("Adding check-in:", { content, photoContent });
      const goal = getActiveGoal();
      if (!goal) {
        console.error("No active goal found when adding check-in");
        return false;
      }
      
      // Create a new check-in with proper structure
      const newCheckIn: CheckIn = {
        id: Math.random().toString(36).substr(2, 9),
        username: "Your Check-in", // Make it clear it's the user's check-in
        createdAt: new Date().toISOString(),
        content: content || "",
        photo: photoContent,
        reactions: [
          { type: "star", count: 0, userReacted: false },
          { type: "heart", count: 0, userReacted: false },
          { type: "clap", count: 0, userReacted: false },
          { type: "fire", count: 0, userReacted: false },
        ],
      };
      
      console.log("Created new check-in object:", newCheckIn);
      
      // Update check-ins state using functional update to ensure we're working with latest state
      setCheckIns(prev => {
        // Ensure prev is an array
        const prevArray = Array.isArray(prev) ? prev : [];
        const newCheckIns = [newCheckIn, ...prevArray];
        console.log("Updated check-ins array:", newCheckIns);
        return newCheckIns;
      });
      
      // Update goal progress
      const updatedGoals = goals.map((g) =>
        g.id === goal.id ? { 
          ...g, 
          lastCheckIn: new Date().toISOString(),
          checkInCount: (g.checkInCount || 0) + 1,
          progress: Math.min((g.progress || 0) + 10, 100), // Increment progress by 10%, max 100%
        } : g
      );
      
      setGoals(updatedGoals);
      console.log("Successfully added check-in and updated goals");
      
      // Force update localStorage immediately for extra safety
      try {
        const updatedCheckIns = [newCheckIn, ...checkIns];
        localStorage.setItem("check-ins", JSON.stringify(updatedCheckIns));
        console.log("Directly updated localStorage with new check-in");
      } catch (storageError) {
        console.error("Error directly updating localStorage:", storageError);
      }
      
      return true;
    } catch (error) {
      console.error("Error adding check-in:", error);
      return false;
    }
  }, [checkIns, goals]);

  // Fix the getTribeCheckIns function to use proper ReactionType values
  const getTribeCheckIns = useCallback((): CheckIn[] => {
    console.log("Getting check-ins from state:", checkIns);
    
    // If we have check-ins in state and they're valid, return them directly
    if (Array.isArray(checkIns) && checkIns.length > 0) {
      console.log("Returning check-ins from state:", checkIns);
      return checkIns;
    }
    
    // Try to fetch from localStorage as a fallback
    try {
      const storedCheckIns = localStorage.getItem("check-ins");
      console.log("Raw check-ins from localStorage:", storedCheckIns);
      
      if (storedCheckIns && storedCheckIns !== "null" && storedCheckIns !== "undefined") {
        try {
          const parsedCheckIns = JSON.parse(storedCheckIns);
          console.log("Parsed check-ins from localStorage:", parsedCheckIns);
          
          if (Array.isArray(parsedCheckIns) && parsedCheckIns.length > 0) {
            // Update state with localStorage data
            setCheckIns(parsedCheckIns);
            return parsedCheckIns;
          }
        } catch (parseError) {
          console.error("Error parsing check-ins JSON:", parseError);
        }
      }
    } catch (error) {
      console.error("Error retrieving check-ins from localStorage:", error);
    }
    
    // Return mock check-ins as last resort fallback
    console.log("Returning mock check-ins as fallback");
    const mockCheckIns: CheckIn[] = [
      {
        id: "checkin1",
        username: "Anonymous1",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        content: "I've been consistent with my goal this week. Feeling good about my progress!",
        reactions: [
          { type: "star" as ReactionType, count: 2, userReacted: false },
          { type: "heart" as ReactionType, count: 1, userReacted: false },
          { type: "clap" as ReactionType, count: 3, userReacted: false },
          { type: "fire" as ReactionType, count: 0, userReacted: false },
        ],
      },
      {
        id: "checkin2",
        username: "Anonymous2",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        content: "Had a challenging day, but still made time for my goal. Small steps add up!",
        photo: "https://placehold.co/400x300/667/fff?text=Sample+Photo",
        reactions: [
          { type: "star" as ReactionType, count: 1, userReacted: false },
          { type: "heart" as ReactionType, count: 2, userReacted: false },
          { type: "clap" as ReactionType, count: 0, userReacted: false },
          { type: "fire" as ReactionType, count: 1, userReacted: false },
        ],
      },
    ];
    
    // Update state with mock data
    setCheckIns(mockCheckIns);
    return mockCheckIns;
  }, [checkIns]);

  const addReaction = (checkInId: string, reactionType: ReactionType): void => {
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
          switch(goal.timeframe) {
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
        switch(goal.timeframe) {
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
  const deleteCheckIn = (checkInId: string): boolean => {
    // Remove from check-ins state
    setCheckIns(prevCheckIns => {
      return prevCheckIns.filter(checkIn => checkIn.id !== checkInId);
    });
    
    // Track deletion in admin metrics
    const metricsData = localStorage.getItem('admin_metrics');
    if (metricsData) {
      const metrics = JSON.parse(metricsData);
      metrics.deletedCheckIns += 1;
      metrics.lastMetricsUpdate = new Date().toISOString();
      localStorage.setItem('admin_metrics', JSON.stringify(metrics));
    }
    
    return true;
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
    // For debugging
    checkIns,
  };
};
