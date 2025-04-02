
import { motion } from "framer-motion";
import { Clock, AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Goal } from "@/hooks/useGoals";

interface NextCheckInCardProps {
  goal: Goal;
  nextCheckIn: Date | null;
  onCheckIn: () => void;
}

const NextCheckInCard = ({ goal, nextCheckIn, onCheckIn }: NextCheckInCardProps) => {
  if (!nextCheckIn) return null;
  
  const today = new Date();
  const daysDifference = Math.ceil((nextCheckIn.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  const formatCheckInDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  const formatTimeLeft = (days: number) => {
    if (days <= 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };
  
  const getTimeLeftColor = () => {
    if (daysDifference <= 0) return "text-destructive";
    if (daysDifference <= 2) return "text-yellow-500";
    return "text-green-500";
  };
  
  const isOverdue = daysDifference <= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className={`glass border ${isOverdue ? 'border-destructive/50' : 'border-primary/20'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isOverdue ? (
                <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              ) : (
                <Clock className="mr-2 h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-lg">
                {isOverdue ? "Check-in Overdue" : "Next Check-in"}
              </CardTitle>
            </div>
            <span className={`text-sm font-medium ${getTimeLeftColor()}`}>
              {formatTimeLeft(daysDifference)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatCheckInDate(nextCheckIn)}</span>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {isOverdue 
                ? "You're due for a check-in. Keep your progress going!" 
                : `Your ${goal.timeframe} check-in is coming up.`}
            </p>
          </div>
          
          <Button 
            onClick={onCheckIn} 
            className="w-full"
            variant={isOverdue ? "destructive" : "default"}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isOverdue ? "Check In Now" : "Post Early Check-in"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NextCheckInCard;
