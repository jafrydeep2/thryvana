import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TribeMemberCard from './TribeMemberCard';
import CheckInsTab from './CheckInsTab';

const TribeMembersList = ({ tribeMembers, checkIns, isRefreshing, userId, handleReaction, defaultReactions,
  navigate, hasActiveGoal, activeGoal
}) => (
  <>
    <TabsContent value="members" className="mt-4 space-y-4">
      {tribeMembers.map((member) => <TribeMemberCard key={member.id} member={member} />)}
    </TabsContent>
    <TabsContent value="check-ins">
      <CheckInsTab
        checkIns={checkIns}
        isRefreshing={isRefreshing}
        userId={userId}
        handleReaction={handleReaction}
        defaultReactions={defaultReactions}
        navigate={navigate}
        hasActiveGoal={hasActiveGoal}
        activeGoal={activeGoal}
      />
    </TabsContent>
  </>

);

export default TribeMembersList