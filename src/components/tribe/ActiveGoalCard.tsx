import React from 'react'
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ActiveGoalCard = ({ formatNextCheckIn, navigate, activeGoal }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="glass border-primary/20 shadow">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <div>
              <p className="font-medium">Next check-in: {formatNextCheckIn()}</p>
              <p className="text-sm text-muted-foreground">Share your progress with your tribe</p>
            </div>
          </div>
          <Button onClick={() => navigate("/checkin/"+ activeGoal.id)}>Check In Now</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
export default ActiveGoalCard