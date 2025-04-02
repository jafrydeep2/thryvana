
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    timeframe: "daily" | "weekly" | "monthly";
    progress: number;
    checkInCount: number;
    lastCheckIn: string;
    startDate: string;
    targetDate: string;
    duration: number;
    isCompleted?: boolean
  };
  onCheckIn: (goalId: string) => void;
  onViewDetails?: (goalId: string) => void;
}

const GoalCard = ({ goal, onCheckIn, onViewDetails }: GoalCardProps) => {
  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case "daily":
        return "Daily Check-ins";
      case "weekly":
        return "Weekly Check-ins";
      case "monthly":
        return "Monthly Check-ins";
      default:
        return "Check-ins";
    }
  };

  // Calculate progress based on days elapsed vs total duration
  const calculateDaysProgress = (): number => {
    const startDate = new Date(goal.startDate);
    const today = new Date();
    const diffInTime = today.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffInTime / (1000 * 3600 * 24));

    // Calculate progress as percentage of days completed out of total duration
    if (!goal.isCompleted) {
      return Math.min(Math.round((daysPassed / goal.duration) * 100), 100);
    } else {
      return goal.progress
    }
  };

  // Use days-based progress calculation
  const progressValue = goal.isCompleted ? 100 : goal.progress //calculateDaysProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="w-full"
    >
      <Card className="glass h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2">
              {getTimeframeLabel(goal.timeframe)}
            </Badge>
            <Badge className="bg-primary/20 text-primary border-none">
              <CheckCircle className="mr-1 h-3 w-3" /> {goal.checkInCount} check-ins
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold line-clamp-1">{goal.title}</CardTitle>
        </CardHeader>
        <CardContent className="py-2 flex-grow">
          <p className="text-muted-foreground line-clamp-2 text-sm">{goal.description}</p>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time Progress</span>
              <span className="font-medium">{progressValue}%</span>
            </div>
            <Progress value={progressValue} />
          </div>

          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Last check-in: {!goal.lastCheckIn ? "Never" : new Date(goal.lastCheckIn).toLocaleDateString()}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails && onViewDetails(goal.id)}
            className="flex-1"
          >
            <span>Details</span>
          </Button>
          <Button
            onClick={() => onCheckIn(goal.id)}
            className="flex-1 group"
            disabled={goal.isCompleted}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>{goal?.isCompleted ? 'Completed' : 'Check In'}</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GoalCard;
