/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Flame, Heart, Loader2, Star, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCheckInDate } from '@/lib/utils';
import { Button } from '../ui/button';
import { getCurrentUserId, ReactionType } from '@/hooks/useGoals';

const CheckInsTab = ({ checkIns, isRefreshing, userId, handleReaction, defaultReactions, navigate, hasActiveGoal, activeGoal }) => {

  const ReactionIcon = ({ type }: { type: ReactionType }) => {
    switch (type) {
      case "star": return <Star className="h-4 w-4 text-amber-500" />;
      case "heart": return <Heart className="h-4 w-4 text-rose-500" />;
      case "clap": return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case "fire": return <Flame className="h-4 w-4 text-orange-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredCheckIns = checkIns ? checkIns.filter(checkIn => checkIn.user_id === userId) : [];

  return (
    <TabsContent value="check-ins" className="mt-4 space-y-4">
      {isRefreshing ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-primary">Loading check-ins...</span>
        </div>
      ) : checkIns && checkIns.length > 0 ? (
        checkIns.map((checkIn) => {
          return (
            <motion.div
              key={checkIn.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={null} />
                      <AvatarFallback>
                        {checkIn.username?.substring(0, 2).toUpperCase() || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{checkIn.username || 'Unknown User'}</div>
                        <span className="text-xs text-muted-foreground">
                          {formatCheckInDate(checkIn.createdAt)}
                        </span>
                      </div>

                      {/* Check-in content */}
                      <p className="text-sm mb-2">{checkIn.content}</p>
                      {/* <p className="text-sm mb-2">{JSON.stringify(checkIn)}</p> */}

                      {/* Photo if present */}
                      {checkIn.photo && (
                        <div className="mt-2 mb-3 rounded-md overflow-hidden">
                          <img
                            src={checkIn.photo}
                            alt="Check-in photo"
                            className="w-full h-auto max-h-[300px] object-cover"
                          />
                        </div>
                      )}

                      {/* Reaction buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(defaultReactions).map(([reactionType, reaction]: [string, any]) => {
                          // const userReacted = reaction?.reactions?.some((reactionItem: any) => reactionItem.reaction_type === reactionType);
                          const userReacted = checkIn?.reactions?.some(
                            (reactionItem: any) => reactionItem.reaction_type === reactionType
                          );
                          const reactionCount = checkIn?.reactions?.filter(
                            (reactionItem: any) => reactionItem.reaction_type === reactionType
                          ).length || 0;
                          return (
                            <Button
                              key={reactionType}
                              variant={userReacted ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 px-3 gap-1"
                              onClick={() => handleReaction(checkIn.check_in_id, reactionType)}
                            >
                              <ReactionIcon type={reactionType as ReactionType} />
                              <span>{reactionCount}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No check-ins yet. Be the first to share your progress!</p>
          {hasActiveGoal && (
            <Button
              className="mt-4"
              onClick={() => navigate("/checkin/" + activeGoal.id)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check In Now
            </Button>
          )}
        </div>
      )}
    </TabsContent>
  );
};


export default CheckInsTab