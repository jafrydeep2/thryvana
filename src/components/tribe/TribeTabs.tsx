import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, UserCircle } from 'lucide-react';
import TribeMembersList from './TribeMembersList';

const TribeTabs = ({ activeTab, setActiveTab, tribeMembers, checkIns, isRefreshing, userId, handleReaction, defaultReactions,
    navigate, hasActiveGoal, activeGoal }) => (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="members"><UserCircle className="h-4 w-4 mr-2" /> Members</TabsTrigger>
            <TabsTrigger value="check-ins"><Calendar className="h-4 w-4 mr-2" /> Check-ins</TabsTrigger>
        </TabsList>
        <TribeMembersList tribeMembers={tribeMembers}
            checkIns={checkIns}
            isRefreshing={isRefreshing}
            userId={userId}
            handleReaction={handleReaction}
            defaultReactions={defaultReactions}
            navigate={navigate}
            hasActiveGoal={hasActiveGoal}
            activeGoal={activeGoal} />
    </Tabs>
);
export default TribeTabs